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

## Notes

- This package is intended to be imported by other workspace packages.
- Keep this package aligned with the `pixels` Storybook config package where possible.
- Keep intentional differences documented (for example, snapshot normalization behavior).

## Browser test styling limitation

The Vitest browser project currently does not enable CSS processing or the
Tailwind Vite plugin. Interaction and DOM assertions still run, but passing
accessibility checks do not establish contrast or layout correctness for the
styled UI. Check those in the normal styled Storybook preview.

Enabling `css: true` together with `@tailwindcss/vite` should be a separate testing
infrastructure change. It exposes existing contrast failures, including white
text on the green success/submit button (about 2.19:1 normally and 1.9:1 on hover,
below the required 4.5:1). These remain unresolved; the current test configuration
is not evidence that they are fixed. Review theme and component changes separately.

FieldReset tests assert reset behavior and placement within the input's end-content
slot. Pixel-alignment checks from its former custom positioning implementation
are no longer needed; the input now owns that layout.
