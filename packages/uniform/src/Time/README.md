# Time

Segmented time input connected to form state.

## Usage

```tsx
import Form from '@fuf-stack/uniform/Form';
import Time from '@fuf-stack/uniform/Time';

<Form initialValues={{ startTime: '10:15Z' }} onSubmit={console.log}>
  <Time label="Start time" name="startTime" timeZone="UTC" />
</Form>;
```

## Notes

- String mode stores UTC time values such as `10:15Z`. Display uses the local timezone unless `timeZone` is supplied.
- `hourAsNumber` stores a UTC hour from 0 to 23. `valueType="timeValue"` stores date-library time objects instead of strings.

## Styling

[`segmentedInputVariants`](timeVariants.ts) owns the segmented input defaults, also reused
by DatePicker. Override individual slots through `className`, including `label`,
`description` and `errorMessage`. See the [styling guide](../../../../docs/styling.md).

[Props](Time.tsx) · [Stories](stories/Time.stories.tsx)

## Composition

`Time` owns registration and storage conversion through the field transform.
`TimeControl` prepares values and placeholders and owns the React Aria engine,
focus routing and styling. `TimeInput` owns editable segments and their supporting
messages. `TimeReset` clears partial segment edits when the form resets.
