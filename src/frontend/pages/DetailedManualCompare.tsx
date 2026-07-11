import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocale } from '../i18n';
import {
  buildDetailedComparisonRows,
  createDetailedSampleState,
  normalizeDetailedState,
  type DetailedCompareState,
  type DetailedModel,
  type DetailedPlan,
  type DetailedPlatform,
  type DetailedRule,
} from '../../shared/detailedCompare';
import {
  MANUAL_CURRENCIES,
  unitTypesForCategory,
  type ManualCategory,
  type ManualPricingMode,
} from '../../shared/manualCompare';
import type { Scenario, UnitDefinition } from '../../shared/types';

const STORAGE_KEY = 'oph.detailed-compare.v1';
type EntityTab = 'platforms' | 'plans' | 'models' | 'rules';
type ResultMetric = 'unit' | 'scenario';

let sequence = 0;
function createId(prefix: string) {
  if (typeof globalThis.crypto?.randomUUID === 'function') return `${prefix}-${globalThis.crypto.randomUUID()}`;
  sequence += 1;
  return `${prefix}-${Date.now()}-${sequence}`;
}

function loadInitialState() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const normalized = saved ? normalizeDetailedState(JSON.parse(saved)) : null;
    if (normalized) return normalized;
  } catch {
    // Keep the calculator usable when storage is blocked.
  }
  return createDetailedSampleState();
}

const CATEGORY_LABELS = {
  zh: { text: '文本', image: '图片', video: '视频', audio: '音频' },
  en: { text: 'Text', image: 'Image', video: 'Video', audio: 'Audio' },
};
const UNIT_LABELS = {
  zh: {
    per_1k_input_tokens: '每 1K 输入',
    per_1k_output_tokens: '每 1K 输出',
    per_image: '每张图片',
    per_second: '每秒',
    per_minute: '每分钟',
  },
  en: {
    per_1k_input_tokens: 'Per 1K input',
    per_1k_output_tokens: 'Per 1K output',
    per_image: 'Per image',
    per_second: 'Per second',
    per_minute: 'Per minute',
  },
};

