# uniform

## Password inputs

`Input` with `type="password"` masks the value and includes a keyboard-accessible
show/hide button by default. Toggling changes only visibility: the field name,
value, validation, and submission behavior remain the same. Pointer activation
keeps input focus; keyboard users can reach and activate the toggle normally.
Form resets hide the password again.

```tsx
<Input name="password" label="Password" type="password" />
```

Set `hidePasswordToggle={true}` to keep a password input masked without a toggle.
Custom `endContent` appears alongside the toggle. Disabled inputs disable the
toggle, and `clearable` password inputs offer separate clear and reveal buttons.

## Sensitive debug values

Password inputs are automatically redacted as `[REDACTED]` in Uniform's debug
viewer, its JSON copy output, and Uniform's submit debug logs. Showing a password
inside the input does not reveal it in debug output.

Use `sensitive` on an ordinary `Input` for API tokens and other secrets:

```tsx
<Input name="password" type="password" />
<Input name="apiToken" sensitive />
```

Custom field components can pass `sensitive: true` to `useUniformField`. The
shared hook registers the field path with the form. Nested paths and array items
are supported. Sensitivity is retained for the form's lifetime, including when
an input is unmounted but its value remains in form state.

Submit diagnostics redact sensitive values before removing empty array rows.
Passwords and tokens stay redacted when submission cleanup changes their array
indices, including in nested arrays.

Redaction changes diagnostic copies only. Form values, validation, and `onSubmit`
receive the original values. Application callbacks that log submitted data must
handle their own redaction.
