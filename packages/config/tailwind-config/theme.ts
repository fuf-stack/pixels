import type { CustomThemeConfig } from 'tailwindcss/types/config';

// see: https://tailwindcss.com/docs/theme
const theme: Partial<CustomThemeConfig> = {
  colors: {
    // additional info color range
    info: {
      DEFAULT: 'hsl(var(--theme-info))',
      foreground: 'hsl(var(--theme-info-foreground))',
      50: 'hsl(var(--theme-info-50))',
      100: 'hsl(var(--theme-info-100))',
      200: 'hsl(var(--theme-info-200))',
      300: 'hsl(var(--theme-info-300))',
      400: 'hsl(var(--theme-info-400))',
      500: 'hsl(var(--theme-info-500))',
      600: 'hsl(var(--theme-info-600))',
      700: 'hsl(var(--theme-info-700))',
      800: 'hsl(var(--theme-info-800))',
      900: 'hsl(var(--theme-info-900))',
    },
  },
};

export default theme;
