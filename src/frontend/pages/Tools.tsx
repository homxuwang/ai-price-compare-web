// OpenPriceHub · AI 工具库 (文档 §6)

import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { Tool, ToolCategory } from '../../shared/types';
import { useT, useLocale, useLocalePath } from '../i18n';
import { useCurrency } from '../context/CurrencyProvider';
import { useCompare } from '../context/CompareContext';
import { useTools, useSponsored, filterTools, sortTools, type ToolFilters, type SortKey } from '../data';
import { ToolCard, priceLabel } from '../components/ToolCard';
import { ToolLogo } from '../components/ToolLogo';
import { ConfidenceBadge, CommercialBadge } from '../components/Badges';
import { SearchBar } from '../components/SearchBar';
import { SponsoredCard } from '../components/SponsoredCard';
import { EmptyState } from '../components/EmptyState';

const CATS: (ToolCategory | 'all')[] = ['all', 'image', 'video', 'llm-api'];

const FILTER_CONFIG: { group: string; field: keyof ToolFilters; options: string[]; tkey: string }[] = [
  { group: 'audience', field: 'audiences', options: ['ecommerce', 'designer', 'creator', 'developer', 'team', 'individual'], tkey: 'audiences' },
  { group: 'pricing', field: 'pricing', options: ['subscription', 'credit', 'usage', 'api'], tkey: 'pricing' },
  { group: 'commercial', field: 'commercial', options: ['yes', 'paid', 'unclear', 'no'], tkey: 'commercial' },
  { group: 'region', field: 'regions', options: ['cnAccess', 'globalAccess', 'cny', 'proxy'], tkey: 'regions' },
  { group: 'capability', field: 'capabilities', options: ['t2i', 'i2i', 't2v', 'i2v', 'text', 'vision', 'coding', 'commercial', 'highQuality'], tkey: 'tags' },
];

