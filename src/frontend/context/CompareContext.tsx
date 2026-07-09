// OpenPriceHub · 对比上下文 — 最多 4 个工具 (文档 §15.1)

import React, { createContext, useContext, useState, useCallback } from 'react';

export const MAX_COMPARE = 4;

interface CompareCtx {
  slugs: string[];
  has: (slug: string) => boolean;
  toggle: (slug: string) => boolean; // 返回操作后是否在对比中; 满 4 且新增时返回 false 并不加入
  remove: (slug: string) => void;
  clear: () => void;
  isFull: boolean;
  lastRejected: number; // 时间戳递增, 用于触发"已满"提示
}

const Ctx = createContext<CompareCtx | null>(null);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [lastRejected, setLastRejected] = useState(0);

  const has = useCallback((slug: string) => slugs.includes(slug), [slugs]);

  const toggle = useCallback(
    (slug: string) => {
      let nowIn = false;
      setSlugs((prev) => {
        if (prev.includes(slug)) {
          nowIn = false;
          return prev.filter((s) => s !== slug);
        }
        if (prev.length >= MAX_COMPARE) {
          nowIn = false;
          setLastRejected((n) => n + 1);
          return prev;
        }
        nowIn = true;
        return [...prev, slug];
      });
      return nowIn;
    },
    []
  );

  const remove = useCallback((slug: string) => {
    setSlugs((prev) => prev.filter((s) => s !== slug));
  }, []);

  const clear = useCallback(() => setSlugs([]), []);

  return (
    <Ctx.Provider
      value={{ slugs, has, toggle, remove, clear, isFull: slugs.length >= MAX_COMPARE, lastRejected }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useCompare(): CompareCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useCompare must be used within CompareProvider');
  return v;
}
