import type { UniformField } from '../../hooks/useUniformField/types';

import { useDebounce } from '@fuf-stack/pixels';

import {
  checkFieldIsRequired,
  useFormContext,
} from '../../hooks/useFormContext';
import {
  getNestedValue,
  hasAnyChildErrors,
  hasAnyChildTouched,
  hasVisibleChildErrors,
} from '../fieldCardValidation';

/**
 * Derives the card's required and invalid states from its nested fields
 *
 * A card groups independently registered inputs, so its own field state does
 * not tell us whether a child is required or which child errors are visible
 * Required state comes from registered descendants and their validation schema
 *
 * Child errors become visible after that child is touched or the form is submitted
 * Object-level errors follow child interaction or submission when no child errors
 * exist, so they do not reveal untouched child failures early
 *
 * Debounces invalid-state changes to prevent flickering during validation updates
 */
const useFieldCardValidation = (
  field: Pick<UniformField, 'error' | 'name'>,
) => {
  const { error, name } = field;

  const {
    control,
    formState: { touchedFields, submitCount },
    validation,
  } = useFormContext();

  // inspect registered children for required fields
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

  // resolve touched state for nested children
  const fieldTouched = getNestedValue(touchedFields, name);

  // retain object-level errors alongside child errors
  // @ts-expect-error - error._errors exists but not typed
  const hasObjectErrors = !!error?._errors;

  const errorRecord = error as unknown as Record<string, unknown>;

  const hasChildErrors = hasAnyChildErrors(errorRecord);
  const isAnyChildTouched = hasAnyChildTouched(fieldTouched);

  // reveal child errors after interaction or submission
  const rawShowInvalid =
    (hasChildErrors &&
      (hasVisibleChildErrors(errorRecord, fieldTouched) || submitCount > 0)) ||
    (hasObjectErrors &&
      !hasChildErrors &&
      (isAnyChildTouched || submitCount > 0));

  // prevent flickering during rapid validation updates
  const showInvalid = useDebounce(rawShowInvalid, 200);

  return { invalid: showInvalid, required: isRequired };
};

export default useFieldCardValidation;
