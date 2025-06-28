import type { ReactNode } from 'react';
import type { InputValueTransform } from '../hooks';

import { Input as HeroInput } from '@heroui/input';

import { cn } from '@fuf-stack/pixel-utils';

import { useController, useFormContext, useInputValueDebounce } from '../hooks';
import { FieldCopyTestIdButton } from '../partials/FieldCopyTestIdButton';
import { FieldValidationError } from '../partials/FieldValidationError';

export interface InputProps {
  /** CSS class name */
  className?: string;
  /** debounce delay in milliseconds for form state updates (default: 300ms) */
  debounceDelay?: number;
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
  /** size of the input */
  size?: 'sm' | 'md' | 'lg';
  /** content added to the start of the input field */
  startContent?: ReactNode;
  /** HTML data-testid attribute used in e2e tests */
  testId?: string;
  /** allows disentangled display and form values for a field */
  transformValue?: InputValueTransform;
  /** input type */
  type?: 'number' | 'password';
}

/**
 * Input component based on [HeroUI Input](https://www.heroui.com//docs/components/input)
 */
const Input = ({
  className = undefined,
  debounceDelay = 300,
  disabled = false,
  endContent = undefined,
  label = undefined,
  name,
  placeholder = ' ',
  size = undefined,
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

  const {
    disabled: isDisabled,
    onChange: fieldOnChange,
    onBlur: fieldOnBlur,
    value: fieldValue,
    ref,
  } = field;

  // Use hook that provides debounced onChange and enhanced blur handling
  const { onChange, onBlur, value } = useInputValueDebounce({
    debounceDelay,
    onBlur: fieldOnBlur,
    onChange: fieldOnChange,
    transformValue,
    type,
    value: fieldValue,
  });

  const showTestIdCopyButton = debugMode === 'debug-testids';
  const showLabel = label || showTestIdCopyButton;

  return (
    <HeroInput
      className={cn(className)}
      classNames={{
        inputWrapper: 'bg-content1 group-data-[focus=true]:border-focus',
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
      onChange={onChange}
      placeholder={placeholder}
      radius="sm"
      ref={ref}
      size={size}
      startContent={startContent}
      type={type}
      // @ts-expect-error can be number for input type number
      value={value}
      variant="bordered"
    />
  );
};

export default Input;
