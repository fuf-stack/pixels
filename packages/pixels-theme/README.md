# @fuf-stack/pixels-theme

Install this package as a direct dependency of the application that builds your Tailwind stylesheet.

```css
@import 'tailwindcss';
@import '@fuf-stack/pixels-theme/theme.css';
```

The theme stylesheet defines the light and dark palettes and their Tailwind mappings. It imports `utilities.css` for interaction states, transitions, and striped backgrounds. The sources live in `src/css/theme.css` and `src/css/utilities.css`; the build copies both into `dist/`.

The optional `pixelsTwClassMergeConfig` plugin from `@fuf-stack/pixels-theme/vite` reads the application stylesheet, including this theme, to configure class merging for project tokens.

Register it in Vite’s `plugins` array or Astro’s `vite.plugins`, using the CSS entry your app imports.

```ts
import { pixelsTwClassMergeConfig } from '@fuf-stack/pixels-theme/vite';

const plugins = [
  pixelsTwClassMergeConfig({ tailwindConfig: './src/theme.css' }),
];
```

Continue importing `cn` and `tv` from `@fuf-stack/pixel-utils`. That package uses the theme reader at build time to generate its default merge rules.

See the [styling guide](../../docs/styling.md) for component source scanning and theme overrides.
