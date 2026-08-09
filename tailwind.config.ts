import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        canvas: '#FFFFFF',
        mist: '#F5F6F8',
        // Surfaces
        card: '#FFFFFF',
        // Text
        ink: '#1A1A1A',
        'ink-soft': '#4A4E57',
        'ink-muted': '#8A8F9A',
        // Borders
        line: '#E8EAED',
        'line-soft': '#F0F1F4',
        // Gold accent scale
        gold: {
          DEFAULT: '#C9A227',
          light: '#D4AF37',
          deep: '#B8860B',
          wash: '#FBF7EC',
          faint: '#FDFBF5',
        },
      },
      fontFamily: {
        display: ['var(--font-manrope)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['clamp(2.75rem, 6vw, 5rem)', { lineHeight: '1.02', letterSpacing: '-0.03em' }],
        'display-lg': ['clamp(2rem, 4vw, 3.25rem)', { lineHeight: '1.06', letterSpacing: '-0.025em' }],
        'display-md': ['clamp(1.5rem, 2.5vw, 2.25rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
      },
      maxWidth: {
        reading: '68ch',
        content: '52rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)',
        card: '0 4px 24px -8px rgba(16, 24, 40, 0.10), 0 2px 8px -4px rgba(16, 24, 40, 0.06)',
        float: '0 12px 48px -12px rgba(16, 24, 40, 0.18), 0 4px 16px -8px rgba(16, 24, 40, 0.10)',
        'gold-glow': '0 0 0 1px rgba(201, 162, 39, 0.20), 0 8px 32px -8px rgba(201, 162, 39, 0.28)',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
};

export default config;
