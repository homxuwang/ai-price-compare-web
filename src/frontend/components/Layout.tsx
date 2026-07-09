// OpenPriceHub · Layout — 顶部导航 + 语言/货币切换 + 移动底部导航 + 页脚

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useT, useLocalePath } from '../i18n';
import { LanguageSwitcher, CurrencySwitcher } from './Switchers';
import { BottomNav } from './BottomNav';
import { CompareBar } from './CompareBar';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems: { path: string; key: string }[] = [
  { path: '/', key: 'nav.home' },
  { path: '/tools', key: 'nav.tools' },
  { path: '/tools?category=image', key: 'nav.image' },
  { path: '/tools?category=video', key: 'nav.video' },
  { path: '/tools?category=llm-api', key: 'nav.llmApi' },
  { path: '/guides', key: 'nav.guides' },
];

function Mark() {
  return (
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M20.6 13.4L13.4 20.6a2 2 0 01-2.8 0l-7.2-7.2A2 2 0 013 12V4a1 1 0 011-1h8a2 2 0 011.4.6l7.2 7.2a2 2 0 010 2.6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <circle cx="8.5" cy="8.5" r="1.6" fill="currentColor" />
      </svg>
    </span>
  );
}

function Layout({ children }: LayoutProps) {
  const t = useT();
  const lp = useLocalePath();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // 当前路径(去掉 locale 前缀) + query,用于高亮
  const current = location.pathname.replace(/^\/(zh|en)/, '') || '/';
  const isActive = (path: string) => {
    const [p, q] = path.split('?');
    if (q) return current === '/tools' && location.search.includes(q.split('=')[1]);
    if (p === '/') return current === '/';
    return current === p && !location.search.includes('category=');
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link to={lp('/')} className="flex flex-none items-center gap-2" onClick={() => setOpen(false)}>
            <Mark />
            <span className="font-display text-lg font-bold tracking-tight text-ink">
              Open<span className="text-primary">Price</span>Hub
            </span>
          </Link>

          {/* 桌面导航 */}
          <nav className="ml-2 hidden flex-1 items-center gap-1 lg:flex">
            {navItems.map((it) => (
              <Link
                key={it.key}
                to={lp(it.path)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(it.path) ? 'bg-primary-50 text-primary-700' : 'text-ink-2 hover:bg-surface-2 hover:text-ink'
                }`}
              >
                {t(it.key)}
              </Link>
            ))}
          </nav>

          {/* 右侧: 切换 + 提交 */}
          <div className="ml-auto flex items-center gap-2">
            <CurrencySwitcher className="hidden sm:inline-flex" />
            <LanguageSwitcher className="hidden sm:inline-flex" />
            <Link to={lp('/submit')} className="btn-primary hidden !py-2 md:inline-flex">
              {t('nav.submit')}
            </Link>
            <button
              className="rounded-lg border border-line p-2 text-ink-2 hover:bg-surface-2 lg:hidden"
              aria-expanded={open}
              aria-label="菜单"
              onClick={() => setOpen((v) => !v)}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {open ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* 移动端菜单 */}
        {open && (
          <div className="border-t border-line lg:hidden">
            <nav className="mx-auto max-w-7xl px-4 py-2 sm:px-6">
              {[...navItems, { path: '/submit', key: 'nav.submit' }].map((it) => (
                <Link
                  key={it.key}
                  to={lp(it.path)}
                  onClick={() => setOpen(false)}
                  className={`block rounded-lg px-3 py-2.5 text-sm font-medium ${
                    isActive(it.path) ? 'bg-primary-50 text-primary-700' : 'text-ink-2'
                  }`}
                >
                  {t(it.key)}
                </Link>
              ))}
              <div className="flex items-center gap-2 px-1 py-3">
                <CurrencySwitcher />
                <LanguageSwitcher />
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* 主内容 */}
      <main className="flex-1 pb-24 md:pb-10">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
      </main>

      {/* 页脚 */}
      <footer className="border-t border-line bg-surface">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:px-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <Mark />
              <span className="font-display text-lg font-bold text-ink">OpenPriceHub</span>
            </div>
            <p className="mt-3 max-w-sm text-sm text-ink-2">{t('footer.tagline')}</p>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-label text-ink-2">{t('footer.product')}</div>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to={lp('/tools')} className="text-ink-2 hover:text-primary">{t('nav.tools')}</Link></li>
              <li><Link to={lp('/tools?category=image')} className="text-ink-2 hover:text-primary">{t('nav.image')}</Link></li>
              <li><Link to={lp('/tools?category=video')} className="text-ink-2 hover:text-primary">{t('nav.video')}</Link></li>
              <li><Link to={lp('/tools?category=llm-api')} className="text-ink-2 hover:text-primary">{t('nav.llmApi')}</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-label text-ink-2">{t('footer.resources')}</div>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to={lp('/guides')} className="text-ink-2 hover:text-primary">{t('footer.guides')}</Link></li>
              <li><Link to={lp('/submit')} className="text-ink-2 hover:text-primary">{t('footer.submit')}</Link></li>
              <li>
                <a href="https://github.com/homxuwang/AIPriceCompareTool" target="_blank" rel="noopener noreferrer" className="text-ink-2 hover:text-primary">
                  {t('footer.github')} ↗
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-line">
          <div className="mx-auto max-w-7xl px-4 py-4 text-xs text-ink-2 sm:px-6 lg:px-8">
            © 2026 OpenPriceHub · {t('footer.rights')}
          </div>
        </div>
      </footer>

      {/* 移动底部导航 + 对比栏 */}
      <BottomNav />
      <CompareBar />
    </div>
  );
}

export default Layout;
