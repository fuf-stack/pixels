# RadioControl

Private radio option owned by Radios and reused by RadioBoxes, with a selection
indicator, label and optional description.

```tsx
<RadioGroup aria-label="Delivery">
  <RadioControl className={classNames} invalid={false} value="email">
    Email
  </RadioControl>
</RadioGroup>
```

Receives resolved slot classes from `radioControlVariants.ts`. The surrounding
React Aria RadioGroup manages selection, keyboard interaction and disabled state.
When used inside RadioGroupField, the option combines the group's supporting
message IDs with its own description. Decorative icons do not enter its name.
Uses React Aria `RadioField` for option state and `RadioButton` for the clickable
label. The field wrapper uses the `field` slot with `display: contents`, preserving
the option layout. Hover presentation uses React Aria's render state through recipe selectors.

[Props](./RadioControl.tsx) · [Stories](./stories/RadioControl.stories.tsx) · [React Aria RadioGroup](https://react-aria.adobe.com/RadioGroup)
