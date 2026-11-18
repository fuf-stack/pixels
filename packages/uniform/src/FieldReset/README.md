# FieldReset

Compare a field with an independently loaded value and supply a compact reset
button for the field's `endContent` or another slot.

```tsx
import FieldReset from '@fuf-stack/uniform/FieldReset';
import Form from '@fuf-stack/uniform/Form';
import Input from '@fuf-stack/uniform/Input';

<Form onSubmit={saveChanges}>
  <FieldReset name="cpuCount" resetValue={server.cpuCount}>
    {({ transform, resetAction }) => (
      <Input
        name="cpuCount"
        label="CPU count"
        type="number"
        transform={transform}
        endContent={resetAction}
      />
    )}
  </FieldReset>
</Form>;
```

Supply a non-null `resetValue` after loading it. It is both the reset destination
and the comparison value, independent of `Form.initialValues`. Pass the supplied
`transform` to the matching field. No field hook or form submission changes are
needed. For array-valued fields, specify the display type, e.g. `FieldReset<string[]>`.

`include="changed"` is the default: unchanged values are displayed but omitted
from form data. Editing stores the update; returning to `resetValue` or pressing
reset removes it. `include="always"` stores unchanged values too. The debug viewer
and form value accessors show the update, not the display fallback.

Make changed-only fields optional in the schema. Use an object refinement when
at least one provided value is required, and avoid schema defaults that add
omitted fields back. Clears follow normal Uniform serialization: empty values
are omitted, not sent as explicit `null`.

Pristine fields follow changes to `resetValue`; edited fields keep their values
and compare against the new reset value. A form `reset(values)` uses the supplied
values and updates form defaults; it does not change `resetValue`. Update that
prop explicitly when the comparison baseline should change. The reset icon still
returns to `resetValue`. Programmatic `setValue` calls also omit values matching
the baseline in changed-only mode, including when immediately followed by submit. Comparison handles Uniform's
markers and array wrappers and equates numbers with their input strings. A numeric
`resetValue` also converts numeric input strings to numbers for validation.

The reset action appears and disappears without animation. It is a keyboard-accessible
warning-colored icon button with a visible focus ring; resetting returns focus to the field.
Place it beside fields without an end-content slot. Do not combine it with
`Input clearable` in `endContent`: text inputs wrap that slot in their clear button.
For clearable inputs, place `resetAction` beside the input instead.

Wrap one field with a `transform` prop, not a `FieldArray` or a group of paths.
The wrapper's `disabled` prop disables only reset; disable the field separately
to omit its value. `resetLabel` labels the button; `changedLabel` supplies its
screen-reader announcement.

Pass a string to `className` to style the wrapper, or use the `base` and
`announcement` slots to style each element separately.

See [the stories](stories/FieldReset.stories.tsx) for submission, reset, and error states.

Styling resolves through `StylingProvider`. The exported `fieldResetVariants`
recipe defines the `base` and `announcement` slots. The outer element uses
`data-component="field-reset"`, and the reset button uses `data-slot="reset-action"`.
