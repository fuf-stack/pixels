import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { InputProps as HeroInputProps } from '@heroui/input';
import type { ReactNode } from 'react';
import type { InputValueTransform } from '../hooks/useInputValueTransform';

import { Input as HeroInput } from '@heroui/input';
import { NumberInput as HeroNumberInput } from '@heroui/number-input';

import { tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

import { useInputValueDebounce } from '../hooks/useInputValueDebounce';
import { useUniformField } from '../hooks/useUniformField';
import InputPassword from './InputPassword';

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
  variants: {
    readOnly: {
      true: {
        // Inner controls set their own cursors, so override every descendant.
        base: '**:cursor-not-allowed cursor-not-allowed opacity-disabled',
      },
    },
  },
});

type VariantProps = TVProps<typeof inputVariants>;
type ClassName = TVClassName<typeof inputVariants>;

export interface InputProps extends VariantProps {
  /** Overrides the accessible name, otherwise derived from the field name when no visible label exists */
  ariaLabel?: string;
  /** Applies CSS classes to the input slots */
  className?: ClassName;
  /** Shows a clear button when the input has a value */
  clearable?: boolean;
  /** Sets the delay in milliseconds before updating form state (default: 300) */
  debounceDelay?: number;
  /** Disables the input */
  disabled?: boolean;
  /** Displays content at the end of the input */
  endContent?: ReactNode;
  /** Hides the visibility toggle for password inputs (default: false) */
  hidePasswordToggle?: boolean;
  /** Sets the field label */
  label?: ReactNode;
  /** Identifies the field in form state */
  name: string;
  /** Callback invoked when the input value is cleared */
  onClear?: () => void;
  /** Sets the placeholder text */
  placeholder?: string;
  /** Prevents changes while keeping the input focusable and its value in validation and submission */
  readOnly?: boolean;
  /** Redacts the value from Uniform debug output; password inputs are always redacted */
  sensitive?: boolean;
  /** Sets the input size */
  size?: 'sm' | 'md' | 'lg';
  /** Displays content at the start of the input */
  startContent?: ReactNode;
  /** Sets the HTML data-testid attribute for e2e tests */
  testId?: string;
  /** Converts between display and form values */
  transform?: InputValueTransform<string>;
  /** Sets the input type */
  type?: 'number' | 'password';
}

/**
 * Input component based on [HeroUI Input](https://www.heroui.com//docs/components/input)
 */
const Input = ({
  className: _className = undefined,
  clearable = false,
  debounceDelay = 300,
  endContent = undefined,
  name,
  onClear = undefined,
  placeholder = ' ',
  hidePasswordToggle = false,
  size = undefined,
  startContent = undefined,
  type = undefined,
  ...uniformFieldProps
}: InputProps) => {
  const {
    ariaLabel,
    disabled,
    field: {
      onChange: fieldOnChange,
      onBlur: fieldOnBlur,
      value: fieldValue,
      ref,
    },
    errorMessage,
    invalid,
    label,
    readOnly,
    required,
    testId,
    resetField,
  } = useUniformField({ name, type, ...uniformFieldProps });

  // Use hook that provides debounced onChange and enhanced blur handling
  const { onChange, onBlur, value } = useInputValueDebounce({
    debounceDelay,
    name,
    onBlur: fieldOnBlur,
    onChange: fieldOnChange,
    value: fieldValue,
  });

  const clearValue = () => {
    // Clear initial values too, rather than restoring the default value.
    resetField(name, { defaultValue: null });
    onClear?.();
  };

  // Read-only inputs keep their value, so they never offer clearing.
  const isClearable = clearable && !readOnly;
  const clearableProps: Pick<HeroInputProps, 'isClearable' | 'onClear'> =
    isClearable ? { isClearable: true, onClear: clearValue } : {};

  const variants = inputVariants({ readOnly });
  const classNames = variantsToClassNames(variants, _className, 'base');

  // Common props for both Input and NumberInput
  const commonProps = {
    ref,
    // Only add aria-label if there's no meaningful placeholder (HeroUI uses placeholder as aria-label)
    'aria-label':
      !placeholder || placeholder.trim() === '' ? ariaLabel : undefined,
    // disable autocomplete
    autoComplete: 'off',
    classNames: {
      base: classNames.base,
      clearButton: classNames.clearButton,
      // set padding to 0 for error message exit animation
      helperWrapper: 'p-0',
      input: classNames.input,
      inputWrapper: classNames.inputWrapper,
    },
    'data-testid': testId,
    endContent,
    errorMessage,
    id: testId,
    isDisabled: disabled,
    isInvalid: invalid,
    isReadOnly: readOnly,
    isRequired: required,
    label,
    labelPlacement: 'outside' as const,
    name,
    onBlur,
    placeholder,
    radius: 'sm' as const,
    size,
    startContent,
    variant: 'bordered' as const,
  };

  // Render NumberInput for number type
  if (type === 'number') {
    // Parse the string value to number - use null for empty/cleared state to keep component controlled
    const numberValue =
      value !== '' && value != null && !Number.isNaN(Number(value))
        ? Number(value)
        : null;

    return (
      <HeroNumberInput
        {...commonProps}
        {...clearableProps}
        // Disable thousands separator to avoid parsing issues
        formatOptions={{
          useGrouping: false,
        }}
        // NumberInput onChange receives either an event or a number
        onChange={(e: React.ChangeEvent<HTMLInputElement> | number) => {
          if (typeof e === 'number') {
            // Convert number to synthetic event and pass through debounced onChange
            onChange({
              target: { value: String(e) },
            });
          } else {
            // Pass event through debounced onChange
            onChange(e);
          }
        }}
        // @ts-expect-error - HeroUI NumberInput type is not compatible with null,
        // but it needs to be for empty/cleared state to be controlled
        value={numberValue}
      />
    );
  }

  if (type === 'password') {
    return (
      <InputPassword
        {...commonProps}
        clearable={isClearable}
        hidePasswordToggle={hidePasswordToggle}
        onChange={onChange}
        onClear={clearValue}
        testId={testId}
        value={value}
      />
    );
  }

  return (
    <HeroInput
      {...commonProps}
      {...clearableProps}
      onChange={onChange}
      type={type}
      value={value}
    />
  );
};

export default Input;
