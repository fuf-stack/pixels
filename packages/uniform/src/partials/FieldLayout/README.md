# FieldLayout

Private composition of a field base, label, editable content and supporting messages.

## Usage

```tsx
<FieldLayout
  {...layoutProps}
  baseProps={{ ...focusWithinProps, ref: handleControlRef, role: 'group' }}
  className={classNames}
>
  <RadioTabsList {...tabProps} />
</FieldLayout>
```

- Owns the outer `div`, `data-slot="base"` and `className.base`
- `baseProps` supplies attributes, handlers and a ref; styling stays in `className`
- Receives IDs and validation state, without registering a field or deriving control semantics
- Renders the supplied `errorMessage` inside the styled wrapper with `ids.error`
- Omits the helper wrapper when neither description nor visible validation exists

## Custom base

Use `baseAs` to select a field engine instead of the default `div`:

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

`FieldLayout` renders the chosen base around its label, content and messages,
without adding another wrapper. `baseProps` is typed for that component, including
its ref. It is required when that component has required props, and optional for
the default `div` or a base with only optional props. Keep `className` and children on `FieldLayout`, rather than in `baseProps`.
Define custom base components outside render to preserve their identity and focus.
Radio and checkbox groups also pass React Aria `Label` as `labelAs`. Native labels use `htmlFor={ids.control}` by default.
Fields with a different arrangement, such as Switch, compose individual partials.

[Props](./FieldLayout.tsx) · [Stories](./stories/FieldLayout.stories.tsx) · [Composition guide](../../../../../docs/uniform/field-composition.md)

Compile-time contract checks run with `pnpm --filter @fuf-stack/uniform test:types`
and as part of `pnpm check`.
