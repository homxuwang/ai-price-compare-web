// AI Price Compare Web - 结构化数据组件

import React from 'react';

interface StructuredDataProps {
  type: 'WebApplication' | 'Product' | 'Organization' | 'BreadcrumbList';
  data?: Record<string, any>;
}

// 默认结构化数据
const structuredDataSchemas: Record<string, any> = {
  WebApplication: {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'AI 模型价格对比',
    url: 'https://ai-price-compare.pages.dev',
    description: '免费对比各大 AI 平台的模型定价',
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'CNY',
    },
    featureList: [
      'AI 模型价格对比',
      '跨平台价格查询',
      '积分套餐换算',
      '众包价格提交',
    ],
  },

  Organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AI Price Compare',
    url: 'https://ai-price-compare.pages.dev',
    logo: 'https://ai-price-compare.pages.dev/logo.png',
    description: '免费、开源的 AI 模型价格对比平台',
    sameAs: [
      'https://github.com/homxuwang/AIPriceCompareTool',
    ],
  },
};

// 生成产品结构化数据
export function generateProductSchema(model: {
  name: string;
  category: string;
  description?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: model.name,
    description: model.description || `AI 模型 ${model.name} 的跨平台价格对比`,
    category: model.category,
    brand: {
      '@type': 'Brand',
      name: 'AI Price Compare',
    },
  };
}

// 生成面包屑结构化数据
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// 生成价格对比结构化数据
export function generatePriceComparisonSchema(model: {
  name: string;
  category: string;
  comparisons: Array<{
    platformName: string;
    singleRunCost: number;
    currency: string;
  }>;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: model.name,
    description: `${model.name} 的跨平台价格对比`,
    offers: model.comparisons.map((comp) => ({
      '@type': 'Offer',
      price: comp.singleRunCost,
      priceCurrency: comp.currency,
      seller: {
        '@type': 'Organization',
        name: comp.platformName,
      },
    })),
  };
}

function StructuredData({ type, data }: StructuredDataProps) {
  const schema = data || structuredDataSchemas[type];

  if (!schema) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default StructuredData;
