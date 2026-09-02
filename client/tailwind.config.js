/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Black + Gold Luxury Surfaces ─────────────────────────
        'bg-primary': '#070707',
        'bg-secondary': '#0D0D0D',
        'bg-elevated': '#121212',
        'bg-card': '#111111',
        'bg-panel': '#151515',

        // ── Gold System ──────────────────────────────────────────
        gold: {
          DEFAULT: '#D4AF37',
          bright: '#E6C85C',
          soft: '#C8A951',
          dark: '#9F7C22',
          glow: 'rgba(212, 175, 55, 0.25)',
        },

        // ── Primary Brand (Gold as primary accent) ──────────────
        primary: {
          DEFAULT: '#D4AF37',
          hover: '#E6C85C',
          light: '#F0D879',
          dark: '#9F7C22',
        },

        // ── Typography ───────────────────────────────────────────
        'text-primary': '#FFFFFF',
        'text-secondary': '#B8B8B8',
        'text-muted': '#7D7D7D',

        // ── Borders ──────────────────────────────────────────────
        'border-gold': 'rgba(212, 175, 55, 0.18)',
        'border-subtle': 'rgba(255, 255, 255, 0.07)',
        'border-light': 'rgba(255, 255, 255, 0.09)',

        // ── Semantics ────────────────────────────────────────────
        success: {
          DEFAULT: '#22C55E',
          light: '#14532D',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#78350F',
        },
        danger: {
          DEFAULT: '#EF4444',
          light: '#7F1D1D',
        },

        // ── AI Accent ────────────────────────────────────────────
        'ai-gold': '#D4AF37',
        'ai-purple': '#A855F7',

        // ── Lead Temperature ─────────────────────────────────────
        hot: { DEFAULT: '#EF4444', light: 'rgba(239, 68, 68, 0.15)' },
        warm: { DEFAULT: '#D4AF37', light: 'rgba(212, 175, 55, 0.15)' },
        cold: { DEFAULT: '#60A5FA', light: 'rgba(96, 165, 250, 0.15)' },
      },
      fontFamily: {
        sans: ['Inter', 'Geist', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Manrope', 'Inter', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      },
      fontSize: {
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['13px', { lineHeight: '20px' }],
        base: ['14px', { lineHeight: '22px' }],
        md: ['15px', { lineHeight: '24px' }],
        lg: ['16px', { lineHeight: '24px' }],
        xl: ['18px', { lineHeight: '28px' }],
        '2xl': ['20px', { lineHeight: '30px' }],
        '3xl': ['24px', { lineHeight: '32px' }],
        '4xl': ['28px', { lineHeight: '36px' }],
        '5xl': ['32px', { lineHeight: '40px' }],
        '6xl': ['44px', { lineHeight: '52px' }],
      },
      spacing: {
        sidebar: '248px',
        'sidebar-collapsed': '72px',
        header: '60px',
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '8px',
        md: '10px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
      },
      boxShadow: {
        card: '0 4px 20px rgba(0, 0, 0, 0.45)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.6), 0 0 15px rgba(212, 175, 55, 0.15)',
        'gold-glow': '0 0 25px rgba(212, 175, 55, 0.22)',
        'gold-sm': '0 0 12px rgba(212, 175, 55, 0.14)',
        modal: '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(212, 175, 55, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-in': 'slideIn 250ms ease-out',
        'scale-in': 'scaleIn 200ms ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
