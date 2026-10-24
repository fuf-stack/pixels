# Migration verification summary

The HeroUI removal and Tailwind 4 migration were checked with automated tests,
package-consumer verification and targeted Chromium visual/accessibility reviews.
One-time migration screenshots and JSON reports have been removed from the
working tree. They were review evidence, not automated visual-test baselines.
Existing DOM snapshots, behavioral tests and browser stories remain in place.

## Verification retained

- Before/after field reviews compared light/dark geometry, typography, colors,
  borders and spacing across normal, invalid, disabled and custom-styling states
- Interaction tests cover keyboard navigation, focus containment/restoration,
  label/help/error associations, clearing, resets, transforms and submission
- Package checks verify all seven published packages, HeroUI independence,
  React 18 AvatarGroup rendering and CSS-first Tailwind 4 consumer compilation
- The latest full local check passed all seven gates, including 588 browser
  stories and 1,994 unit tests, with one skipped unit test

Visual evidence was captured in Chromium, including 900×650 field comparisons.
The completion review also covered light/dark layouts at 1,000px and 390px.
These historical checks do not constitute a current cross-browser or
screen-reader audit. See the [completion review](./migration-review.md).

## Accessibility findings still open

Historical axe WCAG 2 A/AA and 2.1 AA audits recorded the following findings.
Removing their raw reports does not resolve them or establish WCAG conformance.

| Area                             | Recorded findings                                                                                                                           |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Input and TextArea               | Invalid text contrast in both themes, including Input label/error text in light mode                                                        |
| Select                           | Light invalid-text and dark search-input contrast, loading listbox lacks required option children (`aria-required-children`) in both themes |
| Switch and SwitchBox             | Light invalid-state contrast                                                                                                                |
| FieldArray and FieldCard         | Invalid-array and object-error text contrast in both themes                                                                                 |
| Radios, RadioBoxes and RadioTabs | Light invalid-state contrast, RadioTabs keyboard/error fixture contrast in both themes                                                      |
| Checkboxes                       | Light invalid-state contrast, line-through, sublabel, custom layout and keyboard/error fixture contrast in both themes                      |
| Slider                           | Light invalid/disabled text contrast                                                                                                        |
| DatePicker and Time              | Invalid/segment-focus and composition-story contrast in both themes, earlier time-enabled calendar checks also found light-theme contrast   |
| Shared form consumers            | Contrast in default/configured form compositions in both themes, including the success button's white text                                  |

Other sampled states without findings do not certify whole components. Recheck
these cases in light/dark themes, focus states and consumer-customized colors
when changing the semantic palette. See the
[migration guide](./migration.md) for remaining consumer/release requirements.
