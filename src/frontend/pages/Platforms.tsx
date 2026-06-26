// AI Price Compare Web - 平台列表页

import React from 'react';
import { Link } from 'react-router-dom';
import { usePlatforms } from '../hooks/useApi';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

function Platforms() {
  const { data, loading, error, refetch } = usePlatforms();
  const platforms = data?.platforms || [];

  if (loading) {
    return <Loading text="加载平台列表..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-warm-900">平台列表</h1>
        <div className="text-warm-500">{platforms.length} 个平台</div>
      </div>

      {platforms.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-warm-500 mb-4">暂无平台数据</div>
          <Link to="/submit" className="btn-primary">
            提交新平台
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {platforms.map((platform) => (
            <Link
              key={platform.id}
              to={`/platforms/${platform.id}`}
              className="card hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-medium text-warm-900">{platform.name}</h2>
                  <div className="text-sm text-warm-500 mt-1">
                    {platform.defaultCurrency}
                  </div>
                </div>
                <div className="text-primary-500">→</div>
              </div>
              <div className="flex space-x-4 mt-4 text-sm text-warm-600">
                <span>{platform.plansCount} 套餐</span>
                <span>{platform.rulesCount} 规则</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Platforms;
