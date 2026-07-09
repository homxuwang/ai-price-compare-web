// OpenPriceHub · 模型列表页 — 规格目录

import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MODEL_CATEGORIES, CATEGORY_LABELS } from '../../shared/constants';
import { useModels } from '../hooks/useApi';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import Sheet from '../components/Sheet';

const CATEGORY_CODES: Record<string, string> = {
  text: 'TXT',
  image: 'IMG',
  video: 'VID',
  audio: 'AUD',
};

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
    return <Loading text="加载模型列表…" />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refetch} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="eyebrow">// 规格目录 · MODELS</span>
          <h1 className="mt-3 font-mono text-3xl font-semibold text-chalk">模型列表</h1>
        </div>
        <div className="font-mono text-sm tabular-nums text-dim">
          {String(models.length).padStart(2, '0')} 项 · ITEMS
        </div>
      </div>

      {/* 类别筛选 — 尺寸线标签 */}
      <div className="flex flex-wrap border border-line">
        {[{ key: '', label: '全部', code: 'ALL' }, ...MODEL_CATEGORIES.map((c) => ({ key: c, label: CATEGORY_LABELS[c], code: CATEGORY_CODES[c] }))].map(
          (tab) => {
            const active = currentCategory === tab.key;
            return (
              <button
                key={tab.key || 'all'}
                onClick={() => handleCategoryChange(tab.key)}
                className={`flex items-baseline gap-2 border-r border-line px-4 py-2.5 font-mono text-sm uppercase tracking-wide transition-colors last:border-r-0 ${
                  active ? 'bg-cyan/10 text-cyan' : 'text-dim hover:bg-panel-2 hover:text-chalk'
                }`}
              >
                <span className="text-[10px] tracking-blueprint opacity-60">{tab.code}</span>
                {tab.label}
              </button>
            );
          }
        )}
      </div>

      {/* 列表 */}
      {models.length === 0 ? (
        <div className="border border-dashed border-line bg-panel px-4 py-14 text-center">
          <div className="mb-5 font-mono text-sm uppercase tracking-blueprint text-dim">
            — 暂无模型数据 · NO DATA —
          </div>
          <Link to="/submit" className="btn-primary">
            提交新模型 →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {models.map((model) => (
            <Link key={model.id} to={`/models/${model.id}`} className="group">
              <Sheet className="h-full p-5 transition-colors group-hover:bg-panel-2 group-hover:border-cyan">
                <div className="flex items-start justify-between">
                  <span className="font-mono text-xs font-semibold tracking-widest text-cyan">
                    {CATEGORY_CODES[model.category] || model.category?.toUpperCase()}
                  </span>
                  <span className="font-mono text-dim transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
                <h2 className="mt-4 font-mono text-lg font-medium text-chalk">{model.name}</h2>
                <div className="mt-1 font-mono text-xs uppercase tracking-wide text-dim">
                  {CATEGORY_LABELS[model.category] || model.category}
                </div>
                <div className="mt-5 flex items-baseline gap-2 border-t border-dashed border-line pt-3 font-mono text-xs text-dim">
                  <span className="tabular-nums text-chalk">{model.platformsCount}</span>
                  个平台提供
                </div>
              </Sheet>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Models;
