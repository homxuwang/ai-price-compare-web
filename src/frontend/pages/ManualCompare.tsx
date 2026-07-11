import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocale } from '../i18n';
import {
  calculateManualComparison,
  createManualItem,
  createManualSampleState,
  MANUAL_CURRENCIES,
  normalizeManualState,
  unitTypesForCategory,
  type ManualCategory,
  type ManualCompareState,
  type ManualPriceItem,
  type ManualPricingMode,
} from '../../shared/manualCompare';
import type { Scenario, UnitDefinition } from '../../shared/types';

const STORAGE_KEY = 'oph.manual-compare.v1';

let idSequence = 0;
function createId() {
  if (typeof globalThis.crypto?.randomUUID === 'function') return globalThis.crypto.randomUUID();
  idSequence += 1;
  return `manual-${Date.now()}-${idSequence}`;
}

function initialState() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const normalized = saved ? normalizeManualState(JSON.parse(saved)) : null;
    if (normalized) return normalized;
  } catch {
    // Storage can be unavailable in private browsing.
  }
  return createManualSampleState(createId(), createId());
}

const CATEGORY_LABELS = {
  zh: { text: '文本', image: '图片', video: '视频', audio: '音频' },
  en: { text: 'Text', image: 'Image', video: 'Video', audio: 'Audio' },
};
const MODE_LABELS = {
  zh: { plan_credit_based: '积分换算', direct_price_based: '直接价格' },
  en: { plan_credit_based: 'Plan credits', direct_price_based: 'Direct price' },
};
const UNIT_LABELS = {
  zh: {
    per_1k_input_tokens: '每 1K 输入 tokens',
    per_1k_output_tokens: '每 1K 输出 tokens',
    per_image: '每张图片',
    per_second: '每秒',
    per_minute: '每分钟',
  },
  en: {
    per_1k_input_tokens: 'Per 1K input tokens',
    per_1k_output_tokens: 'Per 1K output tokens',
    per_image: 'Per image',
    per_second: 'Per second',
    per_minute: 'Per minute',
  },
};

function NumberField({
  label,
  value,
  onChange,
  step = 'any',
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: string;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        className="input tabular"
        type="number"
        min="0"
        step={step}
        value={value}
        onChange={(event) => onChange(Math.max(0, Number(event.target.value) || 0))}
      />
    </div>
  );
}