function DetailedManualCompare() {
  const locale = useLocale();
  const zh = locale === 'zh';
  const tr = (chinese: string, english: string) => zh ? chinese : english;
  const [state, setState] = useState<DetailedCompareState>(loadInitialState);
  const [tab, setTab] = useState<EntityTab>('platforms');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(() => state.platforms.map((entry) => entry.id));
  const [selectedModels, setSelectedModels] = useState<string[]>(() => state.models.map((entry) => entry.id));
  const [scenario, setScenario] = useState<Scenario>(() => ({ ...state.scenario }));
  const [targetCurrency, setTargetCurrency] = useState(state.targetCurrency);
  const [metric, setMetric] = useState<ResultMetric>('scenario');
  const [generated, setGenerated] = useState(true);
  const [message, setMessage] = useState('');
  const importRef = useRef<HTMLInputElement>(null);

  const [platformDraft, setPlatformDraft] = useState({ id: '', name: '', defaultCurrency: 'CNY', notes: '' });
  const [planDraft, setPlanDraft] = useState({
    id: '', platformId: state.platforms[0]?.id ?? '', name: '', price: 0, currency: 'CNY',
    billingCycle: 'monthly' as DetailedPlan['billingCycle'], creditAmount: 0, notes: '',
  });
  const [modelDraft, setModelDraft] = useState({ id: '', name: '', category: 'image' as ManualCategory });
  const [ruleDraft, setRuleDraft] = useState({
    id: '', platformId: state.platforms[0]?.id ?? '', modelId: state.models[0]?.id ?? '',
    pricingMode: 'plan_credit_based' as ManualPricingMode, currency: 'CNY', notes: '',
    values: {} as Partial<Record<UnitDefinition['unitType'], number>>,
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore persistence errors.
    }
  }, [state]);

  const rows = useMemo(() => generated ? buildDetailedComparisonRows(state, {
    platformIds: selectedPlatforms,
    modelIds: selectedModels,
    scenario,
    targetCurrency,
  }) : [], [generated, selectedModels, selectedPlatforms, scenario, state, targetCurrency]);

  const activeRuleModel = state.models.find((entry) => entry.id === ruleDraft.modelId);
  const ruleUnits = activeRuleModel ? unitTypesForCategory(activeRuleModel.category) : [];

  const notify = (value: string) => {
    setMessage(value);
    window.setTimeout(() => setMessage(''), 3000);
  };

  const savePlatform = (event: React.FormEvent) => {
    event.preventDefault();
    const item: DetailedPlatform = {
      id: platformDraft.id || createId('platform'),
      name: platformDraft.name.trim(),
      defaultCurrency: platformDraft.defaultCurrency,
      notes: platformDraft.notes.trim(),
    };
    if (!item.name) return;
    setState((current) => ({
      ...current,
      platforms: platformDraft.id
        ? current.platforms.map((entry) => entry.id === item.id ? item : entry)
        : [...current.platforms, item],
    }));
    if (!platformDraft.id) setSelectedPlatforms((current) => [...current, item.id]);
    setPlatformDraft({ id: '', name: '', defaultCurrency: 'CNY', notes: '' });
    notify(tr('网站已保存', 'Platform saved'));
  };

  const savePlan = (event: React.FormEvent) => {
    event.preventDefault();
    if (!planDraft.platformId || !planDraft.name.trim() || planDraft.price <= 0) return;
    const item: DetailedPlan = { ...planDraft, id: planDraft.id || createId('plan'), name: planDraft.name.trim() };
    setState((current) => ({
      ...current,
      plans: planDraft.id
        ? current.plans.map((entry) => entry.id === item.id ? item : entry)
        : [...current.plans, item],
    }));
    setPlanDraft({ id: '', platformId: planDraft.platformId, name: '', price: 0, currency: 'CNY', billingCycle: 'monthly', creditAmount: 0, notes: '' });
    notify(tr('套餐已保存', 'Plan saved'));
  };

  const saveModel = (event: React.FormEvent) => {
    event.preventDefault();
    if (!modelDraft.name.trim()) return;
    const item: DetailedModel = { ...modelDraft, id: modelDraft.id || createId('model'), name: modelDraft.name.trim() };
    setState((current) => ({
      ...current,
      models: modelDraft.id
        ? current.models.map((entry) => entry.id === item.id ? item : entry)
        : [...current.models, item],
    }));
    if (!modelDraft.id) setSelectedModels((current) => [...current, item.id]);
    setModelDraft({ id: '', name: '', category: 'image' });
    notify(tr('模型已保存', 'Model saved'));
  };

  const saveRule = (event: React.FormEvent) => {
    event.preventDefault();
    if (!activeRuleModel || !ruleDraft.platformId) return;
    const unitDefinitions = ruleUnits
      .map((unitType) => ({ unitType, value: ruleDraft.values[unitType] ?? null }))
      .filter((unit) => unit.value !== null);
    if (unitDefinitions.length === 0) {
      notify(tr('请至少填写一个有效消耗或单价', 'Enter at least one valid usage or price'));
      return;
    }
    if (ruleDraft.pricingMode === 'plan_credit_based'
      && !state.plans.some((entry) => entry.platformId === ruleDraft.platformId)) {
      notify(tr('积分模式需要先为该网站录入套餐', 'Credit mode requires a plan for this platform'));
      return;
    }
    const item: DetailedRule = {
      id: ruleDraft.id || createId('rule'),
      platformId: ruleDraft.platformId,
      modelId: ruleDraft.modelId,
      pricingMode: ruleDraft.pricingMode,
      currency: ruleDraft.currency,
      unitDefinitions,
      notes: ruleDraft.notes,
    };
    setState((current) => ({
      ...current,
      rules: ruleDraft.id
        ? current.rules.map((entry) => entry.id === item.id ? item : entry)
        : [...current.rules, item],
    }));
    setRuleDraft((current) => ({ ...current, id: '', notes: '', values: {} }));
    notify(tr('模型价格已保存', 'Model price saved'));
  };

  const remove = (type: EntityTab, id: string) => {
    if (!window.confirm(tr('确定删除？相关数据也会一并清理。', 'Delete this item and related data?'))) return;
    setState((current) => {
      if (type === 'platforms') return {
        ...current,
        platforms: current.platforms.filter((entry) => entry.id !== id),
        plans: current.plans.filter((entry) => entry.platformId !== id),
        rules: current.rules.filter((entry) => entry.platformId !== id),
      };
      if (type === 'plans') return { ...current, plans: current.plans.filter((entry) => entry.id !== id) };
      if (type === 'models') return {
        ...current,
        models: current.models.filter((entry) => entry.id !== id),
        rules: current.rules.filter((entry) => entry.modelId !== id),
      };
      return { ...current, rules: current.rules.filter((entry) => entry.id !== id) };
    });
    if (type === 'platforms') setSelectedPlatforms((current) => current.filter((entry) => entry !== id));
    if (type === 'models') setSelectedModels((current) => current.filter((entry) => entry !== id));
  };

  const edit = (type: EntityTab, id: string) => {
    setTab(type);
    if (type === 'platforms') {
      const item = state.platforms.find((entry) => entry.id === id);
      if (item) setPlatformDraft(item);
    } else if (type === 'plans') {
      const item = state.plans.find((entry) => entry.id === id);
      if (item) setPlanDraft(item);
    } else if (type === 'models') {
      const item = state.models.find((entry) => entry.id === id);
      if (item) setModelDraft(item);
    } else {
      const item = state.rules.find((entry) => entry.id === id);
      if (item) setRuleDraft({
        ...item,
        values: Object.fromEntries(item.unitDefinitions.map((unit) => [unit.unitType, unit.value ?? 0])),
      });
    }
  };

  const loadSample = () => {
    const sample = createDetailedSampleState();
    setState(sample);
    setScenario({ ...sample.scenario });
    setTargetCurrency(sample.targetCurrency);
    setSelectedPlatforms(sample.platforms.map((entry) => entry.id));
    setSelectedModels(sample.models.map((entry) => entry.id));
    setGenerated(true);
    notify(tr('示例数据已载入', 'Sample data loaded'));
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'openpricehub-detailed-compare.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importJson = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const imported = normalizeDetailedState(JSON.parse(await file.text()));
      if (!imported) throw new Error('invalid');
      setState(imported);
      setScenario({ ...imported.scenario });
      setTargetCurrency(imported.targetCurrency);
      setSelectedPlatforms(imported.platforms.map((entry) => entry.id));
      setSelectedModels(imported.models.map((entry) => entry.id));
      notify(tr('数据已导入', 'Data imported'));
    } catch {
      notify(tr('导入失败：JSON 格式无效', 'Import failed: invalid JSON'));
    }
  };

  const setRate = (currency: string, value: number) => {
    if (value <= 0) return;
    setState((current) => ({ ...current, rates: { ...current.rates, [currency]: value } }));
  };
  const setScenarioValue = (key: keyof Scenario, value: number) =>
    setScenario((current) => ({ ...current, [key]: Math.max(0, value) }));
  const toggle = (id: string, values: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) =>
    setter(values.includes(id) ? values.filter((entry) => entry !== id) : [...values, id]);
  const format = (value: number | null, currency: string) =>
    value === null ? '—' : `${value.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${currency}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {[
            [tr('网站', 'Platforms'), state.platforms.length],
            [tr('套餐', 'Plans'), state.plans.length],
            [tr('模型', 'Models'), state.models.length],
            [tr('价格规则', 'Rules'), state.rules.length],
            [tr('结果币种', 'Currency'), targetCurrency],
          ].map(([label, value]) => (
            <div className="card px-4 py-3" key={label}>
              <div className="text-xs text-ink-2">{label}</div>
              <div className="mt-1 font-display text-lg font-bold text-ink">{value}</div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-secondary" type="button" onClick={loadSample}>{tr('载入示例', 'Load sample')}</button>
          <button className="btn-secondary" type="button" onClick={() => importRef.current?.click()}>{tr('导入 JSON', 'Import JSON')}</button>
          <button className="btn-secondary" type="button" onClick={exportJson}>{tr('导出 JSON', 'Export JSON')}</button>
          <input ref={importRef} type="file" className="hidden" accept="application/json" onChange={importJson} />
        </div>
      </div>

      {message && <div className="rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-700" role="status">{message}</div>}

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <section className="card overflow-hidden">
          <div className="border-b border-line px-5 py-4">
            <h2 className="font-display text-lg font-semibold text-ink">{tr('数据录入', 'Data entry')}</h2>
            <p className="mt-1 text-sm text-ink-2">{tr('按网站 → 套餐 → 模型 → 模型价格的顺序录入。', 'Enter platforms, plans, models, then model prices.')}</p>
          </div>
          <div className="flex overflow-x-auto border-b border-line px-3 pt-3">
            {([
              ['platforms', tr('1. 网站', '1. Platforms')],
              ['plans', tr('2. 套餐', '2. Plans')],
              ['models', tr('3. 模型', '3. Models')],
              ['rules', tr('4. 模型价格', '4. Model prices')],
            ] as [EntityTab, string][]).map(([value, label]) => (
              <button key={value} type="button" onClick={() => setTab(value)}
                className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold ${tab === value ? 'border-primary text-primary' : 'border-transparent text-ink-2'}`}>
                {label}
              </button>
            ))}
          </div>
          <div className="p-5">
            {tab === 'platforms' && (
              <form className="grid gap-4 sm:grid-cols-2" onSubmit={savePlatform}>
                <TextInput label={tr('网站名', 'Platform name')} value={platformDraft.name}
                  onChange={(name) => setPlatformDraft((current) => ({ ...current, name }))} />
                <SelectInput label={tr('默认币种', 'Default currency')} value={platformDraft.defaultCurrency}
                  options={MANUAL_CURRENCIES.map((value) => ({ value, label: value }))}
                  onChange={(defaultCurrency) => setPlatformDraft((current) => ({ ...current, defaultCurrency }))} />
                <div className="sm:col-span-2">
                  <TextInput label={tr('备注', 'Notes')} value={platformDraft.notes}
                    onChange={(notes) => setPlatformDraft((current) => ({ ...current, notes }))} />
                </div>
                <button className="btn-primary sm:col-span-2" type="submit">{platformDraft.id ? tr('更新网站', 'Update platform') : tr('保存网站', 'Save platform')}</button>
              </form>
            )}

            {tab === 'plans' && (
              <form className="grid gap-4 sm:grid-cols-2" onSubmit={savePlan}>
                <SelectInput label={tr('所属网站', 'Platform')} value={planDraft.platformId}
                  options={state.platforms.map((entry) => ({ value: entry.id, label: entry.name }))}
                  onChange={(platformId) => setPlanDraft((current) => ({ ...current, platformId }))} />
                <TextInput label={tr('套餐名', 'Plan name')} value={planDraft.name}
                  onChange={(name) => setPlanDraft((current) => ({ ...current, name }))} />
                <NumberInput label={tr('价格', 'Price')} value={planDraft.price}
                  onChange={(price) => setPlanDraft((current) => ({ ...current, price }))} />
                <SelectInput label={tr('币种', 'Currency')} value={planDraft.currency}
                  options={MANUAL_CURRENCIES.map((value) => ({ value, label: value }))}
                  onChange={(currency) => setPlanDraft((current) => ({ ...current, currency }))} />
                <SelectInput label={tr('周期', 'Billing cycle')} value={planDraft.billingCycle}
                  options={['monthly', 'yearly', 'one_time', 'custom'].map((value) => ({ value, label: value }))}
                  onChange={(billingCycle) => setPlanDraft((current) => ({ ...current, billingCycle: billingCycle as DetailedPlan['billingCycle'] }))} />
                <NumberInput label={tr('积分数量', 'Credits')} value={planDraft.creditAmount}
                  onChange={(creditAmount) => setPlanDraft((current) => ({ ...current, creditAmount }))} />
                <button className="btn-primary sm:col-span-2" type="submit">{planDraft.id ? tr('更新套餐', 'Update plan') : tr('保存套餐', 'Save plan')}</button>
              </form>
            )}

            {tab === 'models' && (
              <form className="grid gap-4 sm:grid-cols-2" onSubmit={saveModel}>
                <TextInput label={tr('模型名', 'Model name')} value={modelDraft.name}
                  onChange={(name) => setModelDraft((current) => ({ ...current, name }))} />
                <SelectInput label={tr('模型类型', 'Category')} value={modelDraft.category}
                  options={(Object.keys(CATEGORY_LABELS[locale]) as ManualCategory[]).map((value) => ({ value, label: CATEGORY_LABELS[locale][value] }))}
                  onChange={(category) => setModelDraft((current) => ({ ...current, category: category as ManualCategory }))} />
                <button className="btn-primary sm:col-span-2" type="submit">{modelDraft.id ? tr('更新模型', 'Update model') : tr('保存模型', 'Save model')}</button>
              </form>
            )}

            {tab === 'rules' && (
              <form className="grid gap-4 sm:grid-cols-2" onSubmit={saveRule}>
                <SelectInput label={tr('网站', 'Platform')} value={ruleDraft.platformId}
                  options={state.platforms.map((entry) => ({ value: entry.id, label: entry.name }))}
                  onChange={(platformId) => setRuleDraft((current) => ({ ...current, platformId }))} />
                <SelectInput label={tr('模型', 'Model')} value={ruleDraft.modelId}
                  options={state.models.map((entry) => ({ value: entry.id, label: `${entry.name} · ${CATEGORY_LABELS[locale][entry.category]}` }))}
                  onChange={(modelId) => setRuleDraft((current) => ({ ...current, modelId, values: {} }))} />
                <SelectInput label={tr('计费模式', 'Pricing mode')} value={ruleDraft.pricingMode}
                  options={[
                    { value: 'plan_credit_based', label: tr('积分换算', 'Plan credits') },
                    { value: 'direct_price_based', label: tr('直接价格', 'Direct price') },
                  ]}
                  onChange={(pricingMode) => setRuleDraft((current) => ({ ...current, pricingMode: pricingMode as ManualPricingMode }))} />
                {ruleDraft.pricingMode === 'direct_price_based' && (
                  <SelectInput label={tr('直接价格币种', 'Direct price currency')} value={ruleDraft.currency}
                    options={MANUAL_CURRENCIES.map((value) => ({ value, label: value }))}
                    onChange={(currency) => setRuleDraft((current) => ({ ...current, currency }))} />
                )}
                {ruleUnits.map((unitType) => (
                  <NumberInput key={unitType}
                    label={`${UNIT_LABELS[locale][unitType]} · ${ruleDraft.pricingMode === 'plan_credit_based' ? tr('消耗积分', 'credits used') : tr('单价', 'price')}`}
                    value={ruleDraft.values[unitType] ?? 0}
                    onChange={(value) => setRuleDraft((current) => ({ ...current, values: { ...current.values, [unitType]: value } }))} />
                ))}
                <button className="btn-primary sm:col-span-2" type="submit">{ruleDraft.id ? tr('更新模型价格', 'Update model price') : tr('保存模型价格', 'Save model price')}</button>
              </form>
            )}

            <SavedItems
              type={tab}
              state={state}
              locale={locale}
              onEdit={edit}
              onRemove={remove}
            />
          </div>
        </section>

        <div className="space-y-4">
          <section className="card p-5">
            <h2 className="font-display font-semibold text-ink">{tr('整体参数', 'Global settings')}</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {MANUAL_CURRENCIES.map((currency) => (
                <NumberInput key={currency} label={`1 ${currency} = ? CNY`} value={state.rates[currency] ?? 1}
                  onChange={(value) => setRate(currency, value)} />
              ))}
            </div>
            <div className="mt-4">
              <SelectInput label={tr('结果币种', 'Target currency')} value={targetCurrency}
                options={MANUAL_CURRENCIES.map((value) => ({ value, label: value }))}
                onChange={setTargetCurrency} />
            </div>
          </section>

          <section className="card p-5">
            <h2 className="font-display font-semibold text-ink">{tr('对比设置', 'Comparison settings')}</h2>
            <FilterList title={tr('选择网站', 'Select platforms')} items={state.platforms}
              selected={selectedPlatforms} onToggle={(id) => toggle(id, selectedPlatforms, setSelectedPlatforms)}
              onAll={() => setSelectedPlatforms(state.platforms.map((entry) => entry.id))} onNone={() => setSelectedPlatforms([])} />
            <FilterList title={tr('选择模型', 'Select models')} items={state.models}
              selected={selectedModels} onToggle={(id) => toggle(id, selectedModels, setSelectedModels)}
              onAll={() => setSelectedModels(state.models.map((entry) => entry.id))} onNone={() => setSelectedModels([])} />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <NumberInput label={tr('输入 tokens', 'Input tokens')} value={scenario.textInputTokens} onChange={(value) => setScenarioValue('textInputTokens', value)} />
              <NumberInput label={tr('输出 tokens', 'Output tokens')} value={scenario.textOutputTokens} onChange={(value) => setScenarioValue('textOutputTokens', value)} />
              <NumberInput label={tr('图片张数', 'Images')} value={scenario.imageCount} onChange={(value) => setScenarioValue('imageCount', value)} />
              <NumberInput label={tr('视频秒数', 'Video seconds')} value={scenario.videoSeconds} onChange={(value) => setScenarioValue('videoSeconds', value)} />
              <NumberInput label={tr('音频分钟', 'Audio minutes')} value={scenario.audioMinutes} onChange={(value) => setScenarioValue('audioMinutes', value)} />
            </div>
            <div className="mt-4">
              <SelectInput label={tr('对比指标', 'Comparison metric')} value={metric}
                options={[
                  { value: 'scenario', label: tr('本次场景总成本', 'Scenario total cost') },
                  { value: 'unit', label: tr('目标币种单位成本', 'Normalized unit cost') },
                ]}
                onChange={(value) => setMetric(value as ResultMetric)} />
            </div>
            <button className="btn-primary mt-4 w-full" type="button"
              disabled={selectedPlatforms.length === 0 || selectedModels.length === 0}
              onClick={() => setGenerated(true)}>
              {tr('生成对比表和图表', 'Generate table and chart')}
            </button>
          </section>
        </div>
      </div>

      <details className="card p-5">
        <summary className="cursor-pointer font-display font-semibold text-ink">
          {tr('查看计算说明', 'View calculation formulas')}
        </summary>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            {
              title: tr('积分套餐折算', 'Plan credit conversion'),
              formula: tr('每积分成本 = 套餐价格 ÷ 套餐总积分', 'Cost per credit = plan price ÷ total credits'),
            },
            {
              title: tr('模型单位成本', 'Model unit cost'),
              formula: tr('单位成本 = 每积分成本 × 每单位消耗积分', 'Unit cost = cost per credit × credits per unit'),
            },
            {
              title: tr('汇率换算', 'Currency conversion'),
              formula: tr('目标成本 = 原币种成本 × 原币种汇率 ÷ 目标币种汇率', 'Target cost = source cost × source rate ÷ target rate'),
            },
          ].map((item) => (
            <div className="rounded-lg border border-line bg-surface-2/60 p-4" key={item.title}>
              <div className="text-sm font-semibold text-ink">{item.title}</div>
              <code className="mt-2 block whitespace-normal text-xs leading-5 text-ink-2">{item.formula}</code>
            </div>
          ))}
        </div>
      </details>

      <Results rows={rows} metric={metric} locale={locale} format={format} />
    </div>
  );
}

function TextInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <div><label className="label">{label}</label><input className="input" value={value} onChange={(event) => onChange(event.target.value)} /></div>;
}

function NumberInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <div><label className="label">{label}</label><input className="input tabular" type="number" min="0" step="any" value={value} onChange={(event) => onChange(Math.max(0, Number(event.target.value) || 0))} /></div>;
}

function SelectInput({ label, value, options, onChange }: {
  label: string; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <select className="input" value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">—</option>
        {options.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
      </select>
    </div>
  );
}

function FilterList({ title, items, selected, onToggle, onAll, onNone }: {
  title: string; items: { id: string; name: string }[]; selected: string[];
  onToggle: (id: string) => void; onAll: () => void; onNone: () => void;
}) {
  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="label mb-0">{title}</span>
        <span className="flex gap-2 text-xs"><button type="button" className="text-primary" onClick={onAll}>All</button><button type="button" className="text-ink-2" onClick={onNone}>None</button></span>
      </div>
      <div className="max-h-36 space-y-1 overflow-y-auto rounded-lg border border-line p-2">
        {items.map((item) => (
          <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-surface-2" key={item.id}>
            <input type="checkbox" checked={selected.includes(item.id)} onChange={() => onToggle(item.id)} />
            <span>{item.name}</span>
          </label>
        ))}
        {items.length === 0 && <div className="px-2 py-3 text-sm text-ink-2">—</div>}
      </div>
    </div>
  );
}

