# uniform

## Breaking change: legacy field hooks removed

The following package exports are removed:

- `@fuf-stack/uniform/hooks/useInput`
- `@fuf-stack/uniform/hooks/useUniformField`
- `@fuf-stack/uniform/hooks/useUniformFieldArray`

Their associated public types and presentation getters (`getLabelProps`,
`getHelperWrapperProps`, `getErrorMessageProps`) are removed too. The field and
array state used by Uniform components is now private implementation code.
Do not import it through source or distribution paths.

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
and declarations contain no HeroUI references. Other workspace dependencies still retain
HeroUI internally; removing those transitive dependencies belongs to the remaining
Pixels/foundation migration. See [the migration inventory](../../docs/heroui-removal.md).

## Numeric empty values

Number inputs display `null`, `undefined`, and empty strings as an empty control;
`0` remains a visible numeric value. Clearing resets the field to an empty state
without displaying zero. Existing schema/empty-field submission normalization is
unchanged: optional empty fields are omitted from submitted values.

## Debounced custom controls

`useInputValueDebounce` updates the displayed value immediately and flushes a
pending edit on blur. A programmatic form reset cancels queued edits, including
when the reset restores the same committed value. For a custom clear action,
call `cancelPendingChange('')` before `resetField(name, { defaultValue: null })`
to discard pending text and preserve the field's existing reset semantics. The
cancellation helper changes the display only; it does not commit a value or
trigger validation itself.

## Owned input rendering

`Input` now uses React Aria text/number controls with owned Tailwind styling.
Its existing props, exports, transforms and `base`, `inputWrapper`, `input` and
`clearButton` slots are preserved. Consumer styling instances now apply to the
production input: custom font-size utilities replace its default font size while
retaining text colors. Import the packaged token stylesheet as described in
[the styling guide](../../docs/styling.md).

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

## Input composition

`Input.tsx` owns registration, value transforms, debounced edits, reset/clear
behavior and the editable ref. It keeps its public prop definition alongside the component,
exported through the existing Input entry point.

Private components live in `Input/subcomponents/`. `InputControl` owns focus/hover styling and composes the label, editable
content and help/errors. `InputField` selects the React Aria text/number engine
and preserves its root state selectors. `InputContent` owns the shared editable
layout and addons; `InputActions` contains clear and stepper controls. These
components receive values, associations, refs and callbacks, and do not register
fields or read form context. Public and private styling recipes remain in
`inputVariants.ts`. The shared `FieldControlProps` and `FieldIds` types in
`partials/FieldLayout/FieldLayout.types.ts` describe control associations for both
field state and presentation. Private prop declarations include documentation;
inherited props retain the documentation from `InputProps`.

This is an internal restructuring: public props/exports/slots, rendered DOM,
value formats, validation timing, focus and reset behavior remain unchanged.
The private presentation can also be exercised without a Uniform Form.

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
