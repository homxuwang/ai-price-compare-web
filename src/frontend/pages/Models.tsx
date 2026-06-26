// AI Price Compare Web - 模型列表页

import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MODEL_CATEGORIES, CATEGORY_LABELS } from '../../shared/constants';
import { useModels } from '../hooks/useApi';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

function Models() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCategory = searchParams.get('category') || '';
  const { data, loading, error, refetch } = useModels(currentCategory);

  const models = data?.models || [];

  function handleCategoryChange(category: string) {
    if (category) {
      setSearchParams({ category });
    } else {
      setSearchParams({});
    }
  }

  if (loading) {
    return <Loading text="加载模型列表..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-warm-900">模型列表</h1>
        <div className="text-warm-500">{models.length} 个模型</div>
      </div>

      {/* 类别筛选 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleCategoryChange('')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            !currentCategory
              ? 'bg-primary-500 text-white'
              : 'bg-warm-100 text-warm-700 hover:bg-warm-200'
          }`}
        >
          全部
        </button>
        {MODEL_CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentCategory === category
                ? 'bg-primary-500 text-white'
                : 'bg-warm-100 text-warm-700 hover:bg-warm-200'
            }`}
          >
            {CATEGORY_LABELS[category]}
          </button>
        ))}
      </div>

      {/* 模型列表 */}
      {models.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-warm-500 mb-4">暂无模型数据</div>
          <Link to="/submit" className="btn-primary">
            提交新模型
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {models.map((model) => (
            <Link
              key={model.id}
              to={`/models/${model.id}`}
              className="card hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-medium text-warm-900">{model.name}</h2>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="px-2 py-0.5 bg-warm-100 rounded text-sm">
                      {CATEGORY_LABELS[model.category] || model.category}
                    </span>
                  </div>
                </div>
                <div className="text-primary-500">→</div>
              </div>
              <div className="mt-4 text-sm text-warm-600">
                {model.platformsCount} 个平台提供
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Models;
