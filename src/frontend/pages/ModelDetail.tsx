// AI Price Compare Web - 模型详情页

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CATEGORY_LABELS, PRICING_MODE_LABELS, UNIT_TYPE_LABELS } from '../../shared/constants';
import { useModel } from '../hooks/useApi';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import Sheet from '../components/Sheet';
import DimDivider from '../components/DimDivider';

function ModelDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error, refetch } = useModel(id);

  const model = data?.model;

  if (loading) {
    return <Loading text="加载模型详情…" />;
  }

  if (error || !model) {
    return (
      <div className="py-12 text-center">
        <ErrorMessage message={error || 'Model not found'} onRetry={refetch} />
        <div className="mt-4">
          <Link to="/models" className="btn-secondary">
            返回列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 头部规格 */}
      <Sheet className="p-6">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-semibold tracking-widest text-cyan">
            {model.category?.toUpperCase()}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-blueprint text-dim">
            SPEC · 模型规格
          </span>
        </div>
        <h1 className="mt-3 font-mono text-3xl font-semibold text-chalk">{model.name}</h1>
        <div className="mt-3 flex items-center gap-3 font-mono text-xs uppercase tracking-wide text-dim">
          <span className="border border-line px-2 py-0.5">
            {CATEGORY_LABELS[model.category] || model.category}
          </span>
          <span>
            <span className="tabular-nums text-chalk">{model.rules.length}</span> 个平台提供
          </span>
        </div>
        {model.description && (
          <p className="mt-4 font-sans text-sm leading-relaxed text-dim">{model.description}</p>
        )}
      </Sheet>

      {/* 价格对比表 */}
      <div>
        <DimDivider label="跨平台价格 · CROSS-PLATFORM" />
        {model.rules.length === 0 ? (
          <div className="mt-5 border border-dashed border-line bg-panel px-4 py-10 text-center font-mono text-sm uppercase tracking-blueprint text-dim">
            — 暂无价格数据 · NO DATA —
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto border border-line bg-panel">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-line text-left font-mono text-[10px] uppercase tracking-blueprint text-dim">
                  <th className="px-4 py-3 font-medium">平台 · Platform</th>
                  <th className="px-4 py-3 font-medium">计费模式 · Mode</th>
                  <th className="px-4 py-3 font-medium">价格详情 · Detail</th>
                </tr>
              </thead>
              <tbody className="font-mono text-sm">
                {model.rules.map((rule: any) => (
                  <tr
                    key={rule.id}
                    className="border-b border-line/50 last:border-0 hover:bg-panel-2"
                  >
                    <td className="px-4 py-3">
                      <Link
                        to={`/platforms/${rule.platformId}`}
                        className="text-chalk underline-offset-2 hover:text-cyan hover:underline"
                      >
                        {rule.platformName}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="border border-line px-2 py-0.5 text-[11px] uppercase tracking-wide text-dim">
                        {PRICING_MODE_LABELS[rule.pricingMode] || rule.pricingMode}
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-dim">
                      {rule.unitDefinitions.map((ud: any, i: number) => (
                        <span key={i}>
                          <span className="text-dim">{UNIT_TYPE_LABELS[ud.unitType] || ud.unitType}</span>
                          {': '}
                          <span className="text-chalk">
                            {ud.value}
                            {rule.currency && ` ${rule.currency}`}
                          </span>
                          {i < rule.unitDefinitions.length - 1 && <span className="text-line"> | </span>}
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 计算说明 */}
      <Sheet corners={false} className="p-5">
        <div className="eyebrow">NOTES · 计算说明</div>
        <div className="mt-4 space-y-3 font-sans text-sm text-dim">
          <p>
            <span className="font-mono text-xs uppercase tracking-wide text-cyan">积分换算</span>
            <br />单价 = (套餐价格 / 套餐积分) × 模型消耗积分
          </p>
          <p>
            <span className="font-mono text-xs uppercase tracking-wide text-cyan">直接价格</span>
            <br />直接使用平台公布的单位价格
          </p>
        </div>
      </Sheet>

      <div className="pt-2">
        <Link to="/models" className="btn-secondary">
          ← 返回模型列表
        </Link>
      </div>
    </div>
  );
}

export default ModelDetail;
