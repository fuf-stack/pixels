# Pixels package instructions

`@fuf-stack/pixels` is the base React component library. Its root and component
subpath exports are public API.

- Put each component in `src/<Component>/` with its implementation, `index.ts`,
  tests, story, and snapshots where they add value. Export new entry points from
  `package.json` and from `src/index.ts` only when a root export is intentional.
- Preserve DOM semantics, keyboard behavior, focus management, ARIA naming, and
  controlled/uncontrolled behavior. For HeroUI migration slices, prefer React
  Aria Components (hooks where the existing contract requires control) with
  owned Tailwind Variants recipes. Resolve recipes through `useStyling()` before
  merging consumer slot classes. Preserve the existing appearance and slots.
- Keep dependencies flowing only to `pixel-utils` and `pixel-motion`; do not
  import from `uniform`, `atelier`, or `megapixels`.
- For visual changes, exercise meaningful states in Storybook and report manual
  keyboard and accessibility verification in the pull request.
- Run focused Vitest tests during development and `pnpm check` before review.
