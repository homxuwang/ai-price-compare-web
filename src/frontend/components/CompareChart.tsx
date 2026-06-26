// AI Price Compare Web - 对比图表组件

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
    <div className="card">
      <h3 className="font-medium text-warm-900 mb-4">{modelName} 价格对比图</h3>

      <div className="space-y-3">
        {validData
          .sort((a, b) => a.rank - b.rank)
          .map((item, index) => {
            const barWidth = maxCost > 0 ? (item.singleRunCost / maxCost) * 100 : 0;
            const isMin = item.singleRunCost === minCost && validData.length > 1;
            const isMax = item.singleRunCost === maxCost && validData.length > 1;

            return (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-32 text-sm text-warm-700 truncate">
                  {item.platformName}
                  {item.planName && (
                    <span className="text-warm-500 ml-1">({item.planName})</span>
                  )}
                </div>

                <div className="flex-1 h-8 bg-warm-100 rounded-lg overflow-hidden">
                  <div
                    className={`h-full rounded-lg flex items-center justify-end pr-2 transition-all duration-500 ${
                      isMin
                        ? 'bg-green-500'
                        : isMax
                        ? 'bg-red-400'
                        : 'bg-primary-400'
                    }`}
                    style={{ width: `${Math.max(barWidth, 5)}%` }}
                  >
                    <span className="text-xs text-white font-medium">
                      {item.singleRunCost.toFixed(6)}
                    </span>
                  </div>
                </div>

                <div className="w-12 text-right">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                      item.rank === 1
                        ? 'bg-green-500 text-white'
                        : item.rank === 2
                        ? 'bg-warm-300 text-warm-700'
                        : 'bg-warm-200 text-warm-600'
                    }`}
                  >
                    {item.rank}
                  </span>
                </div>
              </div>
            );
          })}
      </div>

      <div className="flex justify-center space-x-6 mt-4 text-sm">
        <div className="flex items-center">
          <span className="w-3 h-3 bg-green-500 rounded mr-2"></span>
          <span className="text-warm-600">最低价</span>
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 bg-red-400 rounded mr-2"></span>
          <span className="text-warm-600">最高价</span>
        </div>
      </div>
    </div>
  );
}

export default CompareChart;
