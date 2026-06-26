// AI Price Compare Web - 价格查询 API 路由

import { successResponse, errorResponse } from '../utils/response';
import { buildComparisonRow } from '../utils/calc';
import { DEFAULT_SCENARIO, DEFAULT_EXCHANGE_RATES } from '../../shared/constants';
import type { Env, UnitDefinition } from '../../shared/types';

// 查询价格
export async function queryPrices(
  db: D1Database,
  params: {
    platformId?: string;
    modelId?: string;
    targetCurrency?: string;
  }
) {
  const { platformId, modelId, targetCurrency = 'CNY' } = params;

  let query = `
    SELECT r.*, p.name as platform_name, p.default_currency as platform_currency,
           m.name as model_name, m.category as model_category
    FROM rules r
    JOIN platforms p ON r.platform_id = p.id
    JOIN models m ON r.model_id = m.id
    WHERE r.status = 'approved'
  `;
  const bindParams: any[] = [];

  if (platformId) {
    query += ' AND r.platform_id = ?';
    bindParams.push(platformId);
  }

  if (modelId) {
    query += ' AND r.model_id = ?';
    bindParams.push(modelId);
  }

  query += ' ORDER BY m.name, p.name';

  const rules = bindParams.length > 0
    ? await db.prepare(query).bind(...bindParams).all()
    : await db.prepare(query).all();

  const results = [];

  for (const rule of rules) {
    // 获取该平台的所有套餐
    const plans = await db
      .prepare('SELECT * FROM plans WHERE platform_id = ?')
      .bind(rule.platform_id)
      .all();

    const unitDefinitions: UnitDefinition[] = JSON.parse(rule.unit_definitions);

    if (rule.pricing_mode === 'plan_credit_based' && plans.length > 0) {
      // 积分模式：为每个套餐计算价格
      for (const plan of plans) {
        const comparisonRow = buildComparisonRow({
          platform: { name: rule.platform_name },
          model: { name: rule.model_name, category: rule.model_category },
          plan: {
            name: plan.name,
            price: plan.price,
            currency: plan.currency,
            creditAmount: plan.credit_amount,
          },
          rule: {
            pricingMode: rule.pricing_mode,
            currency: rule.currency,
            unitDefinitions,
          },
          scenario: DEFAULT_SCENARIO,
          exchangeRates: DEFAULT_EXCHANGE_RATES,
          targetCurrency,
        });

        results.push({
          platformName: rule.platform_name,
          modelName: rule.model_name,
          planName: plan.name,
          singleRunCost: comparisonRow.singleRunCost,
          currency: targetCurrency,
        });
      }
    } else {
      // 直接价格模式
      const comparisonRow = buildComparisonRow({
        platform: { name: rule.platform_name },
        model: { name: rule.model_name, category: rule.model_category },
        plan: null,
        rule: {
          pricingMode: rule.pricing_mode,
          currency: rule.currency,
          unitDefinitions,
        },
        scenario: DEFAULT_SCENARIO,
        exchangeRates: DEFAULT_EXCHANGE_RATES,
        targetCurrency,
      });

      results.push({
        platformName: rule.platform_name,
        modelName: rule.model_name,
        planName: '',
        singleRunCost: comparisonRow.singleRunCost,
        currency: targetCurrency,
      });
    }
  }

  return results;
}

