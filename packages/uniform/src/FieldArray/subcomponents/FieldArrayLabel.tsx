import type { ReactNode } from 'react';

import { cn } from '@fuf-stack/pixel-utils';

import { useUniformField } from '../../hooks/useUniformField';

export interface FieldArrayLabelProps {
  /** CSS class name */
  className?: string;
  /** Label content */
  label: ReactNode;
  /** Field name */
  name: string;
}

/**
 * Renders the label for a FieldArray component.
 *
 * This component handles displaying the array label with proper accessibility
 * attributes using the label props from useUniformField.
 */
const FieldArrayLabel = ({
  className = undefined,
  label: _label,
  name,
}: FieldArrayLabelProps) => {
  const { error, getLabelProps, invalid, label } = useUniformField({
    name,
    label: _label,
  });

  // when no label is provided, don't render anything
  if (!_label) {
    return null;
  }

  // @ts-expect-error - error._errors exists but not typed
  const hasErrors = invalid && error?._errors;

  return (
    <div
      {...getLabelProps()}
      aria-level={3}
      role="heading"
      className={cn(getLabelProps()?.className, className, {
        // when there are no array level errors, the label should have foreground color
        'text-foreground!': !hasErrors,
      })}
    >
      {label}
    </div>
  );
};

export default FieldArrayLabel;
