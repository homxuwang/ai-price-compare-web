// AI Price Compare Web - 价格表格组件

import React from 'react';
import { Link } from 'react-router-dom';
import { CATEGORY_LABELS, PRICING_MODE_LABELS } from '../../shared/constants';

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
      <div className="card text-center py-8 text-warm-500">暂无价格数据</div>
    );
  }

  return (
    <div className="card overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-warm-200">
            {showRank && (
              <th className="text-left py-3 px-4 font-medium text-warm-700">排名</th>
            )}
            <th className="text-left py-3 px-4 font-medium text-warm-700">平台</th>
            {showModel && (
              <th className="text-left py-3 px-4 font-medium text-warm-700">模型</th>
            )}
            <th className="text-left py-3 px-4 font-medium text-warm-700">套餐</th>
            <th className="text-right py-3 px-4 font-medium text-warm-700">单价</th>
          </tr>
        </thead>
        <tbody>
          {validData
            .sort((a, b) => (a.rank || 0) - (b.rank || 0))
            .map((row, index) => (
              <tr
                key={index}
                className={`border-b border-warm-100 last:border-0 ${
                  row.rank === 1 ? 'bg-green-50' : ''
                }`}
              >
                {showRank && (
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                        row.rank === 1
                          ? 'bg-green-500 text-white'
                          : row.rank === 2
                          ? 'bg-warm-300 text-warm-700'
                          : 'bg-warm-200 text-warm-600'
                      }`}
                    >
                      {row.rank}
                    </span>
                  </td>
                )}
                <td className="py-3 px-4">
                  {row.platformId ? (
                    <Link
                      to={`/platforms/${row.platformId}`}
                      className="text-primary-500 hover:underline"
                    >
                      {row.platformName}
                    </Link>
                  ) : (
                    <span>{row.platformName}</span>
                  )}
                </td>
                {showModel && (
                  <td className="py-3 px-4">
                    {row.modelId ? (
                      <Link
                        to={`/models/${row.modelId}`}
                        className="text-primary-500 hover:underline"
                      >
                        {row.modelName}
                      </Link>
                    ) : (
                      <span>{row.modelName}</span>
                    )}
                    {row.modelCategory && (
                      <span className="ml-2 px-2 py-0.5 bg-warm-100 rounded text-xs">
                        {CATEGORY_LABELS[row.modelCategory] || row.modelCategory}
                      </span>
                    )}
                  </td>
                )}
                <td className="py-3 px-4 text-warm-600">{row.planName || '-'}</td>
                <td className="py-3 px-4 text-right font-medium">
                  {row.singleRunCost?.toFixed(6)} {row.currency}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default PriceTable;
