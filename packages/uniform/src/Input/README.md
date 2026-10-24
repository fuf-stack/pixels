# Input

Text, password and number input connected to a Uniform form.

## Usage

```tsx
import Form from '@fuf-stack/uniform/Form';
import Input from '@fuf-stack/uniform/Input';

<Form onSubmit={console.log}>
  <Input label="Email" name="email" placeholder="you@example.com" />
</Form>;
```

## Notes

- Edits update the display immediately and form state after 300 ms by default; blur flushes pending edits. Use `debounceDelay` to change the delay.
- Accessible names use `ariaLabel`, the visible label, a nonblank placeholder, then the field name, in that order.
- `type="number"` stores numeric values. Empty values stay visually empty; zero stays visible.
- `clearable` adds a clear action that cancels pending edits and restores input focus.

## Styling

Use `className` for a base class or a partial map of slot overrides:

```tsx
<Input
  className={{ label: 'font-semibold', errorMessage: 'text-small' }}
  label="Amount"
  name="amount"
  type="number"
/>
```

| Slot             | Target                               |
| ---------------- | ------------------------------------ |
| `base`           | Whole field                          |
| `clearButton`    | Clear action                         |
| `description`    | Help text                            |
| `errorMessage`   | Validation message wrapper           |
| `helperWrapper`  | Description and validation wrapper   |
| `innerWrapper`   | Input, addons and actions            |
| `input`          | Editable control                     |
| `inputWrapper`   | Input border and background          |
| `label`          | Field label                          |
| `passwordToggle` | Password visibility action           |
| `stepper`        | Number stepper wrapper               |
| `stepperButton`  | Both increment and decrement buttons |

Slots are available when their content is rendered. Steppers are shown only for
number inputs. See [component styling](../../../../docs/styling.md) for class merging.

NumberField's increment/decrement slots keep the stepper buttons outside the tab
order, keyboard editing stays in the input.

Hover styles use `data-[hovered=true]` on `inputWrapper`, managed by React Aria
Group. Input no longer mirrors hover state on the field root.

`data-filled` reflects a nonempty value, including zero. Placeholders do not mark
the field as filled. Shared state attributes and removed legacy selectors are
documented in [Uniform’s selector notes](../../../../docs/uniform/migration.md#field-state-selectors).

Built on React Aria [TextField](https://react-aria.adobe.com/TextField) and
[NumberField](https://react-aria.adobe.com/NumberField).

Labels and hints use Uniform's private [shared field partials](../partials/README.md).

## Internal composition

```text
Input                         Field binding, IDs, transforms and debounce
  InputControl                Editable ref, focus, interaction state and slot styling
    FieldLayout               Label, supplied children and messages
      InputField (baseAs)      React Aria engine, base element and context
        FieldLabel            Label and required indicator
        InputWrapper          Bordered Group, editable input and surrounding controls
          InputClearButton    Clear action
          InputPasswordToggle Password visibility action
          InputStepper        Number increment and decrement controls
        helperWrapper         Rendered directly by FieldLayout when needed
          FieldDescription    Help text
          error-message       Styled association wrapper owned by FieldLayout
            errorMessage      Supplied messages, normally FieldValidationError
```

[FieldLayout](../partials/FieldLayout/README.md) reuses the existing IDs and slot
classes, and renders `InputField` as its base via `baseAs`. `Input` passes the debounce hook’s `clear` operation as `onReset`.
`InputControl` invokes it, notifies the consumer through `onClear` and restores
focus. The hook cancels pending edits and resets the form value to `null`, with
`emptyValue: ''` keeping the display empty immediately.
Display changes pass directly to the debounce hook, which accepts raw values.
The rendered elements and control associations stay the same.

[Props](Input.tsx) · [Stories](stories/Input.stories.tsx)

Password inputs include separate clear and visibility actions. `hidePasswordToggle`
keeps them masked without the reveal button. Clearing, resetting, changing the
field name or switching the input type restores masking. Declared password fields
remain redacted in diagnostics while revealed; ordinary inputs can set `sensitive`.
See [password fields](../../docs/password-fields.md) for diagnostic guarantees.
