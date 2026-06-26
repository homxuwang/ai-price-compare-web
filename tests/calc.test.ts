// AI Price Compare Web - 价格计算测试

import { describe, it, expect } from 'vitest';
import { calculateUnitCostFromPlanCredits, buildComparisonRow, convertCurrency } from '../worker/utils/calc';

describe('calculateUnitCostFromPlanCredits', () => {
  it('calculates image unit cost from plan credits', () => {
    const result = calculateUnitCostFromPlanCredits({
      planPrice: 39,
      creditAmount: 400,
      creditsPerUnit: 20,
    });
    expect(result).toBe(1.95);
  });

  it('calculates text unit cost from plan credits', () => {
    const result = calculateUnitCostFromPlanCredits({
      planPrice: 100,
      creditAmount: 10000,
      creditsPerUnit: 5,
    });
    expect(result).toBe(0.05);
  });
});

describe('convertCurrency', () => {
  it('converts USD to CNY using configured rates', () => {
    const result = convertCurrency({
      amount: 2,
      fromCurrency: 'USD',
      toCurrency: 'CNY',
      rates: { CNY: 1, USD: 7.2, HKD: 0.92 },
    });
    expect(result).toBe(14.4);
  });

  it('returns same amount for same currency', () => {
    const result = convertCurrency({
      amount: 100,
      fromCurrency: 'CNY',
      toCurrency: 'CNY',
      rates: { CNY: 1, USD: 7.2 },
    });
    expect(result).toBe(100);
  });
});

describe('buildComparisonRow', () => {
  it('builds image comparison row from plan-credit pricing', () => {
    const result = buildComparisonRow({
      platform: { name: 'Demo SaaS' },
      model: { name: 'gpt-image-1', category: 'image' },
      plan: {
        name: '基础套餐',
        price: 39,
        currency: 'CNY',
        creditAmount: 400,
      },
      rule: {
        pricingMode: 'plan_credit_based',
        currency: 'CNY',
        unitDefinitions: [{ unitType: 'per_image', value: 20 }],
      },
      scenario: {
        textInputTokens: 1000,
        textOutputTokens: 500,
        imageCount: 1,
        videoSeconds: 5,
        audioMinutes: 1,
      },
      exchangeRates: {
        baseCurrency: 'CNY',
        rates: { CNY: 1, USD: 7.2 },
        updatedAt: '2026-01-01',
      },
      targetCurrency: 'CNY',
    });

    expect(result.platformName).toBe('Demo SaaS');
    expect(result.modelName).toBe('gpt-image-1');
    expect(result.planName).toBe('基础套餐');
    expect(result.singleRunCost).toBe(1.95);
  });

  it('builds text comparison row from direct pricing', () => {
    const result = buildComparisonRow({
      platform: { name: 'OpenAI' },
      model: { name: 'gpt-4o', category: 'text' },
      plan: null,
      rule: {
        pricingMode: 'direct_price_based',
        currency: 'USD',
        unitDefinitions: [
          { unitType: 'per_1k_input_tokens', value: 0.005 },
          { unitType: 'per_1k_output_tokens', value: 0.015 },
        ],
      },
      scenario: {
        textInputTokens: 1000,
        textOutputTokens: 500,
        imageCount: 1,
        videoSeconds: 5,
        audioMinutes: 1,
      },
      exchangeRates: {
        baseCurrency: 'CNY',
        rates: { CNY: 1, USD: 7.2 },
        updatedAt: '2026-01-01',
      },
      targetCurrency: 'CNY',
    });

    expect(result.platformName).toBe('OpenAI');
    expect(result.modelName).toBe('gpt-4o');
    expect(result.planName).toBe('');
    // 0.005 * 1 + 0.015 * 0.5 = 0.0125 USD = 0.09 CNY
    expect(result.singleRunCost).toBe(0.09);
  });
});
