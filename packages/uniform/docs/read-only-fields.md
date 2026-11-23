# Read-only fields

Use `readOnly` when a value is fixed but still belongs to the submitted data,
for example a preselected default or a value derived from earlier input.
Use `disabled` when the value does not apply and should be left out.

|                         | `disabled`                        | `readOnly`                   |
| ----------------------- | --------------------------------- | ---------------------------- |
| User can change it      | No                                | No                           |
| Focusable               | No                                | Yes; text fields copyable    |
| Appearance              | Dimmed                            | Dimmed, `not-allowed` cursor |
| Validated by the schema | As omitted (required fields fail) | Yes, with its stored value   |
| Included in `onSubmit`  | No                                | Yes                          |

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

## Behavior per field

The fields below support `readOnly` and stay keyboard focusable. They announce
themselves as read-only where the underlying control supports it. `FieldArray`
does not support `readOnly`.

| Field                                                       | Read-only behavior                                                                                                        |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `Input` (incl. `number`, `password`), `TextArea`            | Native `readonly`: text can be selected and copied. Clear buttons are hidden; the password visibility toggle still works. |
| `DatePicker`, `Time`                                        | HeroUI read-only mode: segments are focusable but not editable; the calendar button is disabled.                          |
| `Checkboxes`, `Radios`, `RadioBoxes`, `Switch`, `SwitchBox` | HeroUI read-only mode: clicks and keyboard input do not change the value.                                                 |
| `Select`                                                    | Focusable; the menu, search, clearing, and multi-value removal are blocked. The input gets `aria-readonly`.               |
| `Slider`, `RadioTabs`                                       | No HeroUI read-only mode: controls stay focusable and changes are ignored, so the stored value is kept.                   |

Read-only fields are dimmed like disabled fields through a `readOnly` style
variant on each component. Hovering shows the `not-allowed` cursor and no hover
feedback, so it is clear the value cannot be changed, while focusing and
copying still work.

## Validation and submission

Read-only fields stay enabled in React Hook Form. Their stored value is
validated and submitted, and schema errors are shown as for editable fields.
Because the user cannot fix an invalid read-only value, make sure the value
you provide passes validation.

`disabled` takes precedence: a field with both props is omitted, as described
in [Disabled fields](./disabled-fields.md).

## Custom fields

`useUniformField` accepts `readOnly` and returns it next to `disabled`. Pass it
to the control's read-only prop, ignore changes where the control has none,
and add a `readOnly` variant for styling. Only `disabled` reaches React Hook
Form, so value omission stays limited to disabled fields.
