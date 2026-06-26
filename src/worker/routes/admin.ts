// AI Price Compare Web - 管理 API 路由

import { successResponse, errorResponse } from '../utils/response';
import type { Env } from '../../shared/types';

// 验证管理员密钥
function verifyAdminKey(request: Request, env: Env): boolean {
  const adminKey = request.headers.get('X-Admin-Key');
  return adminKey === env.ADMIN_KEY;
}

// 获取待审核提交
export async function getSubmissions(db: D1Database, status?: string) {
  let query = 'SELECT * FROM submissions';
  const params: any[] = [];

  if (status) {
    query += ' WHERE status = ?';
    params.push(status);
  }

  query += ' ORDER BY created_at DESC';

  const submissions = params.length > 0
    ? await db.prepare(query).bind(...params).all()
    : await db.prepare(query).all();

  return submissions.map((s) => ({
    id: s.id,
    platformName: s.platform_name,
    modelName: s.model_name,
    modelCategory: s.model_category,
    planName: s.plan_name,
    planPrice: s.plan_price,
    planCurrency: s.plan_currency,
    planCreditAmount: s.plan_credit_amount,
    pricingMode: s.pricing_mode,
    unitDefinitions: JSON.parse(s.unit_definitions),
    submitterIp: s.submitter_ip,
    submitterNote: s.submitter_note,
    status: s.status,
    adminNotes: s.admin_notes,
    createdAt: s.created_at,
    reviewedAt: s.reviewed_at,
  }));
}

// 审核提交
export async function reviewSubmission(
  db: D1Database,
  id: string,
  status: 'approved' | 'rejected',
  adminNotes?: string
) {
  const existing = await db.prepare('SELECT * FROM submissions WHERE id = ?').bind(id).first();

  if (!existing) {
    return null;
  }

  await db
    .prepare(
      `UPDATE submissions 
       SET status = ?, admin_notes = ?, reviewed_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    )
    .bind(status, adminNotes || null, id)
    .run();

  // 如果批准，创建实际数据
  if (status === 'approved') {
    await createDataFromSubmission(db, existing);
  }

  return { id, status };
}

// 从提交创建实际数据
async function createDataFromSubmission(db: D1Database, submission: any) {
  // 1. 查找或创建平台
  let platform = await db
    .prepare('SELECT id FROM platforms WHERE name = ?')
    .bind(submission.platform_name)
    .first();

  if (!platform) {
    const platformId = `platform-${crypto.randomUUID()}`;
    await db
      .prepare(
        `INSERT INTO platforms (id, name, default_currency)
         VALUES (?, ?, ?)`
      )
      .bind(platformId, submission.platform_name, submission.plan_currency || 'USD')
      .run();
    platform = { id: platformId };
  }

  // 2. 查找或创建模型
  let model = await db
    .prepare('SELECT id FROM models WHERE name = ?')
    .bind(submission.model_name)
    .first();

  if (!model) {
    const modelId = `model-${crypto.randomUUID()}`;
    await db
      .prepare(
        `INSERT INTO models (id, name, category)
         VALUES (?, ?, ?)`
      )
      .bind(modelId, submission.model_name, submission.model_category)
      .run();
    model = { id: modelId };
  }

  // 3. 创建套餐（如果有）
  let planId = null;
  if (submission.plan_name && submission.plan_price) {
    const plan = await db
      .prepare('SELECT id FROM plans WHERE platform_id = ? AND name = ?')
      .bind(platform.id, submission.plan_name)
      .first();

    if (!plan) {
      planId = `plan-${crypto.randomUUID()}`;
      await db
        .prepare(
          `INSERT INTO plans (id, platform_id, name, price, currency, credit_amount)
           VALUES (?, ?, ?, ?, ?, ?)`
        )
        .bind(
          planId,
          platform.id,
          submission.plan_name,
          submission.plan_price,
          submission.plan_currency || 'USD',
          submission.plan_credit_amount || null
        )
        .run();
    } else {
      planId = plan.id;
    }
  }

  // 4. 创建价格规则
  const ruleId = `rule-${crypto.randomUUID()}`;
  await db
    .prepare(
      `INSERT INTO rules (id, platform_id, model_id, pricing_mode, currency, unit_definitions, status)
       VALUES (?, ?, ?, ?, ?, ?, 'approved')`
    )
    .bind(
      ruleId,
      platform.id,
      model.id,
      submission.pricing_mode,
      submission.plan_currency || 'USD',
      submission.unit_definitions
    )
    .run();
}

// 删除提交
export async function deleteSubmission(db: D1Database, id: string) {
  const existing = await db.prepare('SELECT * FROM submissions WHERE id = ?').bind(id).first();

  if (!existing) {
    return false;
  }

  await db.prepare('DELETE FROM submissions WHERE id = ?').bind(id).run();

  return true;
}

// 获取统计数据
export async function getStats(db: D1Database) {
  const platformsCount = await db.prepare('SELECT COUNT(*) as count FROM platforms').first();
  const modelsCount = await db.prepare('SELECT COUNT(*) as count FROM models').first();
  const rulesCount = await db.prepare('SELECT COUNT(*) as count FROM rules').first();
  const pendingCount = await db
    .prepare("SELECT COUNT(*) as count FROM submissions WHERE status = 'pending'")
    .first();

  return {
    platforms: platformsCount?.count || 0,
    models: modelsCount?.count || 0,
    rules: rulesCount?.count || 0,
    pendingSubmissions: pendingCount?.count || 0,
  };
}

// 处理请求
export async function handleAdmin(
  request: Request,
  env: Env,
  headers: Record<string, string>
): Promise<Response> {
  const url = new URL(request.url);

  // 验证管理员权限
  if (!verifyAdminKey(request, env)) {
    return errorResponse('Unauthorized', 401, headers);
  }

  try {
    // GET /api/admin/submissions?status=pending
    if (request.method === 'GET' && url.pathname === '/api/admin/submissions') {
      const status = url.searchParams.get('status') || undefined;
      const submissions = await getSubmissions(env.DB, status);
      return successResponse({ submissions }, undefined, headers);
    }

    // PUT /api/admin/submissions/:id
    if (request.method === 'PUT' && url.pathname.startsWith('/api/admin/submissions/')) {
      const id = url.pathname.split('/')[3];
      const data = await request.json();

      if (!data.status || !['approved', 'rejected'].includes(data.status)) {
        return errorResponse('Invalid status', 400, headers);
      }

      const result = await reviewSubmission(env.DB, id, data.status, data.notes);
      if (!result) {
        return errorResponse('Submission not found', 404, headers);
      }

      return successResponse(result, 'Submission reviewed', headers);
    }

    // DELETE /api/admin/submissions/:id
    if (request.method === 'DELETE' && url.pathname.startsWith('/api/admin/submissions/')) {
      const id = url.pathname.split('/')[3];
      const deleted = await deleteSubmission(env.DB, id);
      if (!deleted) {
        return errorResponse('Submission not found', 404, headers);
      }
      return successResponse(null, 'Submission deleted', headers);
    }

    // GET /api/admin/stats
    if (request.method === 'GET' && url.pathname === '/api/admin/stats') {
      const stats = await getStats(env.DB);
      return successResponse({ stats }, undefined, headers);
    }

    return errorResponse('Not found', 404, headers);
  } catch (error) {
    console.error('Admin API error:', error);
    return errorResponse('Internal server error', 500, headers);
  }
}
