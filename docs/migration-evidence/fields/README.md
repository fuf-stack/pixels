# Field baseline evidence

Captured on 2026-10-14 from local Storybook in Chromium at 900×650 with reduced
motion enabled. Each PNG contains the same decorated form, including its existing
submit button, with the light/dark class set on both the document root and body.
Storybook gives the body its own theme scope, so the dark baselines were
recaptured with matching scopes before comparing the prototype. Invalid and
number examples include their story interaction before capture.

`before.json` records the editable control and wrapper dimensions, fonts, colors,
borders and radii. These baselines precede renderer/theme migration. The additive
field association API does not change existing renderer attributes or appearance.

Examples: text input with label, required, disabled and invalid states, number
input, required textarea, and the React Select default. Additional comparisons
will be added with each renderer slice. No assistive-technology review is claimed
by these screenshots.

`prototype.json` and the prototype PNGs compare the private React Aria input
against five text/number baseline states in both themes. Font sizes, line
heights, input/wrapper dimensions, colors, borders, radii and padding match the
baseline measurements. The prototype associates the native label through
`aria-labelledby`; accessible names and help/error associations are checked by
its interaction tests. These captures do not certify other field renderers.

An axe WCAG 2 A/AA and 2.1 AA field-subtree audit covered label, required,
disabled, invalid, number, clearable and help states in both themes. All states
except invalid had zero findings. The invalid state retains the baseline's
contrast findings: label/input/error text in light mode and input text in dark
mode. A separate audit of the existing renderer reproduced the same findings;
the prototype introduces no additional findings in this set. This remains a
theme accessibility limitation to resolve before release.

## Production Input rollout

`input-production-before.json` and `input-production-after.json` expand the
comparison to 12 production stories in each theme: default, label, required,
clearable, disabled, invalid, addons, number, password, custom styles,
transformation and all sizes. The paired `production-before`/`production-after`
PNGs capture each decorated form. Editable-control fonts, line heights, colors,
heights and wrapper heights, padding, backgrounds, borders and radii match in
all 24 comparisons. These checks also cover the focused/hovered state left by
the clearable and number story interactions. Small-input font/padding, inherited
custom-wrapper text color, clear-button appearance and combined focus/hover
selectors were corrected during rollout before accepting the new DOM snapshots.

## Production TextArea rollout

The textarea `production-before`/`production-after` PNGs and JSON measurements
cover default, long initial value, required and invalid states in both themes.
All eight comparisons match editable fonts, colors, padding and heights, plus
wrapper dimensions, backgrounds, borders and radii. The default input is 60px
(three rows), capped at 160px (eight rows) with the captured default typography.
Live browser stories check growth, the scroll threshold, shrinking after clear,
consumer font-size merging and combined help/error descriptions. Unit tests
cover multiline submission, reset, error focus, disabled behavior, explicit
names, public slot targets and wrapper click focus.

The final Input and TextArea rollout captures also restore the baseline
control-to-error spacing: label spacing lives on the label, leaving zero gap
between the control wrapper and error helper. Both production composition
stories assert this geometry. Number input captures explicitly retain the
focused state represented by the baseline to avoid story blur timing differences.
The textarea audit is recorded in `textarea-production-a11y.json`; invalid text
contrast is reported in each theme and the other audited states have no findings.

## Select integration

The paired Select `integration-before`/`integration-after` captures and JSON
measurements cover default, single/multi initial values, required, invalid,
disabled, loading and numeric-option stories in both themes. The integration
retains React Select and replaces only the HeroUI presentation helper and
association wiring. Existing control and wrapper dimensions, fonts, foregrounds,
backgrounds, borders and radii are compared across these 16 states. Association
IDs and icon/container class wiring intentionally change. Browser stories verify
configured single-value font-size merging and required/help/error focus behavior.

`select-integration-a11y.json` records nine audited states in both themes. The
audit reports invalid-state contrast in light mode, search-input contrast in
several dark-mode states and `aria-required-children` for React Select's loading
listbox (which contains a loading message rather than options). These findings
remain release-review items. No clean accessibility audit or before/after axe
equivalence is claimed for Select; the engine and captured appearance are
retained in this integration slice.
