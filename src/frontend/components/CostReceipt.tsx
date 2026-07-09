// OpenPriceHub · 成本收据 (签名元素) — 把价格拆解为预计单位成本

import React from 'react';
import type { UnitCostEstimate } from '../../shared/types';
import { useT } from '../i18n';
import { useCurrency } from '../context/CurrencyProvider';

const UNIT_LABEL: Record<UnitCostEstimate['unit'], string> = {
  image: 'common.perImage',
  video: 'common.perVideo',
  call: 'common.perCall',
  'mtoken-in': 'common.perCall',
  'mtoken-out': 'common.perCall',
};

function unitCaption(unit: UnitCostEstimate['unit'], t: (k: string) => any): string {
  if (unit === 'mtoken-in') return `${t('tags.text')} · /M tokens`;
  if (unit === 'mtoken-out') return `${t('tags.text')} · /M tokens`;
  return t(UNIT_LABEL[unit]);
}

export function CostReceipt({
  unitCost,
  compact = false,
}: {
  unitCost?: UnitCostEstimate;
  compact?: boolean;
}) {
  const t = useT();
  const { format, isConverted } = useCurrency();
  if (!unitCost) return null;

  const low = format(unitCost.low, unitCost.currency, { max: 3 });
  const high = format(unitCost.high, unitCost.currency, { max: 3 });
  const approx = isConverted(unitCost.currency);

  if (compact) {
    return (
      <div className="flex items-baseline justify-between gap-2 font-mono text-xs">
        <span className="text-ink-2">{unitCaption(unitCost.unit, t)}</span>
        <span className="font-semibold tabular text-ink">
          {approx && <span className="text-ink-2">≈ </span>}
          {low}–{high}
        </span>
      </div>
    );
  }

  return (
    <div className="receipt">
      <div className="receipt-row">
        <span className="k">{unitCaption(unitCost.unit, t)}</span>
        <span className="v">
          {approx && <span className="font-normal text-ink-2">≈ </span>}
          {low} <span className="text-ink-2">–</span> {high}
        </span>
      </div>
    </div>
  );
}
