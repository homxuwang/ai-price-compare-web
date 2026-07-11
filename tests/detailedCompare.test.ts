import { describe, expect, it } from 'vitest';
import {
  buildDetailedComparisonRows,
  createDetailedSampleState,
  normalizeDetailedState,
} from '../src/shared/detailedCompare';

describe('detailed manual comparison', () => {
  it('expands a credit rule across every plan on the platform', () => {
    const state = createDetailedSampleState();
    const rows = buildDetailedComparisonRows(state, {
      platformIds: ['platform-demo'],
      modelIds: ['model-image'],
      targetCurrency: 'CNY',
      scenario: state.scenario,
    });

    expect(rows).toHaveLength(2);
    expect(rows.map((row) => row.planName)).toEqual([
      '99 元 / 1200 积分',
      '39 元 / 400 积分',
    ]);
    expect(rows.map((row) => row.scenarioCost)).toEqual([1.65, 1.95]);
  });

  it('compares direct pricing across currencies', () => {
    const state = createDetailedSampleState();
    const rows = buildDetailedComparisonRows(state, {
      platformIds: ['platform-direct'],
      modelIds: ['model-image'],
      targetCurrency: 'CNY',
      scenario: state.scenario,
    });

    expect(rows).toHaveLength(1);
    expect(rows[0].originalUnitCost).toBe(0.3);
    expect(rows[0].convertedUnitCost).toBe(2.16);
  });

  it('filters out unselected platforms and models', () => {
    const state = createDetailedSampleState();
    const rows = buildDetailedComparisonRows(state, {
      platformIds: ['platform-demo'],
      modelIds: ['model-text'],
      targetCurrency: 'CNY',
      scenario: state.scenario,
    });

    expect(rows).toEqual([]);
  });

  it('rejects imported data with orphaned plans', () => {
    const state = createDetailedSampleState();
    state.plans[0].platformId = 'missing-platform';
    expect(normalizeDetailedState(state)).toBeNull();
  });
});
