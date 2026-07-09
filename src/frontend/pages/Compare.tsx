// AI Price Compare Web - 对比工具页

import React, { useEffect, useState } from 'react';
import { API_PATHS, CATEGORY_LABELS } from '../../shared/constants';
import CompareChart from '../components/CompareChart';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import Sheet from '../components/Sheet';
import DimDivider from '../components/DimDivider';

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
    <div className="space-y-8">
      <div>
        <span className="eyebrow">// 并排比对 · COMPARE</span>
        <h1 className="mt-3 font-mono text-3xl font-semibold text-chalk">价格对比工具</h1>
      </div>

      {/* 模型选择 */}
      <Sheet className="p-0">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <h2 className="font-mono text-sm uppercase tracking-blueprint text-chalk">
            选择要对比的模型
          </h2>
          <div className="flex items-center gap-4 font-mono text-xs uppercase tracking-wide">
            <button onClick={selectAll} className="text-cyan hover:text-cyan-soft">
              全选
            </button>
            <span className="text-line">|</span>
            <button onClick={clearAll} className="text-dim hover:text-chalk">
              清空
            </button>
          </div>
        </div>

        <div className="p-5">
          {modelsLoading ? (
            <Loading text="加载模型列表…" />
          ) : (
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {models.map((model) => {
                const on = selectedModels.includes(model.id);
                return (
                  <label
                    key={model.id}
                    className={`flex cursor-pointer items-center gap-3 border px-3 py-2.5 transition-colors ${
                      on ? 'border-cyan bg-cyan/10' : 'border-line hover:border-dim'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => toggleModel(model.id)}
                      className="h-4 w-4 flex-none accent-cyan"
                    />
                    <div className="min-w-0">
                      <div className="truncate font-mono text-sm text-chalk">{model.name}</div>
                      <div className="font-mono text-[10px] uppercase tracking-blueprint text-dim">
                        {CATEGORY_LABELS[model.category]}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}

          <div className="mt-5 flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-blueprint text-dim">
              已选 {String(selectedModels.length).padStart(2, '0')} 项
            </span>
            <button
              onClick={handleCompare}
              disabled={loading || selectedModels.length === 0}
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? '对比中…' : '开始对比 →'}
            </button>
          </div>
        </div>
      </Sheet>

      {/* 错误提示 */}
      {error && <ErrorMessage message={error} onRetry={handleCompare} />}

      {/* 对比结果 */}
      {results.length > 0 && (
        <div className="space-y-6">
          <DimDivider label="对比结果 · RESULTS" />
          {results.map((result, index) => (
            <div key={index} className="space-y-4">
              <CompareChart data={result.comparison} modelName={result.modelName} />
            </div>
          ))}
        </div>
      )}

      {/* 计算说明 */}
      <Sheet corners={false} className="p-5">
        <div className="eyebrow">NOTES · 计算说明</div>
        <div className="mt-4 space-y-3 font-sans text-sm text-dim">
          <p>
            <span className="font-mono text-xs uppercase tracking-wide text-cyan">积分换算</span>
            <br />单价 = (套餐价格 / 套餐积分) × 模型消耗积分
          </p>
          <p>
            <span className="font-mono text-xs uppercase tracking-wide text-cyan">直接价格</span>
            <br />直接使用平台公布的单位价格
          </p>
          <p className="border-t border-dashed border-line pt-3 font-mono text-xs text-dim">
            * 价格统一换算为 CNY 显示 · 汇率 1 USD = 7.2 CNY
          </p>
        </div>
      </Sheet>
    </div>
  );
}

export default Compare;
