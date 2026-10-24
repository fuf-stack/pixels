import type { ReactNode } from 'react';

import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import FieldLabel from '../../partials/FieldLabel/FieldLabel';

export interface FieldArrayLabelProps {
  /** CSS class name */
  className?: string;
  /** Optional heading ID supplied by the owning group. */
  id?: string;
  /** Shows an array-level validation failure */
  invalid: boolean;
  /** Field label */
  label: ReactNode;
  /** Marks the array as required */
  required: boolean;
}

/**
 * Renders the label for a FieldArray component.
 *
 * This component handles displaying the array label with proper accessibility
 * attributes using owned heading markup and field state.
 */
const FieldArrayLabel = ({
  className = undefined,
  id = undefined,
  label,
  invalid,
  required,
}: FieldArrayLabelProps) => {
  const { cn } = useStyling();

  // when no label is provided, don't render anything
  if (!label) {
    return null;
  }

  const hasErrors = invalid;

  return (
    <FieldLabel
      aria-level={3}
      as="div"
      className={cn(
        'block max-w-full overflow-hidden text-ellipsis subpixel-antialiased text-small',
        hasErrors ? 'text-danger!' : undefined,
        className,
        {
          // when there are no array level errors, the label should have foreground color
          'text-foreground!': !hasErrors,
        },
      )}
      id={id}
      required={required}
      requiredClassName="ms-0.5 text-danger"
      role="heading"
    >
      {label}
    </FieldLabel>
  );
};

export default FieldArrayLabel;
