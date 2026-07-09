// OpenPriceHub · 搜索框

import React, { useState } from 'react';

export function SearchBar({
  placeholder,
  defaultValue = '',
  onSearch,
  size = 'md',
  autoFocus = false,
}: {
  placeholder?: string;
  defaultValue?: string;
  onSearch?: (q: string) => void;
  size?: 'md' | 'lg';
  autoFocus?: boolean;
}) {
  const [q, setQ] = useState(defaultValue);
  const pad = size === 'lg' ? 'py-3.5 pl-12 pr-28 text-base' : 'py-2.5 pl-10 pr-3 text-sm';

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onSearch?.(q.trim());
      }}
      className="relative w-full"
    >
      <svg
        className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-ink-2 ${
          size === 'lg' ? 'left-4 h-5 w-5' : 'left-3 h-4 w-4'
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
      </svg>
      <input
        type="search"
        value={q}
        autoFocus={autoFocus}
        onChange={(e) => {
          setQ(e.target.value);
          if (size !== 'lg') onSearch?.(e.target.value.trim()); // 小搜索框即时过滤
        }}
        placeholder={placeholder}
        className={`w-full rounded-xl border border-line bg-surface text-ink placeholder:text-ink-2/70 shadow-card transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${pad}`}
      />
      {size === 'lg' && (
        <button type="submit" className="btn-primary absolute right-2 top-1/2 -translate-y-1/2 !py-2">
          搜索
        </button>
      )}
    </form>
  );
}
