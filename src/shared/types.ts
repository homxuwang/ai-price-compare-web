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

// ============================================================
// Studio 产品模型 — AI 工具比价 (里程碑 1, 前端 mock)
// ============================================================

export type ToolCategory = 'image' | 'video' | 'llm-api';

// 价格可信度 (文档 §15.2)
export type PriceConfidence =
  | 'official' // 官方价格
  | 'verified' // 已核验
  | 'user-submitted' // 用户提交
  | 'pending' // 待核验
  | 'promotional' // 活动价
  | 'regional' // 地区价
  | 'outdated'; // 可能已过期

export type PricingModelType =
  | 'free'
  | 'subscription'
  | 'credit'
  | 'usage'
  | 'api'
  | 'team'
  | 'enterprise';

// 商用权限 (文档 §6.4)
export type CommercialUse = 'yes' | 'paid' | 'unclear' | 'no';

export type WatermarkStatus = 'none' | 'watermarked' | 'removable';

export type Region = 'cn' | 'global';

export interface ToolPlan {
  id: string;
  name: string;
  priceMonthly: number | null; // null = 免费 / 无月付
  priceYearly?: number | null;
  currency: string; // 原始币种
  creditAmount?: number | null;
  billingCycle: 'monthly' | 'yearly' | 'one_time' | 'usage' | 'custom';
  commercialUse: CommercialUse;
  watermark: WatermarkStatus;
  quota?: string; // 额度描述
  bestFor?: string;
  notes?: string;
}

// 预估单位成本 (成本收据签名)
export interface UnitCostEstimate {
  unit: 'image' | 'video' | 'call' | 'mtoken-in' | 'mtoken-out';
  low: number;
  high: number;
  currency: string;
}

export interface Tool {
  id: string;
  slug: string;
  name: string;
  toolCategory: ToolCategory;
  tagline: string; // 一句话定位 (中文)
  taglineEn?: string;
  logoText?: string; // 无图时的字母标
  url?: string;
  sponsored?: boolean;
  pricingModel: PricingModelType;
  fromPrice: number | null; // 最低价 (原始币种)
  fromCurrency: string;
  freePlan: boolean;
  recommendedPlan?: string;
  commercialUse: CommercialUse;
  watermark: WatermarkStatus;
  regions: Region[];
  needsProxyInCn?: boolean;
  supportsCny?: boolean;
  audiences: string[]; // 适合人群 (i18n key)
  tags: string[]; // 能力标签 (i18n key)
  bestFor: string[];
  notIdealFor: string[];
  unitCost?: UnitCostEstimate; // 预计单位成本
  confidence: PriceConfidence;
  lastUpdated: string; // ISO date
  plans: ToolPlan[];
  popularity: number; // 排序权重
}

export interface PriceUpdate {
  id: string;
  toolSlug: string;
  toolName: string;
  summary: string; // 变更内容 (中文)
  summaryEn?: string;
  date: string; // ISO
  status: PriceConfidence;
}

export interface Guide {
  id: string;
  slug: string;
  title: string;
  titleEn?: string;
  excerpt?: string;
  category: ToolCategory | 'general';
}

export interface SponsoredSlot {
  id: string;
  toolSlug: string;
  toolName: string;
  tagline: string;
  taglineEn?: string;
  logoText?: string;
  url: string;
  ctaLabel?: string;
}
