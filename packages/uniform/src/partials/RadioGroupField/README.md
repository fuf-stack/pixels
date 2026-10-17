# RadioGroupField

Private React Aria radio-group engine shared by Radios and RadioBoxes.

```tsx
<FieldLayout
  {...layoutProps}
  baseAs={RadioGroupField}
  baseProps={groupProps}
  labelAs={Label}
>
  {options}
</FieldLayout>
```

- Receives values, validation state, control associations and callbacks, without
  reading form context or registering another field
- Owns the group root, selection engine, disabled state and orientation
- Exposes focus on the selected enabled option, falling back to the first enabled
  option, and leaves focus alone when all options are disabled
- Shares supporting message IDs with RadioControl, which adds its own description
- Its children own layout and option presentation, the engine does not receive
  the complete field-state object or resolve label and option styles
- Group defaults live in `radioGroupFieldVariants.ts` and are extended by the
  respective field recipes

Import `Label` from `react-aria-components` for `labelAs`. React Aria owns the
radiogroup's label association, individual option names remain independent.

[Props](./RadioGroupField.tsx) · [Stories](./stories/RadioGroupField.stories.tsx) · [React Aria RadioGroup](https://react-aria.adobe.com/RadioGroup)
