# Uniform

Form components backed by React Hook Form and Veto validation.

## Usage

```tsx
import Form from '@fuf-stack/uniform/Form';
import Input from '@fuf-stack/uniform/Input';
import SubmitButton from '@fuf-stack/uniform/SubmitButton';
import { string, veto } from '@fuf-stack/veto';

<Form
  initialValues={{ email: '' }}
  validation={veto({ email: string() })}
  onSubmit={console.log}
>
  <Input label="Email" name="email" />
  <SubmitButton>Save</SubmitButton>
</Form>;
```

## Components

Component guides contain a typical usage example, a few behavior notes, and links
to props and stories. Field components are used inside [Form](./src/Form/README.md).

- [Checkboxes](./src/Checkboxes/README.md)
- [DatePicker](./src/DatePicker/README.md)
- [FieldArray](./src/FieldArray/README.md)
- [FieldCard](./src/FieldCard/README.md)
- [FieldCopyTestIdButton](./src/partials/FieldCopyTestIdButton/README.md)
- [FieldValidationError](./src/partials/FieldValidationError/README.md)
- [Form](./src/Form/README.md)
- [Grid](./src/Grid/README.md)
- [Input](./src/Input/README.md)
- [RadioBoxes](./src/RadioBoxes/README.md)
- [Radios](./src/Radios/README.md)
- [RadioTabs](./src/RadioTabs/README.md)
- [Select](./src/Select/README.md)
- [Slider](./src/Slider/README.md)
- [SubmitButton](./src/SubmitButton/README.md)
- [Switch](./src/Switch/README.md)
- [SwitchBox](./src/SwitchBox/README.md)
- [TextArea](./src/TextArea/README.md)
- [Time](./src/Time/README.md)

## Documentation

- [Field composition](../../docs/uniform/field-composition.md) — binding, presentation, layout and messages
- [Migration notes](../../docs/uniform/migration.md) — removed hooks, compatibility and selector changes
- [Styling](../../docs/styling.md) — slots, variants and token setup

The legacy `useInput`, `useUniformField` and `useUniformFieldArray` public exports
have been removed. See the [migration guide](../../docs/uniform/migration.md#breaking-change-legacy-field-hooks-removed)
before upgrading consumers that use these hooks.
