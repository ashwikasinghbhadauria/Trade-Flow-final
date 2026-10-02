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
          950: '#07090E',
          900: '#0B0F19',
          850: '#101623',
          800: '#161F31',
          750: '#1D283E',
          700: '#26344E',
          600: '#384B6E',
          500: '#52668E',
        },
        trade: {
          buy: '#10B981', // Green for BUY / Bid
          'buy-bg': 'rgba(16, 185, 129, 0.12)',
          'buy-hover': '#059669',
          sell: '#EF4444', // Red for SELL / Ask
          'sell-bg': 'rgba(239, 68, 68, 0.12)',
          'sell-hover': '#DC2626',
          accent: '#00D2FF', // Cyan accent
          'accent-glow': 'rgba(0, 210, 255, 0.25)',
          purple: '#8B5CF6',
          amber: '#F59E0B'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Roboto Mono', 'monospace'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flash-green': 'flashGreen 0.6s ease-out',
        'flash-red': 'flashRed 0.6s ease-out',
      },
      keyframes: {
        flashGreen: {
          '0%': { backgroundColor: 'rgba(16, 185, 129, 0.4)' },
          '100%': { backgroundColor: 'transparent' },
        },
        flashRed: {
          '0%': { backgroundColor: 'rgba(239, 68, 68, 0.4)' },
          '100%': { backgroundColor: 'transparent' },
        },
      }
    },
  },
  plugins: [],
}
