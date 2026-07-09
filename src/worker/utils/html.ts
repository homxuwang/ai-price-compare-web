// AI Price Compare Web - SSR 渲染工具

// 生成 HTML 模板
export function generateHTML({
  title,
  description,
  keywords,
  url,
  image,
  structuredData,
  content,
}: {
  title: string;
  description: string;
  keywords?: string;
  url: string;
  image?: string;
  structuredData?: Record<string, any>;
  content?: string;
}) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#F8FAFC" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
    <meta name="description" content="${escapeHtml(description)}" />
    ${keywords ? `<meta name="keywords" content="${escapeHtml(keywords)}" />` : ''}
    <meta name="robots" content="index, follow" />
    <meta name="author" content="AI Price Compare" />
    
    <!-- Open Graph -->
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${escapeHtml(url)}" />
    ${image ? `<meta property="og:image" content="${escapeHtml(image)}" />` : ''}
    <meta property="og:site_name" content="AI 价格对比" />
    <meta property="og:locale" content="zh_CN" />
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    ${image ? `<meta name="twitter:image" content="${escapeHtml(image)}" />` : ''}
    
    <!-- Canonical URL -->
    <link rel="canonical" href="${escapeHtml(url)}" />
    
    ${
      structuredData
        ? `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`
        : ''
    }
    
    <title>${escapeHtml(title)}</title>
    <link rel="stylesheet" href="/assets/index.css" />
  </head>
  <body style="background:#F8FAFC;color:#111827;margin:0">
    <div id="root">${content || ''}</div>
    <script type="module" src="/assets/index.js"></script>
  </body>
</html>`;
}

// HTML 转义
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// 页面 SEO 配置
export const pageConfigs: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'AI 模型价格对比 - 免费查询 ChatGPT、Claude、Gemini 定价',
    description: '免费对比 OpenAI、Anthropic、Google 等 AI 平台的模型定价。支持文本、图片、视频、音频模型的跨平台价格对比。',
  },
  '/platforms': {
    title: 'AI 平台列表 - 所有支持的 AI 服务平台',
    description: '浏览所有支持的 AI 服务平台，查看各平台的套餐和定价信息。',
  },
  '/models': {
    title: 'AI 模型列表 - 所有可对比的 AI 模型',
    description: '浏览所有可对比的 AI 模型，按类别筛选文本、图片、视频、音频模型。',
  },
  '/compare': {
    title: 'AI 价格对比工具 - 自定义对比方案',
    description: '使用对比工具，选择多个模型或平台，找到最划算的 AI 服务方案。',
  },
  '/submit': {
    title: '提交 AI 价格 - 贡献您的价格数据',
    description: '提交您发现的 AI 模型价格，经审核后将展示给所有用户。',
  },
  '/about': {
    title: '关于 AI 价格对比 - 开源免费项目',
    description: '了解 AI 价格对比项目，一个免费、开源的 AI 模型价格对比平台。',
  },
};

// 获取页面配置
export function getPageConfig(pathname: string) {
  return pageConfigs[pathname] || pageConfigs['/'];
}
