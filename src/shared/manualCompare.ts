import type { Scenario, UnitDefinition } from './types';

export type ManualCategory = 'text' | 'image' | 'video' | 'audio';
export type ManualPricingMode = 'plan_credit_based' | 'direct_price_based';

export interface ManualPriceItem {
  id: string;
  platformName: string;
  modelName: string;
  category: ManualCategory;
  pricingMode: ManualPricingMode;
  planName: string;
  planPrice: number;
  creditAmount: number;
  currency: string;
  unitDefinitions: UnitDefinition[];
}

export interface ManualCompareState {
  version: 1;
  items: ManualPriceItem[];
  scenario: Scenario;
  targetCurrency: string;
  rates: Record<string, number>;
}

export interface ManualComparisonResult {
  id: string;
  platformName: string;
  modelName: string;
  category: ManualCategory;
  pricingMode: ManualPricingMode;
  planName: string;
  sourceCurrency: string;
  targetCurrency: string;
  creditUnitCost: number | null;
  originalUnitCost: number | null;
  convertedUnitCost: number | null;
  scenarioCost: number | null;
  unitDefinitions: UnitDefinition[];
  unitCosts: Array<{
    unitType: UnitDefinition['unitType'];
    usageAmount: number;
    originalUnitCost: number;
    convertedUnitCost: number;
  }>;
}

export const MANUAL_CURRENCIES = ['CNY', 'USD', 'HKD', 'EUR', 'GBP', 'JPY'] as const;

export const DEFAULT_MANUAL_STATE: ManualCompareState = {
  version: 1,
  items: [],
  scenario: {
    textInputTokens: 1000,
    textOutputTokens: 500,
    imageCount: 1,
    videoSeconds: 5,
    audioMinutes: 1,
  },
  targetCurrency: 'CNY',
  rates: {
    CNY: 1,
    USD: 7.2,
    HKD: 0.92,
    EUR: 7.8,
    GBP: 9.2,
    JPY: 0.048,
  },
};

export function unitTypesForCategory(category: ManualCategory): UnitDefinition['unitType'][] {
  switch (category) {
    case 'text':
      return ['per_1k_input_tokens', 'per_1k_output_tokens'];
    case 'image':
      return ['per_image'];
    case 'video':
    case 'audio':
      return ['per_second', 'per_minute'];
  }
}

export function createManualItem(
  id: string,
  index: number,
  category: ManualCategory = 'image',
): ManualPriceItem {
  return {
    id,
    platformName: `Platform ${index}`,
    modelName: `Model ${index}`,
    category,
    pricingMode: 'plan_credit_based',
    planName: '',
    planPrice: 0,
    creditAmount: 0,
    currency: 'CNY',
    unitDefinitions: unitTypesForCategory(category).map((unitType) => ({ unitType, value: null })),
  };
}

export function createManualSampleState(firstId: string, secondId: string): ManualCompareState {
  return {
    ...DEFAULT_MANUAL_STATE,
    scenario: { ...DEFAULT_MANUAL_STATE.scenario },
    rates: { ...DEFAULT_MANUAL_STATE.rates },
    items: [
      {
        id: firstId,
        platformName: 'Demo SaaS',
        modelName: 'gpt-image-1',
        category: 'image',
        pricingMode: 'plan_credit_based',
        planName: 'Pro 400',
        planPrice: 39,
        creditAmount: 400,
        currency: 'CNY',
        unitDefinitions: [{ unitType: 'per_image', value: 20 }],
      },
      {
        id: secondId,
        platformName: 'Direct API',
        modelName: 'image-v2',
        category: 'image',
        pricingMode: 'direct_price_based',
        planName: '',
        planPrice: 0,
        creditAmount: 0,
        currency: 'USD',
        unitDefinitions: [{ unitType: 'per_image', value: 0.3 }],
      },
    ],
  };
}

