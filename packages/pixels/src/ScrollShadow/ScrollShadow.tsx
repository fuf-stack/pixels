/* eslint-disable react/require-default-props */

import type { CSSProperties, ReactNode } from 'react';

import { forwardRef } from 'react';
import { useObjectRef } from 'react-aria';

import { useStyling } from '../StylingProvider';
import useScrollShadow from './hooks/useScrollShadow';
import { scrollShadowVariants } from './scrollShadowVariants';

type ScrollShadowVisibility =
  'auto' | 'top' | 'bottom' | 'left' | 'right' | 'both' | 'none';

export interface ScrollShadowProps {
  /** Scrollable content */
  children?: ReactNode;
  /** CSS class name */
  className?: string | string[];
  /** Slot name for styling and debugging */
  dataSlot?: string;
  /** Hides the scrollbar */
  hideScrollBar?: boolean;
  /** Direction of scrolling and edge shadows */
  orientation?: 'horizontal' | 'vertical';
  /** Shadow size in pixels */
  size?: number;
  /** Inline styles for the scroll container */
  style?: CSSProperties;
  /** HTML data-testid attribute for e2e tests */
  testId?: string;
  /** Visible edges, auto follows the current scroll position */
  visibility?: ScrollShadowVisibility;
}

/** Scrollable content with fading edges that indicate more content */
const ScrollShadow = forwardRef<HTMLDivElement, ScrollShadowProps>(
  (
    {
      children = null,
      className = undefined,
      dataSlot = undefined,
      hideScrollBar = false,
      orientation = 'vertical',
      size = 40,
      style = undefined,
      testId = undefined,
      visibility = 'auto',
    },
    ref,
  ) => {
    const styling = useStyling();
    const controlRef = useObjectRef(ref);
    useScrollShadow({ children, orientation, ref: controlRef, visibility });

    // className from the scroll surface recipe
    const variants = styling.resolve(scrollShadowVariants, {
      className,
      hideScrollBar,
      orientation,
    });
    const shadowStyle = {
      '--scroll-shadow-size': `${size}px`,
      ...style,
    } as CSSProperties;

    return (
      <div
        ref={controlRef}
        className={variants}
        data-component="scroll-shadow"
        data-orientation={orientation}
        data-slot={dataSlot}
        data-testid={testId}
        style={shadowStyle}
      >
        {children}
      </div>
    );
  },
);

ScrollShadow.displayName = 'ScrollShadow';

export default ScrollShadow;
