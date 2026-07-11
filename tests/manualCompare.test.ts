import { describe, expect, it } from 'vitest';
import {
  calculateManualComparison,
  createManualSampleState,
  normalizeManualState,
} from '../src/shared/manualCompare';

describe('manual price comparison', () => {
  it('converts plan credits into an image scenario cost', () => {
    const state = createManualSampleState('credit', 'direct');
    const result = calculateManualComparison(
      state.items[0],
      state.scenario,
      state.rates,
      state.targetCurrency,
    );

    expect(result.creditUnitCost).toBe(0.0975);
    expect(result.originalUnitCost).toBe(1.95);
    expect(result.convertedUnitCost).toBe(1.95);
    expect(result.scenarioCost).toBe(1.95);
  });

  it('converts direct prices to the target currency', () => {
    const state = createManualSampleState('credit', 'direct');
    const result = calculateManualComparison(
      state.items[1],
      state.scenario,
      state.rates,
      state.targetCurrency,
    );

    expect(result.originalUnitCost).toBe(0.3);
    expect(result.convertedUnitCost).toBe(2.16);
    expect(result.scenarioCost).toBe(2.16);
  });

  it('applies text input and output scenario multipliers', () => {
    const result = calculateManualComparison({
      id: 'text',
      platformName: 'API',
      modelName: 'Text model',
      category: 'text',
      pricingMode: 'direct_price_based',
      planName: '',
      planPrice: 0,
      creditAmount: 0,
      currency: 'USD',
      unitDefinitions: [
        { unitType: 'per_1k_input_tokens', value: 0.2 },
        { unitType: 'per_1k_output_tokens', value: 0.4 },
      ],
    }, {
      textInputTokens: 2000,
      textOutputTokens: 500,
      imageCount: 0,
      videoSeconds: 0,
      audioMinutes: 0,
    }, { CNY: 1, USD: 7.2 }, 'CNY');

    expect(result.scenarioCost).toBe(4.32);
  });

  it('rejects imported state without a valid target exchange rate', () => {
    expect(normalizeManualState({
      version: 1,
      items: [],
      scenario: {
        textInputTokens: 0,
        textOutputTokens: 0,
        imageCount: 0,
        videoSeconds: 0,
        audioMinutes: 0,
      },
      targetCurrency: 'USD',
      rates: { CNY: 1 },
    })).toBeNull();
  });
});
