# FieldHelper

Help text and validation messages below a field, for custom controls that
render their own field markup.

## Usage

```tsx
import FieldHelper, {
  fieldHelperVariants,
} from '@fuf-stack/uniform/partials/FieldHelper';
import FieldValidationError from '@fuf-stack/uniform/partials/FieldValidationError';

const classNames = fieldHelperVariants();

<FieldHelper
  className={{
    description: classNames.description(),
    errorMessage: classNames.errorMessage(),
    helperWrapper: classNames.helperWrapper(),
  }}
  description={description}
  errorMessage={<FieldValidationError error={error} testId={testId} />}
  ids={{ description: descriptionId, error: errorId }}
  invalid={!!error}
/>;
```

Point the control's `aria-describedby` at both IDs.

## Notes

- Renders nothing without help text or visible validation, so empty fields keep
  no spacing below the control.
- The error slot renders only while `invalid` is true. `errorMessage` is the
  rendered messages, usually a `FieldValidationError` without its own `id`.
- Unstyled by default, the caller supplies the `description`, `errorMessage` and
  `helperWrapper` classes, usually from `fieldHelperVariants`. Slots carry `data-slot` attributes.
- Uniform fields use it through `FieldLayout`, or directly when their arrangement
  differs (Switch, Slider, Time, DatePicker, SwitchBox).
- Does not register a field or read form state. Pair it with public
  `useController`, `useFormContext` and [FieldLabel](../FieldLabel/README.md).

[Props](./FieldHelper.tsx) · [Stories](./stories/FieldHelper.stories.tsx)
