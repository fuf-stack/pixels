# Uniform field composition

Fields bind form state at the top level and pass a `field` bundle to their
control components. Presentation does not register another field or read
form context. Use a separate control component when it owns substantial rendering
or interactions, simple fields can keep those responsibilities inline.

## Bound field contract

`useUniformField` returns `{ field, control, debugMode, getValues, resetField }`.
The private `UniformField` type lives beside the hook. Its explicitly declared
properties belong to one field:

- Value and interactions: `name`, `value`, `defaultValue`, `onChange`, `onBlur`, `ref`
- Content and validation: `label`, `description`, `error`, `errorMessage`,
  `disabled`, `invalid`, `required`
- Associations and identification: `ariaLabel`, `customAriaLabel`, `hasLabel`, `hasErrors`, `ids`, `testId`

Renderers call `getFieldControlProps(field)` where control associations are needed.
The helper shares [fieldProps](../../packages/uniform/src/helpers/fieldProps/fieldProps.ts)
with `getFieldDataAttributes`, which supplies styling flags for the relevant wrapper.
The hook returns metadata instead of DOM props. `customAriaLabel` preserves the
explicit override, `hasLabel` excludes debug label content, and `hasErrors` reflects
normalized validation messages. Form operations and debug configuration remain outside
`field`. No React Hook Form controller properties are spread into the bundle.
`errorMessage` remains rendered content, and `error` retains its existing raw/group
shape unless array-value normalization was requested.

```tsx
const { field } = useUniformField({ ...uniformFieldProps, name });

return (
  <RadioBoxesControl
    className={className}
    field={field}
    inline={inline}
    options={options}
  />
);
```

Bindings can adapt their own bundle where they coordinate form behavior:

```tsx
<InputControl
  field={{ ...field, onBlur, onChange, value }}
  onClear={onClear}
  onReset={clear}
/>
```

A control reads its values from `field`, without registering again or accessing
form context. It forwards only the relevant properties to DOM and UI engines,
never the whole bundle. `useUniformFieldArray` retains the same bundle alongside
its row operations.

## Input

```text
Input                         Form binding, transforms and debounce
  InputControl                Editable ref, focus, interactions and slot styling
    FieldLayout               Label, supplied control and supporting messages
      InputField (baseAs)     React Aria engine, root element and state selectors
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

[FieldLayout](../../packages/uniform/src/partials/FieldLayout/README.md) owns the
base `div` and its `className.base` by default. RadioTabs, TextArea and Select pass
root attributes, interaction handlers and refs through `baseProps`:

```tsx
<FieldLayout
  {...layoutProps}
  baseProps={{ ...focusWithinProps, ref: handleControlRef, role: 'group' }}
  className={classNames}
>
  <RadioTabsList {...tabProps} />
</FieldLayout>
```

Input, Checkboxes, Radios and RadioBoxes select their React Aria engine with
`baseAs`. `FieldLayout` passes `baseProps`, `className.base` and the composed
children to it, keeping the engine context without adding another DOM wrapper:

```tsx
<FieldLayout
  {...layoutProps}
  // provide the text or number field engine
  baseAs={InputField}
  baseProps={fieldProps}
  className={classNames}
>
  <InputWrapper {...contentProps} />
