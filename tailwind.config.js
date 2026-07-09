/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/frontend/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // OpenPriceHub Studio · 浅色创作者风
        bg: '#F8FAFC', // 页面底
        surface: '#FFFFFF', // 卡片
        'surface-2': '#F1F5F9', // 次级面 / hover
        ink: '#111827', // 主文字
        'ink-2': '#6B7280', // 次要文字
        line: '#E5E7EB', // 边框
        'line-2': '#EEF2F7', // 更淡的分隔线

        primary: {
          DEFAULT: '#4F46E5',
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#4F46E5',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
        accent: {
          DEFAULT: '#06B6D4',
          soft: '#CFFAFE',
        },
        success: { DEFAULT: '#16A34A', soft: '#DCFCE7' },
        warn: { DEFAULT: '#F59E0B', soft: '#FEF3C7' },
        danger: { DEFAULT: '#DC2626', soft: '#FEE2E2' },

        // 场景强调 (仅三大场景卡/专题页)
        scene: {
          image: '#4F46E5',
          video: '#06B6D4',
          llm: '#7C3AED',
        },

        // 兼容旧类名 → 映射到浅色 slate,避免遗留页面完全失样
        warm: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E5E7EB',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'system-ui', '"PingFang SC"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        card: '0.875rem', // 14px 卡片
      },
      boxShadow: {
        card: '0 1px 2px rgba(17,24,39,0.06), 0 1px 3px rgba(17,24,39,0.04)',
        'card-hover': '0 6px 20px rgba(17,24,39,0.08), 0 2px 6px rgba(17,24,39,0.04)',
        pop: '0 12px 32px rgba(17,24,39,0.12)',
      },
      letterSpacing: {
        label: '0.08em',
      },
      keyframes: {
        'fade-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in': 'fade-in 0.4s ease-out both',
      },
    },
  },
  plugins: [],
};
