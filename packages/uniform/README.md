# uniform

## Custom controls and accessible field associations

`useUniformField` owns registration, value transformations, refs, and RHF/Veto
validation timing. Its `ids` and `getControlProps()` support custom editors and
migrated controls without parsing generated `aria-labelledby` strings:

```tsx
const {
  field,
  ids,
  label,
  description,
  errorMessage,
  invalid,
  getControlProps,
} = useUniformField({
  name: 'editor',
  label: 'Editor',
  description: 'Markdown supported',
});

return (
  <>
    <label id={ids.label} htmlFor={ids.control}>
      {label}
    </label>
    <textarea {...field} {...getControlProps()} />
    <div id={ids.description}>{description}</div>
    {invalid ? <div id={ids.error}>{errorMessage}</div> : null}
  </>
);
```

Apply association attributes and the returned focus ref to the actual editable
element. CodeMirror integrations should use its content-attribute extension for
these attributes and route the RHF ref to the editor's focus method. The helper
uses `aria-required`, leaving native `required` validation disabled so RHF/Veto
remains authoritative. It describes visible errors only after the existing
dirty/touched/submitted visibility rules allow them. Explicit `ariaLabel` takes
precedence over a visible label; otherwise unlabeled controls use the field name.

IDs remain stable through rerenders and distinct for repeated names within the
React tree. Server/client rendering must use the same tree; independent SSR
roots should supply React's usual matching `identifierPrefix` values.

The existing presentation getters remain available during HeroUI coexistence.
When using the owned association helper, use the explicit `ids` on local label,
description, and error elements as above. Do not combine its associations with
the legacy getters' generated IDs. See [the migration inventory](../../docs/heroui-removal.md).

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