function SavedItems({ type, state, locale, onEdit, onRemove }: {
  type: EntityTab; state: DetailedCompareState; locale: 'zh' | 'en';
  onEdit: (type: EntityTab, id: string) => void; onRemove: (type: EntityTab, id: string) => void;
}) {
  const items = type === 'platforms' ? state.platforms : type === 'plans' ? state.plans : type === 'models' ? state.models : state.rules;
  return (
    <div className="mt-6 border-t border-line pt-5">
      <h3 className="mb-3 text-sm font-semibold text-ink">{locale === 'zh' ? '已保存' : 'Saved'}</h3>
      <div className="space-y-2">
        {items.map((item) => {
          const title = 'name' in item ? item.name : state.models.find((model) => model.id === item.modelId)?.name ?? '—';
          const meta = type === 'platforms' ? (item as DetailedPlatform).defaultCurrency
            : type === 'plans' ? `${(item as DetailedPlan).price} ${(item as DetailedPlan).currency} · ${state.platforms.find((entry) => entry.id === (item as DetailedPlan).platformId)?.name ?? '—'}`
              : type === 'models' ? CATEGORY_LABELS[locale][(item as DetailedModel).category]
                : `${state.platforms.find((entry) => entry.id === (item as DetailedRule).platformId)?.name ?? '—'} · ${(item as DetailedRule).pricingMode === 'plan_credit_based' ? (locale === 'zh' ? '积分换算' : 'Credits') : (locale === 'zh' ? '直接价格' : 'Direct')}`;
          return (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface-2/50 px-3 py-2" key={item.id}>
              <div className="min-w-0"><div className="truncate text-sm font-semibold text-ink">{title}</div><div className="truncate text-xs text-ink-2">{meta}</div></div>
              <div className="flex gap-1">
                <button className="btn-ghost px-2 py-1 text-xs" type="button" onClick={() => onEdit(type, item.id)}>{locale === 'zh' ? '编辑' : 'Edit'}</button>
                <button className="btn-ghost px-2 py-1 text-xs text-danger" type="button" onClick={() => onRemove(type, item.id)}>{locale === 'zh' ? '删除' : 'Delete'}</button>
              </div>
            </div>
          );
        })}
        {items.length === 0 && <div className="text-sm text-ink-2">{locale === 'zh' ? '暂无数据' : 'No data'}</div>}
      </div>
    </div>
  );
}

