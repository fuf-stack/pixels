import type { ReactNode } from 'react';

import { Textarea as HeroTextArea } from '@heroui/input';

import { cn } from '@fuf-stack/pixel-utils';

import { useController, useFormContext, useInputValueDebounce } from '../hooks';
import { FieldCopyTestIdButton } from '../partials/FieldCopyTestIdButton';
import { FieldValidationError } from '../partials/FieldValidationError';

export interface TextAreaProps {
  /** Child components. The content of the textarea. */
  children?: ReactNode;
  /** CSS class name */
  className?: string;
  /** debounce delay in milliseconds for form state updates (default: 300ms) */
  debounceDelay?: number;
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
  debounceDelay = 300,
  disabled = false,
  label = undefined,
  name,
  placeholder = ' ',
  testId: _testId = undefined,
}: TextAreaProps) => {
  const { control, debugMode, getFieldState } = useFormContext();
  const { error, invalid, required, testId } = getFieldState(name, _testId);

  const { field } = useController({
    control,
    disabled,
    name,
  });

  const {
    disabled: isDisabled,
    onChange: fieldOnChange,
    onBlur: fieldOnBlur,
    value: fieldValue,
    ref,
  } = field;

  // Use debounced handlers for form updates
  const { onChange, onBlur, value } = useInputValueDebounce({
    debounceDelay,
    onBlur: fieldOnBlur,
    onChange: fieldOnChange,
    value: fieldValue,
  });

  const showTestIdCopyButton = debugMode === 'debug-testids';
  const showLabel = label || showTestIdCopyButton;

  return (
    <HeroTextArea
      ref={ref}
      className={cn(className)}
      data-testid={testId}
      isDisabled={isDisabled}
      isInvalid={invalid}
      isRequired={required}
      labelPlacement="outside"
      name={name}
      onBlur={onBlur}
      onChange={onChange}
      placeholder={placeholder}
      value={value as string}
      variant="bordered"
      classNames={{
        inputWrapper: 'bg-content1 group-data-[focus=true]:border-focus',
      }}
      errorMessage={
        error ? <FieldValidationError error={error} testId={testId} /> : null
      }
      label={
        showLabel ? (
          <>
            {label}
            {showTestIdCopyButton ? (
              <FieldCopyTestIdButton testId={testId} />
            ) : null}
          </>
        ) : null
      }
    >
      {children}
    </HeroTextArea>
  );
};

export default TextArea;
