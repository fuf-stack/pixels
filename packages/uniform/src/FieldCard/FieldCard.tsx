import type { ReactNode } from 'react';
import type { ClassName } from './fieldCardVariants';

import { useDebounce } from '@fuf-stack/pixels';

import { checkFieldIsRequired, useFormContext } from '../hooks/useFormContext';
import useUniformField from '../hooks/useUniformField/useUniformField';
import {
  getNestedValue,
  hasAnyChildErrors,
  hasAnyChildTouched,
  hasVisibleChildErrors,
} from './fieldCardValidation';
import FieldCardControl from './subcomponents/FieldCardControl';

export { fieldCardVariants } from './fieldCardVariants';
export {
  hasAnyChildErrors,
  hasAnyChildTouched,
  hasVisibleChildErrors,
} from './fieldCardValidation';

export interface FieldCardProps {
  /** Content to render inside the card */
  children: ReactNode;
  /** CSS class name */
  className?: ClassName;
  /** Field label */
  label: ReactNode;
  /** Field name */
  name: string;
  /** HTML data-testid attribute for e2e tests */
  testId?: string;
}

/** Form field group displayed as a card with a heading and validation footer */
const FieldCard = ({
  children,
  className: _className = undefined,
  name,
  ...uniformFieldProps
}: FieldCardProps) => {
  const { error, ids, ariaLabel, label, testId } = useUniformField({
    name,
    ...uniformFieldProps,
  });

  const {
    control,
    formState: { touchedFields, submitCount },
    validation,
  } = useFormContext();

  // Check if any registered child field is required
  const validationInstance = validation?.baseInstance ?? validation?.instance;
  const registeredFields: string[] = Array.from(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (control as any)._names?.mount ?? [],
  );
  const childFieldPrefix = `${name}.`;
  const isRequired = validationInstance
    ? registeredFields
        .filter((f) => {
          return f.startsWith(childFieldPrefix);
        })
        .some((f) => {
          return checkFieldIsRequired(
            validationInstance,
            f.split('.').filter((k) => {
              return k !== '';
            }),
          );
        })
    : false;

  // Get touched state for this field's children by traversing the path
  const fieldTouched = getNestedValue(touchedFields, name);

  // Check for object-level errors (_errors)
  // @ts-expect-error - error._errors exists but not typed
  const hasObjectErrors = !!error?._errors;

  const errorRecord = error as unknown as Record<string, unknown>;

  // Check if any child field has errors (regardless of touched state)
  const hasChildErrors = hasAnyChildErrors(errorRecord);
  // Check if any child field is touched
  const isAnyChildTouched = hasAnyChildTouched(fieldTouched);

  // Show invalid styling (danger border/header/error text) when:
  // 1. Any child field has an error AND (it's touched OR form was submitted), OR
  // 2. Object-level _errors exists AND no child errors AND (any child touched OR submitted)
  const rawShowInvalid =
    (hasChildErrors &&
      (hasVisibleChildErrors(errorRecord, fieldTouched) || submitCount > 0)) ||
    (hasObjectErrors &&
      !hasChildErrors &&
      (isAnyChildTouched || submitCount > 0));

  // Debounce to prevent flickering during rapid state changes
  const showInvalid = useDebounce(rawShowInvalid, 200);

  return (
    <FieldCardControl
      ariaLabel={ariaLabel}
      className={_className}
      error={error}
      ids={ids}
      invalid={showInvalid}
      label={label}
      required={isRequired}
      testId={testId}
    >
      {children}
    </FieldCardControl>
  );
};

export default FieldCard;
