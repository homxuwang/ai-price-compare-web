// AI Price Compare Web - 站点地图生成

import type { Env } from '../../shared/types';

export async function handleSitemap(env: Env): Promise<Response> {
  const baseUrl = 'https://ai-price-compare.pages.dev';

  // 获取所有平台
  const platforms = await env.DB.prepare('SELECT id, name FROM platforms').all();

  // 获取所有模型
  const models = await env.DB.prepare('SELECT id, name FROM models').all();

  // 构建 URL 列表
  const urls = [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/platforms', priority: '0.9', changefreq: 'weekly' },
    { path: '/models', priority: '0.9', changefreq: 'weekly' },
    { path: '/compare', priority: '0.8', changefreq: 'weekly' },
    { path: '/submit', priority: '0.7', changefreq: 'monthly' },
    { path: '/about', priority: '0.6', changefreq: 'monthly' },
    ...platforms.map((p) => ({
      path: `/platforms/${p.id}`,
      priority: '0.8',
      changefreq: 'weekly',
    })),
    ...models.map((m) => ({
      path: `/models/${m.id}`,
      priority: '0.8',
      changefreq: 'weekly',
    })),
  ];

  // 生成 XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls
    .map(
      (url) => `
  <url>
    <loc>${baseUrl}${url.path}</loc>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
    )
    .join('')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml;charset=UTF-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
