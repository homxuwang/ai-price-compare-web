// OpenPriceHub · 价格表格 — 规格图纸样式,最低价旗标置顶

import React from 'react';
import { Link } from 'react-router-dom';
import { CATEGORY_LABELS } from '../../shared/constants';

interface PriceRow {
  platformName: string;
  platformId?: string;
  modelName: string;
  modelId?: string;
  modelCategory?: string;
  planName: string;
  singleRunCost: number | null;
  currency: string;
  rank?: number;
}

interface PriceTableProps {
  data: PriceRow[];
  showModel?: boolean;
  showRank?: boolean;
}

function PriceTable({ data, showModel = false, showRank = true }: PriceTableProps) {
  const validData = data.filter((d) => d.singleRunCost !== null);

  if (validData.length === 0) {
    return (
      <div className="border border-dashed border-line bg-panel px-4 py-10 text-center font-mono text-sm uppercase tracking-blueprint text-dim">
        — 暂无价格数据 · NO DATA —
      </div>
    );
  }

  const sorted = [...validData].sort((a, b) => (a.rank || 0) - (b.rank || 0));

  return (
    <div className="overflow-x-auto border border-line bg-panel">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-line text-left font-mono text-[10px] uppercase tracking-blueprint text-dim">
            {showRank && <th className="px-4 py-3 font-medium">#</th>}
            <th className="px-4 py-3 font-medium">平台 · Platform</th>
            {showModel && <th className="px-4 py-3 font-medium">模型 · Model</th>}
            <th className="px-4 py-3 font-medium">套餐 · Plan</th>
            <th className="px-4 py-3 text-right font-medium">单价 · Unit</th>
          </tr>
        </thead>
        <tbody className="font-mono text-sm">
          {sorted.map((row, index) => {
            const best = row.rank === 1;
            return (
              <tr
                key={index}
                className={`border-b border-line/50 last:border-0 transition-colors ${
                  best ? 'bg-mint/10' : 'hover:bg-panel-2'
                }`}
              >
                {showRank && (
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex h-6 min-w-6 items-center justify-center border px-1 text-xs tabular-nums ${
                        best
                          ? 'border-mint text-mint'
                          : row.rank === 2
                          ? 'border-cyan text-cyan'
                          : 'border-line text-dim'
                      }`}
                    >
                      {row.rank}
                    </span>
                  </td>
                )}
                <td className="px-4 py-3">
                  <span className="flex items-center gap-2">
                    {best && <span className="text-mint" aria-hidden>◂</span>}
                    {row.platformId ? (
                      <Link
                        to={`/platforms/${row.platformId}`}
                        className="text-chalk underline-offset-2 hover:text-cyan hover:underline"
                      >
                        {row.platformName}
                      </Link>
                    ) : (
                      <span className="text-chalk">{row.platformName}</span>
                    )}
                    {best && <span className="flag-min ml-1">LOWEST</span>}
                  </span>
                </td>
                {showModel && (
                  <td className="px-4 py-3">
                    {row.modelId ? (
                      <Link
                        to={`/models/${row.modelId}`}
                        className="text-chalk underline-offset-2 hover:text-cyan hover:underline"
                      >
                        {row.modelName}
                      </Link>
                    ) : (
                      <span className="text-chalk">{row.modelName}</span>
                    )}
                    {row.modelCategory && (
                      <span className="ml-2 border border-line px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-dim">
                        {CATEGORY_LABELS[row.modelCategory] || row.modelCategory}
                      </span>
                    )}
                  </td>
                )}
                <td className="px-4 py-3 text-dim">{row.planName || '—'}</td>
                <td
                  className={`px-4 py-3 text-right tabular-nums ${best ? 'text-mint' : 'text-chalk'}`}
                >
                  {row.singleRunCost?.toFixed(6)} {row.currency}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default PriceTable;
