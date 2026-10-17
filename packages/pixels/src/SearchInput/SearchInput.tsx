import type { ReactNode } from 'react';
import type { ClassName, VariantProps } from './searchInputVariants';

import { useState } from 'react';

import SearchInputControl from './subcomponents/SearchInputControl';

export { inputVariants } from './searchInputVariants';

export interface SearchInputProps {
  /** CSS class name */
  className?: ClassName;
  /** Disables the input */
  disabled?: boolean;
  /** Content after the input, replaced by the clear action when present */
  endContent?: ReactNode;
  /** Initial search text, read when the component mounts */
  initialValue?: string;
  /** Callback for text edits, null when explicitly cleared */
  onChange: (value: string | null) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Input size */
  size?: VariantProps['size'];
  /** Content before the input, defaults to a search icon */
  startContent?: ReactNode;
  /** HTML data-testid attribute for e2e tests */
  testId?: string;
}

/** Search input for filtering content, with an action to clear the search text */
const SearchInput = ({
  initialValue = undefined,
  onChange,
  ...props
}: SearchInputProps) => {
  const [value, setValue] = useState(initialValue ?? '');

  // update the displayed text and preserve the explicit clear signal
  const handleValueChange = (next: string | null) => {
    setValue(next ?? '');
    onChange(next);
  };

  return (
    <SearchInputControl
      {...props}
      onValueChange={handleValueChange}
      value={value}
    />
  );
};

export default SearchInput;
