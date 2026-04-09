/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        rose: '#C1506A',
        'rose-light': '#F5D6DE',
        cream: '#FAF6F1',
        ink: '#2C1A1A',
        muted: '#8A6E6E',
        gold: '#C9962A',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['Lato', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 30px rgba(44, 26, 26, 0.12)',
      },
    },
  },
  plugins: [],
}

