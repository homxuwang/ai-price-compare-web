// OpenPriceHub · 数据层 — 现读 mock,签名与未来 API 对齐 ({data,loading,error})
// 后续只需把实现换成 fetch,调用点不变。

import { useMemo } from 'react';
import type { Tool, ToolCategory, PriceUpdate, Guide, SponsoredSlot } from '../../shared/types';
import { MOCK_TOOLS } from '../mock/tools';
import { MOCK_PRICE_UPDATES } from '../mock/priceUpdates';
import { MOCK_GUIDES } from '../mock/guides';
import { MOCK_SPONSORED } from '../mock/sponsored';
import { convert, type Currency } from '../context/CurrencyProvider';

interface Result<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

export function useTools(): Result<Tool[]> {
  return { data: MOCK_TOOLS, loading: false, error: null };
}

export function useTool(slug: string | undefined): Result<Tool | null> {
  const data = useMemo(() => MOCK_TOOLS.find((t) => t.slug === slug) ?? null, [slug]);
  return { data, loading: false, error: null };
}

export function useToolsBySlugs(slugs: string[]): Tool[] {
  return useMemo(
    () => slugs.map((s) => MOCK_TOOLS.find((t) => t.slug === s)).filter(Boolean) as Tool[],
    [slugs.join(',')] // eslint-disable-line react-hooks/exhaustive-deps
  );
}

export function usePriceUpdates(): Result<PriceUpdate[]> {
  return { data: MOCK_PRICE_UPDATES, loading: false, error: null };
}

export function useGuides(): Result<Guide[]> {
  return { data: MOCK_GUIDES, loading: false, error: null };
}

export function useSponsored(): Result<SponsoredSlot[]> {
  return { data: MOCK_SPONSORED, loading: false, error: null };
}

// ---- 纯选择器 ----------------------------------------------------

export function getPopular(category: ToolCategory, n = 4): Tool[] {
  return MOCK_TOOLS.filter((t) => t.toolCategory === category)
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, n);
}

export interface ToolFilters {
  category?: ToolCategory | 'all';
  query?: string;
  audiences?: string[];
  pricing?: string[];
  commercial?: string[];
  regions?: string[]; // 'cnAccess' | 'globalAccess' | 'cny' | 'proxy'
  capabilities?: string[]; // tag keys
}

export type SortKey = 'recommended' | 'popular' | 'priceAsc' | 'updated' | 'free';

export function filterTools(tools: Tool[], f: ToolFilters): Tool[] {
  const q = (f.query || '').trim().toLowerCase();
  return tools.filter((t) => {
    if (f.category && f.category !== 'all' && t.toolCategory !== f.category) return false;
    if (q) {
      const hay = `${t.name} ${t.slug} ${t.tagline} ${t.taglineEn ?? ''} ${t.tags.join(' ')}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (f.audiences?.length && !f.audiences.some((a) => t.audiences.includes(a))) return false;
    if (f.pricing?.length && !f.pricing.includes(t.pricingModel)) return false;
    if (f.commercial?.length && !f.commercial.includes(t.commercialUse)) return false;
    if (f.capabilities?.length && !f.capabilities.some((c) => t.tags.includes(c))) return false;
    if (f.regions?.length) {
      const ok = f.regions.every((r) => {
        if (r === 'cnAccess') return t.regions.includes('cn');
        if (r === 'globalAccess') return t.regions.includes('global');
        if (r === 'cny') return !!t.supportsCny;
        if (r === 'proxy') return !!t.needsProxyInCn;
        return true;
      });
      if (!ok) return false;
    }
    return true;
  });
}

export function sortTools(tools: Tool[], key: SortKey, currency: Currency): Tool[] {
  const arr = [...tools];
  const price = (t: Tool) => (t.fromPrice == null ? Infinity : convert(t.fromPrice, t.fromCurrency, currency));
  switch (key) {
    case 'popular':
      return arr.sort((a, b) => b.popularity - a.popularity);
    case 'priceAsc':
      return arr.sort((a, b) => price(a) - price(b));
    case 'updated':
      return arr.sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated));
    case 'free':
      return arr.sort((a, b) => Number(b.freePlan) - Number(a.freePlan) || b.popularity - a.popularity);
    case 'recommended':
    default:
      // 综合: 赞助不参与自然排序(赞助单独插入); 这里按人气 + 有免费轻微加权
      return arr.sort((a, b) => b.popularity - a.popularity);
  }
}
