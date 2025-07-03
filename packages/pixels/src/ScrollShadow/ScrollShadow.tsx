import type { ReactNode } from 'react';

import { ScrollShadow } from '@heroui/scroll-shadow';

import { cn } from '@fuf-stack/pixel-utils';

export interface ScrollShadowProps {
  /** child components */
  children?: ReactNode;
  /** CSS class name */
  className?: string | string[];
  /** Hides the scrollbar */
  hideScrollBar?: boolean;
  /** Orientation of the scroll shadow */
  orientation?: 'horizontal' | 'vertical';
  /** Shadow size in pixels */
  size?: number;
  /** HTML data-testid attribute used in e2e tests */
  testId?: string;
}

/**
 * Scroll Shadow component based on [HeroUI Scroll Shadow](https://www.heroui.com//docs/components/scroll-shadow)
 */
export default ({
  children = null,
  className = undefined,
  hideScrollBar = false,
  orientation = 'vertical',
  size = 40,
  testId = undefined,
}: ScrollShadowProps) => (
  <ScrollShadow
    className={cn(className)}
    data-testid={testId}
    hideScrollBar={hideScrollBar}
    orientation={orientation}
    size={size}
  >
    {children}
  </ScrollShadow>
);
