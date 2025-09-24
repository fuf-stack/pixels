import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { ReactNode } from 'react';

import { FaSearch } from 'react-icons/fa';

import { Input as HeroInput } from '@heroui/input';

import { slugify, tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

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

export interface SearchInputProps extends VariantProps {
  /** CSS class name */
  className?: ClassName;
  /** shows clear button when input has value */
  clearable?: boolean;
  /** input field is disabled */
  disabled?: boolean;
  /** added content to the end of the input Field. */
  endContent?: ReactNode;
  /** callback that is fired when the value is cleared */
  onClear?: () => void;
  /** callback that is fired when the value is changed */
  onChange: (value?: string) => void;
  /** form field placeholder */
  placeholder?: string;
  /** size of the input */
  size?: 'sm' | 'md' | 'lg';
  /** content added to the start of the input field */
  startContent?: ReactNode;
  /** HTML data-testid attribute used in e2e tests */
  testId?: string;
  /** value of the input */
  value?: string;
}

/**
 * SearchInput component based on [HeroUI Input](https://www.heroui.com//docs/components/input)
 */
const SearchInput = ({
  className: _className = undefined,
  clearable = false,
  disabled = false,
  endContent = undefined,
  onChange,
  onClear = undefined,
  placeholder = undefined,
  size = undefined,
  startContent = undefined,
  testId = undefined,
  value = undefined,
}: SearchInputProps) => {
  // classNames from slots
  const variants = inputVariants();
  const classNames = variantsToClassNames(variants, _className, 'base');

  return (
    <HeroInput
      data-testid={testId ? slugify(testId) : undefined}
      endContent={endContent}
      isClearable={clearable}
      isDisabled={disabled}
      placeholder={placeholder}
      radius="sm"
      size={size}
      startContent={startContent ?? <FaSearch className="opacity-50" />}
      value={value}
      variant="bordered"
      classNames={{
        base: classNames.base,
        clearButton: classNames.clearButton,
        input: classNames.input,
        inputWrapper: classNames.inputWrapper,
      }}
      onChange={(e) => {
        onChange(e.target.value);
      }}
      onClear={
        onClear
          ? () => {
              onClear();
            }
          : undefined
      }
    />
  );
};

export default SearchInput;
