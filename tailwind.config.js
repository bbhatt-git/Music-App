/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        glass: {
          100: 'rgba(255, 255, 255, 0.03)',
          200: 'rgba(255, 255, 255, 0.06)',
          300: 'rgba(255, 255, 255, 0.09)',
          400: 'rgba(255, 255, 255, 0.12)',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-strong': 'rgba(255, 255, 255, 0.15)',
        },
        apple: {
          bg: '#000000',
          surface: '#0d0d0d',
          elevated: '#141414',
        }
      },
      animation: {
        'float': 'float 20s ease-in-out infinite',
        'pulse-slow': 'pulse 15s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '33%': { transform: 'translate(30px, -30px)' },
          '66%': { transform: 'translate(-20px, 20px)' },
        }
      }
    },
  },
  plugins: [],
}
