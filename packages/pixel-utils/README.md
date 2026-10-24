# @fuf-stack/pixel-utils

Shared helper utilities for the fuf pixels component library.

## Token stylesheet

Import `@fuf-stack/pixel-utils/tokens.css` after Tailwind in your global CSS entry.
It provides owned semantic tokens and utilities in light/dark themes, including
`bg-content1`, `text-danger`, `text-small`, `border-small` and `rounded-small`.
Override `--pixel-*` variables in theme scopes. See [styling](../../docs/styling.md)
for source detection and theme customization. CSS is marked side-effectful
and is never imported through the JavaScript entry.

## Exports

### `cn(...classes)`

Combines [`classnames`](https://github.com/JedWatson/classnames) with a prose-aware [`tailwind-merge`](https://github.com/dcastil/tailwind-merge) instance. Accepts strings, arrays, and conditional objects.

```ts
import { cn } from '@fuf-stack/pixel-utils';

cn('p-4 text-center', { 'bg-red-500': true });
// => 'p-4 text-center bg-red-500'

// prose-* deduplication built in
cn('prose prose-slate dark:prose-invert', 'prose-blue');
// => 'prose dark:prose-invert prose-blue'
```

### `proseTwMerge(classes)`

A standalone `tailwind-merge` instance extended with class groups for `@tailwindcss/typography`:

- **`prose-size`** — deduplicates size classes (`prose-sm`, `prose-lg`, `prose-xl`, ...)
- **`prose-color`** — deduplicates color theme classes (`prose-slate`, `prose-blue`, `prose-[#333]`, ...) while keeping `prose-invert` independent

Use it directly when you need prose-aware merging outside of `cn`.

```ts
import { proseTwMerge } from '@fuf-stack/pixel-utils';

proseTwMerge('prose prose-lg prose-slate', 'prose-xl prose-blue');
// => 'prose prose-xl prose-blue'
```

### `proseTwMergeClassGroups`

The raw class group config object. Use it to build your own extended `tailwind-merge` instance.

```ts
import { extendTailwindMerge } from 'tailwind-merge';

import { proseTwMergeClassGroups } from '@fuf-stack/pixel-utils';

const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      ...proseTwMergeClassGroups,
      // add more custom groups here
    },
  },
});
```

### `tv`, `variantsToClassNames`, `TVProps`, `TVClassName`, `ClassValue`

Re-exports and helpers around [`tailwind-variants`](https://www.tailwind-variants.org/).

```ts
import { tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

const tooltip = tv({
  slots: { base: '', content: 'p-4', trigger: 'cursor-pointer' },
  variants: {
    size: { sm: { content: 'max-w-sm' }, lg: { content: 'max-w-lg' } },
  },
});

const classes = variantsToClassNames(
  tooltip({ size: 'sm' }),
  'shadow-lg',
  'base',
);
// => { base: 'shadow-lg', content: 'p-4 max-w-sm', trigger: 'cursor-pointer' }
```

`tv` includes the same prose merge rules as `cn`. Owned recipes additionally
classify existing semantic sizes, radii, borders, shadows and transitions.
The legacy standalone `cn` keeps its previous semantic classification for compatibility; use instance helpers for semantic utility classes. Recipes use the unmerged
Tailwind Variants engine, then resolve conflicts with an isolated instance.
Compound variants and recipe extension retain their classes until final merging.

### `createStyling(config?)`, `defaultStyling`

Create an immutable set of `cn`, `tv`, `resolve`, and `variantsToClassNames`
helpers using Tailwind Merge's `extend`/`override` configuration format. Custom
class groups and directional conflicts are supported. The configuration is
copied when the instance is created; separate instances do not share settings.

```ts
import { createStyling, tv } from '@fuf-stack/pixel-utils';

export const styling = createStyling({
  extend: { classGroups: { 'font-size': [{ text: ['body'] }] } },
});
styling.cn('text-sm text-danger', 'text-body');
// => 'text-danger text-body'

// Resolve an existing module-level recipe before merging slot overrides.
const input = tv({ slots: { input: 'text-danger text-sm' } });
styling.variantsToClassNames(styling.resolve(input), { input: 'text-body' });
// => { base: undefined, input: 'text-danger text-body' }
```

Use `styling.tv` for application recipes. Use `styling.resolve` only with recipes
created by pixel-utils: classes discarded inside a third-party recipe cannot be
recovered. Define the corresponding utility in Tailwind separately; merge
configuration does not generate CSS. See [styling](../../docs/styling.md) for
React context usage and source detection.

### `slugify(string, options?)`

URL/ID-safe slug generation via [`slug`](https://github.com/trott/slug), with sensible defaults (RFC 3986, underscores instead of hyphens).

```ts
import { slugify } from '@fuf-stack/pixel-utils';

slugify('Hello World'); // => 'hello_world'
slugify('a.b.c', { replaceDots: true }); // => 'a_b_c'
```

### `isTestEnvironment()`

Returns `true` when running inside Vitest or when `NODE_ENV` is `test`. Safe for both Node.js and browser environments.

## Migration from the HeroUI plugin

The `heroui` JavaScript export is removed as a breaking change. Replace the
Tailwind plugin with the token stylesheet and scan the built component packages:

```css
@import 'tailwindcss';
@import '@fuf-stack/pixel-utils/tokens.css';
@source '../node_modules/@fuf-stack/pixels/dist';
@source '../node_modules/@fuf-stack/uniform/dist';
```

Paths are relative to the stylesheet. Add Megapixels when used. Replace custom
`--heroui-*` variables with the corresponding `--pixel-*` variables. The default
palette and semantic utilities remain available without a plugin.
