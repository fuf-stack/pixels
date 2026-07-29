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

## Important Files

- `main.ts`: shared Storybook main config and addon wiring.
- `preview.tsx`: shared Storybook preview parameters and theme behavior.
- `story-snapshots.ts`: deterministic story snapshot helper for Vitest.
- `.storybook/main.ts`: consumer-facing Storybook main wrapper.
- `.storybook/preview.tsx`: consumer-facing preview wrapper.
- `.storybook/test-runner.ts`: test-runner bridge.

## Notes

- This package is intended to be imported by other workspace packages.
- Keep this package aligned with the `pixels` Storybook config package where possible.
- Keep intentional differences documented (for example, snapshot normalization behavior).
