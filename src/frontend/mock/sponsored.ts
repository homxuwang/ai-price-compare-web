// OpenPriceHub · Mock 赞助位 (文档 §5.6) — 必须明确标注赞助,不参与默认排序

import type { SponsoredSlot } from '../../shared/types';

export const MOCK_SPONSORED: SponsoredSlot[] = [
  {
    id: 's1',
    toolSlug: 'recraft',
    toolName: 'Recraft',
    tagline: '矢量与品牌视觉的 AI 设计工具。',
    taglineEn: 'AI design tool for vector and brand visuals.',
    logoText: 'Rc',
    url: 'https://www.recraft.ai',
    ctaLabel: '了解更多',
  },
  {
    id: 's2',
    toolSlug: 'heygen',
    toolName: 'HeyGen',
    tagline: 'AI 数字人视频,适合口播与营销。',
    taglineEn: 'AI avatar videos for spokesperson and marketing.',
    logoText: 'Hg',
    url: 'https://www.heygen.com',
    ctaLabel: '了解更多',
  },
];
