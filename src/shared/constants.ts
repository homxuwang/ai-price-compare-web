// AI Price Compare Web - 共享常量

// 模型类别
export const MODEL_CATEGORIES = ['text', 'image', 'video', 'audio'] as const;

// 计费模式
export const PRICING_MODES = ['plan_credit_based', 'direct_price_based'] as const;

// 单位类型
export const UNIT_TYPES = [
  'per_1k_input_tokens',
  'per_1k_output_tokens',
  'per_image',
  'per_second',
  'per_minute',
] as const;

// 账单周期
export const BILLING_CYCLES = ['monthly', 'yearly', 'one_time', 'custom'] as const;

// 提交状态
export const SUBMISSION_STATUSES = ['pending', 'approved', 'rejected'] as const;

// 默认场景参数
export const DEFAULT_SCENARIO = {
  textInputTokens: 1000,
  textOutputTokens: 500,
  imageCount: 1,
  videoSeconds: 5,
  audioMinutes: 1,
};

// 默认汇率
export const DEFAULT_EXCHANGE_RATES = {
  baseCurrency: 'CNY',
  rates: {
    CNY: 1,
    USD: 7.2,
    HKD: 0.92,
  },
  updatedAt: '2026-06-18T00:00:00.000Z',
};

// 模型类别标签
export const CATEGORY_LABELS: Record<string, string> = {
  text: '文本',
  image: '图片',
  video: '视频',
  audio: '音频',
};

// 计费模式标签
export const PRICING_MODE_LABELS: Record<string, string> = {
  plan_credit_based: '积分换算',
  direct_price_based: '直接价格',
};

// 单位类型标签
export const UNIT_TYPE_LABELS: Record<string, string> = {
  per_1k_input_tokens: '每 1K 输入',
  per_1k_output_tokens: '每 1K 输出',
  per_image: '每张图片',
  per_second: '每秒',
  per_minute: '每分钟',
};

// API 路径
export const API_PATHS = {
  PLATFORMS: '/api/platforms',
  MODELS: '/api/models',
  PRICES: '/api/prices',
  SUBMIT: '/api/submit',
  ADMIN: '/api/admin',
} as const;
