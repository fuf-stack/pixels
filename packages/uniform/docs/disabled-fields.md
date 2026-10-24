# Disabled fields

Uniform omits disabled field values before schema validation and submission.
The stored value is retained and restored when the field is re-enabled.

The Veto schema remains authoritative: a required disabled field produces a
missing-field error and blocks submission. Mark a field optional when its value
may be omitted:

```tsx
const validation = veto({ accountCode: string().optional() });

<Form validation={validation} onSubmit={onSubmit}>
  <Input name="accountCode" disabled />
</Form>;
```

This applies to nested fields and client validation too. Schema defaults and
cross-field rules still run normally; disabling a field does not relax them.
Disabled values are also removed from validated output, so schema defaults
cannot add them to the submitted payload.

For flat arrays, omitted entries keep their indices during validation. Submission
normalization turns these empty slots into `null` placeholders; later entries
keep their positions.

Previously, Uniform validated stored disabled values before removing them from
submission. Required schemas must now accept omission, or the field must remain
enabled. Re-enabling restores validation of its retained value.
