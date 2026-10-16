# Uniform field composition

Fields bind form state at the top level and pass values, associations and callbacks
to presentation components. Presentation does not register another field or read
form context. Use a separate control component when it owns substantial rendering
or interactions, simple fields can keep those responsibilities inline.

## Input

```text
Input                         Form binding, transforms and debounce
  InputControl                Editable ref, focus, interactions and slot styling
    InputField                React Aria engine, root element and state selectors
      FieldLayout             Label, supplied control and supporting messages
        FieldLabel            Label and required indicator
        InputWrapper          Bordered Group, editable input and surrounding controls
          InputClearButton    Clear action
          InputStepper        Number increment and decrement controls
        FieldDescription      Help text
        error-message         Styled association wrapper around supplied messages
```

[Input](../../packages/uniform/src/Input/Input.tsx) owns its public props and
connects `useUniformField` to `useInputValueDebounce`. The hook updates the display
immediately, flushes pending edits on blur and cancels them before resetting.
Input passes its `clear` operation as `onReset`. `InputControl` calls that operation,
notifies `onClear` and restores focus.

[InputField](../../packages/uniform/src/Input/subcomponents/InputField.tsx)
provides TextField or NumberField context. `InputWrapper` arranges the actual input,
addons and controls. DOM refs and focus handling stay in presentation. Recipes
and their derived types live in `inputVariants.ts`. Defaults and state variants
share one recipe, with slots in alphabetical order.

## Layout and messages

[FieldLayout](../../packages/uniform/src/partials/FieldLayout/README.md) renders a
fragment inside the field engine, which retains its root element and `base` slot.
The layout uses existing field IDs and resolved slot classes, without adding a
wrapper around the whole field:

```tsx
<InputField {...fieldProps}>
  <FieldLayout {...layoutProps}>
    <InputWrapper {...wrapperProps} />
  </FieldLayout>
</InputField>
```

Input, TextArea, Select, Radios and RadioBoxes use this arrangement. Specialized
fields can compose the [individual partials](../../packages/uniform/src/partials/README.md)
directly.

The private `useUniformField` hook returns a rendered `errorMessage` using
`FieldValidationError`. That component owns the message list and animation.
Field presentation chooses visibility and places the messages in a styled wrapper
with the shared error ID. Direct uses of `FieldValidationError` can supply `id`
for its optional association wrapper. The hook's `error` property retains raw/group
errors. Private hook names do not restore the removed public exports, see
[the migration notes](./migration.md#breaking-change-legacy-field-hooks-removed).

## Radio groups

Radios and RadioBoxes share the private `RadioGroupField` engine. It receives
explicit values, associations and callbacks, handles selection and disabled state,
and routes focus to an enabled option. Layout composition stays with the field:

```tsx
<RadioGroupField {...groupProps}>
  <FieldLayout {...layoutProps} labelAs={Label}>
    {options}
  </FieldLayout>
</RadioGroupField>
```

Here `Label` comes from React Aria, preserving group naming without assigning a
native `htmlFor` to the group. `RadioControl` uses `RadioField` and `RadioButton`
for each option, combining group and option descriptions. Its field wrapper uses
`display: contents` to preserve the option layout.

`RadioControl` and its recipe live under `Radios/subcomponents/`. `RadioBox`
imports them directly from Radios. Family-specific reuse keeps its primary owner,
while `partials/` holds presentation shared across field families. See the
[ownership rule and folder example](../code-style.md#component-files-and-responsibility).

## Related guides

- [Code style](../code-style.md) covers component/type ownership, comments, tests and stories
- [Styling](../styling.md) covers slots, variants, class merging and state attributes
- [Input guide](../../packages/uniform/src/Input/README.md) documents usage and public styling slots

## Other field renderers

Each substantial renderer follows the same binding and presentation boundary.
The binding keeps registration, transforms and form-update timing. Its control
receives values, IDs, refs and callbacks through explicit props, without receiving
the form context or the whole binding-hook result.

| Renderer   | Presentation owner  | Additional responsibilities                                                |
| ---------- | ------------------- | -------------------------------------------------------------------------- |
| Checkboxes | `CheckboxesControl` | `CheckboxControl` owns each option                                         |
| DatePicker | `DatePickerControl` | `DatePickerCalendar` owns the popup and time editor                        |
| FieldArray | `FieldArrayControl` | The binding creates row operations, presentation arranges rows and sorting |
| FieldCard  | `FieldCardControl`  | The binding retains child-validation visibility rules                      |
| RadioBoxes | `RadioBoxesControl` | `RadioBox` reuses Radios' option control                                   |
| Radios     | `RadiosControl`     | Custom option layouts receive the existing option descriptors              |
| RadioTabs  | `RadioTabsControl`  | `RadioTabsList` owns tabs, panels and cursor geometry                      |
| Select     | `SelectControl`     | Select adapters own individual React Select elements                       |
| Slider     | `SliderControl`     | `SliderTrackControl` owns fill, markers and the editable thumb             |
| Switch     | `SwitchControl`     | Thumb and icon rendering stay with Switch                                  |
| SwitchBox  | `SwitchBoxControl`  | Track styling reuses Switch's recipe                                       |
| TextArea   | `TextAreaControl`   | Autosizing and editable refs stay in presentation                          |
| Time       | `TimeControl`       | Stored-value conversion stays in the binding                               |

The segmented fields pass a small reset bridge as engine content. `TimeReset` and
`DatePickerReset` subscribe to form resets inside the relevant React Aria context,
so partial edits clear even when the committed value stays empty. The controls
can render independently when that bridge is omitted.

FieldCard and FieldArray labels and validation footers consume their owner's
existing field data. They do not register the same field again. Specialized
layouts retain their existing label and message arrangement. Simple wrappers
such as SubmitButton do not gain an extra control layer.
