/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070C16',
          900: '#0B1220',
          800: '#111D35',
          700: '#1B2A4A',
        },
        electric: {
          500: '#2563EB',
          600: '#1D4ED8',
          400: '#3B82F6',
        },
        cyanAccent: {
          400: '#22D3EE',
          500: '#06B6D4',
        },
        saffron: {
          500: '#FF9933',
          600: '#EA7E1A',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
