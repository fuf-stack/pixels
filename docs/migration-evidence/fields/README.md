# Field baseline evidence

Captured on 2026-10-14 from local Storybook in Chromium at 900×650 with reduced
motion enabled. Each PNG contains the same decorated form, including its existing
submit button, with the light/dark class set on the document root. Invalid and
number examples include their story interaction before capture.

`before.json` records the editable control and wrapper dimensions, fonts, colors,
borders and radii. These baselines precede renderer/theme migration. The additive
field association API does not change existing renderer attributes or appearance.

Examples: text input with label, required, disabled and invalid states, number
input, required textarea, and the React Select default. Additional comparisons
will be added with each renderer slice. No assistive-technology review is claimed
by these screenshots.
