import type { InputValueTransform } from '../../hooks/useInputValueTransform';
import type { FieldResetInclude } from './fieldResetValues';

import { toNullishString } from '../../helpers';
import { isFieldValueChanged } from './fieldResetValues';

interface FieldResetTransformOptions {
  /** Omits unchanged values in changed mode or retains them in always mode */
  include: FieldResetInclude;
  /** Supplies the display fallback and comparison value; numeric values enable number conversion */
  resetValue: NonNullable<unknown>;
  /** Supplies the raw form value to distinguish omitted updates from explicit clears */
  storedValue: unknown;
}

/** Creates the display/update mapping without changing form state */
const createFieldResetTransform = <TDisplay = string>({
  resetValue,
  include,
  storedValue,
}: FieldResetTransformOptions): InputValueTransform<TDisplay> => {
  return {
    toDisplayValue: (current) => {
      // the null marker means unchanged, a real null is an explicit clear
      return (
        storedValue === toNullishString(null) || storedValue === undefined
          ? resetValue
          : (current ?? '')
      ) as TDisplay;
    },
    toFormValue: (nextValue) => {
      // custom transforms replace Input's built-in number conversion. Normalize
      // before comparing, but preserve invalid text for schema validation
      let formValue: unknown = nextValue;
      if (
        typeof resetValue === 'number' &&
        typeof nextValue === 'string' &&
        nextValue.trim() !== ''
      ) {
        const numericValue = Number(nextValue);
        formValue = Number.isNaN(numericValue) ? nextValue : numericValue;
      }
      if (
        include === 'changed' &&
        !isFieldValueChanged(formValue, resetValue)
      ) {
        return null;
      }
      // keep clears distinct from the omitted-update marker
      return formValue ?? '';
    },
  };
};

export default createFieldResetTransform;
