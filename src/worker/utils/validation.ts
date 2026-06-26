// AI Price Compare Web - 数据验证工具

import { MODEL_CATEGORIES, PRICING_MODES, UNIT_TYPES, BILLING_CYCLES } from '../../shared/constants';

// 验证平台数据
export function validatePlatform(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.name || typeof data.name !== 'string') {
    errors.push('name is required and must be a string');
  }

  if (data.url && typeof data.url !== 'string') {
    errors.push('url must be a string');
  }

  if (data.defaultCurrency && typeof data.defaultCurrency !== 'string') {
    errors.push('defaultCurrency must be a string');
  }

  return { valid: errors.length === 0, errors };
}

// 验证套餐数据
export function validatePlan(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.platformId || typeof data.platformId !== 'string') {
    errors.push('platformId is required');
  }

  if (!data.name || typeof data.name !== 'string') {
    errors.push('name is required');
  }

  if (typeof data.price !== 'number' || data.price < 0) {
    errors.push('price must be a non-negative number');
  }

  if (!data.currency || typeof data.currency !== 'string') {
    errors.push('currency is required');
  }

  if (data.creditAmount !== undefined && data.creditAmount !== null) {
    if (typeof data.creditAmount !== 'number' || data.creditAmount < 0) {
      errors.push('creditAmount must be a non-negative number');
    }
  }

  if (data.billingCycle && !BILLING_CYCLES.includes(data.billingCycle)) {
    errors.push(`billingCycle must be one of: ${BILLING_CYCLES.join(', ')}`);
  }

  return { valid: errors.length === 0, errors };
}

// 验证模型数据
export function validateModel(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.name || typeof data.name !== 'string') {
    errors.push('name is required');
  }

  if (!data.category || !MODEL_CATEGORIES.includes(data.category)) {
    errors.push(`category must be one of: ${MODEL_CATEGORIES.join(', ')}`);
  }

  return { valid: errors.length === 0, errors };
}

// 验证价格规则数据
export function validateRule(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.platformId || typeof data.platformId !== 'string') {
    errors.push('platformId is required');
  }

  if (!data.modelId || typeof data.modelId !== 'string') {
    errors.push('modelId is required');
  }

  if (!data.pricingMode || !PRICING_MODES.includes(data.pricingMode)) {
    errors.push(`pricingMode must be one of: ${PRICING_MODES.join(', ')}`);
  }

  if (!data.currency || typeof data.currency !== 'string') {
    errors.push('currency is required');
  }

  if (!Array.isArray(data.unitDefinitions)) {
    errors.push('unitDefinitions must be an array');
  } else {
    data.unitDefinitions.forEach((ud: any, index: number) => {
      if (!ud.unitType || !UNIT_TYPES.includes(ud.unitType)) {
        errors.push(`unitDefinitions[${index}].unitType must be one of: ${UNIT_TYPES.join(', ')}`);
      }
      if (ud.value !== null && ud.value !== undefined && typeof ud.value !== 'number') {
        errors.push(`unitDefinitions[${index}].value must be a number or null`);
      }
    });
  }

  return { valid: errors.length === 0, errors };
}

// 验证提交数据
export function validateSubmission(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.platformName || typeof data.platformName !== 'string') {
    errors.push('platformName is required');
  }

  if (!data.modelName || typeof data.modelName !== 'string') {
    errors.push('modelName is required');
  }

  if (!data.modelCategory || !MODEL_CATEGORIES.includes(data.modelCategory)) {
    errors.push(`modelCategory must be one of: ${MODEL_CATEGORIES.join(', ')}`);
  }

  if (!data.pricingMode || !PRICING_MODES.includes(data.pricingMode)) {
    errors.push(`pricingMode must be one of: ${PRICING_MODES.join(', ')}`);
  }

  if (!Array.isArray(data.unitDefinitions) || data.unitDefinitions.length === 0) {
    errors.push('unitDefinitions must be a non-empty array');
  } else {
    data.unitDefinitions.forEach((ud: any, index: number) => {
      if (!ud.unitType || !UNIT_TYPES.includes(ud.unitType)) {
        errors.push(`unitDefinitions[${index}].unitType must be one of: ${UNIT_TYPES.join(', ')}`);
      }
      if (typeof ud.value !== 'number') {
        errors.push(`unitDefinitions[${index}].value must be a number`);
      }
    });
  }

  if (data.planPrice !== undefined && data.planPrice !== null) {
    if (typeof data.planPrice !== 'number' || data.planPrice < 0) {
      errors.push('planPrice must be a non-negative number');
    }
  }

  if (data.planCreditAmount !== undefined && data.planCreditAmount !== null) {
    if (typeof data.planCreditAmount !== 'number' || data.planCreditAmount < 0) {
      errors.push('planCreditAmount must be a non-negative number');
    }
  }

  return { valid: errors.length === 0, errors };
}

// Sanitize string input
export function sanitizeString(input: any): string | null {
  if (typeof input !== 'string') return null;
  return input.trim().slice(0, 1000); // Limit length
}

// Sanitize number input
export function sanitizeNumber(input: any, min?: number, max?: number): number | null {
  const num = Number(input);
  if (isNaN(num)) return null;
  if (min !== undefined && num < min) return null;
  if (max !== undefined && num > max) return null;
  return num;
}
