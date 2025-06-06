import type { ReactNode } from 'react';

import { Input as HeroInput } from '@heroui/input';

import { cn } from '@fuf-stack/pixel-utils';

import { useController, useFormContext } from '../hooks';
import { FieldCopyTestIdButton } from '../partials/FieldCopyTestIdButton';
import { FieldValidationError } from '../partials/FieldValidationError';

export interface InputProps {
  /** CSS class name */
  className?: string;
  /** input field is disabled */
  disabled?: boolean;
  /** added content to the end of the input Field. */
  endContent?: ReactNode;
  /** form field label (set to false to disable label) */
  label?: string | false;
  /** form field name */
  name: string;
  /** form field placeholder */
  placeholder?: string;
  /** content added to the start of the input field */
  startContent?: ReactNode;
  /** HTML data-testid attribute used in e2e tests */
  testId?: string;
  /** allows disentangled display and form values for a field */
  transformValue?: {
    /** transforms the formValue of the field to the display value of the field */
    displayValue: (value: string | number) => string | number;
    /** transforms the displayValue of the field to the form value of the field */
    formValue: (value: string) => string | number;
  };
  /** input type */
  type?: 'number' | 'password';
}

/**
 * Input component based on [HeroUI Input](https://www.heroui.com//docs/components/input)
 */
const Input = ({
  className = undefined,
  disabled = false,
  endContent = undefined,
  label = undefined,
  name,
  placeholder = ' ',
  startContent = undefined,
  testId: _testId = undefined,
  transformValue = undefined,
  type = undefined,
}: InputProps) => {
  const { control, debugMode, getFieldState } = useFormContext();
  const { error, invalid, required, testId } = getFieldState(name, _testId);

  const { field } = useController({
    control,
    disabled,
    name,
  });

  const { disabled: isDisabled, onChange, onBlur, value, ref } = field;

  const showTestIdCopyButton = debugMode === 'debug-testids';
  const showLabel = label || showTestIdCopyButton;

  /**
   * Determines the display value for the input field:
   * 1. If transformValue.displayValue is provided, applies the transform to the current value
   *    (useful for formatting like adding currency symbols, date formatting, etc.)
   * 2. Falls back to the raw value if no transform is provided
   * 3. Ensures a defined value by using empty string as fallback (prevents uncontrolled input warnings)
   *
   * Examples:
   * - With transform: value "1000" → displayValue "$1,000"
   * - Without transform: value "1000" → displayValue "1000"
   * - Undefined value: value undefined → displayValue ""
   */
  const displayValue = transformValue?.displayValue
    ? transformValue.displayValue(value ?? '')
    : (value ?? '');

  /**
   * Handles input value changes with special processing:
   * 1. For number inputs:
   *    - Preserves empty string (prevents NaN in the form state)
   *    - Converts non-empty values to numbers
   *    Example: "" → "" (empty stays empty)
   *            "42" → 42 (converts to number)
   *
   * 2. For text inputs with transformValue.formValue:
   *    - Applies custom transform before updating form state
   *    - Useful for converting display format to storage format
   *    Example: "$1,000" → "1000" (strips formatting)
   *
   * 3. For regular text inputs:
   *    - Passes through the raw input value
   *    Example: "hello" → "hello" (no transformation)
   *
   * @param e The input change event
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (type === 'number') {
      onChange(inputValue === '' ? '' : Number(inputValue));
    } else {
      onChange(
        transformValue?.formValue
          ? transformValue.formValue(inputValue)
          : inputValue,
      );
    }
  };

  return (
    <HeroInput
      className={cn(className)}
      classNames={{
        inputWrapper: 'group-data-[focus=true]:border-focus',
      }}
      data-testid={testId}
      endContent={endContent}
      errorMessage={
        error && <FieldValidationError error={error} testId={testId} />
      }
      isDisabled={isDisabled}
      isInvalid={invalid}
      isRequired={required}
      label={
        showLabel && (
          <>
            {label}
            {showTestIdCopyButton && <FieldCopyTestIdButton testId={testId} />}
          </>
        )
      }
      labelPlacement="outside"
      name={name}
      onBlur={onBlur}
      onChange={handleChange}
      placeholder={placeholder}
      radius="sm"
      ref={ref}
      startContent={startContent}
      type={type}
      // @ts-expect-error number is ok here
      value={displayValue}
      variant="bordered"
    />
  );
};

export default Input;
