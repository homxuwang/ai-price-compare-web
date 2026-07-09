// OpenPriceHub · 平台列表页 — 供应商图纸

import React from 'react';
import { Link } from 'react-router-dom';
import { usePlatforms } from '../hooks/useApi';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import Sheet from '../components/Sheet';

function Platforms() {
  const { data, loading, error, refetch } = usePlatforms();
  const platforms = data?.platforms || [];

  if (loading) {
    return <Loading text="加载平台列表…" />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refetch} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="eyebrow">// 供应商 · PLATFORMS</span>
          <h1 className="mt-3 font-mono text-3xl font-semibold text-chalk">平台列表</h1>
        </div>
        <div className="font-mono text-sm tabular-nums text-dim">
          {String(platforms.length).padStart(2, '0')} 家 · VENDORS
        </div>
      </div>

      {platforms.length === 0 ? (
        <div className="border border-dashed border-line bg-panel px-4 py-14 text-center">
          <div className="mb-5 font-mono text-sm uppercase tracking-blueprint text-dim">
            — 暂无平台数据 · NO DATA —
          </div>
          <Link to="/submit" className="btn-primary">
            提交新平台 →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {platforms.map((platform) => (
            <Link key={platform.id} to={`/platforms/${platform.id}`} className="group">
              <Sheet className="h-full p-5 transition-colors group-hover:bg-panel-2 group-hover:border-cyan">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-mono text-lg font-medium text-chalk">{platform.name}</h2>
                    <div className="mt-1 font-mono text-xs uppercase tracking-blueprint text-dim">
                      CUR · {platform.defaultCurrency}
                    </div>
                  </div>
                  <span className="font-mono text-dim transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
                <div className="mt-5 flex gap-6 border-t border-dashed border-line pt-3 font-mono text-xs text-dim">
                  <span>
                    <span className="tabular-nums text-chalk">{platform.plansCount}</span> 套餐
                  </span>
                  <span>
                    <span className="tabular-nums text-chalk">{platform.rulesCount}</span> 规则
                  </span>
                </div>
              </Sheet>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Platforms;