function Results({ rows, metric, locale, format }: {
  rows: ReturnType<typeof buildDetailedComparisonRows>; metric: ResultMetric; locale: 'zh' | 'en';
  format: (value: number | null, currency: string) => string;
}) {
  const zh = locale === 'zh';
  const values = rows.map((row) => metric === 'scenario' ? row.scenarioCost : row.convertedUnitCost).filter((value): value is number => value !== null);
  const max = Math.max(...values, 0);
  return (
    <section className="card overflow-hidden">
      <div className="border-b border-line px-5 py-4">
        <span className="eyebrow">{zh ? '对比结果' : 'COMPARISON RESULTS'}</span>
        <h2 className="mt-1 font-display text-xl font-semibold text-ink">{zh ? '多网站 · 多套餐成本对比' : 'Cross-platform and plan comparison'}</h2>
      </div>
      {rows.length === 0 ? (
        <div className="px-5 py-12 text-center text-sm text-ink-2">{zh ? '请选择网站和模型，然后生成对比结果。' : 'Select platforms and models, then generate results.'}</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-[1050px] w-full text-left text-sm">
              <thead className="bg-surface-2 text-xs uppercase tracking-label text-ink-2">
                <tr>
                  {['#', zh ? '网站' : 'Platform', zh ? '模型' : 'Model', zh ? '类型' : 'Type', zh ? '计费方式' : 'Pricing', zh ? '套餐' : 'Plan', zh ? '消耗积分 / 单价' : 'Usage / price', zh ? '原币种单价' : 'Original unit', zh ? '目标币种单价' : 'Normalized unit', zh ? '本次成本' : 'Scenario cost'].map((heading) => <th className="px-4 py-3" key={heading}>{heading}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((row, index) => (
                  <tr className={index === 0 ? 'bg-success-soft/40' : 'bg-surface'} key={row.id}>
                    <td className="px-4 py-4 font-semibold">{index + 1}</td>
                    <td className="px-4 py-4 font-semibold text-ink">{row.platformName}</td>
                    <td className="px-4 py-4">{row.modelName}</td>
                    <td className="px-4 py-4">{CATEGORY_LABELS[locale][row.category]}</td>
                    <td className="px-4 py-4">{row.pricingMode === 'plan_credit_based' ? (zh ? '积分换算' : 'Credits') : (zh ? '直接价格' : 'Direct')}</td>
                    <td className="px-4 py-4">{row.planName || '—'}</td>
                    <td className="max-w-52 px-4 py-4 text-xs text-ink-2">{row.usageDescription}</td>
                    <td className="px-4 py-4 tabular">
                      {row.unitCosts.map((unit) => (
                        <div className="whitespace-nowrap" key={unit.unitType}>
                          <span className="text-xs text-ink-2">{UNIT_LABELS[locale][unit.unitType]}:</span>{' '}
                          {format(unit.originalUnitCost, row.originalCurrency)}
                        </div>
                      ))}
                    </td>
                    <td className="px-4 py-4 tabular">
                      {row.unitCosts.map((unit) => (
                        <div className="whitespace-nowrap" key={unit.unitType}>
                          <span className="text-xs text-ink-2">{UNIT_LABELS[locale][unit.unitType]}:</span>{' '}
                          {format(unit.convertedUnitCost, row.targetCurrency)}
                        </div>
                      ))}
                    </td>
                    <td className="px-4 py-4 font-semibold tabular text-primary">{format(row.scenarioCost, row.targetCurrency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-line p-5">
            <h3 className="font-display font-semibold text-ink">{zh ? '成本对比图' : 'Cost chart'}</h3>
            <div className="mt-5 space-y-4">
              {rows.map((row, index) => {
                const value = metric === 'scenario' ? row.scenarioCost : row.convertedUnitCost;
                const width = value !== null && max > 0 ? Math.max(2, value / max * 100) : 0;
                return (
                  <div className="grid gap-2 sm:grid-cols-[220px_1fr_150px] sm:items-center" key={row.id}>
                    <div className="truncate text-sm text-ink">{row.platformName} · {row.planName || row.modelName}</div>
                    <div className="h-8 overflow-hidden rounded-md bg-surface-2">
                      <div className={`h-full rounded-md ${index === 0 ? 'bg-success' : 'bg-primary'}`} style={{ width: `${width}%` }} />
                    </div>
                    <div className="text-right text-sm font-semibold tabular">{format(value, row.targetCurrency)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default DetailedManualCompare;
