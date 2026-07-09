// OpenPriceHub · 手动录入 / 提交价格 (文档 §12 + 参考 AIPriceCompareTool quick-entry)
// 里程碑 1: 纯前端本地 state + 实时预览,暂不接后端(待确认)。

import React, { useMemo, useState } from 'react';
import { useT, useLocale, useLocalePath } from '../i18n';
import { Link } from 'react-router-dom';
import { MOCK_TOOLS } from '../mock/tools';

type Category = 'text' | 'image' | 'video' | 'audio';
type Mode = 'direct_price_based' | 'plan_credit_based';

const CAT_LABEL: Record<'zh' | 'en', Record<Category, string>> = {
  zh: { text: '文本', image: '图片', video: '视频', audio: '音频' },
  en: { text: 'Text', image: 'Image', video: 'Video', audio: 'Audio' },
};
const CURRENCIES = ['CNY', 'USD', 'EUR', 'GBP', 'JPY', 'HKD'];
const SYMBOL: Record<string, string> = { CNY: '¥', USD: '$', EUR: '€', GBP: '£', JPY: '¥', HKD: 'HK$' };
const BILLING: { v: string; zh: string; en: string }[] = [
  { v: 'monthly', zh: '月付', en: 'Monthly' },
  { v: 'yearly', zh: '年付', en: 'Yearly' },
  { v: 'one_time', zh: '一次性', en: 'One-time' },
  { v: 'custom', zh: '自定义', en: 'Custom' },
];

const EXISTING_NAMES = Array.from(new Set(MOCK_TOOLS.map((t) => t.name)));

interface FormState {
  toolName: string;
  category: Category;
  modelName: string;
  mode: Mode;
  currency: string;
  planName: string;
  planPrice: string;
  creditAmount: string;
  billing: string;
  // 文本
  textInput: string;
  textOutput: string;
  textCached: string;
  scale: 'K' | 'M';
  // 图片
  imageValue: string;
  // 视频/音频
  mediaValue: string;
  mediaKind: 'second' | 'minute';
  mediaSize: string;
  // 证据
  sourceUrl: string;
  screenshot: string;
  email: string;
  promo: boolean;
  promoEnd: string;
  notes: string;
}

const INITIAL: FormState = {
  toolName: '', category: 'image', modelName: '', mode: 'direct_price_based', currency: 'USD',
  planName: '', planPrice: '', creditAmount: '', billing: 'monthly',
  textInput: '', textOutput: '', textCached: '', scale: 'M',
  imageValue: '', mediaValue: '', mediaKind: 'second', mediaSize: '5',
  sourceUrl: '', screenshot: '', email: '', promo: false, promoEnd: '', notes: '',
};

function num(v: string): number | null {
  if (v.trim() === '') return null;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}
function fmt(n: number): string {
  return Number(n.toFixed(6)).toString();
}

