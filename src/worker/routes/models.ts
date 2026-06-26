// AI Price Compare Web - 模型 API 路由

import { successResponse, errorResponse } from '../utils/response';
import { validateModel } from '../utils/validation';
import type { Env } from '../../shared/types';

// 获取所有模型
export async function getModels(db: D1Database, category?: string) {
  let query = `
    SELECT 
      m.*,
      (SELECT COUNT(DISTINCT platform_id) FROM rules WHERE model_id = m.id) as platforms_count
    FROM models m
  `;
  const params: any[] = [];

  if (category) {
    query += ' WHERE m.category = ?';
    params.push(category);
  }

  query += ' ORDER BY m.name';

  const models = params.length > 0
    ? await db.prepare(query).bind(...params).all()
    : await db.prepare(query).all();

  return models.map((m) => ({
    id: m.id,
    name: m.name,
    category: m.category,
    provider: m.provider,
    description: m.description,
    createdAt: m.created_at,
    platformsCount: m.platforms_count,
  }));
}

// 获取模型详情
export async function getModelById(db: D1Database, id: string) {
  const model = await db.prepare('SELECT * FROM models WHERE id = ?').bind(id).first();

  if (!model) {
    return null;
  }

  // 获取该模型在各平台的价格
  const rules = await db
    .prepare(
      `SELECT r.*, p.name as platform_name, p.default_currency as platform_currency
       FROM rules r
       JOIN platforms p ON r.platform_id = p.id
       WHERE r.model_id = ?
       ORDER BY p.name`
    )
    .bind(id)
    .all();

  return {
    id: model.id,
    name: model.name,
    category: model.category,
    provider: model.provider,
    description: model.description,
    createdAt: model.created_at,
    rules: rules.map((r) => ({
      id: r.id,
      platformId: r.platform_id,
      platformName: r.platform_name,
      platformCurrency: r.platform_currency,
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

// 创建模型
export async function createModel(db: D1Database, data: any) {
  const validation = validateModel(data);
  if (!validation.valid) {
    throw new Error(validation.errors.join(', '));
  }

  const id = `model-${crypto.randomUUID()}`;

  await db
    .prepare(
      `INSERT INTO models (id, name, category, provider, description)
       VALUES (?, ?, ?, ?, ?)`
    )
    .bind(id, data.name, data.category, data.provider || null, data.description || null)
    .run();

  return getModelById(db, id);
}

// 更新模型
export async function updateModel(db: D1Database, id: string, data: any) {
  const existing = await db.prepare('SELECT * FROM models WHERE id = ?').bind(id).first();

  if (!existing) {
    return null;
  }

  await db
    .prepare(
      `UPDATE models 
       SET name = ?, category = ?, provider = ?, description = ?
       WHERE id = ?`
    )
    .bind(data.name, data.category, data.provider || null, data.description || null, id)
    .run();

  return getModelById(db, id);
}

// 删除模型
export async function deleteModel(db: D1Database, id: string) {
  const existing = await db.prepare('SELECT * FROM models WHERE id = ?').bind(id).first();

  if (!existing) {
    return false;
  }

  await db.prepare('DELETE FROM models WHERE id = ?').bind(id).run();

  return true;
}

// 处理请求
export async function handleModels(
  request: Request,
  env: Env,
  headers: Record<string, string>
): Promise<Response> {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const id = pathParts[2]; // /api/models/:id

  try {
    // GET /api/models?category=xxx
    if (request.method === 'GET' && !id) {
      const category = url.searchParams.get('category') || undefined;
      const models = await getModels(env.DB, category);
      return successResponse({ models }, undefined, headers);
    }

    // GET /api/models/:id
    if (request.method === 'GET' && id) {
      const model = await getModelById(env.DB, id);
      if (!model) {
        return errorResponse('Model not found', 404, headers);
      }
      return successResponse({ model }, undefined, headers);
    }

    // POST /api/models
    if (request.method === 'POST') {
      const data = await request.json();
      if (!data.name || !data.category) {
        return errorResponse('Name and category are required', 400, headers);
      }
      const model = await createModel(env.DB, data);
      return successResponse({ model }, 'Model created', headers);
    }

    // PUT /api/models/:id
    if (request.method === 'PUT' && id) {
      const data = await request.json();
      const model = await updateModel(env.DB, id, data);
      if (!model) {
        return errorResponse('Model not found', 404, headers);
      }
      return successResponse({ model }, 'Model updated', headers);
    }

    // DELETE /api/models/:id
    if (request.method === 'DELETE' && id) {
      const deleted = await deleteModel(env.DB, id);
      if (!deleted) {
        return errorResponse('Model not found', 404, headers);
      }
      return successResponse(null, 'Model deleted', headers);
    }

    return errorResponse('Method not allowed', 405, headers);
  } catch (error) {
    console.error('Models API error:', error);
    return errorResponse('Internal server error', 500, headers);
  }
}
