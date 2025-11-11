import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { InputProps as HeroInputProps } from '@heroui/input';
import type { ReactNode } from 'react';
import type { InputValueTransform } from '../hooks/useInputValueTransform';

import { Input as HeroInput } from '@heroui/input';
import { NumberInput as HeroNumberInput } from '@heroui/number-input';

import { tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

import { useInputValueDebounce } from '../hooks/useInputValueDebounce';
import { useUniformField } from '../hooks/useUniformField';

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
  transform?: InputValueTransform<string>;
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
  endContent = undefined,
  name,
  onClear = undefined,
  placeholder = ' ',
  size = undefined,
  startContent = undefined,
  type = undefined,
  ...uniformFieldProps
}: InputProps) => {
  const {
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
    required,
    testId,
    resetField,
  } = useUniformField({ name, type, ...uniformFieldProps });

  // Use hook that provides debounced onChange and enhanced blur handling
  const { onChange, onBlur, value } = useInputValueDebounce({
    debounceDelay,
    onBlur: fieldOnBlur,
    onChange: fieldOnChange,
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

  // classNames from slots
  const variants = inputVariants();
  const classNames = variantsToClassNames(variants, _className, 'base');

  // Common props for both Input and NumberInput
  const commonProps = {
    ref,
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
    ...clearableProps,
  };

  // Render NumberInput for number type
  if (type === 'number') {
    // Parse the string value to number - use undefined for empty/cleared state
    const numberValue =
      value !== '' && value != null && !Number.isNaN(Number(value))
        ? Number(value)
        : undefined;

    return (
      <HeroNumberInput
        {...commonProps}
        value={numberValue}
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
            } as React.ChangeEvent<HTMLInputElement>);
          } else {
            // Pass event through debounced onChange
            onChange(e);
          }
        }}
      />
    );
  }

  // Render regular Input for text/password
  return (
    <HeroInput {...commonProps} onChange={onChange} type={type} value={value} />
  );
};

export default Input;
