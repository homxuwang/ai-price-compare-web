/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/frontend/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff8ed',
          100: '#f4ead6',
          200: '#e5d4b6',
          300: '#d4b88c',
          400: '#c49a62',
          500: '#bf5a2b',
          600: '#a84823',
          700: '#8c381e',
          800: '#732e1e',
          900: '#60281c',
        },
        warm: {
          50: '#fffbf5',
          100: '#fff7ec',
          200: '#fff1d9',
          300: '#ffe4bc',
          400: '#ffd08f',
          500: '#ffb662',
          600: '#f99333',
          700: '#e87318',
          800: '#c45a12',
          900: '#a04812',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
