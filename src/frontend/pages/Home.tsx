// OpenPriceHub · 首页 (文档 §5)

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { ToolCategory } from '../../shared/types';
import { useT, useLocale, useLocalePath } from '../i18n';
import { getPopular, useSponsored, usePriceUpdates, useGuides } from '../data';
import { SearchBar } from '../components/SearchBar';
import { ScenarioCard } from '../components/ScenarioCard';
import { ToolCard } from '../components/ToolCard';
import { SponsoredCard } from '../components/SponsoredCard';
import { ConfidenceBadge } from '../components/Badges';
import { SCENE_TEXT } from '../lib/scene';

function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">{title}</h2>
      {action}
    </div>
  );
}

function Home() {
  const t = useT();
  const locale = useLocale();
  const lp = useLocalePath();
  const navigate = useNavigate();

  const sponsored = useSponsored().data;
  const updates = usePriceUpdates().data;
  const guides = useGuides().data;

  const groups: { key: 'image' | 'video' | 'llm'; cat: ToolCategory; title: string }[] = [
    { key: 'image', cat: 'image', title: t('home.popular.image') },
    { key: 'video', cat: 'video', title: t('home.popular.video') },
    { key: 'llm', cat: 'llm-api', title: t('home.popular.llm') },
  ];

  const doSearch = (q: string) => {
    if (q) navigate(lp(`/tools?q=${encodeURIComponent(q)}`));
  };

  return (
    <div className="space-y-16">
      {/* ---- Hero ---- */}
      <section className="animate-fade-up pt-4 text-center">
        <h1 className="mx-auto max-w-3xl font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
          {t('home.heroTitle')}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-ink-2 sm:text-lg">{t('home.heroSubtitle')}</p>
        <div className="mx-auto mt-8 max-w-2xl">
          <SearchBar size="lg" placeholder={t('home.searchPlaceholder')} onSearch={doSearch} />
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-sm text-ink-2">
            <span className="text-ink-2/70">{t('home.trendingLabel')}:</span>
            {(t('home.trending') as string[]).map((w) => (
              <button key={w} onClick={() => doSearch(w)} className="chip !py-1">
                {w}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ---- 三大场景 ---- */}
      <section>
        <div className="grid gap-4 md:grid-cols-3">
          <ScenarioCard category="image" title={t('home.scenes.image.title')} desc={t('home.scenes.image.desc')} to={lp('/tools?category=image')} />
          <ScenarioCard category="video" title={t('home.scenes.video.title')} desc={t('home.scenes.video.desc')} to={lp('/tools?category=video')} />
          <ScenarioCard category="llm-api" title={t('home.scenes.llm.title')} desc={t('home.scenes.llm.desc')} to={lp('/tools?category=llm-api')} />
        </div>
      </section>

      {/* ---- 成本计算器入口 ---- */}
      <section className="overflow-hidden rounded-card border border-primary-100 bg-primary-50/60">
        <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="eyebrow">CALCULATOR</span>
            <h2 className="mt-2 font-display text-2xl font-bold text-ink">{t('home.calcTitle')}</h2>
            <p className="mt-2 max-w-xl text-ink-2">{t('home.calcSubtitle')}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to={lp('/calculator?type=image')} className="btn-secondary justify-start">🖼 {t('home.calc.image')}</Link>
            <Link to={lp('/calculator?type=video')} className="btn-secondary justify-start">🎬 {t('home.calc.video')}</Link>
            <Link to={lp('/calculator?type=api')} className="btn-secondary justify-start">⚡ {t('home.calc.api')}</Link>
          </div>
        </div>
      </section>

      {/* ---- Sponsored ---- */}
      {sponsored.length > 0 && (
        <section>
          <SectionHeader title={t('home.sponsoredTitle')} />
          <p className="-mt-2 mb-4 text-xs text-ink-2">{t('home.sponsoredNote')}</p>
          <div className="grid gap-4 md:grid-cols-2">
            {sponsored.map((s) => (
              <SponsoredCard key={s.id} slot={s} />
            ))}
          </div>
        </section>
      )}

      {/* ---- 热门工具 (三组) ---- */}
      {groups.map((g) => (
        <section key={g.key}>
          <SectionHeader
            title={g.title}
            action={
              <Link to={lp(`/tools?category=${g.cat}`)} className={`text-sm font-semibold ${SCENE_TEXT[g.cat]}`}>
                {t('common.viewAll')} →
              </Link>
            }
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {getPopular(g.cat, 4).map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>
      ))}

      {/* ---- 热门对比 ---- */}
      <section>
        <SectionHeader title={t('home.hotCompareTitle')} />
        <div className="grid gap-4 sm:grid-cols-2">
          {(t('home.hotCompares') as { title: string; desc: string; tools: string }[]).map((c) => (
            <Link key={c.title} to={lp(`/compare?tools=${c.tools}`)} className="card card-hover flex items-center gap-4 p-5">
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-surface-2 text-ink-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 8H4l3-3m10 6h3l-3 3M4 5h13M20 11H7" />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-display font-semibold text-ink">{c.title}</div>
                <div className="mt-0.5 truncate text-sm text-ink-2">{c.desc}</div>
              </div>
              <span className="flex-none text-primary">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---- 最新价格更新 ---- */}
      <section>
        <SectionHeader title={t('home.latestTitle')} />
        <div className="overflow-hidden rounded-card border border-line bg-surface">
          {updates.map((u, i) => (
            <div key={u.id} className={`flex items-center gap-4 px-5 py-3.5 ${i > 0 ? 'border-t border-line-2' : ''}`}>
              <div className="min-w-0 flex-1">
                <span className="font-medium text-ink">{u.toolName}</span>
                <span className="ml-2 text-sm text-ink-2">{locale === 'en' && u.summaryEn ? u.summaryEn : u.summary}</span>
              </div>
              <ConfidenceBadge status={u.status} />
              <span className="hidden w-24 flex-none text-right text-xs text-ink-2 sm:block">{u.date}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ---- 投稿入口 ---- */}
      <section className="rounded-card border border-line bg-surface p-6 sm:p-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-ink">{t('home.submitTitle')}</h2>
            <p className="mt-1 text-ink-2">{t('home.submitDesc')}</p>
          </div>
          <Link to={lp('/submit')} className="btn-primary flex-none">
            {t('home.submitCta')} →
          </Link>
        </div>
      </section>

      {/* ---- 精选指南 ---- */}
      <section>
        <SectionHeader title={t('home.guidesTitle')} />
        <div className="grid gap-4 md:grid-cols-3">
          {guides.map((g) => (
            <Link key={g.id} to={lp(`/guides/${g.slug}`)} className="card card-hover flex flex-col p-5">
              <span className={`text-xs font-semibold uppercase tracking-label ${g.category !== 'general' ? SCENE_TEXT[g.category] : 'text-ink-2'}`}>
                {g.category !== 'general' ? t(`categories.${g.category}`) : 'GUIDE'}
              </span>
              <h3 className="mt-2 font-display font-semibold leading-snug text-ink">
                {locale === 'en' && g.titleEn ? g.titleEn : g.title}
              </h3>
              {g.excerpt && <p className="mt-2 flex-1 text-sm text-ink-2">{g.excerpt}</p>}
              <span className="mt-4 text-sm font-semibold text-primary">{t('common.viewDetails')} →</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
