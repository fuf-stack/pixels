import type { ThemeConfig } from 'tailwindcss/plugin';

// see: https://tailwindcss.com/docs/theme
const theme: ThemeConfig = {
  colors: {
    // additional info color range
    info: {
      DEFAULT: 'var(--theme-info)',
      foreground: 'var(--theme-info-foreground)',
      50: 'var(--theme-info-50)',
      100: 'var(--theme-info-100)',
      200: 'var(--theme-info-200)',
      300: 'var(--theme-info-300)',
      400: 'var(--theme-info-400)',
      500: 'var(--theme-info-500)',
      600: 'var(--theme-info-600)',
      700: 'var(--theme-info-700)',
      800: 'var(--theme-info-800)',
      900: 'var(--theme-info-900)',
    },
  },
};

export default theme;
