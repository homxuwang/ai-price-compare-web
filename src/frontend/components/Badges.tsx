// OpenPriceHub · 可信度徽章 (文档 §15.2) — 全站统一信号色词汇

import React from 'react';
import type { PriceConfidence, CommercialUse } from '../../shared/types';
import { useT } from '../i18n';

// 可信度 → 语义色
const CONF_TONE: Record<PriceConfidence, string> = {
  official: 'bg-primary-50 text-primary-700',
  verified: 'bg-success-soft text-success',
  'user-submitted': 'bg-surface-2 text-ink-2',
  pending: 'bg-surface-2 text-ink-2',
  promotional: 'bg-warn-soft text-warn',
  regional: 'bg-accent-soft text-accent',
  outdated: 'bg-danger-soft text-danger',
};

export function ConfidenceBadge({ status }: { status: PriceConfidence }) {
  const t = useT();
  return (
    <span className={`badge badge-dot ${CONF_TONE[status]}`}>{t(`badges.${status}`)}</span>
  );
}

// 商用权限徽章
const COMM_TONE: Record<CommercialUse, string> = {
  yes: 'bg-success-soft text-success',
  paid: 'bg-primary-50 text-primary-700',
  unclear: 'bg-warn-soft text-warn',
  no: 'bg-danger-soft text-danger',
};

export function CommercialBadge({ value }: { value: CommercialUse }) {
  const t = useT();
  return <span className={`badge ${COMM_TONE[value]}`}>{t(`commercial.${value}`)}</span>;
}
