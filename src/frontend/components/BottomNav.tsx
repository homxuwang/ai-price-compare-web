// OpenPriceHub · 移动端底部导航 (文档 §13, MVP 4 项)

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useT, useLocalePath } from '../i18n';

type Item = { to: string; key: 'home' | 'tools' | 'calculator' | 'compare'; icon: React.ReactNode };

function Icon({ name }: { name: Item['key'] }) {
  const p = { className: 'h-5 w-5', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, viewBox: '0 0 24 24' } as const;
  switch (name) {
    case 'home':
      return <svg {...p} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M3 11l9-8 9 8M5 10v10h14V10" /></svg>;
    case 'tools':
      return <svg {...p} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M4 5h16M4 12h16M4 19h10" /></svg>;
    case 'calculator':
      return <svg {...p} aria-hidden><rect x="5" y="3" width="14" height="18" rx="2" /><path strokeLinecap="round" d="M8 7h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15v4" /></svg>;
    case 'compare':
      return <svg {...p} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M7 8H4l3-3m10 6h3l-3 3M4 5h13M20 11H7" /></svg>;
  }
}

export function BottomNav() {
  const t = useT();
  const lp = useLocalePath();
  const items: Item[] = [
    { to: lp('/'), key: 'home', icon: null },
    { to: lp('/tools'), key: 'tools', icon: null },
    { to: lp('/calculator'), key: 'calculator', icon: null },
    { to: lp('/compare'), key: 'compare', icon: null },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur md:hidden">
      <div className="grid grid-cols-4">
        {items.map((it) => (
          <NavLink
            key={it.key}
            to={it.to}
            end={it.key === 'home'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                isActive ? 'text-primary' : 'text-ink-2'
              }`
            }
          >
            <Icon name={it.key} />
            {t(`bottomNav.${it.key}`)}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
