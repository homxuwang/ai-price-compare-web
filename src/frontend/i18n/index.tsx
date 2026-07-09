// OpenPriceHub · i18n — 轻量字典 + Context (无第三方库)

import React, { createContext, useContext, useMemo } from 'react';
import { zh } from './zh';
import { en } from './en';

export type Locale = 'zh' | 'en';
export const LOCALES: Locale[] = ['zh', 'en'];
export const DEFAULT_LOCALE: Locale = 'zh';

const dicts: Record<Locale, Record<string, any>> = { zh, en };

export function isLocale(v: string | undefined): v is Locale {
  return v === 'zh' || v === 'en';
}

interface LocaleCtx {
  locale: Locale;
  t: (key: string) => any;
}

const Ctx = createContext<LocaleCtx>({ locale: DEFAULT_LOCALE, t: (k) => k });

// 按 'a.b.c' 路径取值
function lookup(obj: Record<string, any>, path: string): any {
  return path.split('.').reduce<any>((acc, k) => (acc == null ? undefined : acc[k]), obj);
}

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const value = useMemo<LocaleCtx>(() => {
    const t = (key: string) => {
      const v = lookup(dicts[locale], key);
      if (v !== undefined && v !== '') return v;
      const fb = lookup(dicts.zh, key); // 回退中文
      return fb !== undefined ? fb : key;
    };
    return { locale, t };
  }, [locale]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLocale(): Locale {
  return useContext(Ctx).locale;
}

// t('nav.home') → string; t('home.trending.words') → string[]
export function useT() {
  return useContext(Ctx).t;
}

// 生成带 locale 前缀的路径: localePath('zh', '/tools') → '/zh/tools'
export function localePath(locale: Locale, path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `/${locale}${clean === '/' ? '' : clean}`;
}

// hook: 返回 (path) => '/<locale><path>'
export function useLocalePath() {
  const locale = useLocale();
  return (path: string) => localePath(locale, path);
}
