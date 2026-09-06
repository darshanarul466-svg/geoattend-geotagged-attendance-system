/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        nordic: {
          bg: '#F6F4F0',
          card: '#FFFFFF',
          surface: '#ECE7DF',
          dark: '#0F1115',
          darkCard: '#16191F',
          darkSurface: '#1E232B',
          darkBorder: '#272D37',
        },
        forest: {
          600: '#234E3D',
          700: '#193B2D',
          800: '#122B21',
          900: '#0A1B14',
        },
        terracotta: {
          400: '#F28E73',
          500: '#E76F51',
          600: '#D95B3B',
        },
        lavender: {
          100: '#EAE2FA',
          200: '#D8C5F7',
          800: '#56369A',
          900: '#381F6D',
        },
      }
    },
  },
  plugins: [],
}
