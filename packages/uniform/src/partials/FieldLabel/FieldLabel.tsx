import type { HTMLAttributes, ReactNode } from 'react';
import type { Label as AriaLabel } from 'react-aria-components';

interface FieldLabelProps extends Pick<
  HTMLAttributes<HTMLElement>,
  'aria-level' | 'role'
> {
  /** Label element, React Aria Label preserves the surrounding field context */
  as?: 'label' | 'div' | 'span' | typeof AriaLabel;
  /** Label content */
  children: ReactNode;
  /** CSS class name */
  className?: string;
  /** ID of the labeled control */
  htmlFor?: string;
  /** Label ID */
  id?: string;
  /** Shows the required indicator */
  required?: boolean;
  /** Required indicator CSS class name */
  requiredClassName?: string;
}

/**
 * Shared field label and required indicator
 *
 * Uses a native label by default, with span/div hosts for nested labels and
 * headings, or React Aria Label for fields that supply label context
 *
 * @see https://react-aria.adobe.com/TextField
 * @see https://react-aria.adobe.com/CheckboxGroup
 */
const FieldLabel = ({
  as: Component = 'label',
  children,
  className = undefined,
  htmlFor = undefined,
  id = undefined,
  required = false,
  requiredClassName = 'ml-0.5 text-danger',
  ...props
}: FieldLabelProps) => {
  if (!children) {
    return null;
  }

  return (
    <Component
      {...props}
      className={className}
      data-slot="label"
      htmlFor={htmlFor}
      id={id}
    >
      {children}
      {required ? (
        <span aria-hidden className={requiredClassName}>
          *
        </span>
      ) : null}
    </Component>
  );
};

export default FieldLabel;
