/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#030303',
          800: '#0b0b0f',
          700: '#14141d',
          600: '#1f1f2e',
          500: '#2c2c3e'
        },
        brand: {
          purple: '#8b5cf6',
          violet: '#7c3aed',
          cyan: '#06b6d4',
          neon: '#a78bfa'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        neon: '0 0 15px rgba(139, 92, 246, 0.5)',
        cyan: '0 0 15px rgba(6, 182, 212, 0.5)'
      },
      backdropBlur: {
        glass: '16px',
      }
    },
  },
  plugins: [],
}
