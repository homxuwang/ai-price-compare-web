// AI Price Compare Web - 模型详情页

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CATEGORY_LABELS, PRICING_MODE_LABELS, UNIT_TYPE_LABELS } from '../../shared/constants';
import { useModel } from '../hooks/useApi';
import PriceTable from '../components/PriceTable';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

function ModelDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error, refetch } = useModel(id);

  const model = data?.model;

  if (loading) {
    return <Loading text="加载模型详情..." />;
  }

  if (error || !model) {
    return (
      <div className="text-center py-12">
        <ErrorMessage message={error || 'Model not found'} onRetry={refetch} />
        <div className="mt-4">
          <Link to="/models" className="btn-secondary">
            返回列表
          </Link>
        </div>
      </div>
    );
  }

  // 转换规则为价格表格数据
  const priceData = model.rules.map((rule: any) => ({
    platformName: rule.platformName,
    platformId: rule.platformId,
    modelName: model.name,
    modelId: model.id,
    modelCategory: model.category,
    planName: '',
    singleRunCost: rule.unitDefinitions[0]?.value || null,
    currency: rule.currency,
  }));

  return (
    <div className="space-y-6">
      {/* 头部信息 */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-warm-900">{model.name}</h1>
            <div className="flex items-center space-x-2 mt-2">
              <span className="px-3 py-1 bg-warm-100 rounded-full text-sm">
                {CATEGORY_LABELS[model.category] || model.category}
              </span>
              <span className="text-warm-500">
                {model.rules.length} 个平台提供
              </span>
            </div>
            {model.description && (
              <p className="text-warm-600 mt-3">{model.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* 价格对比表 */}
      <div>
        <h2 className="text-xl font-bold text-warm-900 mb-4">跨平台价格对比</h2>
        {model.rules.length === 0 ? (
          <div className="card text-center py-8 text-warm-500">暂无价格数据</div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-warm-200">
                  <th className="text-left py-3 px-4 font-medium text-warm-700">平台</th>
                  <th className="text-left py-3 px-4 font-medium text-warm-700">计费模式</th>
                  <th className="text-left py-3 px-4 font-medium text-warm-700">价格详情</th>
                </tr>
              </thead>
              <tbody>
                {model.rules.map((rule: any) => (
                  <tr key={rule.id} className="border-b border-warm-100 last:border-0">
                    <td className="py-3 px-4">
                      <Link
                        to={`/platforms/${rule.platformId}`}
                        className="text-primary-500 hover:underline"
                      >
                        {rule.platformName}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-warm-100 rounded text-sm">
                        {PRICING_MODE_LABELS[rule.pricingMode] || rule.pricingMode}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-warm-600">
                      {rule.unitDefinitions.map((ud: any, i: number) => (
                        <span key={i}>
                          {UNIT_TYPE_LABELS[ud.unitType] || ud.unitType}: {ud.value}
                          {rule.currency && ` ${rule.currency}`}
                          {i < rule.unitDefinitions.length - 1 && ' | '}
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
      <div className="card">
        <h3 className="font-medium text-warm-900 mb-3">计算说明</h3>
        <div className="text-sm text-warm-600 space-y-2">
          <p>
            <strong>积分换算模式:</strong> 单价 = (套餐价格 / 套餐积分) × 模型消耗积分
          </p>
          <p>
            <strong>直接价格模式:</strong> 直接使用平台公布的单位价格
          </p>
        </div>
      </div>

      {/* 返回按钮 */}
      <div className="pt-4">
        <Link to="/models" className="btn-secondary">
          ← 返回模型列表
        </Link>
      </div>
    </div>
  );
}

export default ModelDetail;
