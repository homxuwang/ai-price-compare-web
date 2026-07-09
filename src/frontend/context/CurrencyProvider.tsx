// OpenPriceHub · 货币上下文 (USD/CNY) + 价格格式化

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { DEFAULT_EXCHANGE_RATES } from '../../shared/constants';

export type Currency = 'USD' | 'CNY';

const RATES = DEFAULT_EXCHANGE_RATES.rates; // { CNY: 1, USD: 7.2, HKD: 0.92 } (相对 CNY)
const SYMBOL: Record<Currency, string> = { USD: '$', CNY: '¥' };
const STORAGE_KEY = 'oph.currency';

// 把 amount(originalCurrency) 换算到 target
export function convert(amount: number, from: string, to: Currency): number {
  const rFrom = RATES[from] ?? RATES[from?.toUpperCase()] ?? 1; // 相对 CNY
  const rTo = RATES[to] ?? 1;
  // amount 单位: from; 先转 CNY 再转 to
  const inCny = amount * rFrom;
  return inCny / rTo;
}

interface CurrencyCtx {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  /** 格式化并换算; 返回 { text, converted } */
  format: (amount: number | null | undefined, fromCurrency: string, opts?: { max?: number }) => string;
  /** 该价格是否为汇率换算(原币种≠目标) */
  isConverted: (fromCurrency: string) => boolean;
}

const Ctx = createContext<CurrencyCtx | null>(null);

function fmt(n: number, currency: Currency, max = 2): string {
  const digits = Math.abs(n) > 0 && Math.abs(n) < 1 ? Math.max(max, 3) : max;
  const s = n.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });
  return `${SYMBOL[currency]}${s}`;
}

export function CurrencyProvider({
  initial,
  children,
}: {
  initial: Currency;
  children: React.ReactNode;
}) {
  const [currency, setCurrencyState] = useState<Currency>(initial);

  // 首次挂载读 localStorage 覆盖默认
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (saved === 'USD' || saved === 'CNY') setCurrencyState(saved);
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    try {
      window.localStorage.setItem(STORAGE_KEY, c);
    } catch {
      /* ignore */
    }
  }, []);

  const format = useCallback(
    (amount: number | null | undefined, fromCurrency: string, opts?: { max?: number }) => {
      if (amount == null) return '—';
      const val = convert(amount, fromCurrency, currency);
      return fmt(val, currency, opts?.max);
    },
    [currency]
  );

  const isConverted = useCallback(
    (fromCurrency: string) => (fromCurrency || '').toUpperCase() !== currency,
    [currency]
  );

  return (
    <Ctx.Provider value={{ currency, setCurrency, format, isConverted }}>{children}</Ctx.Provider>
  );
}

export function useCurrency(): CurrencyCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useCurrency must be used within CurrencyProvider');
  return v;
}
