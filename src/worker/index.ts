// AI Price Compare Web - Worker 入口

import { handlePlatforms } from './routes/platforms';
import { handleModels } from './routes/models';
import { handlePrices } from './routes/prices';
import { handleSubmit } from './routes/submit';
import { handleAdmin } from './routes/admin';
import { handleSitemap } from './routes/sitemap';
import { generateHTML, getPageConfig } from './utils/html';
import type { Env } from '../shared/types';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // API 路由
    if (url.pathname.startsWith('/api/')) {
      return handleAPI(request, env);
    }

    // 站点地图
    if (url.pathname === '/sitemap.xml') {
      return handleSitemap(env);
    }

    // robots.txt
    if (url.pathname === '/robots.txt') {
      return new Response(generateRobotsTxt(), {
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      });
    }

    // 静态资源
    if (url.pathname.match(/\.(js|css|png|jpg|gif|ico|svg|woff|woff2)$/)) {
      return env.ASSETS.fetch(request);
    }

    // SSR 页面 - 为搜索引擎爬虫返回完整 HTML
    const userAgent = request.headers.get('User-Agent') || '';
    const isBot = /bot|crawler|spider|slurp|mediapartners/i.test(userAgent);

    if (isBot) {
      return handleSSR(request, env);
    }

    // 普通用户返回 SPA
    return env.ASSETS.fetch(request);
  },
};

// SSR 渲染处理
async function handleSSR(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const pageConfig = getPageConfig(url.pathname);

  // 根据路径生成结构化数据
  let structuredData: Record<string, any> | undefined;

  if (url.pathname === '/') {
    structuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'AI 模型价格对比',
      url: 'https://ai-price-compare.pages.dev',
      description: '免费对比各大 AI 平台的模型定价',
      applicationCategory: 'UtilityApplication',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'CNY',
      },
    };
  } else if (url.pathname.startsWith('/models/')) {
    // 动态获取模型数据生成结构化数据
    const modelId = url.pathname.split('/')[2];
    if (modelId) {
      try {
        const model = await env.DB.prepare('SELECT * FROM models WHERE id = ?')
          .bind(modelId)
          .first();
        if (model) {
          structuredData = {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: model.name,
            description: `AI 模型 ${model.name} 的跨平台价格对比`,
            category: model.category,
          };
          pageConfig.title = `${model.name} 跨平台价格对比 - AI 价格对比`;
          pageConfig.description = `对比 ${model.name} 在不同 AI 平台上的定价，找到最划算的使用方案。`;
        }
      } catch (error) {
        console.error('Failed to fetch model for SSR:', error);
      }
    }
  }

  const html = generateHTML({
    title: pageConfig.title,
    description: pageConfig.description,
    url: url.href,
    structuredData,
  });

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html;charset=UTF-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

async function handleAPI(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);

  // CORS 头
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
  };

  // 处理 OPTIONS 请求
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  try {
    // 路由到对应的处理函数
    if (url.pathname.startsWith('/api/platforms')) {
      return await handlePlatforms(request, env, headers);
    }

    if (url.pathname.startsWith('/api/models')) {
      return await handleModels(request, env, headers);
    }

    if (url.pathname.startsWith('/api/prices')) {
      return await handlePrices(request, env, headers);
    }

    if (url.pathname === '/api/submit') {
      return await handleSubmit(request, env, headers);
    }

    if (url.pathname.startsWith('/api/admin')) {
      return await handleAdmin(request, env, headers);
    }

    // 404
    return new Response(
      JSON.stringify({ success: false, error: 'Not found' }),
      { status: 404, headers: { ...headers, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('API error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
    );
  }
}

function generateRobotsTxt(): string {
  return `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/

Sitemap: https://ai-price-compare.pages.dev/sitemap.xml
`;
}
