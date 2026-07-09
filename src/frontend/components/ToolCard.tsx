// OpenPriceHub · 工具卡片 (文档 §6.6 / §7.7)

import React from 'react';
import { Link } from 'react-router-dom';
import type { Tool } from '../../shared/types';
import { useT, useLocalePath, useLocale } from '../i18n';
import { useCurrency } from '../context/CurrencyProvider';
import { useCompare } from '../context/CompareContext';
import { ToolLogo } from './ToolLogo';
import { CostReceipt } from './CostReceipt';
import { ConfidenceBadge, CommercialBadge } from './Badges';

export function priceLabel(
  tool: Tool,
  format: (a: number | null | undefined, c: string) => string,
  t: (k: string) => any
): string {
  if (tool.pricingModel === 'api' || tool.pricingModel === 'usage') return t('pricing.usage');
  if (!tool.fromPrice) return t('pricing.free');
  return `${t('common.from')} ${format(tool.fromPrice, tool.fromCurrency)}${t('common.perMonth')}`;
}

export function ToolCard({ tool }: { tool: Tool }) {
  const t = useT();
  const lp = useLocalePath();
  const locale = useLocale();
  const { format, isConverted } = useCurrency();
  const compare = useCompare();
  const inCompare = compare.has(tool.slug);

  const approx = tool.fromPrice ? isConverted(tool.fromCurrency) : false;
  const tagline = locale === 'en' && tool.taglineEn ? tool.taglineEn : tool.tagline;

  return (
    <div className="card card-hover flex h-full flex-col p-5">
      {/* 头部: logo + 名称 + 对比按钮 */}
      <div className="flex items-start gap-3">
        <ToolLogo text={tool.logoText} category={tool.toolCategory} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link
              to={lp(`/tools/${tool.slug}`)}
              className="truncate font-display text-base font-semibold text-ink hover:text-primary"
            >
              {tool.name}
            </Link>
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-ink-2">{tagline}</p>
        </div>
        <button
          onClick={() => compare.toggle(tool.slug)}
          aria-pressed={inCompare}
          title={t('common.addCompare')}
          className={`flex-none rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
            inCompare
              ? 'border-primary bg-primary text-white'
              : 'border-line bg-surface text-ink-2 hover:border-primary-200 hover:text-primary'
          }`}
        >
          {inCompare ? '✓' : '+'}
        </button>
      </div>

      {/* 价格 + 成本收据 */}
      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <div className="font-display text-xl font-bold tabular text-ink">
            {approx && <span className="text-sm font-normal text-ink-2">≈ </span>}
            {priceLabel(tool, format, t)}
          </div>
          <div className="mt-0.5 text-xs text-ink-2">
            {tool.freePlan ? t('common.freePlanYes') : t('common.freePlanNo')}
          </div>
        </div>
      </div>

      {tool.unitCost && (
        <div className="mt-3">
          <CostReceipt unitCost={tool.unitCost} compact />
        </div>
      )}

      {/* 适合人群 */}
      <div className="mt-4 text-xs text-ink-2">
        <span className="text-ink-2/70">{t('common.suitableFor')}: </span>
        {tool.audiences.map((a) => t(`audiences.${a}`)).join(' / ')}
      </div>

      {/* 标签 */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {tool.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="rounded-md bg-surface-2 px-2 py-0.5 text-xs text-ink-2">
            {t(`tags.${tag}`)}
          </span>
        ))}
      </div>

      {/* 底部: 可信度 + 更新时间 + 详情 */}
      <div className="mt-4 flex items-center justify-between border-t border-line-2 pt-3">
        <div className="flex items-center gap-2">
          <ConfidenceBadge status={tool.confidence} />
          <CommercialBadge value={tool.commercialUse} />
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-ink-2">
          {t('common.lastUpdated')} {tool.lastUpdated}
        </span>
        <Link to={lp(`/tools/${tool.slug}`)} className="text-xs font-semibold text-primary hover:text-primary-700">
          {t('common.viewDetails')} →
        </Link>
      </div>
    </div>
  );
}
