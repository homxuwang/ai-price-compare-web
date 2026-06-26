// AI Price Compare Web - 对比工具页

import React, { useEffect, useState } from 'react';
import { API_PATHS, CATEGORY_LABELS } from '../../shared/constants';
import CompareChart from '../components/CompareChart';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

interface Model {
  id: string;
  name: string;
  category: string;
}

interface ComparisonResult {
  modelName: string;
  category: string;
  comparison: Array<{
    platformName: string;
    planName: string;
    singleRunCost: number;
    rank: number;
  }>;
}

function Compare() {
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [results, setResults] = useState<ComparisonResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchModels();
  }, []);

  async function fetchModels() {
    setModelsLoading(true);
    try {
      const response = await fetch(API_PATHS.MODELS);
      const data = await response.json();
      if (data.success) {
        setModels(data.data.models);
      }
    } catch (err) {
      console.error('Failed to fetch models:', err);
    } finally {
      setModelsLoading(false);
    }
  }

  async function handleCompare() {
    if (selectedModels.length === 0) {
      setError('请选择至少一个模型');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_PATHS.PRICES}/compare?model_ids=${selectedModels.join(',')}`
      );
      const data = await response.json();
      if (data.success) {
        setResults(data.data.comparisons);
      } else {
        setError(data.error || 'Failed to compare prices');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  function toggleModel(modelId: string) {
    setSelectedModels((prev) =>
      prev.includes(modelId)
        ? prev.filter((id) => id !== modelId)
        : [...prev, modelId]
    );
  }

  function selectAll() {
    setSelectedModels(models.map((m) => m.id));
  }

  function clearAll() {
    setSelectedModels([]);
    setResults([]);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-warm-900">价格对比工具</h1>

      {/* 模型选择 */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium">选择要对比的模型</h2>
          <div className="space-x-2">
            <button onClick={selectAll} className="text-sm text-primary-500 hover:underline">
              全选
            </button>
            <button onClick={clearAll} className="text-sm text-warm-500 hover:underline">
              清空
            </button>
          </div>
        </div>

        {modelsLoading ? (
          <Loading text="加载模型列表..." />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {models.map((model) => (
              <label
                key={model.id}
                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedModels.includes(model.id)
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-warm-200 hover:border-warm-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedModels.includes(model.id)}
                  onChange={() => toggleModel(model.id)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium">{model.name}</div>
                  <div className="text-sm text-warm-500">
                    {CATEGORY_LABELS[model.category]}
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleCompare}
            disabled={loading || selectedModels.length === 0}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '对比中...' : '开始对比'}
          </button>
        </div>
      </div>

      {/* 错误提示 */}
      {error && <ErrorMessage message={error} onRetry={handleCompare} />}

      {/* 对比结果 */}
      {results.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-warm-900">对比结果</h2>

          {results.map((result, index) => (
            <div key={index} className="space-y-4">
              <CompareChart
                data={result.comparison}
                modelName={result.modelName}
              />
            </div>
          ))}
        </div>
      )}

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
          <p className="text-warm-500 mt-4">
            * 所有价格已转换为 CNY 显示，汇率: 1 USD = 7.2 CNY
          </p>
        </div>
      </div>
    </div>
  );
}

export default Compare;