// 对比价格
export async function comparePrices(
  db: D1Database,
  params: {
    modelIds: string[];
    platformIds?: string[];
    targetCurrency?: string;
  }
) {
  const { modelIds, platformIds, targetCurrency = 'CNY' } = params;

  if (modelIds.length === 0) {
    return [];
  }

  // 获取模型信息
  const placeholders = modelIds.map(() => '?').join(',');
  const models = await db
    .prepare(`SELECT * FROM models WHERE id IN (${placeholders})`)
    .bind(...modelIds)
    .all();

  const comparisons = [];

  for (const model of models) {
    // 获取该模型的所有规则
    let query = `
      SELECT r.*, p.name as platform_name, p.default_currency as platform_currency
      FROM rules r
      JOIN platforms p ON r.platform_id = p.id
      WHERE r.model_id = ? AND r.status = 'approved'
    `;
    const bindParams: any[] = [model.id];

    if (platformIds && platformIds.length > 0) {
      const platformPlaceholders = platformIds.map(() => '?').join(',');
      query += ` AND r.platform_id IN (${platformPlaceholders})`;
      bindParams.push(...platformIds);
    }

    const rules = await db.prepare(query).bind(...bindParams).all();

    const comparisonResults = [];

    for (const rule of rules) {
      // 获取该平台的所有套餐
      const plans = await db
        .prepare('SELECT * FROM plans WHERE platform_id = ?')
        .bind(rule.platform_id)
        .all();

      const unitDefinitions: UnitDefinition[] = JSON.parse(rule.unit_definitions);

      if (rule.pricing_mode === 'plan_credit_based' && plans.length > 0) {
        for (const plan of plans) {
          const comparisonRow = buildComparisonRow({
            platform: { name: rule.platform_name },
            model: { name: model.name, category: model.category },
            plan: {
              name: plan.name,
              price: plan.price,
              currency: plan.currency,
              creditAmount: plan.credit_amount,
            },
            rule: {
              pricingMode: rule.pricing_mode,
              currency: rule.currency,
              unitDefinitions,
            },
            scenario: DEFAULT_SCENARIO,
            exchangeRates: DEFAULT_EXCHANGE_RATES,
            targetCurrency,
          });

          comparisonResults.push({
            platformName: rule.platform_name,
            planName: plan.name,
            singleRunCost: comparisonRow.singleRunCost,
            rank: 0, // 稍后排序
          });
        }
      } else {
        const comparisonRow = buildComparisonRow({
          platform: { name: rule.platform_name },
          model: { name: model.name, category: model.category },
          plan: null,
          rule: {
            pricingMode: rule.pricing_mode,
            currency: rule.currency,
            unitDefinitions,
          },
          scenario: DEFAULT_SCENARIO,
          exchangeRates: DEFAULT_EXCHANGE_RATES,
          targetCurrency,
        });

        comparisonResults.push({
          platformName: rule.platform_name,
          planName: '',
          singleRunCost: comparisonRow.singleRunCost,
          rank: 0,
        });
      }
    }

    // 按价格排序并设置排名
    comparisonResults
      .filter((r) => r.singleRunCost !== null)
      .sort((a, b) => (a.singleRunCost ?? Infinity) - (b.singleRunCost ?? Infinity))
      .forEach((r, index) => {
        r.rank = index + 1;
      });

    comparisons.push({
      modelName: model.name,
      category: model.category,
      comparison: comparisonResults,
    });
  }

  return comparisons;
}

// 处理请求
export async function handlePrices(
  request: Request,
  env: Env,
  headers: Record<string, string>
): Promise<Response> {
  const url = new URL(request.url);

  try {
    // GET /api/prices?platform_id=xxx&model_id=yyy&target_currency=CNY
    if (request.method === 'GET' && url.pathname === '/api/prices') {
      const platformId = url.searchParams.get('platform_id') || undefined;
      const modelId = url.searchParams.get('model_id') || undefined;
      const targetCurrency = url.searchParams.get('target_currency') || 'CNY';

      const results = await queryPrices(env.DB, {
        platformId,
        modelId,
        targetCurrency,
      });

      return successResponse({ results }, undefined, headers);
    }

    // GET /api/prices/compare?model_ids=aaa,bbb&platform_ids=xxx,yyy&target_currency=CNY
    if (request.method === 'GET' && url.pathname === '/api/prices/compare') {
      const modelIdsStr = url.searchParams.get('model_ids');
      const platformIdsStr = url.searchParams.get('platform_ids');
      const targetCurrency = url.searchParams.get('target_currency') || 'CNY';

      if (!modelIdsStr) {
        return errorResponse('model_ids is required', 400, headers);
      }

      const modelIds = modelIdsStr.split(',').filter(Boolean);
      const platformIds = platformIdsStr?.split(',').filter(Boolean);

      const comparisons = await comparePrices(env.DB, {
        modelIds,
        platformIds,
        targetCurrency,
      });

      return successResponse({ comparisons }, undefined, headers);
    }

    return errorResponse('Not found', 404, headers);
  } catch (error) {
    console.error('Prices API error:', error);
    return errorResponse('Internal server error', 500, headers);
  }
}
