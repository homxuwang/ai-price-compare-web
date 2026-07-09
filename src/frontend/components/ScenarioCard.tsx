// OpenPriceHub · 场景卡片 (文档 §5.4) — 三大场景,各带专属色

import React from 'react';
import { Link } from 'react-router-dom';
import type { ToolCategory } from '../../shared/types';
import { useLocale } from '../i18n';
import { SCENE_BG_SOFT, SCENE_TEXT, SCENE_HEX } from '../lib/scene';

function SceneIcon({ category }: { category: ToolCategory }) {
  const common = { className: 'h-5 w-5', fill: 'none', stroke: 'currentColor', strokeWidth: 2, viewBox: '0 0 24 24' } as const;
  if (category === 'image')
    return (
      <svg {...common} aria-hidden>
        <rect x="3" y="4" width="18" height="16" rx="2" strokeLinejoin="round" />
        <circle cx="8.5" cy="9.5" r="1.5" />
        <path d="M4 17l5-5 4 4 3-3 4 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  if (category === 'video')
    return (
      <svg {...common} aria-hidden>
        <rect x="3" y="5" width="14" height="14" rx="2" strokeLinejoin="round" />
        <path d="M21 8l-4 3 4 3V8z" strokeLinejoin="round" />
      </svg>
    );
  return (
    <svg {...common} aria-hidden>
      <path d="M4 6h16M4 12h10M4 18h7" strokeLinecap="round" />
    </svg>
  );
}

export function ScenarioCard({
  category,
  title,
  desc,
  to,
}: {
  category: ToolCategory;
  title: string;
  desc: string;
  to: string;
}) {
  const locale = useLocale();
  return (
    <Link
      to={to}
      className="card card-hover group flex flex-col p-6"
      style={{ borderTopWidth: 3, borderTopColor: SCENE_HEX[category] }}
    >
      <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${SCENE_BG_SOFT[category]} ${SCENE_TEXT[category]}`}>
        <SceneIcon category={category} />
      </span>
      <h3 className="mt-4 font-display text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-2">{desc}</p>
      <span className={`mt-4 inline-flex items-center gap-1 text-sm font-semibold ${SCENE_TEXT[category]}`}>
        <span className="transition-transform group-hover:translate-x-0.5">
          {locale === 'en' ? 'Compare →' : '开始对比 →'}
        </span>
      </span>
    </Link>
  );
}
