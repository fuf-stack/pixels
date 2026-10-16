# DatePicker

Segmented date input with a calendar popup and optional time segments.

## Usage

```tsx
import DatePicker from '@fuf-stack/uniform/DatePicker';
import Form from '@fuf-stack/uniform/Form';

<Form onSubmit={console.log}>
  <DatePicker label="Start date" name="startDate" />
</Form>;
```

## Notes

- Date-only by default; add `withTime` for date and time.
- String mode stores UTC ISO values. `valueType="dateValue"` stores date objects from the date library instead.
- In date-time mode, display uses the local timezone unless `timeZone` is provided.

## Styling

[`datePickerVariants`](datePickerVariants.ts) extends
[`timeVariants`](../Time/timeVariants.ts) for the shared segmented input defaults,
then adds calendar styling. Override individual slots through `className`, including
`label`, `description` and `errorMessage`. See the [styling guide](../../../../docs/styling.md).

[Props](DatePicker.tsx) · [Stories](DatePicker.stories.tsx)

## Composition

`DatePicker` owns form binding and date serialization. `DatePickerControl` owns
the segmented input and field messages, while `DatePickerCalendar` owns popup
navigation and the optional time editor. `DatePickerReset` clears partial edits
when the form resets.
