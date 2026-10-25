import type { ReactNode } from 'react';

import { CheckboxButton, CheckboxField } from 'react-aria-components';

interface CheckboxClassName {
  checkbox?: string;
  checkboxIndicator?: string;
}

export interface DataTableCheckboxProps {
  /** Accessible label for assistive technologies */
  ariaLabel: string;
  /** Controlled checked state */
  checked: boolean;
  /** Icon shown for checked state; pass `false` to hide */
  checkedIcon?: ReactNode | false;
  /** Optional class names for root and indicator nodes */
  className?: CheckboxClassName;
  /** Enables mixed visual state for parent/select-all behavior */
  indeterminate?: boolean;
  /** Icon shown for indeterminate state; pass `false` to hide */
  indeterminateIcon?: ReactNode | false;
  /** Emits normalized boolean checked values */
  onCheckedChange: (checked: boolean) => void;
  /** Optional test id applied to the root element */
  testId?: string;
}

/**
 * Row selection checkbox with a mixed state for partially selected pages
 *
 * @see https://react-aria.adobe.com/Checkbox
 */
const DataTableCheckbox = ({
  ariaLabel,
  checked,
  className = undefined,
  checkedIcon = '✓',
  indeterminate = false,
  indeterminateIcon = '−',
  onCheckedChange,
  testId = undefined,
}: DataTableCheckboxProps) => {
  const indicatorIcon = indeterminate ? indeterminateIcon : checkedIcon;
  const resolvedIndicatorIcon = indicatorIcon === false ? null : indicatorIcon;

  return (
    <CheckboxField
      aria-label={ariaLabel}
      isIndeterminate={indeterminate}
      isSelected={checked}
      onChange={onCheckedChange}
    >
      <CheckboxButton
        className={className?.checkbox}
        data-slot="checkbox"
        data-testid={testId}
      >
        {checked || indeterminate ? (
          <span
            aria-hidden="true"
            className={className?.checkboxIndicator}
            data-slot="checkbox-indicator"
          >
            {resolvedIndicatorIcon}
          </span>
        ) : null}
      </CheckboxButton>
    </CheckboxField>
  );
};

export default DataTableCheckbox;
