import type { ReactNode } from 'react';

interface BreadcrumbSeparatorProps {
  /** Custom separator replacing the chevron */
  children?: ReactNode;
  /** CSS class name */
  className: string;
  /** Disabled appearance of the preceding item */
  disabled: boolean;
}

/** Decorative separator excluded from the breadcrumb's accessible name */
const BreadcrumbSeparator = ({
  children = undefined,
  className,
  disabled,
}: BreadcrumbSeparatorProps) => {
  return (
    <span
      aria-hidden="true"
      className={className}
      data-disabled={disabled || undefined}
      data-slot="separator"
    >
      {children === undefined ? (
        <svg
          aria-hidden="true"
          fill="none"
          height="1em"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          width="1em"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      ) : (
        children
      )}
    </span>
  );
};

export default BreadcrumbSeparator;