export function normalizeManualState(value: unknown): ManualCompareState | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<ManualCompareState>;
  if (!Array.isArray(candidate.items) || !candidate.scenario || !candidate.rates) return null;
  if (typeof candidate.targetCurrency !== 'string') return null;

  const items = candidate.items.filter(isManualItem).map((item) => ({
    ...item,
    unitDefinitions: item.unitDefinitions.filter((unit) =>
      unitTypesForCategory(item.category).includes(unit.unitType)),
  }));
  if (items.length !== candidate.items.length) return null;

  const rates = Object.fromEntries(Object.entries(candidate.rates)
    .filter((entry): entry is [string, number] =>
      typeof entry[1] === 'number' && Number.isFinite(entry[1]) && entry[1] > 0));
  if (!rates[candidate.targetCurrency]) return null;

  return {
    version: 1,
    items,
    scenario: {
      textInputTokens: finiteNonNegative(candidate.scenario.textInputTokens),
      textOutputTokens: finiteNonNegative(candidate.scenario.textOutputTokens),
      imageCount: finiteNonNegative(candidate.scenario.imageCount),
      videoSeconds: finiteNonNegative(candidate.scenario.videoSeconds),
      audioMinutes: finiteNonNegative(candidate.scenario.audioMinutes),
    },
    targetCurrency: candidate.targetCurrency,
    rates,
  };
}

export function calculateManualComparison(
  item: ManualPriceItem,
  scenario: Scenario,
  rates: Record<string, number>,
  targetCurrency: string,
): ManualComparisonResult {
  const fromRate = rates[item.currency];
  const toRate = rates[targetCurrency];
  const creditUnitCost = item.pricingMode === 'plan_credit_based'
    && item.planPrice > 0 && item.creditAmount > 0
    ? item.planPrice / item.creditAmount
    : null;

  let originalTotal = 0;
  let convertedTotal = 0;
  let scenarioTotal = 0;
  let validUnits = 0;
  const unitCosts: ManualComparisonResult['unitCosts'] = [];

  for (const unit of item.unitDefinitions) {
    if (unit.value == null || !Number.isFinite(unit.value) || unit.value < 0) continue;
    const original = item.pricingMode === 'plan_credit_based'
      ? creditUnitCost === null ? null : creditUnitCost * unit.value
      : unit.value;
    if (original === null || fromRate == null || toRate == null || toRate <= 0) continue;
    const converted = original * fromRate / toRate;
    originalTotal += original;
    convertedTotal += converted;
    scenarioTotal += converted * scenarioMultiplier(unit.unitType, item.category, scenario);
    validUnits += 1;
    unitCosts.push({
      unitType: unit.unitType,
      usageAmount: unit.value,
      originalUnitCost: round(original),
      convertedUnitCost: round(converted),
    });
  }

  return {
    id: item.id,
    platformName: item.platformName,
    modelName: item.modelName,
    category: item.category,
    pricingMode: item.pricingMode,
    planName: item.planName,
    sourceCurrency: item.currency,
    targetCurrency,
    creditUnitCost: creditUnitCost === null ? null : round(creditUnitCost),
    originalUnitCost: validUnits === 0 ? null : round(originalTotal),
    convertedUnitCost: validUnits === 0 ? null : round(convertedTotal),
    scenarioCost: validUnits === 0 ? null : round(scenarioTotal),
    unitDefinitions: item.unitDefinitions,
    unitCosts,
  };
}

function isManualItem(value: unknown): value is ManualPriceItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<ManualPriceItem>;
  return typeof item.id === 'string'
    && typeof item.platformName === 'string'
    && typeof item.modelName === 'string'
    && ['text', 'image', 'video', 'audio'].includes(item.category ?? '')
    && ['plan_credit_based', 'direct_price_based'].includes(item.pricingMode ?? '')
    && typeof item.planName === 'string'
    && typeof item.planPrice === 'number'
    && typeof item.creditAmount === 'number'
    && typeof item.currency === 'string'
    && Array.isArray(item.unitDefinitions);
}

function scenarioMultiplier(
  unitType: UnitDefinition['unitType'],
  category: ManualCategory,
  scenario: Scenario,
) {
  switch (unitType) {
    case 'per_1k_input_tokens':
      return scenario.textInputTokens / 1000;
    case 'per_1k_output_tokens':
      return scenario.textOutputTokens / 1000;
    case 'per_image':
      return scenario.imageCount;
    case 'per_second':
      return category === 'audio' ? scenario.audioMinutes * 60 : scenario.videoSeconds;
    case 'per_minute':
      return category === 'video' ? scenario.videoSeconds / 60 : scenario.audioMinutes;
  }
}

function finiteNonNegative(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 0;
}

function round(value: number) {
  return Number(value.toFixed(6));
}
