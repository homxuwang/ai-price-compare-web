// AI Price Compare Web - 平台详情页

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CATEGORY_LABELS, PRICING_MODE_LABELS, UNIT_TYPE_LABELS } from '../../shared/constants';
import { usePlatform } from '../hooks/useApi';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import Sheet from '../components/Sheet';
import DimDivider from '../components/DimDivider';

function PlatformDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error, refetch } = usePlatform(id);

  const platform = data?.platform;

  if (loading) {
    return <Loading text="加载平台详情…" />;
  }

  if (error || !platform) {
    return (
      <div className="py-12 text-center">
        <ErrorMessage message={error || 'Platform not found'} onRetry={refetch} />
        <div className="mt-4">
          <Link to="/platforms" className="btn-secondary">
            返回列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 头部信息 */}
      <Sheet className="p-6">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-blueprint text-dim">
            VENDOR · 供应商
          </span>
          <span className="border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-blueprint text-dim">
            CUR · {platform.defaultCurrency}
          </span>
        </div>
        <h1 className="mt-3 font-mono text-3xl font-semibold text-chalk">{platform.name}</h1>
        {platform.url && (
          <a
            href={platform.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block font-mono text-sm text-cyan hover:text-cyan-soft"
          >
            访问官网 ↗
          </a>
        )}
      </Sheet>

      {/* 套餐列表 */}
      <div>
        <DimDivider label="套餐 · PLANS" />
        {platform.plans.length === 0 ? (
          <div className="mt-5 border border-dashed border-line bg-panel px-4 py-10 text-center font-mono text-sm uppercase tracking-blueprint text-dim">
            — 暂无套餐 · NO PLANS —
          </div>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {platform.plans.map((plan: any) => (
              <Sheet key={plan.id} className="p-5">
                <h3 className="font-mono text-sm uppercase tracking-wide text-dim">{plan.name}</h3>
                <div className="mt-3 font-mono text-2xl font-semibold tabular-nums text-cyan">
                  {plan.price} <span className="text-sm text-dim">{plan.currency}</span>
                </div>
                {plan.creditAmount && (
                  <div className="mt-2 border-t border-dashed border-line pt-2 font-mono text-xs tabular-nums text-dim">
                    {plan.creditAmount.toLocaleString()} 积分
                  </div>
                )}
              </Sheet>
            ))}
          </div>
        )}
      </div>

      {/* 价格规则 */}
      <div>
        <DimDivider label="价格规则 · RULES" />
        {platform.rules.length === 0 ? (
          <div className="mt-5 border border-dashed border-line bg-panel px-4 py-10 text-center font-mono text-sm uppercase tracking-blueprint text-dim">
            — 暂无价格规则 · NO RULES —
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {platform.rules.map((rule: any) => (
              <Sheet key={rule.id} corners={false} className="p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to={`/models/${rule.modelId}`}
                    className="font-mono text-base font-medium text-chalk underline-offset-2 hover:text-cyan hover:underline"
                  >
                    {rule.modelName}
                  </Link>
                  <span className="border border-line px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide text-dim">
                    {CATEGORY_LABELS[rule.modelCategory] || rule.modelCategory}
                  </span>
                  <span className="border border-line px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide text-dim">
                    {PRICING_MODE_LABELS[rule.pricingMode] || rule.pricingMode}
                  </span>
                </div>
                <div className="mt-3 border-t border-dashed border-line pt-3 font-mono text-sm text-dim">
                  {rule.unitDefinitions.map((ud: any, i: number) => (
                    <span key={i}>
                      {UNIT_TYPE_LABELS[ud.unitType] || ud.unitType}:{' '}
                      <span className="tabular-nums text-chalk">{ud.value}</span>
                      {i < rule.unitDefinitions.length - 1 && <span className="text-line"> | </span>}
                    </span>
                  ))}
                </div>
              </Sheet>
            ))}
          </div>
        )}
      </div>

      <div className="pt-2">
        <Link to="/platforms" className="btn-secondary">
          ← 返回平台列表
        </Link>
      </div>
    </div>
  );
}

export default PlatformDetail;
