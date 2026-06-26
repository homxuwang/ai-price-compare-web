// AI Price Compare Web - 首页

import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="space-y-8">
      {/* Hero 区域 */}
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold text-warm-900 mb-4">
          AI 模型价格对比
        </h1>
        <p className="text-xl text-warm-600 mb-8 max-w-2xl mx-auto">
          免费对比 OpenAI、Anthropic、Google 等 AI 平台的模型定价。
          支持文本、图片、视频、音频模型的跨平台价格对比。
        </p>
        <div className="flex justify-center space-x-4">
          <Link to="/models" className="btn-primary">
            浏览模型
          </Link>
          <Link to="/submit" className="btn-secondary">
            提交价格
          </Link>
        </div>
      </section>

      {/* 统计卡片 */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary-500">12</div>
          <div className="text-warm-600">平台</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary-500">8</div>
          <div className="text-warm-600">套餐</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary-500">45</div>
          <div className="text-warm-600">模型</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary-500">120</div>
          <div className="text-warm-600">价格</div>
        </div>
      </section>

      {/* 按类别浏览 */}
      <section>
        <h2 className="text-2xl font-bold text-warm-900 mb-4">按类别浏览</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/models?category=text" className="card hover:shadow-md transition-shadow">
            <div className="text-3xl mb-2">📝</div>
            <div className="font-medium">文本模型</div>
            <div className="text-sm text-warm-500">GPT-4o, Claude, Gemini</div>
          </Link>
          <Link to="/models?category=image" className="card hover:shadow-md transition-shadow">
            <div className="text-3xl mb-2">🖼️</div>
            <div className="font-medium">图片模型</div>
            <div className="text-sm text-warm-500">DALL-E, Midjourney</div>
          </Link>
          <Link to="/models?category=video" className="card hover:shadow-md transition-shadow">
            <div className="text-3xl mb-2">🎬</div>
            <div className="font-medium">视频模型</div>
            <div className="text-sm text-warm-500">Sora, Runway</div>
          </Link>
          <Link to="/models?category=audio" className="card hover:shadow-md transition-shadow">
            <div className="text-3xl mb-2">🎵</div>
            <div className="font-medium">音频模型</div>
            <div className="text-sm text-warm-500">Whisper, ElevenLabs</div>
          </Link>
        </div>
      </section>

      {/* 热门对比 */}
      <section>
        <h2 className="text-2xl font-bold text-warm-900 mb-4">热门对比</h2>
        <div className="space-y-4">
          <Link to="/compare?models=gpt-4o,claude-3.5,gemini-1.5" className="card hover:shadow-md transition-shadow block">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">GPT-4o vs Claude 3.5 vs Gemini 1.5</div>
                <div className="text-sm text-warm-500">文本模型跨平台对比</div>
              </div>
              <div className="text-primary-500">→</div>
            </div>
          </Link>
          <Link to="/compare?models=gpt-image-1,dall-e-3" className="card hover:shadow-md transition-shadow block">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">GPT-Image-1 vs DALL-E 3</div>
                <div className="text-sm text-warm-500">图片生成模型对比</div>
              </div>
              <div className="text-primary-500">→</div>
            </div>
          </Link>
        </div>
      </section>

      {/* 如何使用 */}
      <section>
        <h2 className="text-2xl font-bold text-warm-900 mb-4">如何使用</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="card">
            <div className="text-3xl mb-3">1️⃣</div>
            <h3 className="font-medium mb-2">浏览价格</h3>
            <p className="text-sm text-warm-600">
              查看不同平台上 AI 模型的定价信息，支持按类别筛选。
            </p>
          </div>
          <div className="card">
            <div className="text-3xl mb-3">2️⃣</div>
            <h3 className="font-medium mb-2">对比选择</h3>
            <p className="text-sm text-warm-600">
              使用对比工具，选择多个模型或平台，找到最划算的方案。
            </p>
          </div>
          <div className="card">
            <div className="text-3xl mb-3">3️⃣</div>
            <h3 className="font-medium mb-2">贡献数据</h3>
            <p className="text-sm text-warm-600">
              发现新价格？提交给我们，经审核后会展示给所有用户。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
