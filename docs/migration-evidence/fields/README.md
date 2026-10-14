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
