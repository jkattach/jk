/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#F97316',
          amber:  '#F59E0B',
          dark:   '#1C1917',
          muted:  '#78716C',
          light:  '#FFF7ED',
        },
      },
      fontFamily: {
        sans: ['Pretendard', 'Apple SD Gothic Neo', 'Noto Sans KR', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