</FieldLayout>
```

`baseProps` is typed for `baseAs` and does not accept `className`, replacement
children or raw HTML. Switch and specialized
layouts continue composing the [individual partials](../../packages/uniform/src/partials/README.md)
to preserve their distinct label and control arrangements.

The private `useUniformField` hook returns a rendered `field.errorMessage` using
`FieldValidationError`. That component owns the message list and animation.
Field presentation chooses visibility and places the messages in a styled wrapper
with the shared error ID. Direct uses of `FieldValidationError` can supply `id`
for its optional association wrapper. The hook's `field.error` property retains raw/group
errors. Private hook names do not restore the removed public exports, see
[the migration notes](./migration.md#breaking-change-legacy-field-hooks-removed).

## Radio groups

Radios and RadioBoxes share the private `RadioGroupField` engine. It receives
explicit values, associations and callbacks, handles selection and disabled state,
and routes focus to an enabled option. Layout composition stays with the field:

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

Here `Label` comes from React Aria, preserving group naming without assigning a
native `htmlFor` to the group. `RadioControl` uses `RadioField` and `RadioButton`
for each option, combining group and option descriptions. Its field wrapper uses
`display: contents` to preserve the option layout.

`RadioControl` and its recipe live under `Radios/subcomponents/`. `RadioBox`
imports them directly from Radios. Family-specific reuse keeps its primary owner,
while `partials/` holds presentation shared across field families. See the
[ownership rule and folder example](../code-style.md#component-files-and-responsibility).

UI engine value adapters stay in the controls. RadioBoxes, Radios and RadioTabs
convert string keys back to their option value types before calling `field.onChange`.
SelectCombobox converts option objects into stored values and defers the first touched
update until after the selection commits. SliderControl commits its displayed
value at interaction completion when the stored field is still empty. Their
bindings use `useUniformField` and pass narrow `getIsTouched` or `getCurrentValue`
accessors, keeping current form-state reads available without coupling controls
to form context. These small handlers do not need separate binding hooks.

RadioBox resolves one recipe containing its box surface and the shared radio
indicator styles. That recipe reuses slot and validation definitions from
`radioControlVariants`, so rendering receives one finished class map.

## Related guides

- [Code style](../code-style.md) covers component/type ownership, comments, tests and stories
- [Styling](../styling.md) covers slots, variants, class merging and state attributes
- [Input guide](../../packages/uniform/src/Input/README.md) documents usage and public styling slots

## Other field renderers

Each substantial renderer follows the same binding and presentation boundary.
The binding keeps registration, transforms and form-update timing. Its control
receives the `field` bundle and component-specific props, without receiving form
operations or the whole binding-hook result.

| Renderer   | Presentation owner  | Additional responsibilities                                                 |
| ---------- | ------------------- | --------------------------------------------------------------------------- |
| Checkboxes | `CheckboxesControl` | `CheckboxControl` owns each option                                          |
| DatePicker | `DatePickerControl` | `DatePickerInput` owns segments, `DatePickerCalendar` owns the popup        |
| FieldArray | `FieldArrayControl` | The array hook binds row operations, presentation arranges rows and sorting |
| FieldCard  | `FieldCardControl`  | A card-local hook resolves child-validation visibility and required state   |
| RadioBoxes | `RadioBoxesControl` | `RadioBox` reuses Radios' option control                                    |
| Radios     | `RadiosControl`     | Custom option layouts receive the existing option descriptors               |
| RadioTabs  | `RadioTabsControl`  | `RadioTabsList` owns tabs, panels and cursor geometry                       |
| Select     | `SelectControl`     | `SelectCombobox` owns engine configuration and option conversion            |
| Slider     | `SliderControl`     | `SliderTrackControl` owns fill, markers and the editable thumb              |
| Switch     | `SwitchControl`     | `SwitchTrack` owns thumb and icon rendering                                 |
| SwitchBox  | `SwitchBoxControl`  | `SwitchBoxTrack` owns the track, reusing Switch's recipe                    |
| TextArea   | `TextAreaControl`   | `TextAreaInput` owns autosizing, editable refs and wrapper focus            |
| Time       | `TimeControl`       | `TimeInput` renders segments, the control prepares displayed values         |

DatePicker and Time configure their storage transforms through `useUniformField`.
Their controls parse incoming display values, prepare placeholders and resolve
engine-specific options. Storage remains UTC strings, date/time objects or numeric
hours according to the existing props. Checkboxes normalizes its displayed
selection inside `CheckboxesControl`.

`useUniformFieldArray` returns `items`, `appendItem` and `moveItem` alongside its
existing operations. Row callbacks read current form values when invoked, and
`moveItem` validates after moving. The row contract lives beside the hook and
contains data and callbacks only. FieldCard's local `hooks/useFieldCardValidation` hook
retains the child-required and touched/submitted error rules.

The segmented fields pass a small reset bridge as engine content. `TimeReset` and
`DatePickerReset` subscribe to form resets inside the relevant React Aria context,
so partial edits clear even when the committed value stays empty. The controls
can render independently when that bridge is omitted.

FieldCard and FieldArray labels and validation footers consume their owner's
existing field data. They do not register the same field again. Specialized
layouts retain their existing label and message arrangement. Simple wrappers
such as SubmitButton do not gain an extra control layer.

## Date and time type compatibility

Uniform and React Aria must resolve compatible `@internationalized/date` class
identities. Separate versions can produce `#private` errors on `placeholderValue`,
`minValue` and `maxValue`, even when the class names match. Keep their compatible
resolutions aligned in the lockfile rather than casting field props.

Package verification compiles `test/dts-smoke/date-values.ts` against Uniform's
installed dependencies to catch this mismatch.

## Control composition

Split a control when an editable surface, option or visual track owns a distinct
job. Keep the engine context outside children that consume it, and preserve the
existing DOM arrangement. For example:

```text
TextAreaControl       Field layout and root interaction styles
  FieldLayout         Label and supporting messages
    TextAreaInput     Editable ref, text binding, autosizing and wrapper focus

SelectControl         Field layout and slot resolution
  FieldLayout
    SelectCombobox    Option conversion, focus, menu configuration and touched timing
```

Time follows DatePicker’s input-surface split. Slider keeps geometry and markers
in `SliderTrackControl`, while RadioTabs delegates individual option rendering
to `RadioTab`. Smaller controls keep their existing composition. These are private
components under each field’s `subcomponents/`, not new public entry points.
