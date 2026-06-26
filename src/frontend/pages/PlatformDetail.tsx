// AI Price Compare Web - 平台详情页

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CATEGORY_LABELS, PRICING_MODE_LABELS } from '../../shared/constants';
import { usePlatform } from '../hooks/useApi';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

function PlatformDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error, refetch } = usePlatform(id);

  const platform = data?.platform;

  if (loading) {
    return <Loading text="加载平台详情..." />;
  }

  if (error || !platform) {
    return (
      <div className="text-center py-12">
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
    <div className="space-y-6">
      {/* 头部信息 */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-warm-900">{platform.name}</h1>
            <div className="text-warm-500 mt-1">
              默认币种: {platform.defaultCurrency}
            </div>
            {platform.url && (
              <a
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-500 hover:underline text-sm mt-2 inline-block"
              >
                访问官网 →
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 套餐列表 */}
      <div>
        <h2 className="text-xl font-bold text-warm-900 mb-4">套餐</h2>
        {platform.plans.length === 0 ? (
          <div className="card text-center py-8 text-warm-500">暂无套餐</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {platform.plans.map((plan: any) => (
              <div key={plan.id} className="card">
                <h3 className="font-medium">{plan.name}</h3>
                <div className="text-2xl font-bold text-primary-500 mt-2">
                  {plan.price} {plan.currency}
                </div>
                {plan.creditAmount && (
                  <div className="text-sm text-warm-500 mt-1">
                    {plan.creditAmount.toLocaleString()} 积分
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 价格规则 */}
      <div>
        <h2 className="text-xl font-bold text-warm-900 mb-4">价格规则</h2>
        {platform.rules.length === 0 ? (
          <div className="card text-center py-8 text-warm-500">暂无价格规则</div>
        ) : (
          <div className="space-y-4">
            {platform.rules.map((rule: any) => (
              <div key={rule.id} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <Link
                      to={`/models/${rule.modelId}`}
                      className="font-medium text-primary-500 hover:underline"
                    >
                      {rule.modelName}
                    </Link>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="px-2 py-0.5 bg-warm-100 rounded text-sm">
                        {CATEGORY_LABELS[rule.modelCategory] || rule.modelCategory}
                      </span>
                      <span className="px-2 py-0.5 bg-warm-100 rounded text-sm">
                        {PRICING_MODE_LABELS[rule.pricingMode] || rule.pricingMode}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-sm text-warm-600">
                  {rule.unitDefinitions.map((ud: any, i: number) => (
                    <span key={i}>
                      {ud.unitType}: {ud.value}
                      {i < rule.unitDefinitions.length - 1 && ' | '}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 返回按钮 */}
      <div className="pt-4">
        <Link to="/platforms" className="btn-secondary">
          ← 返回平台列表
        </Link>
      </div>
    </div>
  );
}

export default PlatformDetail;
