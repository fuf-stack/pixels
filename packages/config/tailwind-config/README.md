# Workspace Tailwind CSS

CSS-first Tailwind 4 entry for Storybook and workspace UI builds.

```css
@import '@repo/tailwind-config/tailwind.css';
```

- `tailwind.css` imports Tailwind and the shared semantic tokens
- Explicit `@source` globs include `.ts` recipes and `.tsx` components from all four UI packages
- Colors, dark mode and custom utilities come from `@fuf-stack/pixel-utils/tokens.css`
- Prettier uses this entry through `tailwindStylesheet`

Add new workspace sources here. Keep theme changes with the token stylesheet,
without a `tailwind.config.*` file or legacy `@config` directive.

This package is private build tooling. Published consumers use the token CSS
and built-package sources in the [styling guide](../../../docs/styling.md#semantic-tokens).
