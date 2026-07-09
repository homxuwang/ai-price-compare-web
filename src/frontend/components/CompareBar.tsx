// OpenPriceHub · 对比栏 (文档 §11.5 / §15.1) — 选择工具后浮现,最多 4 个

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useT, useLocalePath } from '../i18n';
import { useCompare } from '../context/CompareContext';
import { useToolsBySlugs } from '../data';

export function CompareBar() {
  const t = useT();
  const lp = useLocalePath();
  const { slugs, remove, clear, lastRejected } = useCompare();
  const tools = useToolsBySlugs(slugs);
  const [toast, setToast] = useState(false);

  // "已满" 提示
  useEffect(() => {
    if (lastRejected > 0) {
      setToast(true);
      const id = setTimeout(() => setToast(false), 2600);
      return () => clearTimeout(id);
    }
  }, [lastRejected]);

  if (slugs.length === 0 && !toast) return null;

  return (
    <>
      {toast && (
        <div className="fixed inset-x-0 bottom-24 z-50 mx-auto w-fit rounded-lg bg-ink px-4 py-2 text-sm text-white shadow-pop md:bottom-24">
          {t('tools.compareMax')}
        </div>
      )}

      {slugs.length > 0 && (
        <div className="fixed inset-x-0 bottom-14 z-40 md:bottom-4">
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 sm:px-6 lg:px-8">
            <div className="flex flex-1 items-center gap-3 rounded-card border border-line bg-surface p-2.5 shadow-pop">
              <span className="hidden pl-1 text-xs font-semibold uppercase tracking-label text-ink-2 sm:block">
                {t('bottomNav.compare')} {slugs.length}/4
              </span>
              <div className="flex flex-1 items-center gap-2 overflow-x-auto no-scrollbar">
                {tools.map((tool) => (
                  <span
                    key={tool.slug}
                    className="inline-flex flex-none items-center gap-1.5 rounded-full border border-line bg-surface-2 py-1 pl-2.5 pr-1.5 text-sm"
                  >
                    {tool.name}
                    <button
                      onClick={() => remove(tool.slug)}
                      aria-label={`移除 ${tool.name}`}
                      className="flex h-4 w-4 items-center justify-center rounded-full text-ink-2 hover:bg-line hover:text-ink"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <button onClick={clear} className="hidden text-xs text-ink-2 hover:text-ink sm:block">
                {t('common.clear')}
              </button>
              <Link to={lp(`/compare?tools=${slugs.join(',')}`)} className="btn-primary flex-none !py-2">
                {t('bottomNav.compare')} →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
