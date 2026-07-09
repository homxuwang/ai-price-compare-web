// OpenPriceHub · 语言 / 货币切换器

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLocale, LOCALES, type Locale } from '../i18n';
import { useCurrency, type Currency } from '../context/CurrencyProvider';

const LOCALE_LABEL: Record<Locale, string> = { zh: '中文', en: 'EN' };

export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const locale = useLocale();
  const location = useLocation();
  const navigate = useNavigate();

  function switchTo(next: Locale) {
    if (next === locale) return;
    // 用 next 替换路径首段 locale
    const rest = location.pathname.replace(/^\/(zh|en)/, '');
    navigate(`/${next}${rest}${location.search}`);
  }

  return (
    <div className={`inline-flex overflow-hidden rounded-lg border border-line text-xs font-semibold ${className}`}>
      {LOCALES.map((l) => (
        <button
          key={l}
          onClick={() => switchTo(l)}
          aria-pressed={l === locale}
          className={`px-2.5 py-1.5 transition-colors ${
            l === locale ? 'bg-primary text-white' : 'bg-surface text-ink-2 hover:bg-surface-2'
          }`}
        >
          {LOCALE_LABEL[l]}
        </button>
      ))}
    </div>
  );
}

const CUR: { key: Currency; label: string }[] = [
  { key: 'CNY', label: '¥ CNY' },
  { key: 'USD', label: '$ USD' },
];

export function CurrencySwitcher({ className = '' }: { className?: string }) {
  const { currency, setCurrency } = useCurrency();
  return (
    <div className={`inline-flex overflow-hidden rounded-lg border border-line text-xs font-semibold ${className}`}>
      {CUR.map((c) => (
        <button
          key={c.key}
          onClick={() => setCurrency(c.key)}
          aria-pressed={c.key === currency}
          className={`px-2.5 py-1.5 transition-colors ${
            c.key === currency ? 'bg-ink text-white' : 'bg-surface text-ink-2 hover:bg-surface-2'
          }`}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
