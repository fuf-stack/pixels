import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { InputProps as HeroInputProps } from '@heroui/input';
import type { ReactNode } from 'react';
import type { InputValueTransform } from '../hooks';

import { Input as HeroInput } from '@heroui/input';

import { tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

import { useController, useFormContext, useInputValueDebounce } from '../hooks';
import { FieldCopyTestIdButton } from '../partials/FieldCopyTestIdButton';
import { FieldValidationError } from '../partials/FieldValidationError';

// input variants
export const inputVariants = tv({
  slots: {
    /** wrapper around the whole input */
    base: '',
    /** clear button */
    clearButton: '',
    /** actual input element */
    input: '',
    /** inner wrapper (HeroUI inputWrapper slot) */
    inputWrapper: 'bg-content1 group-data-[focus=true]:border-focus',
  },
});

type VariantProps = TVProps<typeof inputVariants>;
type ClassName = TVClassName<typeof inputVariants>;

export interface InputProps extends VariantProps {
  /** CSS class name */
  className?: ClassName;
  /** shows clear button when input has value */
  clearable?: boolean;
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
  /** callback that is fired when the value is cleared */
  onClear?: () => void;
  /** form field placeholder */
  placeholder?: string;
  /** size of the input */
  size?: 'sm' | 'md' | 'lg';
  /** content added to the start of the input field */
  startContent?: ReactNode;
  /** HTML data-testid attribute used in e2e tests */
  testId?: string;
  /** allows disentangled display and form values for a field */
  transform?: InputValueTransform;
  /** input type */
  type?: 'number' | 'password';
}

/**
 * Input component based on [HeroUI Input](https://www.heroui.com//docs/components/input)
 */
const Input = ({
  className: _className = undefined,
  clearable = false,
  debounceDelay = 300,
  disabled = false,
  endContent = undefined,
  label = undefined,
  name,
  onClear = undefined,
  placeholder = ' ',
  size = undefined,
  startContent = undefined,
  testId: _testId = undefined,
  transform = undefined,
  type = undefined,
}: InputProps) => {
  const { control, debugMode, getFieldState, resetField } = useFormContext();
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
    transform,
    type,
    value: fieldValue,
  });

  // If input is clearable add props for clearing input value
  const clearableProps: Pick<HeroInputProps, 'isClearable' | 'onClear'> =
    clearable
      ? {
          isClearable: true,
          onClear: () => {
            // if field had initial value we do not reset it
            // to that value, but clear it instead
            resetField(name, { defaultValue: null });
            // if onClear cb provided we call it
            if (onClear) {
              onClear();
            }
          },
        }
      : {};

  const showTestIdCopyButton = debugMode === 'debug-testids';
  const showLabel = label ?? showTestIdCopyButton;

  // classNames from slots
  const variants = inputVariants();
  const classNames = variantsToClassNames(variants, _className, 'base');

  return (
    <HeroInput
      ref={ref}
      data-testid={testId}
      endContent={endContent}
      isDisabled={isDisabled}
      isInvalid={invalid}
      isRequired={required}
      labelPlacement="outside"
      name={name}
      onBlur={onBlur}
      onChange={onChange}
      placeholder={placeholder}
      radius="sm"
      size={size}
      startContent={startContent}
      type={type}
      // @ts-expect-error can be number for input type number
      value={value}
      variant="bordered"
      classNames={{
        base: classNames.base,
        clearButton: classNames.clearButton,
        input: classNames.input,
        inputWrapper: classNames.inputWrapper,
      }}
      errorMessage={
        error ? <FieldValidationError error={error} testId={testId} /> : null
      }
      label={
        showLabel ? (
          <>
            {label}
            {showTestIdCopyButton ?? <FieldCopyTestIdButton testId={testId} />}
          </>
        ) : null
      }
      {...clearableProps}
    />
  );
};

export default Input;
