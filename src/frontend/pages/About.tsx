// OpenPriceHub · 关于页面 — 项目图纸说明

import React from 'react';
import { Link } from 'react-router-dom';
import Sheet from '../components/Sheet';
import DimDivider from '../components/DimDivider';

const features = [
  { code: 'QRY', t: '价格查询', d: '浏览不同平台上 AI 模型的定价信息。' },
  { code: 'CMP', t: '跨平台对比', d: '选择多个模型,查看各平台的价格差异。' },
  { code: 'CVT', t: '积分换算', d: '自动将积分套餐换算成统一单位价格。' },
  { code: 'CRW', t: '众包数据', d: '用户提交新价格,经审核后标注展示。' },
];

const stack = {
  前端: ['React 18', 'Vite', 'Tailwind CSS', 'React Router'],
  后端: ['Cloudflare Workers', 'Cloudflare D1 (SQLite)', 'Cloudflare KV'],
};

function About() {
  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div>
        <span className="eyebrow">// 关于 · README</span>
        <h1 className="mt-3 font-mono text-3xl font-semibold text-chalk">关于 OpenPriceHub</h1>
        <p className="mt-3 font-sans text-dim">一个免费、开源的 AI 模型价格对比平台。</p>
      </div>

      <section>
        <DimDivider label="项目介绍 · OVERVIEW" />
        <Sheet corners={false} className="mt-5 space-y-4 p-6 font-sans text-sm leading-relaxed text-dim">
          <p>
            OpenPriceHub 帮助用户比较不同 AI 平台模型的定价。随着 AI 服务普及,平台众多而价格差异巨大。
            我们的目标是让价格信息透明化,帮你找到最划算的方案。
          </p>
          <p>本项目支持文本、图片、视频、音频四类模型的价格对比,涵盖市面主流 AI 服务平台。</p>
        </Sheet>
      </section>

      <section>
        <DimDivider label="核心功能 · FEATURES" />
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {features.map((f) => (
            <Sheet key={f.code} className="p-5">
              <span className="font-mono text-xs font-semibold tracking-widest text-cyan">
                {f.code}
              </span>
              <h3 className="mt-3 font-sans font-medium text-chalk">{f.t}</h3>
              <p className="mt-1 font-sans text-sm text-dim">{f.d}</p>
            </Sheet>
          ))}
        </div>
      </section>

      <section>
        <DimDivider label="技术栈 · STACK" />
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {Object.entries(stack).map(([role, items]) => (
            <Sheet key={role} corners={false} className="p-5">
              <div className="eyebrow">{role}</div>
              <ul className="mt-3 space-y-1.5 font-mono text-sm text-dim">
                {items.map((i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-cyan">›</span>
                    {i}
                  </li>
                ))}
              </ul>
            </Sheet>
          ))}
        </div>
      </section>

      <section>
        <DimDivider label="开源 · OPEN SOURCE" />
        <Sheet corners={false} className="mt-5 p-6">
          <p className="font-sans text-sm text-dim">本项目完全开源,欢迎贡献代码或提交问题。</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="https://github.com/homxuwang/AIPriceCompareTool"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              GitHub ↗
            </a>
            <Link to="/submit" className="btn-primary">
              提交价格 →
            </Link>
          </div>
        </Sheet>
      </section>
    </div>
  );
}

export default About;
