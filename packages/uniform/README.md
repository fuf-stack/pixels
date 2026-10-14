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
