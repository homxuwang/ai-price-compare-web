// AI Price Compare Web - SEO 组件

import React from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

// 默认 SEO 配置
const defaultSEO = {
  title: 'AI 模型价格对比 - 免费查询 ChatGPT、Claude、Gemini 定价',
  description: '免费对比 OpenAI、Anthropic、Google 等 AI 平台的模型定价。支持文本、图片、视频、音频模型的跨平台价格对比。',
  keywords: 'AI价格对比,ChatGPT价格,Claude价格,Gemini价格,AI模型定价,AI成本计算',
  image: 'https://ai-price-compare.pages.dev/og-image.png',
  type: 'website',
};

// 页面级 SEO 配置
const pageSEO: Record<string, Partial<SEOProps>> = {
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

function SEO({ title, description, keywords, image, url, type }: SEOProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  // 合并 SEO 配置
  const seo = {
    ...defaultSEO,
    ...pageSEO[currentPath],
    title: title || pageSEO[currentPath]?.title || defaultSEO.title,
    description: description || pageSEO[currentPath]?.description || defaultSEO.description,
    keywords: keywords || defaultSEO.keywords,
    image: image || defaultSEO.image,
    url: url || `https://ai-price-compare.pages.dev${currentPath}`,
    type: type || defaultSEO.type,
  };

  return (
    <>
      {/* 基础 Meta 标签 */}
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="keywords" content={seo.keywords} />
      <meta name="robots" content="index, follow" />
      <meta name="author" content="AI Price Compare" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={seo.type} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />
      <meta property="og:site_name" content="AI 价格对比" />
      <meta property="og:locale" content="zh_CN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={seo.url} />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />

      {/* Canonical URL */}
      <link rel="canonical" href={seo.url} />
    </>
  );
}

// 动态 SEO Hook
export function useSEO(pageSEO?: Partial<SEOProps>) {
  React.useEffect(() => {
    if (pageSEO?.title) {
      document.title = pageSEO.title;
    }
  }, [pageSEO?.title]);
}

export default SEO;
