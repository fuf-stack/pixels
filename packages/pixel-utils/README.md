# @fuf-stack/pixel-utils

Shared helper utilities for the fuf pixels component library.

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

> **Why doesn't `tv` include prose-aware merging?**
> `tailwind-variants` uses a shared module-level cache for its merge function. Injecting a custom `twMergeConfig` here would corrupt the cache when the same bundle also contains HeroUI components (which set their own `twMergeConfig`). Use `cn(...)` or `proseTwMerge(...)` for prose deduplication instead.

### `slugify(string, options?)`

URL/ID-safe slug generation via [`slug`](https://github.com/trott/slug), with sensible defaults (RFC 3986, underscores instead of hyphens).

```ts
import { slugify } from '@fuf-stack/pixel-utils';

slugify('Hello World'); // => 'hello_world'
slugify('a.b.c', { replaceDots: true }); // => 'a_b_c'
```

### `isTestEnvironment()`

Returns `true` when running inside Vitest or when `NODE_ENV` is `test`. Safe for both Node.js and browser environments.

### `heroui`

Re-export of the `heroui` Tailwind plugin from `@heroui/theme`.
