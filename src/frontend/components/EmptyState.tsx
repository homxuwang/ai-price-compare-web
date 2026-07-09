// OpenPriceHub · 空状态

import React from 'react';

export function EmptyState({
  title,
  desc,
  action,
}: {
  title: string;
  desc?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-card border border-dashed border-line bg-surface px-6 py-14 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 text-ink-2">
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m9-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="font-display text-base font-semibold text-ink">{title}</p>
      {desc && <p className="mx-auto mt-1 max-w-sm text-sm text-ink-2">{desc}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
