import type { ReactNode } from 'react';

import { Checkbox } from '@base-ui/react/checkbox';

interface CheckboxClassName {
  checkbox?: string;
  checkboxIndicator?: string;
}

export interface DataTableCheckboxProps {
  /** Accessible label for assistive technologies. */
  ariaLabel: string;
  /** Controlled checked state. */
  checked: boolean;
  /** Optional class names for root and indicator nodes. */
  className?: CheckboxClassName;
  /** Enables mixed visual state for parent/select-all behavior. */
  indeterminate?: boolean;
  /** Icon shown for checked state; pass `false` to hide. */
  checkedIcon?: ReactNode | false;
  /** Icon shown for indeterminate state; pass `false` to hide. */
  indeterminateIcon?: ReactNode | false;
  /** Emits normalized boolean checked values. */
  onCheckedChange: (checked: boolean) => void;
  /** Optional test id applied to the root element. */
  testId?: string;
}

/** Small checkbox wrapper used by DataTable selection UI. */
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
    <Checkbox.Root
      aria-label={ariaLabel}
      checked={checked}
      className={className?.checkbox}
      data-slot="checkbox"
      data-testid={testId}
      indeterminate={indeterminate}
      onCheckedChange={(nextChecked) => {
        // Base UI can emit non-boolean-ish values; normalize for table callers.
        onCheckedChange(Boolean(nextChecked));
      }}
    >
      <Checkbox.Indicator
        className={className?.checkboxIndicator}
        data-slot="checkbox-indicator"
      >
        {resolvedIndicatorIcon}
      </Checkbox.Indicator>
    </Checkbox.Root>
  );
};

export default DataTableCheckbox;
