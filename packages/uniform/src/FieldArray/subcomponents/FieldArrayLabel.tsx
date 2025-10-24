import type { ReactNode } from 'react';

import { cn } from '@fuf-stack/pixel-utils';

import { useUniformField } from '../../hooks';

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
  const { getLabelProps, label } = useUniformField({
    name,
    showInvalidWhen: 'immediate',
    label: _label,
  });

  // when no label is provided, don't render anything
  if (!_label) {
    return null;
  }

  return (
    <div
      {...getLabelProps()}
      aria-level={3}
      className={cn(getLabelProps()?.className, className)}
      role="heading"
    >
      {label}
    </div>
  );
};

export default FieldArrayLabel;
