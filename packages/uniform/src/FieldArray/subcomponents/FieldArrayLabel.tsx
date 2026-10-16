import type { ReactNode } from 'react';

import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import useUniformField from '../../hooks/useUniformField/useUniformField';
import FieldLabel from '../../partials/FieldLabel/FieldLabel';

export interface FieldArrayLabelProps {
  /** CSS class name */
  className?: string;
  /** Label content */
  label: ReactNode;
  /** Optional heading ID supplied by the owning group. */
  id?: string;
  /** Field name */
  name: string;
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
  label: _label,
  name,
}: FieldArrayLabelProps) => {
  const { error, ids, invalid, label, required } = useUniformField({
    name,
    label: _label,
  });

  const { cn } = useStyling();

  // when no label is provided, don't render anything
  if (!_label) {
    return null;
  }

  // @ts-expect-error - error._errors exists but not typed
  const hasErrors = invalid && error?._errors;

  return (
    <FieldLabel
      as="div"
      id={id ?? ids.label}
      aria-level={3}
      className={cn(
        'block max-w-full overflow-hidden text-ellipsis subpixel-antialiased text-small',
        hasErrors ? 'text-danger!' : undefined,
        className,
        {
          // when there are no array level errors, the label should have foreground color
          'text-foreground!': !hasErrors,
        },
      )}
      role="heading"
      required={required}
      requiredClassName="ms-0.5 text-danger"
    >
      {label}
    </FieldLabel>
  );
};

export default FieldArrayLabel;
