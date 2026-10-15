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

## Production Switch rollout

Paired Switch `production-before`/`production-after` captures cover eight
stories in each theme: default, selected, disabled, required, invalid, thumb
callback, start/end icons and all sizes. Track and thumb dimensions, thumb
positions, backgrounds, radii, label typography/colors and base heights match
across all 16 comparisons. New markup exposes the existing styling slot targets
explicitly and replaces the duplicate hidden input with one editable control.
Browser checks cover Space toggling, actual error focus and required/help
associations; unit checks preserve boolean `false` submission, reset behavior,
disabled state and thumb callback props.

`switch-production-a11y.json` covers eight states in each theme. It reports
light-mode invalid-state contrast; all other audited states have no findings.
No assistive-technology review is claimed.

## Group consumers

Paired `consumer-before`/`consumer-after` captures cover FieldArray default,
required and invalid states, and FieldCard default, required, object errors and
error styling behavior in both themes. All 14 heading comparisons match font
size, line height, weight, dimensions, padding, foreground and background.
Markup intentionally adds named group roles and owned heading/error IDs.
Required markers use hidden spans rather than generated pseudo-element content.

`group-consumers-a11y.json` audits the group subtrees, including their child
controls. Invalid array and object-error card stories report error-text contrast
in both themes; default/required stories have no findings. These remain release
review items. Existing array mutation/reset and card touched/error stories are
retained, with new checks for named groups, child submission and configured
heading font-size merging.

## Production SwitchBox rollout

Paired SwitchBox `production-before`/`production-after` captures cover default,
selected, required, disabled, invalid, icon, thumb callback and all-size stories
in both themes. All 16 comparisons match root/track/thumb/label/description
geometry, typography, colors and radii after animations settle. Markup replaces
two inputs with one registered switch and explicitly associates its label,
description and error footer.

`switchbox-production-a11y.json` audits the switch label and adjacent error
footer across eight states per theme. Light invalid-state contrast is reported;
other audited states have no findings. No assistive-technology review is claimed.

## Production radio families

`radio-family-production-before.json` and `radio-family-production-after.json`
cover Radios, RadioBoxes and RadioTabs default/required/invalid states in both
themes, paired with their `production-before`/`production-after` screenshots.
All 18 group/option geometry and typography comparisons match. RadioTabs changes
its field wrapper from an empty radiogroup to a named group around real tabs;
Radios/RadioBoxes keep native radio semantics. Owned markup adds explicit IDs,
required markers hidden from names, descriptions and actual error-focus targets.

Browser stories check arrow-key navigation past disabled options, configured
option font-size merging and cursor dimensions across solid/light/bordered/
underlined tabs. The older all-disabled Tabs keyboard delegate loop was reproduced
and inspected; Uniform's own newer tab engine fixes it, allowing all eleven
previously excluded RadioTabs stories to run again. No Pixels source was changed.

`radio-family-production-a11y.json` audits 22 states. It reports light invalid
contrast for each family and keyboard/error tab-story contrast in both themes;
other audited states have no findings. No assistive-technology review is claimed.

## Production Checkboxes rollout

`checkbox-production-before.json` / `checkbox-production-after.json` and paired
screenshots cover twelve stories in both themes: default, required, invalid,
initial values, line-through, danger color, sublabels, custom option layouts,
whole-group/option disabled states and scalar/object transforms. All 24 root and
option geometry/typography comparisons match. Native input names and values,
custom option descriptors and disabled submission omission retain their behavior.
Owned label/error associations and group-required descriptions replace the
legacy presentation getters; native per-option required flags are removed.

Browser stories verify keyboard/error focus, required/help/error descriptions
and configured option typography. `checkbox-production-a11y.json` audits 28
states. Contrast findings affect light invalid states, line-through/sublabel/
custom-layout stories in both themes and the keyboard/error fixture in both
themes. Other audited states have no findings. No assistive-technology review is
claimed.

## Production Slider rollout

`slider-production-before.json` / `slider-production-after.json` and paired
screenshots cover twelve stories per theme, including all sizes, custom ranges,
fractional values, step dots, fill offsets, addons and transforms. All 24
comparisons match control dimensions, fonts, colors and radii. The unlabeled
slider retains its compact track-only layout.

Owned composition replaces the ghost range with one registered editable input.
The wrapper focus API and single Tab stop remain covered. Existing Chromium
regressions retain pointer-coordinate dragging, release, subsequent movement and
submission assertions; their input selectors now use the actual field name.
New checks cover zero/fractional values, reset, required help/error association,
disabled omission, explicit zero selection and configured styling.

`slider-production-a11y.json` audits 28 states and reports light invalid/disabled
text contrast. Other audited states have no findings. No assistive-technology
review is claimed.
