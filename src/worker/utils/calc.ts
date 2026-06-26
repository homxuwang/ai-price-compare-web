// AI Price Compare Web - 价格计算工具函数
// 复用 Chrome 扩展的计算逻辑

import type { UnitDefinition, Scenario, ExchangeRates } from '../../shared/types';

// 精度控制
function roundCurrency(value: number): number {
  return Number(value.toFixed(6));
}

// 币种转换
export function convertCurrency({
  amount,
  fromCurrency,
  toCurrency,
  rates,
}: {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  rates: Record<string, number>;
}): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const fromRate = rates[fromCurrency];
  const toRate = rates[toCurrency];

  if (fromRate === undefined || toRate === undefined) {
    throw new Error(`Missing exchange rate for ${fromCurrency} or ${toCurrency}`);
  }

  return roundCurrency((amount * fromRate) / toRate);
}

// 从套餐积分计算单位成本
export function calculateUnitCostFromPlanCredits({
  planPrice,
  creditAmount,
  creditsPerUnit,
}: {
  planPrice: number;
  creditAmount: number;
  creditsPerUnit: number;
}): number {
  return roundCurrency((planPrice / creditAmount) * creditsPerUnit);
}

// 获取场景倍数
function getScenarioMultiplier(
  unitType: string,
  category: string,
  scenario: Scenario
): number {
  switch (unitType) {
    case 'per_1k_input_tokens':
      return scenario.textInputTokens / 1000;
    case 'per_1k_output_tokens':
      return scenario.textOutputTokens / 1000;
    case 'per_image':
      return scenario.imageCount;
    case 'per_second':
      if (category === 'video') {
        return scenario.videoSeconds;
      }
      if (category === 'audio') {
        return scenario.audioMinutes * 60;
      }
      return 1;
    case 'per_minute':
      if (category === 'video') {
        return scenario.videoSeconds / 60;
      }
      if (category === 'audio') {
        return scenario.audioMinutes;
      }
      return 1;
    default:
      return 1;
  }
}

// 构建对比行
export function buildComparisonRow({
  platform,
  model,
  plan,
  rule,
  scenario,
  exchangeRates,
  targetCurrency,
}: {
  platform: { name: string };
  model: { name: string; category: string };
  plan: { name: string; price: number; currency: string; creditAmount: number } | null;
  rule: {
    pricingMode: string;
    currency: string;
    unitDefinitions: UnitDefinition[];
  };
  scenario: Scenario;
  exchangeRates: ExchangeRates;
  targetCurrency: string;
}) {
  const unitCosts = rule.unitDefinitions.map((unitDefinition) => {
    const sourceCurrency = plan?.currency ?? rule.currency ?? targetCurrency;

    let creditUnitCost: number | null = null;
    if (rule.pricingMode === 'plan_credit_based') {
      if (plan && plan.price && plan.creditAmount) {
        creditUnitCost = plan.price / plan.creditAmount;
      } else {
        creditUnitCost = null;
      }
    }

    let originalUnitCost: number | null = null;
    if (rule.pricingMode === 'plan_credit_based') {
      if (creditUnitCost !== null && unitDefinition.value != null) {
        originalUnitCost = creditUnitCost * unitDefinition.value;
      } else {
        originalUnitCost = null;
      }
    } else {
      originalUnitCost = unitDefinition.value != null ? Number(unitDefinition.value) : null;
    }

    const convertedUnitCost =
      originalUnitCost !== null
        ? roundCurrency(
            convertCurrency({
              amount: originalUnitCost,
              fromCurrency: sourceCurrency,
              toCurrency: targetCurrency,
              rates: exchangeRates.rates,
            })
          )
        : null;

    return {
      unitType: unitDefinition.unitType,
      usageAmount: unitDefinition.value,
      creditUnitCost,
      originalUnitCost,
      convertedUnitCost,
      sourceCurrency,
    };
  });

  const hasValidCosts = unitCosts.some((uc) => uc.convertedUnitCost !== null);
  const singleRunCost = hasValidCosts
    ? roundCurrency(
        unitCosts.reduce((total, unitCost) => {
          const cost = unitCost.convertedUnitCost ?? 0;
          return total + cost * getScenarioMultiplier(unitCost.unitType, model.category, scenario);
        }, 0)
      )
    : null;

  return {
    platformName: platform.name,
    modelName: model.name,
    category: model.category,
    comparisonType: model.category,
    pricingMode: rule.pricingMode,
    planName: plan?.name ?? '',
    planTotalPrice: plan?.price ?? null,
    totalCredits: plan?.creditAmount ?? null,
    exchangeRate:
      exchangeRates.rates[unitCosts[0]?.sourceCurrency ?? targetCurrency] /
      exchangeRates.rates[targetCurrency],
    unitUsageDescription: rule.unitDefinitions
      .map((unitDefinition) => `${unitDefinition.unitType}: ${unitDefinition.value}`)
      .join(', '),
    primaryUsageAmount: unitCosts[0]?.usageAmount ?? 0,
    creditUnitCost: unitCosts[0]?.creditUnitCost ?? null,
    convertedUnitCost: unitCosts[0]?.convertedUnitCost ?? null,
    originalUnitCost: unitCosts[0]?.originalUnitCost ?? null,
    originalCurrency: unitCosts[0]?.sourceCurrency ?? targetCurrency,
    singleRunCost,
    unitCosts,
  };
}
