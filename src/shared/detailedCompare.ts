import type { Scenario, UnitDefinition } from './types';
import {
  calculateManualComparison,
  DEFAULT_MANUAL_STATE,
  type ManualCategory,
  type ManualPricingMode,
} from './manualCompare';

export interface DetailedPlatform {
  id: string;
  name: string;
  defaultCurrency: string;
  notes: string;
}

export interface DetailedPlan {
  id: string;
  platformId: string;
  name: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly' | 'one_time' | 'custom';
  creditAmount: number;
  notes: string;
}

export interface DetailedModel {
  id: string;
  name: string;
  category: ManualCategory;
}

export interface DetailedRule {
  id: string;
  platformId: string;
  modelId: string;
  pricingMode: ManualPricingMode;
  currency: string;
  unitDefinitions: UnitDefinition[];
  notes: string;
}

export interface DetailedCompareState {
  version: 1;
  platforms: DetailedPlatform[];
  plans: DetailedPlan[];
  models: DetailedModel[];
  rules: DetailedRule[];
  rates: Record<string, number>;
  targetCurrency: string;
  scenario: Scenario;
}

export interface DetailedFilters {
  platformIds: string[];
  modelIds: string[];
  targetCurrency: string;
  scenario: Scenario;
}

export interface DetailedComparisonRow {
  id: string;
  platformId: string;
  modelId: string;
  planId: string | null;
  platformName: string;
  modelName: string;
  category: ManualCategory;
  pricingMode: ManualPricingMode;
  planName: string;
  usageDescription: string;
  originalUnitCost: number | null;
  originalCurrency: string;
  convertedUnitCost: number | null;
  targetCurrency: string;
  scenarioCost: number | null;
  creditUnitCost: number | null;
  unitCosts: Array<{
    unitType: UnitDefinition['unitType'];
    usageAmount: number;
    originalUnitCost: number;
    convertedUnitCost: number;
  }>;
}

export function createEmptyDetailedState(): DetailedCompareState {
  return {
    version: 1,
    platforms: [],
    plans: [],
    models: [],
    rules: [],
    rates: { ...DEFAULT_MANUAL_STATE.rates },
    targetCurrency: DEFAULT_MANUAL_STATE.targetCurrency,
    scenario: { ...DEFAULT_MANUAL_STATE.scenario },
  };
}

export function createDetailedSampleState(): DetailedCompareState {
  return {
    ...createEmptyDetailedState(),
    platforms: [
      { id: 'platform-demo', name: 'Demo SaaS', defaultCurrency: 'CNY', notes: '积分套餐示例' },
      { id: 'platform-direct', name: 'Direct API', defaultCurrency: 'USD', notes: '直接单价示例' },
    ],
    plans: [
      { id: 'plan-demo', platformId: 'platform-demo', name: '39 元 / 400 积分', price: 39, currency: 'CNY', billingCycle: 'monthly', creditAmount: 400, notes: '' },
      { id: 'plan-pro', platformId: 'platform-demo', name: '99 元 / 1200 积分', price: 99, currency: 'CNY', billingCycle: 'monthly', creditAmount: 1200, notes: '' },
    ],
    models: [
      { id: 'model-image', name: 'gpt-image-1', category: 'image' },
      { id: 'model-text', name: 'text-pro', category: 'text' },
    ],
    rules: [
      {
        id: 'rule-image-credit',
        platformId: 'platform-demo',
        modelId: 'model-image',
        pricingMode: 'plan_credit_based',
        currency: 'CNY',
        unitDefinitions: [{ unitType: 'per_image', value: 20 }],
        notes: '',
      },
      {
        id: 'rule-image-direct',
        platformId: 'platform-direct',
        modelId: 'model-image',
        pricingMode: 'direct_price_based',
        currency: 'USD',
        unitDefinitions: [{ unitType: 'per_image', value: 0.3 }],
        notes: '',
      },
      {
        id: 'rule-text-direct',
        platformId: 'platform-direct',
        modelId: 'model-text',
        pricingMode: 'direct_price_based',
        currency: 'USD',
        unitDefinitions: [
          { unitType: 'per_1k_input_tokens', value: 0.2 },
          { unitType: 'per_1k_output_tokens', value: 0.4 },
        ],
        notes: '',
      },
    ],
  };
}

