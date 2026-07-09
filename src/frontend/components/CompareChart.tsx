// OpenPriceHub · 对比图表 — 蓝图测量条

import React from 'react';

interface ChartData {
  platformName: string;
  planName?: string;
  singleRunCost: number;
  rank: number;
}

interface CompareChartProps {
  data: ChartData[];
  modelName: string;
}

function CompareChart({ data, modelName }: CompareChartProps) {
  const validData = data.filter((d) => d.singleRunCost !== null);
  if (validData.length === 0) return null;

  const maxCost = Math.max(...validData.map((d) => d.singleRunCost));
  const minCost = Math.min(...validData.map((d) => d.singleRunCost));

  return (
    <div className="border border-line bg-panel">
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <h3 className="font-mono text-sm font-medium text-chalk">{modelName}</h3>
        <span className="font-mono text-[10px] uppercase tracking-blueprint text-dim">
          单位成本 · UNIT COST
        </span>
      </div>

      <div className="space-y-3 p-5">
        {validData
          .sort((a, b) => a.rank - b.rank)
          .map((item, index) => {
            const barWidth = maxCost > 0 ? (item.singleRunCost / maxCost) * 100 : 0;
            const isMin = item.singleRunCost === minCost && validData.length > 1;
            const isMax = item.singleRunCost === maxCost && validData.length > 1;
            const tone = isMin ? 'mint' : isMax ? 'coral' : 'cyan';

            return (
              <div key={index} className="flex items-center gap-3">
                <div className="w-28 flex-none truncate font-mono text-xs text-dim sm:w-36">
                  <span className="text-chalk">{item.platformName}</span>
                  {item.planName && <span className="ml-1 text-dim">({item.planName})</span>}
                </div>

                {/* 测量轨 */}
                <div className="relative h-7 flex-1 border border-line bg-ground/40">
                  <div
                    className={`flex h-full items-center justify-end pr-2 transition-[width] duration-500 ${
                      tone === 'mint' ? 'bg-mint/25' : tone === 'coral' ? 'bg-coral/20' : 'bg-cyan/20'
                    }`}
                    style={{ width: `${Math.max(barWidth, 6)}%` }}
                  >
                    <span
                      className={`font-mono text-xs tabular-nums ${
                        tone === 'mint' ? 'text-mint' : tone === 'coral' ? 'text-coral' : 'text-cyan'
                      }`}
                    >
                      {item.singleRunCost.toFixed(6)}
                    </span>
                  </div>
                </div>

                <span
                  className={`flex h-6 w-6 flex-none items-center justify-center border font-mono text-xs tabular-nums ${
                    isMin ? 'border-mint text-mint' : isMax ? 'border-coral text-coral' : 'border-line text-dim'
                  }`}
                >
                  {item.rank}
                </span>
              </div>
            );
          })}
      </div>

      <div className="flex justify-center gap-6 border-t border-dashed border-line px-5 py-3 font-mono text-[10px] uppercase tracking-blueprint">
        <span className="flex items-center gap-2 text-mint">
          <span className="h-2 w-2 bg-mint" /> 最低价 MIN
        </span>
        <span className="flex items-center gap-2 text-coral">
          <span className="h-2 w-2 bg-coral" /> 最高价 MAX
        </span>
      </div>
    </div>
  );
}

export default CompareChart;
