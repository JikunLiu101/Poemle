/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Noto Serif SC', 'Source Han Serif CN', 'serif'],
      },
      colors: {
        correct: '#538d4e',
        present: '#b59f3b',
        absent: '#3a3a3c',
        cell: '#1a1a1b',
      },
      animation: {
        'flip-in': 'flip-in 0.3s ease-in forwards',
        'bounce-in': 'bounce-in 0.1s ease forwards',
        'fade-in': 'fade-in 0.4s ease forwards',
        'slide-up': 'slide-up 0.5s ease forwards',
      },
      keyframes: {
        'flip-in': {
          '0%': { transform: 'rotateX(0deg)' },
          '50%': { transform: 'rotateX(-90deg)' },
          '100%': { transform: 'rotateX(0deg)' },
        },
        'bounce-in': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.12)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
  safelist: [
    'bg-correct', 'bg-present', 'bg-absent',
    'border-correct', 'border-present', 'border-absent',
    'text-correct', 'text-present', 'text-absent',
  ],
}
