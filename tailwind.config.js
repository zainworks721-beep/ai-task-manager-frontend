/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
        xl: '2.5rem',
      },
      screens: {
        '2xl': '1600px',
      },
    },
    extend: {
      fontFamily: {
        sans: [
          'Inter Variable',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'SF Mono',
          'Menlo',
          'Consolas',
          'Liberation Mono',
          'monospace',
        ],
      },
      colors: {
        /* ── Primary accent: refined indigo ─────────────────────────── */
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        /* ── Semantic text ramp (WCAG-tuned on the dark app bg) ─────── */
        ink: {
          DEFAULT: '#e8edf6', /* 14.6:1 */
          strong: '#f7f9fc', /* 17.2:1 */
          muted: '#aab5c7', /* 9.3:1 on app bg */
          subtle: '#8e9aad', /* 6.8:1 on app bg */
          faint: '#7a8598', /* 5.2:1 — placeholders / decorative */
        },
        /* ── Semantic surfaces (dark, layered by elevation) ─────────── */
        surface: {
          DEFAULT: '#10151f', /* cards, modals, panels */
          raised: '#151b27', /* hovered panels / dropdowns */
          muted: '#080b12', /* app background — darkest */
          subtle: '#161d2a', /* chips, quiet fills */
          sunken: '#1d2534', /* inset tracks, hover fills */
        },
        /* ── Semantic borders ───────────────────────────────────────── */
        line: {
          DEFAULT: '#242d3f',
          strong: '#38445c',
          soft: '#1a2130',
        },
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgb(0 0 0 / 0.35)',
        'sm': '0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4)',
        'md': '0 4px 14px -3px rgb(0 0 0 / 0.45), 0 2px 6px -2px rgb(0 0 0 / 0.35)',
        'lg': '0 14px 32px -8px rgb(0 0 0 / 0.5), 0 4px 10px -4px rgb(0 0 0 / 0.35)',
        'xl': '0 26px 52px -14px rgb(0 0 0 / 0.55), 0 8px 16px -8px rgb(0 0 0 / 0.4)',
        '2xl': '0 36px 72px -18px rgb(0 0 0 / 0.65), 0 12px 24px -12px rgb(0 0 0 / 0.45)',
        'inner-soft': 'inset 0 1px 0 0 rgb(255 255 255 / 0.05)',
        'glow': '0 0 0 1px rgb(99 102 241 / 0.22), 0 10px 30px -8px rgb(79 70 229 / 0.45)',
        'focus-brand': '0 0 0 4px rgb(99 102 241 / 0.22)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.75rem',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'in-out': 'cubic-bezier(0.65, 0, 0.35, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        250: '250ms',
        350: '350ms',
      },
      backdropBlur: {
        xs: '2px',
        '2xl': '40px',
        '3xl': '64px',
      },
      letterSpacing: {
        tightest: '-0.045em',
      },
      maxWidth: {
        'screen-2xl': '1600px',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'sheet-up': {
          '0%': { opacity: '0', transform: 'translateY(100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-500px 0' },
          '100%': { backgroundPosition: '500px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '70%': { transform: 'scale(1.6)', opacity: '0' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        'caret-blink': {
          '0%, 70%, 100%': { opacity: '1' },
          '20%, 50%': { opacity: '0' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'bar-grow': {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fade-in 0.4s ease-out both',
        'scale-in': 'scale-in 0.24s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-in-right': 'slide-in-right 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        'sheet-up': 'sheet-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        shimmer: 'shimmer 1.8s linear infinite',
        float: 'float 4s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.24, 0, 0.38, 1) infinite',
        'caret-blink': 'caret-blink 1.1s step-end infinite',
        'gradient-x': 'gradient-x 6s ease infinite',
        'bar-grow': 'bar-grow 0.9s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
};
