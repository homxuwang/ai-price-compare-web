// OpenPriceHub · 赞助卡片 (文档 §5.6) — 必须明确标注赞助

import React from 'react';
import type { SponsoredSlot } from '../../shared/types';
import { useT, useLocale } from '../i18n';

export function SponsoredCard({ slot }: { slot: SponsoredSlot }) {
  const t = useT();
  const locale = useLocale();
  const tagline = locale === 'en' && slot.taglineEn ? slot.taglineEn : slot.tagline;

  return (
    <a
      href={slot.url}
      target="_blank"
      rel="sponsored noopener noreferrer"
      className="card card-hover relative flex items-center gap-4 p-5"
    >
      <span className="absolute right-3 top-3 rounded-md bg-warn-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-label text-warn">
        {t('common.sponsored')}
      </span>
      <span className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-surface-2 font-display text-sm font-bold text-ink-2">
        {slot.logoText || '·'}
      </span>
      <div className="min-w-0 flex-1 pr-12">
        <div className="font-display font-semibold text-ink">{slot.toolName}</div>
        <p className="mt-0.5 line-clamp-1 text-sm text-ink-2">{tagline}</p>
      </div>
      <span className="flex-none text-sm font-semibold text-primary">
        {slot.ctaLabel || t('common.viewDetails')} →
      </span>
    </a>
  );
}
