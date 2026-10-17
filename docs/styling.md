# Component styles

How components across the monorepo packages (`@fuf-stack/pixels`,
`@fuf-stack/megapixels`, `@fuf-stack/uniform`, …) are styled: the Tailwind
variants/slots pattern (the default), and how to ship a raw CSS file on the rare
occasion a component needs one. The same conventions apply to every package that
ships UI components.

For component layout, prop ownership, documentation and readability, see the
[code style guide](./code-style.md). This document owns the styling-specific
rules and examples; keep the two guides consistent when conventions change.

## Tailwind CSS 4 setup

The workspace uses CSS-first configuration in
[`tailwind.css`](../packages/config/tailwind-config/tailwind.css). There is no
JavaScript/TypeScript Tailwind config or `@config` compatibility layer. The Vite
plugin compiles this stylesheet for Storybook and browser tests. Prettier uses
this same entry through `tailwindStylesheet` to recognize semantic utilities.

```css
@import 'tailwindcss' source(none);
@import '@fuf-stack/pixel-utils/tokens.css';

@source '../../pixels/src/**/*.{js,ts,jsx,tsx}';
```

The shared entry explicitly registers Atelier, Megapixels, Pixels and Uniform.
Sources are relative to that stylesheet, so builds work from any package's
working directory. Include `.ts` recipes as well as `.tsx` components when
adding a package. Snapshots, generated output and dependencies are not scanned.
`source(none)` disables implicit discovery, add new workspace sources explicitly.