function Submit() {
  const t = useT();
  const locale = useLocale();
  const lp = useLocalePath();
  const [f, setF] = useState<FormState>(INITIAL);
  const [done, setDone] = useState(false);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((p) => ({ ...p, [k]: v }));
  const credit = f.mode === 'plan_credit_based';
  const sym = SYMBOL[f.currency] || '';

  // —— 实时预览计算(镜像参考工具 calculation.js)——
  const preview = useMemo(() => {
    const missing: string[] = [];
    if (!f.toolName.trim() || !f.modelName.trim()) missing.push(t('submit.needName'));

    const creditUnitCost = credit && num(f.planPrice) && num(f.creditAmount)
      ? num(f.planPrice)! / num(f.creditAmount)!
      : null;
    if (credit && creditUnitCost === null) missing.push(t('submit.needPlan'));

    // 收集单位值
    const rawUnits: { label: string; value: number }[] = [];
    if (f.category === 'text') {
      const scaleLbl = f.scale === 'K' ? t('submit.scaleK') : t('submit.scaleM');
      if (num(f.textInput)) rawUnits.push({ label: `${t('submit.textInput')} · ${scaleLbl}`, value: num(f.textInput)! });
      if (num(f.textOutput)) rawUnits.push({ label: `${t('submit.textOutput')} · ${scaleLbl}`, value: num(f.textOutput)! });
      if (num(f.textCached)) rawUnits.push({ label: `${t('submit.textCached')} · ${scaleLbl}`, value: num(f.textCached)! });
    } else if (f.category === 'image') {
      if (num(f.imageValue)) rawUnits.push({ label: credit ? t('submit.imageCredits') : t('submit.imagePrice'), value: num(f.imageValue)! });
    } else {
      const unit = f.mediaKind === 'minute' ? t('submit.minute') : t('submit.second');
      if (num(f.mediaValue)) rawUnits.push({ label: `${t('submit.per')} ${f.mediaSize || 1} ${unit}`, value: num(f.mediaValue)! });
    }
    if (rawUnits.length === 0) missing.push(t('submit.needUnit'));

    // 每单位成本(源币种)
    const units = rawUnits.map((u) => ({
      label: u.label,
      cost: credit ? (creditUnitCost !== null ? creditUnitCost * u.value : null) : u.value,
    }));

    const newTool = f.toolName.trim() !== '' && !EXISTING_NAMES.some((n) => n.toLowerCase() === f.toolName.trim().toLowerCase());
    const valid = missing.length === 0;

    return { valid, missing, creditUnitCost, units, newTool };
  }, [f, credit, t]);

  if (done) {
    return (
      <div className="mx-auto max-w-lg rounded-card border border-success/30 bg-success-soft/50 px-6 py-14 text-center">
        <span className="mx-auto inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-1 text-sm font-semibold text-success">
          ✓ OK
        </span>
        <h1 className="mt-4 font-display text-2xl font-bold text-ink">{t('submit.successTitle')}</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-2">{t('submit.successDesc')}</p>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={() => { setF(INITIAL); setDone(false); }} className="btn-primary">{t('submit.again')}</button>
          <Link to={lp('/tools')} className="btn-secondary">{t('soon.browse')}</Link>
        </div>
      </div>
    );
  }

  const label = (s: string) => <label className="label">{s}</label>;

  return (
    <div>
      <div className="mb-6">
        <span className="eyebrow">// SUBMIT · 手动录入</span>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink">{t('submit.title')}</h1>
        <p className="mt-2 max-w-2xl text-ink-2">{t('submit.subtitle')}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* —— 表单 —— */}
        <form
          onSubmit={(e) => { e.preventDefault(); if (preview.valid) setDone(true); }}
          className="space-y-5"
        >
          {/* 实体 */}
          <section className="card p-5">
            <h2 className="mb-4 font-display font-semibold text-ink">{t('submit.secEntity')}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                {label(t('submit.tool'))}
                <input list="tool-names" className="input" placeholder={t('submit.toolPh')} value={f.toolName} onChange={(e) => set('toolName', e.target.value)} />
                <datalist id="tool-names">
                  {EXISTING_NAMES.map((n) => <option key={n} value={n} />)}
                </datalist>
              </div>
              <div>
                {label(t('submit.category'))}
                <select className="input" value={f.category} onChange={(e) => set('category', e.target.value as Category)}>
                  {(['text', 'image', 'video', 'audio'] as Category[]).map((c) => (
                    <option key={c} value={c}>{CAT_LABEL[locale][c]}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                {label(t('submit.model'))}
                <input className="input" placeholder={t('submit.modelPh')} value={f.modelName} onChange={(e) => set('modelName', e.target.value)} />
              </div>
            </div>
          </section>

          {/* 计费方式 */}
          <section className="card p-5">
            <h2 className="mb-4 font-display font-semibold text-ink">{t('submit.secPricing')}</h2>

            {/* 模式切换 */}
            <div className="mb-4 inline-flex rounded-lg border border-line p-1">
              {(['direct_price_based', 'plan_credit_based'] as Mode[]).map((m) => (
                <button key={m} type="button" onClick={() => set('mode', m)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${f.mode === m ? 'bg-primary text-white' : 'text-ink-2 hover:text-ink'}`}>
                  {m === 'direct_price_based' ? t('submit.modeDirect') : t('submit.modeCredit')}
                </button>
              ))}
            </div>

            {/* 币种 + 积分套餐(仅积分模式) */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                {label(t('submit.currency'))}
                <select className="input" value={f.currency} onChange={(e) => set('currency', e.target.value)}>
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {credit && (
                <>
                  <div>
                    {label(t('submit.billing'))}
                    <select className="input" value={f.billing} onChange={(e) => set('billing', e.target.value)}>
                      {BILLING.map((b) => <option key={b.v} value={b.v}>{locale === 'en' ? b.en : b.zh}</option>)}
                    </select>
                  </div>
                  <div>{label(t('submit.planName'))}<input className="input" value={f.planName} onChange={(e) => set('planName', e.target.value)} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>{label(t('submit.planPrice'))}<input type="number" step="0.01" className="input" value={f.planPrice} onChange={(e) => set('planPrice', e.target.value)} /></div>
                    <div>{label(t('submit.creditAmount'))}<input type="number" className="input" value={f.creditAmount} onChange={(e) => set('creditAmount', e.target.value)} /></div>
                  </div>
                </>
              )}
            </div>

            {/* 类别自适应单位输入 */}
            <div className="mt-4 border-t border-line-2 pt-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-label text-ink-2">
                {credit ? t('submit.unitCreditTitle') : t('submit.unitInputTitle')}
              </div>

              {f.category === 'text' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-ink-2">{t('submit.scale')}:</span>
                    {(['K', 'M'] as const).map((s) => (
                      <button key={s} type="button" onClick={() => set('scale', s)} className={`chip ${f.scale === s ? 'chip-active' : ''}`}>
                        {s === 'K' ? t('submit.scaleK') : t('submit.scaleM')}
                      </button>
                    ))}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>{label(t('submit.textInput'))}<div className="relative"><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-2">{credit ? '' : sym}</span><input type="number" step="0.0001" className={`input ${credit ? '' : 'pl-7'}`} value={f.textInput} onChange={(e) => set('textInput', e.target.value)} /></div></div>
                    <div>{label(t('submit.textOutput'))}<div className="relative"><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-2">{credit ? '' : sym}</span><input type="number" step="0.0001" className={`input ${credit ? '' : 'pl-7'}`} value={f.textOutput} onChange={(e) => set('textOutput', e.target.value)} /></div></div>
                    <div>{label(t('submit.textCached'))}<div className="relative"><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-2">{credit ? '' : sym}</span><input type="number" step="0.0001" className={`input ${credit ? '' : 'pl-7'}`} value={f.textCached} onChange={(e) => set('textCached', e.target.value)} /></div></div>
                  </div>
                </div>
              )}

              {f.category === 'image' && (
                <div className="max-w-xs">
                  {label(credit ? t('submit.imageCredits') : t('submit.imagePrice'))}
                  <div className="relative"><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-2">{credit ? '' : sym}</span>
                    <input type="number" step="0.0001" className={`input ${credit ? '' : 'pl-7'}`} value={f.imageValue} onChange={(e) => set('imageValue', e.target.value)} /></div>
                </div>
              )}

              {(f.category === 'video' || f.category === 'audio') && (
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="sm:col-span-1">
                    {label(credit ? t('submit.mediaCredits') : t('submit.mediaPrice'))}
                    <div className="relative"><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-2">{credit ? '' : sym}</span>
                      <input type="number" step="0.0001" className={`input ${credit ? '' : 'pl-7'}`} value={f.mediaValue} onChange={(e) => set('mediaValue', e.target.value)} /></div>
                  </div>
                  <div>{label(t('submit.per'))}<input type="number" className="input" value={f.mediaSize} onChange={(e) => set('mediaSize', e.target.value)} /></div>
                  <div>{label(' ')}
                    <select className="input" value={f.mediaKind} onChange={(e) => set('mediaKind', e.target.value as 'second' | 'minute')}>
                      <option value="second">{t('submit.second')}</option>
                      <option value="minute">{t('submit.minute')}</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* 证据 */}
          <section className="card p-5">
            <h2 className="mb-1 font-display font-semibold text-ink">{t('submit.secEvidence')}</h2>
            <p className="mb-4 text-xs text-ink-2">{t('submit.evidenceHint')}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>{label(t('submit.sourceUrl'))}<input type="url" className="input" placeholder={t('submit.sourceUrlPh')} value={f.sourceUrl} onChange={(e) => set('sourceUrl', e.target.value)} /></div>
              <div>
                {label(t('submit.screenshot'))}
                <input type="file" accept="image/*" className="block w-full text-sm text-ink-2 file:mr-3 file:rounded-lg file:border-0 file:bg-surface-2 file:px-3 file:py-2 file:text-sm file:font-medium file:text-ink hover:file:bg-line" onChange={(e) => set('screenshot', e.target.files?.[0]?.name || '')} />
              </div>
              <div>{label(t('submit.email'))}<input type="email" className="input" placeholder={t('submit.emailPh')} value={f.email} onChange={(e) => set('email', e.target.value)} /></div>
              <div className="flex flex-col justify-end gap-2">
                <label className="inline-flex items-center gap-2 text-sm text-ink">
                  <input type="checkbox" className="h-4 w-4 accent-primary" checked={f.promo} onChange={(e) => set('promo', e.target.checked)} />
                  {t('submit.promo')}
                </label>
                {f.promo && <input type="date" className="input" value={f.promoEnd} onChange={(e) => set('promoEnd', e.target.value)} />}
              </div>
              <div className="sm:col-span-2">{label(t('submit.notes'))}<textarea rows={2} className="input" placeholder={t('submit.notesPh')} value={f.notes} onChange={(e) => set('notes', e.target.value)} /></div>
            </div>
          </section>

          <button type="submit" disabled={!preview.valid} className="btn-primary w-full">
            {t('submit.submitBtn')}
          </button>
        </form>

        {/* —— 实时预览 —— */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold text-ink">{t('submit.preview')}</h2>
              <span className={`badge badge-dot ${preview.valid ? 'bg-success-soft text-success' : 'bg-surface-2 text-ink-2'}`}>
                {preview.valid ? t('submit.canCalc') : t('submit.cannotCalc')}
              </span>
            </div>

            {/* 积分单价 */}
            {credit && preview.creditUnitCost !== null && (
              <div className="mt-4 receipt">
                <div className="receipt-row"><span className="k">{t('submit.creditUnit')}</span><span className="v">{sym}{fmt(preview.creditUnitCost)}</span></div>
              </div>
            )}

            {/* 单位成本 */}
            {preview.units.length > 0 && (
              <div className="mt-3">
                <div className="mb-1 text-xs font-semibold uppercase tracking-label text-ink-2">{t('submit.unitCostLabel')}</div>
                <div className="receipt space-y-1">
                  {preview.units.map((u, i) => (
                    <div key={i} className="receipt-row">
                      <span className="k">{u.label}</span>
                      <span className="v">{u.cost !== null ? `${sym}${fmt(u.cost)}` : '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 将创建 */}
            {preview.valid && (
              <div className="mt-4 rounded-lg bg-primary-50/70 p-3 text-sm">
                <div className="font-medium text-ink">{t('submit.willCreate')}</div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <span className="rounded-md bg-surface px-2 py-0.5 text-xs text-ink-2">{preview.newTool ? t('submit.newTool') : t('submit.existing')}: {f.toolName}</span>
                  {credit && f.planName && <span className="rounded-md bg-surface px-2 py-0.5 text-xs text-ink-2">{t('submit.newPlan')}: {f.planName}</span>}
                  <span className="rounded-md bg-surface px-2 py-0.5 text-xs text-ink-2">{t('submit.newModel')}: {f.modelName}</span>
                </div>
                <div className="mt-2 text-xs text-ink-2">{t('submit.oneRule')}</div>
              </div>
            )}

            {/* 缺失项 */}
            {preview.missing.length > 0 && (
              <div className="mt-4 rounded-lg border border-warn/30 bg-warn-soft/50 p-3 text-sm">
                <div className="font-medium text-warn">{t('submit.missing')}</div>
                <ul className="mt-1.5 space-y-1 text-ink-2">
                  {preview.missing.map((m, i) => <li key={i}>· {m}</li>)}
                </ul>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Submit;
