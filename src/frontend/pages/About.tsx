// AI Price Compare Web - 关于页面

import React from 'react';
import { Link } from 'react-router-dom';

function About() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-warm-900 mb-4">关于 AI 价格对比</h1>
        <p className="text-warm-600">
          一个免费、开源的 AI 模型价格对比平台
        </p>
      </div>

      {/* 项目介绍 */}
      <div className="card">
        <h2 className="text-xl font-bold text-warm-900 mb-4">项目介绍</h2>
        <div className="space-y-4 text-warm-600">
          <p>
            AI 价格对比是一个帮助用户比较不同 AI 平台模型定价的工具。
            随着 AI 服务的普及，越来越多的平台提供各种模型，但价格差异很大。
            我们的目标是让这些价格信息透明化，帮助用户找到最划算的方案。
          </p>
          <p>
            本项目支持文本、图片、视频、音频四类模型的价格对比，
            涵盖了市面上主流的 AI 服务平台。
          </p>
        </div>
      </div>

      {/* 核心功能 */}
      <div className="card">
        <h2 className="text-xl font-bold text-warm-900 mb-4">核心功能</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">🔍</span>
            <div>
              <h3 className="font-medium">价格查询</h3>
              <p className="text-sm text-warm-600">
                浏览不同平台上 AI 模型的定价信息
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-2xl">📊</span>
            <div>
              <h3 className="font-medium">跨平台对比</h3>
              <p className="text-sm text-warm-600">
                选择多个模型，查看各平台的价格差异
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-2xl">💰</span>
            <div>
              <h3 className="font-medium">积分换算</h3>
              <p className="text-sm text-warm-600">
                自动将积分套餐换算成单位价格
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-2xl">👥</span>
            <div>
              <h3 className="font-medium">众包数据</h3>
              <p className="text-sm text-warm-600">
                用户可以提交新价格，经审核后展示
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 技术栈 */}
      <div className="card">
        <h2 className="text-xl font-bold text-warm-900 mb-4">技术栈</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-medium mb-2">前端</h3>
            <ul className="space-y-1 text-warm-600">
              <li>• React 18</li>
              <li>• Vite</li>
              <li>• Tailwind CSS</li>
              <li>• React Router</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">后端</h3>
            <ul className="space-y-1 text-warm-600">
              <li>• Cloudflare Workers</li>
              <li>• Cloudflare D1 (SQLite)</li>
              <li>• Cloudflare KV</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 开源信息 */}
      <div className="card">
        <h2 className="text-xl font-bold text-warm-900 mb-4">开源信息</h2>
        <div className="space-y-4 text-warm-600">
          <p>
            本项目完全开源，欢迎贡献代码或提交问题。
          </p>
          <div className="flex space-x-4">
            <a
              href="https://github.com/homxuwang/AIPriceCompareTool"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              GitHub
            </a>
            <Link to="/submit" className="btn-primary">
              提交价格
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
