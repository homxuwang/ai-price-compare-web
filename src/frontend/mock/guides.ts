// OpenPriceHub · Mock 精选指南 (文档 §5.11)

import type { Guide } from '../../shared/types';

export const MOCK_GUIDES: Guide[] = [
  {
    id: 'g1',
    slug: 'choose-ai-image-tool',
    title: '如何选择 AI 生图工具?',
    titleEn: 'How to Choose an AI Image Generator',
    excerpt: '从画质、商用权限、批量能力和单张成本四个维度快速判断。',
    category: 'image',
  },
  {
    id: 'g2',
    slug: 'ai-video-real-cost',
    title: 'AI 生视频工具怎么计算真实成本?',
    titleEn: 'How to Estimate the Real Cost of AI Video Tools',
    excerpt: '积分规则、失败重试、分辨率和时长如何影响每条视频的成本。',
    category: 'video',
  },
  {
    id: 'g3',
    slug: 'llm-pricing-beyond-token',
    title: 'LLM/API 价格为什么不能只看 token 单价?',
    titleEn: 'Why LLM/API Pricing Is More Than Token Cost',
    excerpt: '缓存、上下文、输入输出比例和聚合平台手续费都会改变实际账单。',
    category: 'llm-api',
  },
];
