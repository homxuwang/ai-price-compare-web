// OpenPriceHub · Mock 最新价格更新 (文档 §5.9)

import type { PriceUpdate } from '../../shared/types';

export const MOCK_PRICE_UPDATES: PriceUpdate[] = [
  {
    id: 'u1',
    toolSlug: 'kling',
    toolName: 'Kling 可灵',
    summary: 'Pro 会员套餐价格已更新',
    summaryEn: 'Pro membership price updated',
    date: '2026-07-08',
    status: 'verified',
  },
  {
    id: 'u2',
    toolSlug: 'runway',
    toolName: 'Runway',
    summary: 'Standard 套餐已核验',
    summaryEn: 'Standard plan verified',
    date: '2026-07-08',
    status: 'official',
  },
  {
    id: 'u3',
    toolSlug: 'claude',
    toolName: 'Anthropic Claude',
    summary: 'API 价格已更新',
    summaryEn: 'API pricing updated',
    date: '2026-07-07',
    status: 'official',
  },
  {
    id: 'u4',
    toolSlug: 'midjourney',
    toolName: 'Midjourney',
    summary: '年付价格已确认',
    summaryEn: 'Annual pricing confirmed',
    date: '2026-07-06',
    status: 'official',
  },
  {
    id: 'u5',
    toolSlug: 'luma',
    toolName: 'Luma Dream Machine',
    summary: '用户提交限时活动价,待核验',
    summaryEn: 'User-submitted promo price, pending review',
    date: '2026-07-05',
    status: 'promotional',
  },
  {
    id: 'u6',
    toolSlug: 'ideogram',
    toolName: 'Ideogram',
    summary: '用户提交 Basic 套餐价格',
    summaryEn: 'User submitted Basic plan price',
    date: '2026-07-03',
    status: 'user-submitted',
  },
];
