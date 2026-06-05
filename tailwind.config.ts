import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#e6f5f3',
          100: '#c2e6e1',
          500: '#01645a',
          600: '#015249',
          700: '#014038',
          800: '#002e28',
          900: '#001c18',
        },
        lime: {
          400: '#d1e87a',
          500: '#c7d36d',
        }
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Barlow Condensed"', '"Be Vietnam Pro"', 'sans-serif'],
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
      }
    }
  },
  plugins: []
} satisfies Config
