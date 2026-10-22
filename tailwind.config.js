/** @type {import('tailwindcss').Config} */
// Tokens translated from the original Tailwind v4 theme (CLONE_SPEC.md section 1).
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    // Full screens list so the custom `xs` (480px) sorts before `sm` in the generated CSS.
    screens: {
      xs: '480px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        background: '#121212',
        foreground: '#ffffff',
        'text-primary': '#ffffff',
        'text-secondary': '#a0a0a0',
        'text-tertiary': '#717171',
        'text-quaternary': 'rgba(255,255,255,0.2)',
        'border-primary': 'rgba(255,255,255,0.2)',
        'border-separator': 'rgba(255,255,255,0.1)',
        'border-secondary': 'rgba(255,255,255,0.1)',
        accent: '#245aca',
        'surface-well': '#080808',
        'surface-panel': 'rgba(40,40,40,0.58)',
        'surface-popover': 'rgba(34,34,34,0.95)',
        glass: 'rgba(35,35,35,0.3)',
        'glass-border': 'rgba(255,255,255,0.08)',
        'close-btn': 'rgba(35,35,35,0.34)',
        'close-btn-hover': 'rgba(42,42,42,0.52)',
        'dialog-backdrop': 'rgba(18,18,18,0.75)',
        support: {
          red: '#ff6363',
          orange: '#ff9217',
          yellow: '#ffc531',
          green: '#59d499',
          blue: '#56c2ff',
          purple: '#a485ff',
          magenta: '#cf2f98',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
        display: ['"Instrument Sans"', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
      },
      fontSize: {
        '2xs': '0.625rem',
        md: '0.9375rem',
        hero: '2.125rem',
      },
      lineHeight: {
        hero: '1.1',
      },
      borderRadius: {
        xl: '18px',
        '2xl': '18px',
        '3xl': '26px',
        popover: '14px',
        option: '9px',
      },
      maxWidth: {
        page: '960px',
        content: '640px',
        narrow: '480px',
      },
      boxShadow: {
        'dropdown-trigger': '0 8px 30px rgba(0,0,0,0.18)',
        'dropdown-menu': '0 18px 60px rgba(0,0,0,0.45)',
        'mobile-nav-open': '0 1px 4px #0000001f, 0 26px 48px #0006, 0 8px 18px #0003',
        'close-btn': '0 10px 28px rgba(0,0,0,0.28)',
      },
      dropShadow: {
        glow: '0 0 40px #ffffff1f',
        particle: '0 4px 12px #0006',
      },
      transitionTimingFunction: {
        'nav-panel': 'cubic-bezier(.16,1,.3,1)',
      },
      opacity: {
        15: '0.15',
      },
    },
  },
  plugins: [
    // Original wraps hover variants in @media (hover:hover) (CLONE_SPEC 1.6)
    ({ addVariant }) => {
      addVariant('hover', '@media (hover: hover) { &:hover }')
      addVariant('group-hover', '@media (hover: hover) { :merge(.group):hover & }')
    },
  ],
}
