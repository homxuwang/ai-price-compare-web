// AI Price Compare Web - 共享类型定义

// 平台/网站
export interface Platform {
  id: string;
  name: string;
  url?: string;
  logoUrl?: string;
  defaultCurrency: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 套餐
export interface Plan {
  id: string;
  platformId: string;
  name: string;
  price: number;
  currency: string;
  creditAmount?: number;
  billingCycle: string;
  notes?: string;
  createdAt?: string;
}

// 模型
export interface Model {
  id: string;
  name: string;
  category: 'text' | 'image' | 'video' | 'audio';
  provider?: string;
  description?: string;
  createdAt?: string;
}

// 单位定义
export interface UnitDefinition {
  unitType: 'per_1k_input_tokens' | 'per_1k_output_tokens' | 'per_image' | 'per_second' | 'per_minute';
  value: number | null;
}

// 价格规则
export interface Rule {
  id: string;
  platformId: string;
  modelId: string;
  pricingMode: 'plan_credit_based' | 'direct_price_based';
  currency: string;
  unitDefinitions: UnitDefinition[];
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 用户提交
export interface Submission {
  id: string;
  platformName: string;
  modelName: string;
  modelCategory: 'text' | 'image' | 'video' | 'audio';
  planName?: string;
  planPrice?: number;
  planCurrency?: string;
  planCreditAmount?: number;
  pricingMode: 'plan_credit_based' | 'direct_price_based';
  unitDefinitions: UnitDefinition[];
  submitterIp?: string;
  submitterNote?: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  createdAt?: string;
  reviewedAt?: string;
}

// 场景参数
export interface Scenario {
  textInputTokens: number;
  textOutputTokens: number;
  imageCount: number;
  videoSeconds: number;
  audioMinutes: number;
}

// 汇率
export interface ExchangeRates {
  baseCurrency: string;
  rates: Record<string, number>;
  updatedAt: string;
}

// 对比结果行
export interface ComparisonRow {
  platformName: string;
  modelName: string;
  category: string;
  comparisonType: string;
  pricingMode: string;
  planName: string;
  planTotalPrice: number | null;
  totalCredits: number | null;
  exchangeRate: number;
  unitUsageDescription: string;
  primaryUsageAmount: number;
  creditUnitCost: number | null;
  convertedUnitCost: number | null;
  originalUnitCost: number | null;
  originalCurrency: string;
  singleRunCost: number | null;
  unitCosts: Array<{
    unitType: string;
    usageAmount: number;
    creditUnitCost: number | null;
    originalUnitCost: number | null;
    convertedUnitCost: number | null;
    sourceCurrency: string;
  }>;
}

// API 响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 平台列表响应
export interface PlatformListResponse {
  platforms: Array<Platform & { plansCount: number; rulesCount: number }>;
}

// 模型列表响应
export interface ModelListResponse {
  models: Array<Model & { platformsCount: number }>;
}

// 价格查询响应
export interface PriceQueryResponse {
  results: Array<{
    platformName: string;
    modelName: string;
    planName: string;
    singleRunCost: number;
    currency: string;
  }>;
}

// 价格对比响应
export interface PriceCompareResponse {
  modelName: string;
  category: string;
  comparison: Array<{
    platformName: string;
    planName: string;
    singleRunCost: number;
    rank: number;
  }>;
}

// Worker 环境变量
export interface Env {
  DB: D1Database;
  KV: KVNamespace;
  ADMIN_KEY: string;
  ASSETS: { fetch: typeof fetch };
}
