import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { ReactNode } from 'react';

import { Textarea as HeroTextArea } from '@heroui/input';

import { tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

import { useInputValueDebounce, useUniformField } from '../hooks';

// input variants
export const textAreaVariants = tv({
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

type VariantProps = TVProps<typeof textAreaVariants>;
type ClassName = TVClassName<typeof textAreaVariants>;

export interface TextAreaProps extends VariantProps {
  /** Child components. The content of the textarea. */
  children?: ReactNode;
  /** CSS class name */
  className?: ClassName;
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
  className: _className = undefined,
  debounceDelay = 300,
  name,
  placeholder = ' ',
  ...uniformFieldProps
}: TextAreaProps) => {
  const {
    disabled,
    errorMessage,
    field: {
      onChange: fieldOnChange,
      onBlur: fieldOnBlur,
      value: fieldValue,
      ref,
    },
    invalid,
    label,
    required,
    testId,
  } = useUniformField({ name, ...uniformFieldProps });

  // Use debounced handlers for form updates
  const { onChange, onBlur, value } = useInputValueDebounce({
    debounceDelay,
    onBlur: fieldOnBlur,
    onChange: fieldOnChange,
    value: fieldValue,
  });

  // classNames from slots
  const variants = textAreaVariants();
  const classNames = variantsToClassNames(variants, _className, 'base');

  return (
    <HeroTextArea
      ref={ref}
      data-testid={testId}
      errorMessage={errorMessage}
      id={testId}
      isDisabled={disabled}
      isInvalid={invalid}
      isRequired={required}
      label={label}
      labelPlacement="outside"
      name={name}
      onBlur={onBlur}
      onChange={onChange}
      placeholder={placeholder}
      value={value as string}
      variant="bordered"
      classNames={{
        base: classNames.base,
        clearButton: classNames.clearButton,
        // set padding to 0 for error message exit animation
        helperWrapper: 'p-0',
        input: classNames.input,
        inputWrapper: classNames.inputWrapper,
      }}
    >
      {children}
    </HeroTextArea>
  );
};

export default TextArea;
