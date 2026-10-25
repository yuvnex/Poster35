/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#07080b',
          900: '#0c0e14',
          850: '#11141c',
          800: '#171b26',
          700: '#232938',
          600: '#343c50',
          500: '#525d78',
          400: '#8c97b2'
        },
        brand: {
          amber: '#f59e0b',
          yellow: '#fbbf24',
          crimson: '#e50914',
          red: '#ef4444',
          teal: '#14b8a6',
          cyan: '#06b6d4'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif']
      },
      boxShadow: {
        'poster': '0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
        'poster-hover': '0 20px 35px -5px rgba(245, 158, 11, 0.2), 0 10px 15px -5px rgba(0, 0, 0, 0.8)',
        'glow-amber': '0 0 25px rgba(245, 158, 11, 0.35)',
        'glow-red': '0 0 25px rgba(239, 68, 68, 0.35)'
      },
      aspectRatio: {
        'poster': '2 / 3',
      }
    },
  },
  plugins: [],
}