function ManualCompare() {
  const locale = useLocale();
  const zh = locale === 'zh';
  const tr = (chinese: string, english: string) => zh ? chinese : english;
  const [state, setState] = useState<ManualCompareState>(initialState);
  const [message, setMessage] = useState('');
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Calculations still work if local persistence is blocked.
    }
  }, [state]);

  const results = useMemo(() => state.items
    .map((item) => calculateManualComparison(item, state.scenario, state.rates, state.targetCurrency))
    .sort((a, b) => {
      if (a.scenarioCost === null) return 1;
      if (b.scenarioCost === null) return -1;
      return a.scenarioCost - b.scenarioCost;
    }), [state]);

  const updateItem = (id: string, patch: Partial<ManualPriceItem>) => {
    setState((current) => ({
      ...current,
      items: current.items.map((item) => item.id === id ? { ...item, ...patch } : item),
    }));
  };

  const updateScenario = (key: keyof Scenario, value: number) => {
    setState((current) => ({ ...current, scenario: { ...current.scenario, [key]: value } }));
  };

  const changeCategory = (item: ManualPriceItem, category: ManualCategory) => {
    updateItem(item.id, {
      category,
      unitDefinitions: unitTypesForCategory(category).map((unitType) => ({ unitType, value: null })),
    });
  };

  const updateUnit = (item: ManualPriceItem, unitType: UnitDefinition['unitType'], value: number) => {
    updateItem(item.id, {
      unitDefinitions: item.unitDefinitions.map((unit) =>
        unit.unitType === unitType ? { ...unit, value } : unit),
    });
  };

  const addItem = () => {
    setState((current) => ({
      ...current,
      items: [...current.items, createManualItem(createId(), current.items.length + 1)],
    }));
  };

  const loadSample = () => {
    setState(createManualSampleState(createId(), createId()));
    setMessage(tr('已载入示例：39 CNY / 400 积分 × 20 积分/张 = 1.95 CNY/张。', 'Sample loaded: 39 CNY / 400 credits × 20 credits/image = 1.95 CNY/image.'));
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'openpricehub-manual-compare.json';
    link.click();
    URL.revokeObjectURL(url);
    setMessage(tr('比价数据已导出。', 'Comparison data exported.'));
  };

  const importJson = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const normalized = normalizeManualState(JSON.parse(await file.text()));
      if (!normalized) throw new Error('Invalid data');
      setState(normalized);
      setMessage(tr('导入成功。', 'Import complete.'));
    } catch {
      setMessage(tr('导入失败：文件格式无效。', 'Import failed: invalid file format.'));
    }
  };

  const formatCost = (value: number | null, currency: string) =>
    value === null ? '—' : `${value.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${currency}`;

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <span className="eyebrow">// MANUAL PRICE LAB</span>
          <h1 className="mt-2 font-display text-3xl font-bold text-ink">
            {tr('手动比价实验室', 'Manual price lab')}
          </h1>
          <p className="mt-2 max-w-3xl text-ink-2">
            {tr(
              '把套餐、积分消耗和直接单价统一换算到同一币种，并按真实使用场景排序。数据自动保存在当前浏览器。',
              'Normalize plans, credit usage, and direct prices into one currency, then rank them for a real usage scenario. Data is saved locally.',
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-secondary" type="button" onClick={loadSample}>{tr('载入示例', 'Load sample')}</button>
          <button className="btn-secondary" type="button" onClick={() => importRef.current?.click()}>{tr('导入 JSON', 'Import JSON')}</button>
          <button className="btn-secondary" type="button" onClick={exportJson}>{tr('导出 JSON', 'Export JSON')}</button>
          <input ref={importRef} className="hidden" type="file" accept="application/json" onChange={importJson} />
        </div>
      </header>

      {message && (
        <div className="rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-700" role="status">
          {message}
        </div>
      )}

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.5fr)_360px]">
        <div className="space-y-4">
          {state.items.map((item, index) => (
            <section className="card p-5" key={item.id}>
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <span className="eyebrow">{tr('价格规则', 'PRICE RULE')} #{index + 1}</span>
                  <h2 className="mt-1 font-display text-lg font-semibold text-ink">
                    {item.platformName || tr('未命名平台', 'Unnamed platform')} · {item.modelName || tr('未命名模型', 'Unnamed model')}
                  </h2>
                </div>
                <button
                  className="btn-ghost px-3 py-1.5 text-danger"
                  type="button"
                  disabled={state.items.length === 1}
                  onClick={() => setState((current) => ({
                    ...current,
                    items: current.items.filter((entry) => entry.id !== item.id),
                  }))}
                >
                  {tr('删除', 'Remove')}
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">{tr('平台 / 网站', 'Platform / website')}</label>
                  <input className="input" value={item.platformName}
                    onChange={(event) => updateItem(item.id, { platformName: event.target.value })} />
                </div>
                <div>
                  <label className="label">{tr('模型', 'Model')}</label>
                  <input className="input" value={item.modelName}
                    onChange={(event) => updateItem(item.id, { modelName: event.target.value })} />
                </div>
                <div>
                  <label className="label">{tr('模型类型', 'Model category')}</label>
                  <select className="input" value={item.category}
                    onChange={(event) => changeCategory(item, event.target.value as ManualCategory)}>
                    {(Object.keys(CATEGORY_LABELS[locale]) as ManualCategory[]).map((category) => (
                      <option value={category} key={category}>{CATEGORY_LABELS[locale][category]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">{tr('计费模式', 'Pricing mode')}</label>
                  <select className="input" value={item.pricingMode}
                    onChange={(event) => updateItem(item.id, { pricingMode: event.target.value as ManualPricingMode })}>
                    {(Object.keys(MODE_LABELS[locale]) as ManualPricingMode[]).map((mode) => (
                      <option value={mode} key={mode}>{MODE_LABELS[locale][mode]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">{tr('原始币种', 'Source currency')}</label>
                  <select className="input" value={item.currency}
                    onChange={(event) => updateItem(item.id, { currency: event.target.value })}>
                    {MANUAL_CURRENCIES.map((currency) => <option value={currency} key={currency}>{currency}</option>)}
                  </select>
                </div>

                {item.pricingMode === 'plan_credit_based' && (
                  <>
                    <div>
                      <label className="label">{tr('套餐名称', 'Plan name')}</label>
                      <input className="input" value={item.planName}
                        onChange={(event) => updateItem(item.id, { planName: event.target.value })} />
                    </div>
                    <NumberField label={tr('套餐价格', 'Plan price')} value={item.planPrice}
                      onChange={(planPrice) => updateItem(item.id, { planPrice })} />
                    <NumberField label={tr('套餐积分数', 'Plan credits')} value={item.creditAmount}
                      onChange={(creditAmount) => updateItem(item.id, { creditAmount })} />
                  </>
                )}

                {item.unitDefinitions.map((unit) => (
                  <NumberField
                    key={unit.unitType}
                    label={item.pricingMode === 'plan_credit_based'
                      ? `${UNIT_LABELS[locale][unit.unitType]} · ${tr('消耗积分', 'credits used')}`
                      : `${UNIT_LABELS[locale][unit.unitType]} · ${tr('直接价格', 'direct price')}`}
                    value={unit.value ?? 0}
                    onChange={(value) => updateUnit(item, unit.unitType, value)}
                  />
                ))}
              </div>

              {item.pricingMode === 'plan_credit_based' && item.planPrice > 0 && item.creditAmount > 0 && (
                <div className="receipt mt-4">
                  <div className="receipt-row">
                    <span className="k">{tr('每积分成本', 'Cost per credit')}</span>
                    <span className="v">{formatCost(item.planPrice / item.creditAmount, item.currency)}</span>
                  </div>
                </div>
              )}
            </section>
          ))}

          <button className="btn-secondary w-full" type="button" onClick={addItem}>
            + {tr('添加价格规则', 'Add price rule')}
          </button>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-20">
          <section className="card p-5">
            <h2 className="font-display font-semibold text-ink">{tr('整体参数', 'Global settings')}</h2>
            <div className="mt-4">
              <label className="label">{tr('目标结果币种', 'Target currency')}</label>
              <select className="input" value={state.targetCurrency}
                onChange={(event) => setState((current) => ({ ...current, targetCurrency: event.target.value }))}>
                {MANUAL_CURRENCIES.map((currency) => <option value={currency} key={currency}>{currency}</option>)}
              </select>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {MANUAL_CURRENCIES.map((currency) => (
                <NumberField
                  key={currency}
                  label={`1 ${currency} = ? CNY`}
                  value={state.rates[currency] ?? 0}
                  onChange={(value) => setState((current) => ({
                    ...current,
                    rates: { ...current.rates, [currency]: value || current.rates[currency] || 1 },
                  }))}
                />
              ))}
            </div>
            <p className="mt-3 text-xs text-ink-2">
              {tr('汇率由你维护，避免把静态汇率误认为实时行情。', 'Rates are user-maintained and are not presented as live market data.')}
            </p>
          </section>

          <section className="card p-5">
            <h2 className="font-display font-semibold text-ink">{tr('使用场景', 'Usage scenario')}</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <NumberField label={tr('输入 tokens', 'Input tokens')} value={state.scenario.textInputTokens}
                onChange={(value) => updateScenario('textInputTokens', value)} />
              <NumberField label={tr('输出 tokens', 'Output tokens')} value={state.scenario.textOutputTokens}
                onChange={(value) => updateScenario('textOutputTokens', value)} />
              <NumberField label={tr('图片张数', 'Images')} value={state.scenario.imageCount}
                onChange={(value) => updateScenario('imageCount', value)} />
              <NumberField label={tr('视频秒数', 'Video seconds')} value={state.scenario.videoSeconds}
                onChange={(value) => updateScenario('videoSeconds', value)} />
              <NumberField label={tr('音频分钟', 'Audio minutes')} value={state.scenario.audioMinutes}
                onChange={(value) => updateScenario('audioMinutes', value)} />
            </div>
          </section>
        </aside>
      </div>

      <section className="card overflow-hidden">
        <div className="border-b border-line px-5 py-4">
          <span className="eyebrow">{tr('对比结果', 'COMPARISON RESULTS')}</span>
          <h2 className="mt-1 font-display text-xl font-semibold text-ink">
            {tr('统一币种成本排名', 'Normalized cost ranking')}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead className="bg-surface-2 text-xs uppercase tracking-label text-ink-2">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">{tr('平台 / 模型', 'Platform / model')}</th>
                <th className="px-4 py-3">{tr('类型', 'Type')}</th>
                <th className="px-4 py-3">{tr('计费', 'Pricing')}</th>
                <th className="px-4 py-3">{tr('每积分', 'Per credit')}</th>
                <th className="px-4 py-3">{tr('原币种单位成本', 'Original unit cost')}</th>
                <th className="px-4 py-3">{tr('目标币种单位成本', 'Normalized unit cost')}</th>
                <th className="px-4 py-3">{tr('场景总成本', 'Scenario cost')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {results.map((result, index) => (
                <tr className={index === 0 && result.scenarioCost !== null ? 'bg-success-soft/40' : 'bg-surface'} key={result.id}>
                  <td className="px-4 py-4 font-semibold">{index + 1}</td>
                  <td className="px-4 py-4">
                    <div className="font-semibold text-ink">{result.platformName || '—'}</div>
                    <div className="text-xs text-ink-2">{result.modelName || '—'}</div>
                  </td>
                  <td className="px-4 py-4">{CATEGORY_LABELS[locale][result.category]}</td>
                  <td className="px-4 py-4">
                    <div>{MODE_LABELS[locale][result.pricingMode]}</div>
                    <div className="text-xs text-ink-2">{result.planName}</div>
                  </td>
                  <td className="px-4 py-4 tabular">{formatCost(result.creditUnitCost, result.sourceCurrency)}</td>
                  <td className="px-4 py-4 tabular">{formatCost(result.originalUnitCost, result.sourceCurrency)}</td>
                  <td className="px-4 py-4 tabular">{formatCost(result.convertedUnitCost, result.targetCurrency)}</td>
                  <td className="px-4 py-4 font-semibold tabular text-primary">
                    {formatCost(result.scenarioCost, result.targetCurrency)}
                    {index === 0 && result.scenarioCost !== null && (
                      <div className="mt-1 text-xs text-success">{tr('当前最低', 'Lowest')}</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default ManualCompare;
