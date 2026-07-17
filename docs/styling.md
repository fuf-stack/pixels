# Component styles

How components across the monorepo packages (`@fuf-stack/pixels`,
`@fuf-stack/megapixels`, `@fuf-stack/uniform`, …) are styled: the Tailwind
variants/slots pattern (the default), and how to ship a raw CSS file on the rare
occasion a component needs one. The same conventions apply to every package that
ships UI components.

## TL;DR

- Style components with **Tailwind variants + slots** via `tv()` from
  `@fuf-stack/pixel-utils`. This is the default and covers almost everything.
- Expose a per-slot `className` prop typed with `TVClassName`, and merge user
  classes with `variantsToClassNames(...)`.
- Use `cn()` for simple, single-element class merging.
- Only ship a real `.css` file when a dependency needs global CSS (e.g. CSS
  custom properties). Name it `<Component>.styles.css`, import it from the
  component, mark `sideEffects: ["**/*.css"]`, and expose it as a subpath export.
- Consumers import that CSS **once at their app's global entry**
  (e.g. `@fuf-stack/pixels/Json.css`), never from inside a component module.

## Styling pattern: Tailwind variants + slots

Components are styled with [tailwind-variants](https://www.tailwind-variants.org/)
re-exported as `tv` from `@fuf-stack/pixel-utils`. A component defines named
**slots** (the stylable parts) and **variants** (the style axes), then maps the
resolved classes onto the underlying element(s) (often a HeroUI component).

### 1) Define slots and variants with `tv()`

```tsx
import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';

import { tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

export const alertVariants = tv({
  // slots = the stylable parts of the component
  slots: {
    base: 'min-w-72 gap-3',
    closeButton: '',
    description: '',
    icon: '',
    iconWrapper: '',
    mainWrapper: 'ms-0 items-stretch gap-1.5',
    title: '',
  },
  // variants = the style axes callers (or internal logic) can toggle
  variants: {
    variant: {
      info: {
        base: 'border-small border-info-200 bg-info-50 text-info-600',
        icon: 'fill-current',
        title: 'text-inherit',
      },
      danger: {
        base: 'bg-danger-50',
        description: 'text-foreground',
      },
      // ...
    },
  },
});
```

### 2) Derive the public prop types from the variants

The variant definition is the single source of truth. Derive both the variant
props and the `className` type from it, so they never drift:

```tsx
// union of the variant options (e.g. `{ variant?: 'info' | 'danger' | ... }`)
export type VariantProps = TVProps<typeof alertVariants>;

// either a single class value or a per-slot record:
//   className="..."                       -> applied to the base slot
//   className={{ base: '...', title: '' }} -> applied per slot
type ClassName = TVClassName<typeof alertVariants>;

export interface AlertProps extends Omit<VariantProps, 'hasTitleAndChildren'> {
  /** CSS class name (string for base slot, or a per-slot record) */
  className?: ClassName;
  variant?: VariantProps['variant'];
  // ...
}
```

### 3) Resolve slot classes and merge the caller's `className`

`variantsToClassNames(variants, className, baseSlot)` turns the slot functions
into a `{ slot: 'classes' }` object and merges the caller's `className`:

- a **string/array** `className` is applied to the `baseSlot` (3rd arg),
- a **record** `className` is merged slot-by-slot.

```tsx
const Alert = ({ className, variant = 'info', ...props }: AlertProps) => {
  // 1. resolve slot classes for the active variants
  const variants = alertVariants({ variant });
  // 2. merge caller className; string className lands on the `base` slot
  const classNames = variantsToClassNames(variants, className, 'base');

  // 3. hand the per-slot classNames to the underlying element(s)
  return <HeroAlert classNames={classNames} /* ... */ />;
};
```

For components rendered as a single element (no slots), skip `tv` and just use
`cn()` (classnames + tailwind-merge with conflict resolution):

```tsx
import { cn } from '@fuf-stack/pixel-utils';

<div className={cn('p-4 text-center', className)} />;
```

### Conventions

- Keep slot keys stable and descriptive; empty string (`''`) is a valid default.
- Put shared/base classes in the slot default; put axis-specific overrides under
  `variants`.
- Prefer deriving prop types (`TVProps` / `TVClassName`) over hand-written unions.
- When wrapping HeroUI, map the resolved `classNames` onto its `classNames` prop
  and translate our prop names to HeroUI's where they differ.

## When a component needs a real CSS file

Almost all styling is Tailwind. A raw `.css` file is only needed when a
dependency relies on global CSS that Tailwind can't express — typically CSS
custom properties. The `Json` component is the current example: it ships
`Json.styles.css` with the `--w-rjv-*` variables that `@uiw/react-json-view` reads.

### The pattern

1. Put the stylesheet next to the component, named `<Component>.styles.css`:
   `src/Json/Json.styles.css`. The `.styles.css` suffix is important — a bare
   `Json.css` would share its basename with the compiled `Json.js` chunk and, with
   `unbundle: true`, tsdown would rename the JS chunk to `Json2.js` to dodge the
   clash. The distinct basename keeps `dist/Json/Json.js` clean.

2. Import it from the component module:

   ```tsx
   // src/Json/Json.tsx
   import './Json.styles.css';
   ```

3. Ensure `package.json` marks CSS as side-effectful so the bundler keeps used
   CSS and tree-shakes unused components together with their CSS
   (see the [rolldown DCE guide](https://rolldown.rs/in-depth/dead-code-elimination#example-optimizing-a-component-library)):

   ```json
   { "sideEffects": ["**/*.css"] }
   ```

4. `tsdown` (with `css: { splitting: true }`) extracts the import into a sibling
   file: `dist/Json/Json.styles.css`.

5. Expose it as a subpath export. The public subpath can keep a friendly name
   (`./Json.css`) while pointing at the built file:

   ```jsonc
   // package.json exports
   "./Json.css": { "import": "./dist/Json/Json.styles.css" }
   ```

Storybook needs no extra wiring: stories import the component from source, the
component imports its own `.styles.css`, and Storybook's bundler loads it.

### How consumers use it

Import the component CSS **once at the app's global style entry**, not from inside
a component/module:

```ts
// app entry (e.g. main.tsx / global styles)
import '@fuf-stack/pixels/Json.css';
```

Why global entry matters: importing `@fuf-stack/pixels/Json.css` from a regular
JS/TS module means any tool that externalizes `node_modules` and runs the module
through Node's loader (e.g. Vitest with externalized deps) will try to load a raw
`.css` and fail with `TypeError: Unknown file extension ".css"`. Importing it at
the global style entry keeps CSS out of those JS module graphs.

Each component with a stylesheet exports its own `.css` subpath; there's no
package-wide aggregate. An app that renders pixels components through
`uniform`/`megapixels` imports the relevant component CSS (e.g.
`@fuf-stack/pixels/Json.css`) at its global entry.

### Caveats

- **Name CSS files `<Component>.styles.css`, not `<Component>.css`.** A bare
  `Json.css` collides with the compiled `Json.js` chunk under `unbundle: true`,
  making tsdown emit the component as `dist/Json/Json2.js`. The `.styles.css`
  suffix gives the stylesheet a distinct basename and avoids the clash. (The
  public subpath export can still be named `./Json.css` if you prefer.)
- The ESM build strips the component's `import './Json.styles.css'` to a
  `/* empty css */` marker after extraction, so importing the component in Node
  never pulls a raw `.css`.
