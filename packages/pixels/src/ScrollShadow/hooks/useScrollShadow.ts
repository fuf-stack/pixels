import type { RefObject } from 'react';
import type { ScrollShadowProps } from '../ScrollShadow';

import { useEffect } from 'react';

interface UseScrollShadowProps extends Pick<
  ScrollShadowProps,
  'children' | 'orientation' | 'visibility'
> {
  /** Scrollable element whose hidden edges are measured */
  ref: RefObject<HTMLDivElement | null>;
}

const edges = ['top', 'bottom', 'top-bottom', 'left', 'right', 'left-right'];

/**
 * Keeps edge masks in sync with scrolling and content or container resizing
 *
 * Measures the existing container without adding a content wrapper, so flex and
 * grid children keep their layout, explicit visibility modes bypass measurement
 */
const useScrollShadow = ({
  children,
  orientation,
  ref,
  visibility,
}: UseScrollShadowProps) => {
  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return undefined;
    }

    const horizontal = orientation === 'horizontal';
    const before = horizontal ? 'left' : 'top';
    const after = horizontal ? 'right' : 'bottom';

    const clearAttributes = () => {
      edges.forEach((edge) => {
        element.removeAttribute(`data-${edge}-scroll`);
      });
    };

    const update = () => {
      clearAttributes();

      if (visibility !== 'auto') {
        const edge = visibility === 'both' ? `${before}-${after}` : visibility;
        if (edge !== 'none') {
          element.setAttribute(`data-${edge}-scroll`, 'true');
        }
        return;
      }

      const position = horizontal ? element.scrollLeft : element.scrollTop;
      const viewport = horizontal ? element.clientWidth : element.clientHeight;
      const content = horizontal ? element.scrollWidth : element.scrollHeight;
      const extent = Math.max(0, content - viewport);

      // horizontal RTL scrolling uses negative offsets from the right edge
      const rtl = horizontal && getComputedStyle(element).direction === 'rtl';
      const offset = rtl ? extent + position : position;
      const hasBefore = offset > 0;
      const hasAfter = offset < extent;

      if (hasBefore && hasAfter) {
        element.setAttribute(`data-${before}-${after}-scroll`, 'true');
      } else {
        element.setAttribute(`data-${before}-scroll`, String(hasBefore));
        element.setAttribute(`data-${after}-scroll`, String(hasAfter));
      }
    };

    update();
    element.addEventListener('scroll', update, { passive: true });

    // observe children too, their size can change without resizing the container
    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(update);
    const observeContent = () => {
      resizeObserver?.disconnect();
      resizeObserver?.observe(element);
      Array.from(element.children).forEach((child) => {
        resizeObserver?.observe(child);
      });
      update();
    };
    const mutationObserver = new MutationObserver(observeContent);
    observeContent();
    window.addEventListener('resize', update);
    mutationObserver.observe(element, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      element.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      resizeObserver?.disconnect();
      mutationObserver.disconnect();
      clearAttributes();
    };
  }, [children, orientation, ref, visibility]);
};

export default useScrollShadow;
