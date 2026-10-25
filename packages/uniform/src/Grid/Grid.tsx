import type { ReactNode } from 'react';

import { useStyling } from '@fuf-stack/pixels/StylingProvider';

export interface GridProps {
  /** child components */
  children?: ReactNode;
  /** CSS class name */
  className?: string;
  /** HTML data-testid attribute used in e2e tests */
  testId?: string;
}

/**
 * Defines the default grid for form components
 */
const Grid = ({
  children = null,
  className = undefined,
  testId = undefined,
}: GridProps) => {
  const { cn } = useStyling();
  return (
    <div
      className={cn('grid gap-6', className)}
      data-component="grid"
      data-testid={testId}
    >
      {children}
    </div>
  );
};

export default Grid;
