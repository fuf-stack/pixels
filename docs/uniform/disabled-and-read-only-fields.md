# Disabled and read-only fields

Uniform offers two ways to lock a field. Use `disabled` when the value does not
apply and should be left out. Use `readOnly` when a value is fixed but still
belongs to the submitted data, for example a preselected default or a value
derived from earlier input.

|                         | `disabled`                        | `readOnly`                   |
| ----------------------- | --------------------------------- | ---------------------------- |
| User can change it      | No                                | No                           |
| Focusable               | No                                | Yes, text fields copyable    |
| Appearance              | Dimmed                            | Dimmed, `not-allowed` cursor |
| Validated by the schema | As omitted (required fields fail) | Yes, with its stored value   |
| Included in `onSubmit`  | No                                | Yes                          |

`disabled` takes precedence: a field with both props is omitted.

## Disabled fields

Uniform omits disabled field values before schema validation and submission.
The stored value is retained and restored when the field is re-enabled.

The Veto schema remains authoritative: a required disabled field produces a
missing-field error and blocks submission. Mark a field optional when its value
may be omitted:

```tsx
const validation = veto({ couponCode: string().optional() });

<Form validation={validation} onSubmit={onSubmit}>
  <Input name="couponCode" disabled />
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

## Read-only fields

The ice cream shop only serves one flavor today. Customers can see it but not
change it, and it is still part of every order:

```tsx
const validation = veto({ flavor: string(), scoops: number() });

<Form
  initialValues={{ flavor: 'pistachio' }}
  onSubmit={onSubmit}
  validation={validation}
>
  <Select
    label="Flavor of the day"
    name="flavor"
    options={[
      { label: '🍦 Vanilla', value: 'vanilla' },
      { label: '🌰 Pistachio', value: 'pistachio' },
      { label: '🍓 Strawberry', value: 'strawberry' },
    ]}
    readOnly
  />
  <Input label="Scoops" name="scoops" type="number" />
</Form>;

// onSubmit receives { flavor: 'pistachio', scoops: 2 }
```

Read-only fields stay registered with React Hook Form. Their stored value is
validated and submitted, and schema errors are shown as for editable fields.
Because the user cannot fix an invalid read-only value, make sure the value you
provide passes validation.

### Behavior per field

All fields stay keyboard focusable and announce themselves as read-only where
the control supports it.

| Field                                                       | Read-only behavior                                                                                                        |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `Input` (incl. `number`, `password`), `TextArea`            | Native `readonly`: text can be selected and copied. Clear buttons are hidden, the password visibility toggle still works. |
| `DatePicker`, `Time`                                        | React Aria read-only mode: segments are focusable but not editable, the calendar button is disabled.                      |
| `Checkboxes`, `Radios`, `RadioBoxes`, `Switch`, `SwitchBox` | React Aria read-only mode: clicks and keyboard input do not change the value.                                             |
| `Select`                                                    | Focusable, the menu, search, clearing and value removal are blocked. The input gets `aria-readonly`.                      |
| `Slider`, `RadioTabs`                                       | No React Aria read-only mode: controls stay focusable and changes are ignored. The slider thumb gets `aria-readonly`.     |

Fields add `data-readonly` to their root and dim through a `readOnly` style
variant. Hovering shows the `not-allowed` cursor without hover feedback.

### Custom fields

`useUniformField` accepts `readOnly` and adds it to the bound `field`. Pass it to
the control's read-only prop, ignore changes where the control has none, and
style it through a `readOnly` recipe variant. `getFieldDataAttributes(field)`
includes `data-readonly`. Only `disabled` reaches React Hook Form, so value
omission stays limited to disabled fields. See
[field composition](./field-composition.md#bound-field-contract).
