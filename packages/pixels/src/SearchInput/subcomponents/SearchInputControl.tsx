import type { KeyboardEvent, PointerEvent } from 'react';
import type { SearchInputProps } from '../SearchInput';

import { useRef } from 'react';
import { useFocusRing, useHover } from 'react-aria';
import { Input, TextField } from 'react-aria-components';
import { FaSearch } from 'react-icons/fa';

import { slugify } from '@fuf-stack/pixel-utils';

import { useStyling } from '../../StylingProvider';
import { inputVariants } from '../searchInputVariants';
import SearchInputClearButton from './SearchInputClearButton';

interface SearchInputControlProps extends Omit<
  SearchInputProps,
  'initialValue' | 'onChange'
> {
  /** Callback for edits or explicit clearing */
  onValueChange: (value: string | null) => void;
  /** Displayed search text */
  value: string;
}

/** Editable search surface, focus routing and clear interactions
 *
 * @see https://react-aria.adobe.com/TextField
 */
const SearchInputControl = ({
  className = undefined,
  disabled = false,
  endContent = undefined,
  onValueChange,
  placeholder = undefined,
  size = undefined,
  startContent = undefined,
  testId = undefined,
  value,
}: SearchInputControlProps) => {
  const styling = useStyling();
  const inputRef = useRef<HTMLInputElement>(null);
  const { focusProps, isFocused } = useFocusRing({
    isTextInput: true,
    within: true,
  });
  const { hoverProps, isHovered } = useHover({ isDisabled: disabled });

  // an empty search keeps its placeholder while hiding the clear action
  const hasValue = value !== '';
  const leadingContent = startContent ?? <FaSearch className="opacity-50" />;

  // classNames from slots
  const variants = styling.resolve(inputVariants, {
    disabled,
    filled: hasValue,
    size,
  });
  const classNames = styling.variantsToClassNames(variants, className, 'base');

  // clear the text and return focus to the input
  const handleClear = () => {
    onValueChange(null);
    inputRef.current?.focus();
  };

  // retain Escape clearing without intercepting an enclosing overlay's dismissal
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape' && hasValue && !disabled) {
      handleClear();
    }
  };

  // focus the input when the surrounding surface is pressed
  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!disabled && !(event.target as Element).closest('input, button, a')) {
      event.preventDefault();
      inputRef.current?.focus();
    }
  };

  return (
    <TextField
      aria-label={placeholder?.trim() ? placeholder : 'Search'}
      className={classNames.base}
      data-component="search-input"
      data-disabled={disabled || undefined}
      data-filled={hasValue || undefined}
      data-focus={isFocused || undefined}
      data-slot="base"
      isDisabled={disabled}
      onBlur={focusProps.onBlur}
      onChange={onValueChange}
      onFocus={focusProps.onFocus}
      value={value}
    >
      <div className={classNames.mainWrapper} data-slot="main-wrapper">
        <div
          {...hoverProps}
          className={classNames.inputWrapper}
          data-hover={isHovered || undefined}
          data-slot="input-wrapper"
          onPointerDown={handlePointerDown}
        >
          <div className={classNames.innerWrapper} data-slot="inner-wrapper">
            {leadingContent}
            <Input
              ref={inputRef}
              autoComplete="off"
              className={classNames.input}
              data-filled={hasValue || undefined}
              data-has-end-content={!!endContent || undefined}
              data-has-start-content={!!leadingContent || undefined}
              data-slot="input"
              data-testid={testId ? slugify(testId) : undefined}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
            />
            <SearchInputClearButton
              className={classNames.clearButton}
              disabled={disabled}
              empty={!hasValue}
              onClear={handleClear}
            />
          </div>
        </div>
      </div>
    </TextField>
  );
};

export default SearchInputControl;