// —— 筛选面板(桌面侧栏 / 移动抽屉共用) ——
function FilterPanel({ filters, setFilters }: { filters: ToolFilters; setFilters: (f: ToolFilters) => void }) {
  const t = useT();
  const toggle = (field: keyof ToolFilters, val: string) => {
    const arr = (filters[field] as string[] | undefined) ?? [];
    const next = arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
    setFilters({ ...filters, [field]: next });
  };
  return (
    <div className="space-y-6">
      {FILTER_CONFIG.map((g) => (
        <div key={g.group}>
          <div className="mb-2 text-xs font-semibold uppercase tracking-label text-ink-2">
            {t(`tools.filterGroups.${g.group}`)}
          </div>
          <div className="flex flex-wrap gap-2">
            {g.options.map((opt) => {
              const active = ((filters[g.field] as string[] | undefined) ?? []).includes(opt);
              return (
                <button key={opt} onClick={() => toggle(g.field, opt)} className={`chip ${active ? 'chip-active' : ''}`}>
                  {t(`${g.tkey}.${opt}`)}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function SortSelect({ value, onChange }: { value: SortKey; onChange: (v: SortKey) => void }) {
  const t = useT();
  const opts: SortKey[] = ['recommended', 'popular', 'priceAsc', 'updated', 'free'];
  return (
    <label className="inline-flex items-center gap-2 text-sm text-ink-2">
      <span className="hidden sm:inline">{t('common.sort')}</span>
      <select value={value} onChange={(e) => onChange(e.target.value as SortKey)} className="input !w-auto !py-1.5 !pr-8 text-sm">
        {opts.map((o) => (
          <option key={o} value={o}>
            {t(`tools.sortOptions.${o}`)}
          </option>
        ))}
      </select>
    </label>
  );
}

function ViewToggle({ view, onChange }: { view: 'card' | 'table'; onChange: (v: 'card' | 'table') => void }) {
  const t = useT();
  return (
    <div className="inline-flex overflow-hidden rounded-lg border border-line text-sm font-medium">
      {(['card', 'table'] as const).map((v) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          aria-pressed={view === v}
          className={`px-3 py-1.5 transition-colors ${view === v ? 'bg-primary text-white' : 'bg-surface text-ink-2 hover:bg-surface-2'}`}
        >
          {v === 'card' ? t('tools.viewCard') : t('tools.viewTable')}
        </button>
      ))}
    </div>
  );
}

// —— 表格视图 ——
function ToolTable({ tools }: { tools: Tool[] }) {
  const t = useT();
  const lp = useLocalePath();
  const locale = useLocale();
  const { format, isConverted } = useCurrency();
  const compare = useCompare();
  return (
    <div className="overflow-x-auto rounded-card border border-line bg-surface">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-label text-ink-2">
            <th className="px-4 py-3">{t('tools.tableCols.tool')}</th>
            <th className="px-4 py-3">{t('tools.tableCols.price')}</th>
            <th className="px-4 py-3">{t('tools.tableCols.unit')}</th>
            <th className="px-4 py-3">{t('tools.tableCols.commercial')}</th>
            <th className="px-4 py-3">{t('tools.tableCols.confidence')}</th>
            <th className="px-4 py-3 text-right">{t('tools.tableCols.updated')}</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {tools.map((tool) => {
            const inC = compare.has(tool.slug);
            const approxU = tool.unitCost ? isConverted(tool.unitCost.currency) : false;
            return (
              <tr key={tool.id} className="border-b border-line-2 last:border-0 hover:bg-surface-2/50">
                <td className="px-4 py-3">
                  <Link to={lp(`/tools/${tool.slug}`)} className="flex items-center gap-3">
                    <ToolLogo text={tool.logoText} category={tool.toolCategory} size="sm" />
                    <span>
                      <span className="font-medium text-ink hover:text-primary">{tool.name}</span>
                      <span className="block max-w-xs truncate text-xs text-ink-2">
                        {locale === 'en' && tool.taglineEn ? tool.taglineEn : tool.tagline}
                      </span>
                    </span>
                  </Link>
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-mono font-semibold tabular text-ink">
                  {priceLabel(tool, format, t)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-ink-2">
                  {tool.unitCost ? `${approxU ? '≈' : ''}${format(tool.unitCost.low, tool.unitCost.currency)}–${format(tool.unitCost.high, tool.unitCost.currency)}` : '—'}
                </td>
                <td className="px-4 py-3"><CommercialBadge value={tool.commercialUse} /></td>
                <td className="px-4 py-3"><ConfidenceBadge status={tool.confidence} /></td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-xs text-ink-2">{tool.lastUpdated}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => compare.toggle(tool.slug)}
                    className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${inC ? 'border-primary bg-primary text-white' : 'border-line text-ink-2 hover:border-primary-200 hover:text-primary'}`}
                  >
                    {inC ? '✓' : '+'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Tools() {
  const t = useT();
  const lp = useLocalePath();
  const { currency } = useCurrency();
  const [params, setParams] = useSearchParams();
  const allTools = useTools().data;
  const sponsored = useSponsored().data;

  const urlCat = (params.get('category') as ToolCategory | null) || 'all';
  const urlQ = params.get('q') || '';

  const [filters, setFilters] = useState<ToolFilters>({ audiences: [], pricing: [], commercial: [], regions: [], capabilities: [] });
  const [sort, setSort] = useState<SortKey>('recommended');
  const [view, setView] = useState<'card' | 'table'>('card');
  const [drawer, setDrawer] = useState(false);
  const [more, setMore] = useState(false);

  const setCategory = (c: ToolCategory | 'all') => {
    const next = new URLSearchParams(params);
    if (c === 'all') next.delete('category');
    else next.set('category', c);
    setParams(next, { replace: true });
  };
  const setQuery = (q: string) => {
    const next = new URLSearchParams(params);
    if (q) next.set('q', q);
    else next.delete('q');
    setParams(next, { replace: true });
  };

  const result = useMemo(() => {
    const filtered = filterTools(allTools, { ...filters, category: urlCat, query: urlQ });
    return sortTools(filtered, sort, currency);
  }, [allTools, filters, urlCat, urlQ, sort, currency]);

  // 计算激活筛选数(用于移动端按钮角标)
  const activeCount = FILTER_CONFIG.reduce((n, g) => n + ((filters[g.field] as string[] | undefined)?.length ?? 0), 0);

  return (
    <div>
      {/* 标题 */}
      <div className="mb-6">
        <span className="eyebrow">// {t('categories.all')} · TOOLS</span>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink">{t('tools.title')}</h1>
        <p className="mt-2 max-w-2xl text-ink-2">{t('tools.desc')}</p>
      </div>

      {/* 搜索 */}
      <div className="mb-4 max-w-xl">
        <SearchBar placeholder={t('tools.searchPlaceholder')} defaultValue={urlQ} onSearch={setQuery} />
      </div>

      {/* 分类 Tab */}
      <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-line pb-4">
        {CATS.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
              urlCat === c ? 'bg-primary text-white' : 'text-ink-2 hover:bg-surface-2 hover:text-ink'
            }`}
          >
            {t(`categories.${c}`)}
          </button>
        ))}
        <button onClick={() => setMore((v) => !v)} className="rounded-lg px-3.5 py-2 text-sm font-medium text-ink-2 hover:bg-surface-2">
          {t('categories.more')} ▾
        </button>
        {more &&
          (t('tools.moreCats') as string[]).map((m) => (
            <button key={m} onClick={() => setQuery(m)} className="chip">
              {m}
            </button>
          ))}
      </div>

      <div className="flex gap-6">
        {/* 桌面侧栏筛选 */}
        <aside className="hidden w-56 flex-none lg:block">
          <FilterPanel filters={filters} setFilters={setFilters} />
        </aside>

        {/* 主区 */}
        <div className="min-w-0 flex-1">
          {/* 工具条 */}
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-ink-2">
              <button
                onClick={() => setDrawer(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 font-medium lg:hidden"
              >
                {t('common.filter')}
                {activeCount > 0 && <span className="rounded-full bg-primary px-1.5 text-xs text-white">{activeCount}</span>}
              </button>
              <span className="tabular">
                {result.length} {t('tools.resultsCount')}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <SortSelect value={sort} onChange={setSort} />
              <ViewToggle view={view} onChange={setView} />
            </div>
          </div>

          {/* 列表 */}
          {result.length === 0 ? (
            <EmptyState
              title={t('tools.empty')}
              action={
                <button onClick={() => { setFilters({ audiences: [], pricing: [], commercial: [], regions: [], capabilities: [] }); setCategory('all'); setQuery(''); }} className="btn-secondary">
                  {t('common.reset')}
                </button>
              }
            />
          ) : view === 'table' ? (
            <ToolTable tools={result} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {result.slice(0, 6).map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
              {/* 中部 Sponsored 插入 */}
              {sponsored[0] && result.length > 6 && (
                <div className="sm:col-span-2 xl:col-span-3">
                  <SponsoredCard slot={sponsored[0]} />
                </div>
              )}
              {result.slice(6).map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 移动端筛选抽屉 */}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-ink/30" onClick={() => setDrawer(false)} />
          <div className="absolute inset-y-0 right-0 w-80 max-w-[85vw] overflow-y-auto bg-surface p-5 shadow-pop">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display font-semibold text-ink">{t('common.filter')}</span>
              <button onClick={() => setDrawer(false)} className="rounded-lg p-1.5 text-ink-2 hover:bg-surface-2" aria-label="关闭">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <FilterPanel filters={filters} setFilters={setFilters} />
            <div className="mt-6 flex gap-3">
              <button onClick={() => setFilters({ audiences: [], pricing: [], commercial: [], regions: [], capabilities: [] })} className="btn-secondary flex-1">
                {t('common.reset')}
              </button>
              <button onClick={() => setDrawer(false)} className="btn-primary flex-1">
                {t('common.apply')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tools;
