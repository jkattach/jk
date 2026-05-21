/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        linkit: {
          blue:   '#005383',
          green:  '#C4D700',
          sky:    '#59BDED',
          indigo: '#1B3A5C',
          action: '#F59E0B',
        }
      },
      fontFamily: {
        sans: ['Pretendard', 'Apple SD Gothic Neo', 'Noto Sans KR', 'sans-serif']
      },
      borderRadius: {
        pill: '50px'
      }
    }
  },
  plugins: []
}