Semantic colors, sizes, utilities and the class/data-attribute dark variant
live in `pixel-utils/src/tokens.css`, using `@theme`, `@utility` and
`@custom-variant`. Do not duplicate their defaults in the workspace entry.
Applications outside this repository use the [published token setup](#semantic-tokens)
and register the built packages they consume.

## Recipe file ownership

Keep a component's recipes in a dedicated `<component>Variants.ts` file, such as
[`inputVariants.ts`](../packages/uniform/src/Input/inputVariants.ts). Define and
export `VariantProps`, `ClassName` and resolved slot types beside the recipes they
describe. Keep the component's main prop interface in its own `.tsx` file;
subcomponents own their prop interfaces in the same way. See
[type ownership](./code-style.md#types-live-with-their-owner) for concrete examples.

Older wrappers may still inline recipes and aliases. Follow the dedicated-file
structure for new components and focused refactors without changing public
exports merely to reorganize implementation files.

Keep shared recipes with a component that owns them, and import them directly
from related components. A separate shared styling folder is unnecessary for
reuse between two fields. Compose through `tv`, instead of spreading plain class
maps or interpolating slot strings:

```ts
// DatePicker/datePickerVariants.ts
import { segmentedInputVariants } from '../Time/timeVariants';

// Time/timeVariants.ts
export const segmentedInputVariants = tv({
  slots: {
    /** Bordered surface around the editable segments */
    inputWrapper: 'rounded-small border-2 border-default-200',
  },
});

export const datePickerVariants = tv({
  extend: segmentedInputVariants,
  slots: {
    /** Button opening the calendar popup */
    selectorButton: '',
  },
});
```

Describe each recipe briefly by the elements or states it styles. Avoid migration
history or vague ownership language such as “owned defaults for existing slots”.
Export the component's main recipe from its `index.ts`, so consumers can reuse it
through the component's public import path. Keep internal helper recipes private
unless consumers need them.

```ts
// TextArea/textAreaVariants.ts
/** Textarea slot styles with disabled, filled and invalid states */
export const textAreaVariants = tv({
  // slots and variants
});

// TextArea/index.ts
export { textAreaVariants } from './textAreaVariants';
```

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
resolved classes onto the underlying element(s) (native elements or React Aria components).

### 1) Define slots and variants with `tv()`

Give each slot definition a short JSDoc description of its role or contents,
without a trailing full stop. Explain what it wraps, displays or controls rather
than merely repeating the component and slot names. For example, use
`/** Supporting message below the title */` instead of `/** Alert description */`.
Describe the element, not its current CSS classes. Variant overrides reuse the
slot's description and do not need to repeat it.

```tsx
import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';

// alertVariants.ts
import { tv } from '@fuf-stack/pixel-utils';

export const alertVariants = tv({
  // slots = the stylable parts of the component
  slots: {
    /** Outer container for the icon, message and actions */
    base: 'min-w-72 gap-3',
    /** Button for dismissing the alert */
    closeButton: '',
    /** Supporting message below the title */
    description: '',
    /** Icon indicating the message type */
    icon: '',
    /** Container around the message icon */
    iconWrapper: '',
    /** Container grouping the title and supporting message */
    mainWrapper: 'ms-0 items-stretch gap-1.5',
    /** Heading above the supporting message */
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

### Group long class lists by purpose

Split long slot class lists into arrays of strings. Keep related utilities together,
for example control layout, border and background, typography, focus feedback or
pseudo-element layers. Add short lowercase comments describing each group's role.
Keep short, obvious slot styles as single strings, and avoid a comment per utility.
Use the same grouping for substantial overrides inside variants and compound variants.

Preserve the original class order when splitting a list, including state selectors,
conflicting utilities and browser-specific rules. Do not sort the classes as part of
this cleanup. Keep slot keys alphabetical in defaults and all overrides, without
reordering variant axes or compound variant entries, which can affect precedence.

```ts
inputWrapper: [
  // control dimensions and layout
  'relative inline-flex h-10 w-full items-center gap-3',
  // bordered surface
  'rounded-small border-2 border-default-200 bg-content1 px-3',
  // hover and focus borders
  'hover:border-default-400 focus-within:border-focus',
  // reduced motion
  'transition-colors motion-reduce:transition-none',
],
```

When a component reuses only part of another recipe, reference those slot
and variant definitions in its own `tv` recipe. Resolve and merge the resulting
recipe once, rather than calling individual slot functions and `cn` inside JSX.
Use `extend` when all of the other recipe's defaults belong on the component.

```ts
const radioBoxVariants = tv({
  slots: {
    base: 'rounded-lg border-2 p-4',
    control: radioControlVariants.slots.control,
    labelWrapper: [radioControlVariants.slots.labelWrapper, 'grow'],
  },
});
```

A small mapping between differently named slots can stay directly on a child's
`className` prop, for example `{ base: classNames.boxBase }`. It only forwards
resolved classes, without composing styles in JSX.

### 2) Derive the public prop types from the variants

The variant definition is the single source of truth. Derive and export both
aliases from `alertVariants.ts`, so they stay with the recipe and never drift:

For a small component-local recipe, keep the recipe and derived aliases directly
in the component file instead. A dedicated variants file is useful when styling
is substantial or shared. See the
[colocated recipe example](./code-style.md#types-live-with-their-owner).

```tsx
// union of the variant options (e.g. `{ variant?: 'info' | 'danger' | ... }`)
export type VariantProps = TVProps<typeof alertVariants>;

// either a single class value or a per-slot record:
//   className="..."                       -> applied to the base slot
//   className={{ base: '...', title: '' }} -> applied per slot
export type ClassName = TVClassName<typeof alertVariants>;
```

Import those types into the component file; keep its main prop definition there:

```tsx
// Alert.tsx
import type { ClassName, VariantProps } from './alertVariants';

export interface AlertProps extends Omit<VariantProps, 'hasTitleAndChildren'> {
  /** CSS class name */
  className?: ClassName;
  variant?: VariantProps['variant'];
  // ...
}
```

### 3) Resolve slot classes and merge the caller's `className`

`variantsToClassNames(variants, className, baseSlot)` turns the slot functions
into a `{ slot: 'classes' }` object and merges the caller's `className`:

- a **string/array** `className` is applied to the `baseSlot` (3rd arg),
- a **record** `className` is merged slot-by-slot, with `undefined` overrides
  preserving the slot defaults. Conditional overrides such as
  `{ label: hasSubline ? undefined : classNames.label }` are supported.

Keep these two calls in their own block with `// classNames from slots` above them.
Use `variants` for the resolved slots and `classNames` for their merged strings,
including when resolving through `useStyling()`. Keep them as separate assignments,
do not inline `resolve(...)` inside `variantsToClassNames(...)`.

Compose slot classes through Tailwind Variants, not standalone class maps or
literal slot overrides passed to partials. Put defaults in the owning recipe and
pass its resolved `classNames` to shared presentation:

```tsx
const radioTabsVariants = tv({
  slots: {
    /** Supporting text below the selection */
    description: 'text-tiny text-foreground-400',
    /** Container for validation messages */
    errorMessage: 'text-tiny text-danger',
  },
});

// after resolving and merging the recipe
<FieldLayout className={classNames} /* ... */ />;
```

The shared [FieldLayout](../packages/uniform/src/partials/FieldLayout/README.md)
receives resolved slot classes and applies `className.base` to its default outer
`div`. Supply attributes, interactions and refs via `baseProps`; styling stays in
`className`. Use `baseAs` to select a field engine instead of the default `div`.
The layout passes `className.base` and `baseProps` to that engine, with the label,
control and supporting messages as its children. See the [layout examples](./code-style.md#component-files-and-responsibility).

```tsx
const Alert = ({ className, variant = 'info', ...props }: AlertProps) => {
  // classNames from slots
  const variants = alertVariants({ variant });
  const classNames = variantsToClassNames(variants, className, 'base');

  return <div className={classNames.base} /* ... */ />;
};
```

For components rendered as a single element (no slots), skip `tv` and just use
`cn()` (classnames + tailwind-merge with conflict resolution):

```tsx
import { cn } from '@fuf-stack/pixel-utils';

<div className={cn('p-4 text-center', className)} />;
```

Keep slot keys alphabetical, including slot overrides within variants. Use one
recipe for a field's defaults and state variants. Split recipes only for distinct
rendered controls or actual shared defaults, such as segmented input styling used
by both Time and DatePicker. `VariantProps` describes every recipe variant without
filtering. Extend it only when the component intentionally exposes those variants.
Otherwise define component props explicitly, keeping derived state private:

```ts
export const textAreaVariants = tv({
  slots: {
    /** Supporting text below the textarea */
    description: 'text-tiny text-foreground-500',
    /** Validation message container */
    errorMessage: 'text-tiny text-danger',
    /** Editable multiline text */
    input: 'w-full bg-transparent',
  },
  variants: {
    invalid: { true: { input: 'text-danger' } },
  },
});

export type VariantProps = TVProps<typeof textAreaVariants>;
```

```tsx
// TextArea.tsx
export interface TextAreaProps {
  /** Disables the field */
  disabled?: boolean;
  /** Field name */
  name: string;
}
```

### Conventions

- Expose slots for the styled parts consumers need to customize, including
  labels, descriptions, validation messages and actions. Define them in the
  public recipe so `TVClassName` accepts them. Keep state variants in the same
  recipe and exclude private state axes from component props rather than from
  the recipe’s `VariantProps`. See the
  [Input slot example](../packages/uniform/src/Input/README.md#styling).

- Use `className` for our component styling props, including private components
  receiving resolved slot maps. Keep a resolved map's type separate from the
  consumer override type. See the [code style examples](./code-style.md#types-live-with-their-owner).

- Keep slot keys stable and descriptive; empty string (`''`) is a valid default.
- Put shared/base classes in the slot default; put axis-specific overrides under
  `variants`.
- Prefer deriving prop types (`TVProps` / `TVClassName`) over hand-written unions.
- Pass resolved slot classes to the elements or subcomponents that own them.

## Isolated consumer class merging

`createStyling` from `@fuf-stack/pixel-utils` accepts Tailwind Merge's
`extend`/`override` format. Its `cn`, `tv`, and slot resolution use one effective
configuration, including typography plugin groups. It uses the Tailwind Variants
lite engine so compound variants and extended recipes reach the final merge
without previously discarded classes. `TVProps` now comes directly from
Tailwind Variants rather than the HeroUI theme.

```tsx
import { createStyling, tv } from '@fuf-stack/pixel-utils';
import { StylingProvider, useStyling } from '@fuf-stack/pixels/StylingProvider';

const styling = createStyling({
  extend: { classGroups: { 'font-size': [{ text: ['body'] }] } },
});
const recipe = tv({ slots: { input: 'text-sm text-danger' } });

function Control() {
  const helpers = useStyling();

  // classNames from slots
  const variants = helpers.resolve(recipe);
  const classNames = helpers.variantsToClassNames(variants, {
    input: 'text-body',
  });

  return <input aria-label="Example" className={classNames.input} />;
}

<StylingProvider styling={styling}>
  <Control />
</StylingProvider>;
```

Create instances outside rendering and reuse them in application helpers.
The provider follows the React tree through portals and allows nested providers,
independent roots, and separate server requests. With no provider, `useStyling`
returns `defaultStyling`. String, array, and per-slot record overrides keep their
existing meaning. For module-level recipes, call `resolve` before slot functions
are evaluated; applying a custom merge after default resolution cannot recover
discarded classes.

The standalone `cn` export retains its historical merge behavior for compatibility.
Use `defaultStyling.cn` or an instance’s `cn` for semantic utilities such as
`text-medium`. All workspace component recipes resolve through their styling
instance. Tailwind must generate custom classes such as `text-body` separately,
for example through a `--text-body` theme token.

## Semantic tokens

The public stylesheet `@fuf-stack/pixel-utils/tokens.css` preserves the default
semantic color palettes, layout sizes, radii, shadows, opacity and transition
utilities. It contains owned `--pixel-*` variables and Tailwind v4 directives;
it does not load the HeroUI plugin or reference HeroUI variables. Import it
after Tailwind in the application's global CSS entry:

```css
@import 'tailwindcss';
@import '@fuf-stack/pixel-utils/tokens.css';

/* Tailwind normally excludes node_modules from automatic source discovery. */
@source '../node_modules/@fuf-stack/pixels/dist';
@source '../node_modules/@fuf-stack/uniform/dist';

@theme {
  --text-body: 1.125rem;
}

:root {
  --pixel-color-primary: #006fee;
}
```

Paths in `@source` are relative to this stylesheet. Add Megapixels when used.
The tokens follow `.light`/`.dark` classes and `data-theme="light"`/`"dark"`,
including nested theme scopes. Theme overrides can target those same scopes.
Configure merge rules separately when a custom utility such as `text-body`
needs to conflict with a built-in utility; token generation alone is insufficient.

The HeroUI plugin and its source scanning are removed. The old `heroui` export
from pixel-utils is removed as a breaking change. Consumers must replace plugin
setup with the CSS import and built-package sources above, and replace custom
`--heroui-*` overrides with their `--pixel-*` equivalents. The workspace uses
this same token stylesheet, without a separate component theme plugin.

The stylesheet is shipped unchanged in `dist`, explicitly exported and marked
side-effectful. Packed-consumer verification compiles it without HeroUI tooling
and scans built component files for utility classes.

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

## Field state attributes

Uniform's private [getFieldDataAttributes helper](../packages/uniform/src/helpers/fieldProps/fieldProps.ts) maps disabled, invalid and
required state to `data-disabled`, `data-invalid` and `data-required`. Inactive
flags are omitted. Input, TextArea and Select use it on their field roots.
It shares the `fieldProps` module with `getFieldControlProps`, which derives
accessibility associations for the editable control or group. Call each helper
where its attributes belong, see the [helpers guide](../packages/uniform/src/helpers/README.md).
Interaction attributes remain with the control, and `data-slot` identifies the
rendered element. Other field-specific state remains local to its renderer.

```tsx
<div
  {...getFieldDataAttributes(field)}
  data-focus={focused || undefined}
  data-slot="base"
/>
```

Use selectors such as `group-data-[invalid=true]:text-danger` in the owning
Tailwind Variants recipe. `data-filled` reflects an actual value, including zero,
without counting the placeholder. Avoid speculative flags for content presence,
see the [component ownership rules](./code-style.md#component-files-and-responsibility).

For interaction state that React Aria already exposes, use its attribute directly.
Input's Group owns hover on `inputWrapper`, whose recipe uses
`data-[hovered=true]:border-default-400`. Do not mirror that state in a parent or
add a second hover attribute for styling. See the
[interaction ownership example](./code-style.md#component-files-and-responsibility).

Workspace Tailwind source globs include both `.ts` and `.tsx` files, so dedicated
variants files contribute their utilities. Keep both extensions when adding
another package to the shared source configuration.

## Pixels buttons

Button and ButtonGroup use owned recipes through `useStyling()`. Their recipes
return a single class string, preserving existing `className` and recipe-extension
usage. Use `styling.resolve(buttonVariants, props)` when resolving a recipe with
consumer merge rules. See [Button](../packages/pixels/src/Button/README.md) and
[Pixels migration notes](./pixels/migration.md) for group precedence.
