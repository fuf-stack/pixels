# @repo/storybook-config

Shared Storybook configuration package for the synced workspace.

## What It Is

This package centralizes reusable Storybook setup so app packages can consume one
consistent config instead of duplicating Storybook boilerplate.

## What It Does

- Provides a shared Storybook `main` config (`main.ts`) with common addons.
- Provides shared UI/preview behavior (`preview.tsx`) including dark mode defaults.
- Exposes a reusable story snapshot harness (`story-snapshots.ts`) for Vitest story tests.
- Includes Storybook v10-compatible local wrapper files in `.storybook/`.
- Ships local Vite/Tailwind/TypeScript config files used by Storybook config consumers.
- Compiles Tailwind utilities in browser tests so layout assertions use the same
  stylesheet as the Storybook development server.

## Important Files

- `main.ts`: shared Storybook main config and addon wiring.
- `preview.tsx`: shared Storybook preview parameters and theme behavior.
- `story-snapshots.ts`: deterministic story snapshot helper for Vitest.
- `.storybook/main.ts`: consumer-facing Storybook main wrapper.
- `.storybook/preview.tsx`: consumer-facing preview wrapper.

## Visual regression pilot

At the repository root, `pnpm --filter @repo/storybook-config storybook:build`
builds the stories and `pnpm test:visual:docker` compares selected stories in the
pinned CI environment. See the
[visual regression workflow](../../../docs/visual-regression.md) for baseline
review and updates.

## Notes

- This package is intended to be imported by other workspace packages.
- Keep this package aligned with the `pixels` Storybook config package where possible.
- Keep intentional differences documented (for example, snapshot normalization behavior).
