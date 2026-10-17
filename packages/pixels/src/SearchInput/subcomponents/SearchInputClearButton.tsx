import type { ButtonProps } from 'react-aria-components';

import { Button } from 'react-aria-components';

interface SearchInputClearButtonProps {
  /** CSS class name */
  className: string;
  /** Disables the clear action */
  disabled: boolean;
  /** Whether the search text is empty */
  empty: boolean;
  /** Callback when the search text is cleared */
  onClear: () => void;
}

// Escape provides keyboard clearing without adding a second tab stop
const renderButton: NonNullable<ButtonProps['render']> = (props) => {
  return <button {...props} tabIndex={-1} type="button" />;
};

/** Clear action that leaves keyboard navigation on the editable input
 *
 * @see https://react-aria.adobe.com/Button
 */
const SearchInputClearButton = ({
  className,
  disabled,
  empty,
  onClear,
}: SearchInputClearButtonProps) => {
  return (
    <Button
      aria-hidden={empty || disabled || undefined}
      aria-label="clear input"
      className={className}
      data-slot="clear-button"
      isDisabled={disabled}
      onPress={onClear}
      render={renderButton}
      type="button"
    >
      <svg
        aria-hidden="true"
        focusable="false"
        height="1em"
        viewBox="0 0 24 24"
        width="1em"
      >
        <path
          d="M12 2a10 10 0 1010 10A10.016 10.016 0 0012 2zm3.36 12.3a.754.754 0 010 1.06.748.748 0 01-1.06 0l-2.3-2.3-2.3 2.3a.748.748 0 01-1.06 0 .754.754 0 010-1.06l2.3-2.3-2.3-2.3A.75.75 0 019.7 8.64l2.3 2.3 2.3-2.3a.75.75 0 011.06 1.06l-2.3 2.3z"
          fill="currentColor"
        />
      </svg>
    </Button>
  );
};

export default SearchInputClearButton;
