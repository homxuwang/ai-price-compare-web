// AI Price Compare Web - 布局组件

import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/platforms', label: '平台' },
  { path: '/models', label: '模型' },
  { path: '/compare', label: '对比' },
  { path: '/submit', label: '提交' },
  { path: '/about', label: '关于' },
  { path: '/admin', label: '管理' },
];

function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      {/* 导航栏 */}
      <header className="bg-white border-b border-warm-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl">💰</span>
              <span className="font-bold text-lg text-warm-900">AI 价格对比</span>
            </Link>

            {/* 导航链接 */}
            <nav className="hidden md:flex space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-warm-600 hover:bg-warm-100'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* 移动端菜单按钮 */}
            <button className="md:hidden p-2 rounded-lg hover:bg-warm-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-white border-t border-warm-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-warm-500">
              © 2026 AI Price Compare. 免费开源项目。
            </div>
            <div className="flex space-x-4">
              <a
                href="https://github.com/homxuwang/AIPriceCompareTool"
                target="_blank"
                rel="noopener noreferrer"
                className="text-warm-500 hover:text-warm-700"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
