# Uniform migration completion review

Reviewed on 2026-10-16. Uniform's direct HeroUI migration is complete: its
manifest, published JavaScript and declarations contain no HeroUI dependencies
or references. Package verification checks this boundary on every full check.
The later Pixels and foundation migrations also removed transitive HeroUI
dependencies. Installing Uniform now produces a HeroUI-free dependency tree.
See the [completed migration inventory](../heroui-removal.md).

## Final cleanup

- Removed stale HeroUI implementation comments and corrected the styling guide's
  migration status.
- Added short layout-section comments to composed controls and `FieldLayout`,
  with a concrete example in the [code style guide](../code-style.md).
- Removed the unsupported `invalid` recipe argument from DatePicker. React Aria
  still owns its invalid attributes, which drive the existing styling. A packed
  declaration fixture checks resolution of its supported `disabled` variant.

No styling classes, snapshots, field values or interaction behavior changed in
this cleanup.

## Verification

- `pnpm check`: all six checks passed, 1,687 unit tests passed, one skipped,
  and 504 Storybook tests passed.
- Rebuilt Uniform after the DatePicker fix and reran packed-package verification,
  including the recipe type fixture and all seven published packages.
- Chromium 153: reviewed the all-field form in light and dark themes at 1,000px,
  and its single-column layout at 390px. No clipping or layout overlap observed.
- Additional browser interactions confirmed clear-button focus restoration,
  checkbox toggling with Space, and calendar dismissal with Escape restoring
  focus to its trigger.
- Axe 4.12.1 scanned 26 states: the all-field form and the invalid stories for
  twelve field renderers, each in light and dark themes. Only color-contrast
  violations were reported. This is not a screen-reader or cross-browser audit.

## Remaining release and theme work

The contrast findings are not resolved by the dependency migration. They include
white text on the Pixels success button, validation text/segment focus colors
in DatePicker and Time, and light-theme invalid text in RadioTabs and Slider.
Earlier renderer audits recorded these issues too. Address them in the shared
semantic-color and component contrast work, including light/dark, focus and
consumer-customized colors. Do not describe the current theme as WCAG AA compliant.

The removed public hooks require a breaking release. The external Markdown
editor's `useInput` consumer remains deferred and must migrate before adopting
that release. Release Please owns version and changelog changes. See
[migration instructions](./migration.md) and the remaining
[Pixels/foundation inventory](../heroui-removal.md).
