import type { ReactNode } from 'react';

import { cn } from '@fuf-stack/pixel-utils';

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
  return (
    <div className={cn('grid gap-6', className)} data-testid={testId}>
      {children}
    </div>
  );
};

export default Grid;
