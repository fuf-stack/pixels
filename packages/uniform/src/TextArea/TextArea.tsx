import type { ReactNode } from 'react';

import { Textarea as HeroTextArea } from '@heroui/input';

import { cn } from '@fuf-stack/pixel-utils';

import { useController, useFormContext } from '../hooks';
import { FieldCopyTestIdButton } from '../partials/FieldCopyTestIdButton';
import { FieldValidationError } from '../partials/FieldValidationError';

export interface TextAreaProps {
  /** Child components. The content of the textarea. */
  children?: ReactNode;
  /** CSS class name */
  className?: string;
  /** Determines if the TextArea is disabled or not. */
  disabled?: boolean;
  /** Label displayed above the TextArea. */
  label?: ReactNode;
  /** Name the TextArea is registered at in HTML forms (react-hook-form). */
  name: string;
  /** placeholder for the textArea content. */
  placeholder?: string;
  /** Id to grab element in internal tests. */
  testId?: string;
}

/**
 * TextArea component based on [HeroUI TextArea](https://www.heroui.com//docs/components/textarea)
 */
const TextArea = ({
  children = null,
  className = undefined,
  disabled = false,
  label = undefined,
  name,
  placeholder = ' ',
  testId: _testId = undefined,
}: TextAreaProps) => {
  const { control, debugMode, getFieldState } = useFormContext();
  const { error, invalid, required, testId } = getFieldState(name, _testId);

  const { field } = useController({ control, name, disabled });
  const { disabled: isDisabled, onChange, onBlur, value = '', ref } = field;

  const showTestIdCopyButton = debugMode === 'debug-testids';
  const showLabel = label || showTestIdCopyButton;

  /**
   * Ensures the textarea always has a defined string value to prevent uncontrolled to
   * controlled component warnings:
   *
   * 1. Warning Prevention:
   *    - Sets default value to '' in field destructuring
   *    - Guarantees the value prop is never undefined/null
   *    - Prevents React warning: "A component is changing from uncontrolled to controlled"
   *
   * 2. Value Handling:
   *    - Converts undefined/null to empty string
   *    - Converts non-string values to strings
   *    - Maintains existing string values
   *
   * Examples:
   * - undefined → "" (prevents uncontrolled warning)
   * - null → "" (prevents uncontrolled warning)
   * - "hello" → "hello" (maintains string value)
   * - 123 → "123" (converts to string)
   *
   * Without this handling, the textarea could switch between controlled/uncontrolled
   * states when the form value changes from undefined to defined, causing React warnings
   * and potential rendering issues.
   */
  const displayValue = value?.toString() ?? '';

  return (
    <HeroTextArea
      className={cn(className)}
      classNames={{
        inputWrapper: 'group-data-[focus=true]:border-focus',
      }}
      data-testid={testId}
      errorMessage={
        error && <FieldValidationError error={error} testId={testId} />
      }
      isDisabled={isDisabled}
      isRequired={required}
      isInvalid={invalid}
      label={
        showLabel && (
          <>
            {label}
            {showTestIdCopyButton && <FieldCopyTestIdButton testId={testId} />}
          </>
        )
      }
      labelPlacement="outside"
      placeholder={placeholder}
      name={name}
      value={displayValue}
      onChange={onChange}
      onBlur={onBlur}
      ref={ref}
      variant="bordered"
    >
      {children}
    </HeroTextArea>
  );
};

export default TextArea;
