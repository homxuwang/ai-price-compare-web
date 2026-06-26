// AI Price Compare Web - 提交 API 路由

import { successResponse, errorResponse } from '../utils/response';
import { validateSubmission } from '../utils/validation';
import type { Env, UnitDefinition } from '../../shared/types';

// 提交新价格
export async function submitPrice(db: D1Database, data: any, ip?: string) {
  // 验证数据
  const validation = validateSubmission(data);
  if (!validation.valid) {
    throw new Error(validation.errors.join(', '));
  }

  const id = `sub-${crypto.randomUUID()}`;

  await db
    .prepare(
      `INSERT INTO submissions (
        id, platform_name, model_name, model_category,
        plan_name, plan_price, plan_currency, plan_credit_amount,
        pricing_mode, unit_definitions,
        submitter_ip, submitter_note, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`
    )
    .bind(
      id,
      data.platformName,
      data.modelName,
      data.modelCategory,
      data.planName || null,
      data.planPrice || null,
      data.planCurrency || null,
      data.planCreditAmount || null,
      data.pricingMode,
      JSON.stringify(data.unitDefinitions),
      ip || null,
      data.submitterNote || null
    )
    .run();

  return { id, status: 'pending' };
}

// 检查重复提交
export async function checkDuplicate(db: D1Database, data: any) {
  const existing = await db
    .prepare(
      `SELECT id FROM submissions 
       WHERE platform_name = ? AND model_name = ? AND plan_name = ?
       AND status IN ('pending', 'approved')`
    )
    .bind(data.platformName, data.modelName, data.planName || null)
    .first();

  return !!existing;
}

// 处理请求
export async function handleSubmit(
  request: Request,
  env: Env,
  headers: Record<string, string>
): Promise<Response> {
  try {
    if (request.method !== 'POST') {
      return errorResponse('Method not allowed', 405, headers);
    }

    const data = await request.json();

    // 检查重复
    const isDuplicate = await checkDuplicate(env.DB, data);
    if (isDuplicate) {
      return errorResponse('A similar submission already exists', 409, headers);
    }

    // 获取提交者 IP
    const ip = request.headers.get('CF-Connecting-IP') || undefined;

    // 提交
    const result = await submitPrice(env.DB, data, ip);

    return successResponse(result, 'Submission created, pending review', headers);
  } catch (error) {
    console.error('Submit API error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 400, headers);
  }
}
