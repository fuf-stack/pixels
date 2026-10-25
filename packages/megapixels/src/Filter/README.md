# Filter

Controlled search and filter editing with active labels and per-filter modals.

```tsx
<Filter config={{ filters }} values={values} onChange={setValues} />
```

`Filter` binds the composite validation schema and controlled values.
`FilterControl` composes the form, search, active filters and modal actions.
The portaled modal submit button targets the form by its existing ID.
Recipes live in `filterVariants.ts`, internal components in `subcomponents/`.

Normal, interaction and edge-case stories cover configured filters, editing,
removal and an empty filter registry.

[Props](./Filter.tsx) · [Stories](./stories/Filter.stories.tsx) ·
[Styling](../../../../docs/styling.md)
