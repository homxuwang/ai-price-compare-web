// AI Price Compare Web - 平台 API 路由

import { successResponse, errorResponse } from '../utils/response';
import { validatePlatform } from '../utils/validation';
import type { Env } from '../../shared/types';

// 获取所有平台
export async function getPlatforms(db: D1Database) {
  const platforms = await db
    .prepare(
      `SELECT 
        p.*,
        (SELECT COUNT(*) FROM plans WHERE platform_id = p.id) as plans_count,
        (SELECT COUNT(*) FROM rules WHERE platform_id = p.id) as rules_count
      FROM platforms p
      ORDER BY p.name`
    )
    .all();

  return platforms.map((p) => ({
    id: p.id,
    name: p.name,
    url: p.url,
    logoUrl: p.logo_url,
    defaultCurrency: p.default_currency,
    notes: p.notes,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
    plansCount: p.plans_count,
    rulesCount: p.rules_count,
  }));
}

// 获取平台详情
export async function getPlatformById(db: D1Database, id: string) {
  const platform = await db.prepare('SELECT * FROM platforms WHERE id = ?').bind(id).first();

  if (!platform) {
    return null;
  }

  const plans = await db.prepare('SELECT * FROM plans WHERE platform_id = ? ORDER BY price').bind(id).all();

  const rules = await db
    .prepare(
      `SELECT r.*, m.name as model_name, m.category as model_category
       FROM rules r
       JOIN models m ON r.model_id = m.id
       WHERE r.platform_id = ?
       ORDER BY m.name`
    )
    .bind(id)
    .all();

  return {
    id: platform.id,
    name: platform.name,
    url: platform.url,
    logoUrl: platform.logo_url,
    defaultCurrency: platform.default_currency,
    notes: platform.notes,
    createdAt: platform.created_at,
    updatedAt: platform.updated_at,
    plans: plans.map((p) => ({
      id: p.id,
      platformId: p.platform_id,
      name: p.name,
      price: p.price,
      currency: p.currency,
      creditAmount: p.credit_amount,
      billingCycle: p.billing_cycle,
      notes: p.notes,
      createdAt: p.created_at,
    })),
    rules: rules.map((r) => ({
      id: r.id,
      platformId: r.platform_id,
      modelId: r.model_id,
      modelName: r.model_name,
      modelCategory: r.model_category,
      pricingMode: r.pricing_mode,
      currency: r.currency,
      unitDefinitions: JSON.parse(r.unit_definitions),
      notes: r.notes,
      status: r.status,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    })),
  };
}

// 创建平台
export async function createPlatform(db: D1Database, data: any) {
  const validation = validatePlatform(data);
  if (!validation.valid) {
    throw new Error(validation.errors.join(', '));
  }

  const id = `platform-${crypto.randomUUID()}`;

  await db
    .prepare(
      `INSERT INTO platforms (id, name, url, default_currency, notes)
       VALUES (?, ?, ?, ?, ?)`
    )
    .bind(id, data.name, data.url || null, data.defaultCurrency || 'USD', data.notes || null)
    .run();

  return getPlatformById(db, id);
}

// 更新平台
export async function updatePlatform(db: D1Database, id: string, data: any) {
  const existing = await db.prepare('SELECT * FROM platforms WHERE id = ?').bind(id).first();

  if (!existing) {
    return null;
  }

  await db
    .prepare(
      `UPDATE platforms 
       SET name = ?, url = ?, default_currency = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    )
    .bind(data.name, data.url || null, data.defaultCurrency || 'USD', data.notes || null, id)
    .run();

  return getPlatformById(db, id);
}

// 删除平台
export async function deletePlatform(db: D1Database, id: string) {
  const existing = await db.prepare('SELECT * FROM platforms WHERE id = ?').bind(id).first();

  if (!existing) {
    return false;
  }

  await db.prepare('DELETE FROM platforms WHERE id = ?').bind(id).run();

  return true;
}

// 处理请求
export async function handlePlatforms(
  request: Request,
  env: Env,
  headers: Record<string, string>
): Promise<Response> {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const id = pathParts[2]; // /api/platforms/:id

  try {
    // GET /api/platforms
    if (request.method === 'GET' && !id) {
      const platforms = await getPlatforms(env.DB);
      return successResponse({ platforms }, undefined, headers);
    }

    // GET /api/platforms/:id
    if (request.method === 'GET' && id) {
      const platform = await getPlatformById(env.DB, id);
      if (!platform) {
        return errorResponse('Platform not found', 404, headers);
      }
      return successResponse({ platform }, undefined, headers);
    }

    // POST /api/platforms
    if (request.method === 'POST') {
      const data = await request.json();
      if (!data.name) {
        return errorResponse('Name is required', 400, headers);
      }
      const platform = await createPlatform(env.DB, data);
      return successResponse({ platform }, 'Platform created', headers);
    }

    // PUT /api/platforms/:id
    if (request.method === 'PUT' && id) {
      const data = await request.json();
      const platform = await updatePlatform(env.DB, id, data);
      if (!platform) {
        return errorResponse('Platform not found', 404, headers);
      }
      return successResponse({ platform }, 'Platform updated', headers);
    }

    // DELETE /api/platforms/:id
    if (request.method === 'DELETE' && id) {
      const deleted = await deletePlatform(env.DB, id);
      if (!deleted) {
        return errorResponse('Platform not found', 404, headers);
      }
      return successResponse(null, 'Platform deleted', headers);
    }

    return errorResponse('Method not allowed', 405, headers);
  } catch (error) {
    console.error('Platforms API error:', error);
    return errorResponse('Internal server error', 500, headers);
  }
}
