# Uniform migration notes

Compatibility changes from the HeroUI removal and field composition refactor.
For current component ownership, see [field composition](./field-composition.md).
See the [completion review](./migration-review.md) for verification and remaining
shared-theme limitations.
The [migration inventory](../heroui-removal.md) tracks remaining workspace work.

## Breaking change: legacy field hooks removed

The following package exports are removed:

- `@fuf-stack/uniform/hooks/useInput`
- `@fuf-stack/uniform/hooks/useUniformField`
- `@fuf-stack/uniform/hooks/useUniformFieldArray`

Their associated public types and presentation getters (`getLabelProps`,
`getHelperWrapperProps`, `getErrorMessageProps`) are removed too. The field and
array state used by Uniform components is now private implementation code.
Do not import it through source or distribution paths.

The private implementations are named `useUniformField` and
`useUniformFieldArray`. These internal names do not restore the removed public
exports or their former API.

For custom controls, use the existing public
`@fuf-stack/uniform/hooks/useController` and
`@fuf-stack/uniform/hooks/useFormContext` APIs for registration and form state.
Own the label, description and error markup, create stable IDs with React's
`useId`, and apply accessible associations and the registered ref to the actual
editable element. For CodeMirror, use editor content attributes and route the
ref to its focus method. The Markdown editor's old `useInput` import must be
replaced before adopting this breaking release; its external source is not
part of this repository.

Use `FieldArray` for rendered arrays. Advanced consumers can pair React Hook
Form's `useFieldArray` with the control returned by public `useFormContext` and
own their presentation and initialization/reset rules. Public
`useInputValueTransform` and `useInputValueDebounce` remain available.

RadioBoxes retains its existing component props and options. Its internal option
contract no longer inherits unused HeroUI props/types. All production field
rendering, form values, validation timing, reset behavior and public styling
slots remain unchanged by this removal.

Uniform now declares no direct HeroUI dependencies and its published runtime
and declarations contain no HeroUI references. The Pixels/foundation cleanup is also complete, so
HeroUI is no longer brought in transitively. Consumers must adopt the token CSS
setup in the [styling guide](../styling.md#semantic-tokens). See [the migration inventory](../heroui-removal.md).

## Numeric empty values

Number inputs display `null`, `undefined`, and empty strings as an empty control;
`0` remains a visible numeric value. Clearing resets the field to an empty state
without displaying zero. Existing schema/empty-field submission normalization is
unchanged: optional empty fields are omitted from submitted values.

## Debounced custom controls

`useInputValueDebounce` updates the displayed value immediately and flushes a
pending edit on blur. A programmatic form reset cancels queued edits, including
when the reset restores the same committed value. Configure `emptyValue: ''`
for a text control and call the returned `clear()` operation to cancel pending
edits and reset the form field to `null`. Without `emptyValue`, the display
follows the value supplied after the form reset. `cancelPendingChange(value)`
remains available for display-only cancellation without resetting the field.

For a text control bound through public `useController`, connect its field value
and callbacks to the debounce hook:

```tsx
const { value, onChange, onBlur, clear } = useInputValueDebounce({
  name,
  emptyValue: '',
  value: field.value,
  onChange: field.onChange,
  onBlur: field.onBlur,
});

// pass value, onChange and onBlur to the control, call clear for its clear action
```

## Owned input rendering

`Input` uses React Aria text and number controls with Uniform's Tailwind styling.
Existing props, exports, transforms and styling slots are preserved. Labels,
descriptions, validation messages and number steppers can also be styled through
`className`. See the [Input slot reference](../../packages/uniform/src/Input/README.md#styling).

Consumer styling instances apply to the input, including custom font-size
utilities that replace the default font size while retaining text colors.
Import the packaged token stylesheet as described in
[the styling guide](../styling.md).

Labels and optional `description` text use the shared field association IDs;
`testId` remains the editable control's `data-testid`. Use the label or that test
attribute to find a control rather than relying on its old DOM ID. Markup is
owned by Uniform, so selectors into undocumented HeroUI wrappers should migrate
to supported slots. Required and invalid state continue to come from RHF/Veto.

For clearable text/password fields, `endContent` is the custom clear-button
content, as before. Numeric fields retain separate end content and a clear
button. Clearing discards pending edits, resets to the existing empty state,
calls `onClear` once and restores focus to the editable control.

`TextArea` also uses owned presentation and React Aria field behavior. It retains
three-to-eight-row autosizing through the same `react-textarea-autosize` engine,
its existing exported props and four slot names, controlled values, disabled
state and debounce/reset timing. Its `clearButton` slot remains accepted, but
TextArea has no clear action. Optional `description` text and visible errors are
associated with the actual textarea; consumer styling instances apply before
merging its slot classes. Both field renderers keep RHF/Veto validation
authoritative and use `aria-required` without competing native validation.

## Field state selectors

Input, TextArea and Select share a private
[getFieldDataAttributes helper](../../packages/uniform/src/helpers/fieldProps/fieldProps.ts) for `data-disabled`,
`data-invalid` and `data-required`, with inactive flags omitted. Focus and hover
remain owned by each control. Input and TextArea use `data-filled` only when a
value is present, including numeric zero, without counting placeholder text.

Input's `inputWrapper` uses React Aria Group's `data-hovered` attribute. Its
former `data-hover` attributes on the wrapper and root are removed. Consumer
hover styles should use `data-[hovered=true]` on the `inputWrapper` slot.

The unused legacy attributes `data-has-helper`, `data-has-elements`,
`data-has-label`, `data-has-value`, `data-filled-within`, `data-focus-within` and
TextArea's static `data-has-multiple-rows` marker are removed. Consumer selectors
using them need updating, use the exposed styling slots or the supported field
state attributes. React Aria's own state attributes and accessible associations
remain intact. See the [styling guide](../styling.md#field-state-attributes).

## Owned Select integration

`Select` keeps React Select as its interaction engine and now uses the shared
Uniform field-state core without HeroUI's select or input-presentation hooks.
Visible labels, explicit accessible names, required state, optional `description`
and visible errors are applied to the actual search input. React Select's
placeholder/live-region descriptions remain alongside these field associations.
Control and announcement IDs are distinct even when separate forms repeat a
field name; `data-testid` values remain unchanged.

Option values, numeric conversion, fallback options, loading/search callbacks,
single/multi selection, clearing, transforms and deferred touched notification
retain their existing contracts. All class resolution uses the current styling
instance. Consumer single-value and multi-value label classes merge after owned
defaults. The declared `crossIcon`, `downChevron`, `multiValueContainer`, `group`
and `selectContainer` slots now reach their React Select elements as well.

## Owned Switch rendering

`Switch` uses React Aria toggle, hover and focus hooks with owned presentation.
One native switch input carries the field name, RHF ref, checked state and
label/help/error associations; the duplicate hidden form input and visual-focus
proxy are removed. Boolean values, controlled defaults/reset and supported
sizes and styling slots are retained. Space toggles the same editable control
that receives invalid-submission focus. Veto remains authoritative: schema
required state uses `aria-required`, so a valid boolean `false` is not rejected
by native checkbox validation.

The thumb callback retains its declared `width`, `height`, `className`,
`isSelected` and `data-checked` shape without referencing HeroUI types. The
required marker is hidden from the accessible name. Optional `description` and
visible errors describe the actual input. Use its field name or switch role
rather than the old visual input's internal `*_switch` name.