export function buildDetailedComparisonRows(
  state: DetailedCompareState,
  filters: DetailedFilters,
): DetailedComparisonRow[] {
  const rows = state.rules.flatMap((rule) => {
    if (!filters.platformIds.includes(rule.platformId) || !filters.modelIds.includes(rule.modelId)) return [];
    const platform = state.platforms.find((entry) => entry.id === rule.platformId);
    const model = state.models.find((entry) => entry.id === rule.modelId);
    if (!platform || !model) return [];

    const plans = rule.pricingMode === 'plan_credit_based'
      ? state.plans.filter((entry) => entry.platformId === platform.id)
      : [null];
    if (plans.length === 0) return [];

    return plans.map((plan) => {
      const calculated = calculateManualComparison({
        id: rule.id,
        platformName: platform.name,
        modelName: model.name,
        category: model.category,
        pricingMode: rule.pricingMode,
        planName: plan?.name ?? '',
        planPrice: plan?.price ?? 0,
        creditAmount: plan?.creditAmount ?? 0,
        currency: plan?.currency ?? rule.currency,
        unitDefinitions: rule.unitDefinitions,
      }, filters.scenario, state.rates, filters.targetCurrency);

      return {
        id: `${rule.id}:${plan?.id ?? 'direct'}`,
        platformId: platform.id,
        modelId: model.id,
        planId: plan?.id ?? null,
        platformName: platform.name,
        modelName: model.name,
        category: model.category,
        pricingMode: rule.pricingMode,
        planName: plan?.name ?? '',
        usageDescription: rule.unitDefinitions
          .filter((unit) => unit.value != null)
          .map((unit) => `${unit.unitType}: ${unit.value}`)
          .join(', '),
        originalUnitCost: calculated.originalUnitCost,
        originalCurrency: calculated.sourceCurrency,
        convertedUnitCost: calculated.convertedUnitCost,
        targetCurrency: calculated.targetCurrency,
        scenarioCost: calculated.scenarioCost,
        creditUnitCost: calculated.creditUnitCost,
        unitCosts: calculated.unitCosts,
      };
    });
  });

  return rows.sort((a, b) => {
    if (a.scenarioCost === null) return 1;
    if (b.scenarioCost === null) return -1;
    return a.scenarioCost - b.scenarioCost;
  });
}

export function normalizeDetailedState(value: unknown): DetailedCompareState | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<DetailedCompareState>;
  if (!Array.isArray(candidate.platforms)
    || !Array.isArray(candidate.plans)
    || !Array.isArray(candidate.models)
    || !Array.isArray(candidate.rules)
    || !candidate.rates
    || !candidate.scenario
    || typeof candidate.targetCurrency !== 'string') return null;

  const rates = Object.fromEntries(Object.entries(candidate.rates).filter(
    (entry): entry is [string, number] => typeof entry[1] === 'number' && Number.isFinite(entry[1]) && entry[1] > 0,
  ));
  if (!rates[candidate.targetCurrency]) return null;

  const platformIds = new Set(candidate.platforms.map((entry) => entry.id));
  const modelIds = new Set(candidate.models.map((entry) => entry.id));
  if (candidate.plans.some((entry) => !platformIds.has(entry.platformId))) return null;
  if (candidate.rules.some((entry) => !platformIds.has(entry.platformId) || !modelIds.has(entry.modelId))) return null;

  return {
    version: 1,
    platforms: candidate.platforms,
    plans: candidate.plans,
    models: candidate.models,
    rules: candidate.rules,
    rates,
    targetCurrency: candidate.targetCurrency,
    scenario: {
      textInputTokens: safeNumber(candidate.scenario.textInputTokens),
      textOutputTokens: safeNumber(candidate.scenario.textOutputTokens),
      imageCount: safeNumber(candidate.scenario.imageCount),
      videoSeconds: safeNumber(candidate.scenario.videoSeconds),
      audioMinutes: safeNumber(candidate.scenario.audioMinutes),
    },
  };
}

function safeNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 0;
}
