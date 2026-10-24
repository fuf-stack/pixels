import type { HTMLAttributes, ReactNode } from 'react';

interface FieldDescriptionProps extends HTMLAttributes<HTMLDivElement> {
  /** Help text */
  children: ReactNode;
  /** CSS class name */
  className?: string;
}

/** Help text associated with a field through its description ID */
const FieldDescription = ({ children, ...props }: FieldDescriptionProps) => {
  if (!children) {
    return null;
  }

  return (
    <div data-slot="description" {...props}>
      {children}
    </div>
  );
};

export default FieldDescription;
