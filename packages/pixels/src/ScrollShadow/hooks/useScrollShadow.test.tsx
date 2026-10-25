import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useRef } from 'react';

import { act, fireEvent, render } from '@testing-library/react';

import useScrollShadow from './useScrollShadow';

let resized: () => void;
let mutated: () => void;
const disconnect = vi.fn();
const observe = vi.fn();

const createObserver = (onCreate: (callback: () => void) => void) =>
  class {
    constructor(callback: () => void) {
      onCreate(callback);
    }

    observe = observe;

    disconnect = disconnect;
  };

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    createObserver((callback) => {
      resized = callback;
    }),
  );
  vi.stubGlobal(
    'MutationObserver',
    createObserver((callback) => {
      mutated = callback;
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

const Surface = ({
  orientation = 'vertical',
  visibility = 'auto',
}: {
  orientation?: 'vertical' | 'horizontal';
  visibility?: 'auto' | 'both' | 'none' | 'top' | 'bottom' | 'left' | 'right';
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useScrollShadow({ ref, orientation, visibility });
  return (
    <div ref={ref}>
      <div>Content</div>
    </div>
  );
};

const measure = (element: Element, values: Record<string, number>) => {
  Object.entries(values).forEach(([key, value]) => {
    Object.defineProperty(element, key, { configurable: true, value });
  });
  fireEvent.scroll(element);
};

describe('useScrollShadow', () => {
  it.each(['vertical', 'horizontal'] as const)(
    'tracks both ends and the middle for %s scrolling',
    (orientation) => {
      const { container } = render(<Surface orientation={orientation} />);
      const element = container.firstElementChild as HTMLElement;
      const horizontal = orientation === 'horizontal';
      const start = horizontal ? 'left' : 'top';
      const end = horizontal ? 'right' : 'bottom';
      const offset = horizontal ? 'scrollLeft' : 'scrollTop';
      const viewport = horizontal ? 'clientWidth' : 'clientHeight';
      const content = horizontal ? 'scrollWidth' : 'scrollHeight';

      measure(element, { [offset]: 0, [viewport]: 100, [content]: 300 });
      expect(element).toHaveAttribute(`data-${start}-scroll`, 'false');
      expect(element).toHaveAttribute(`data-${end}-scroll`, 'true');

      measure(element, { [offset]: 50 });
      expect(element).toHaveAttribute(`data-${start}-${end}-scroll`, 'true');
      expect(element).not.toHaveAttribute(`data-${start}-scroll`);

      measure(element, { [offset]: 200 });
      expect(element).toHaveAttribute(`data-${start}-scroll`, 'true');
      expect(element).toHaveAttribute(`data-${end}-scroll`, 'false');
      expect(element).not.toHaveAttribute(`data-${start}-${end}-scroll`);

      measure(element, { [offset]: 0, [content]: 100 });
      expect(element).toHaveAttribute(`data-${end}-scroll`, 'false');
    },
  );

  it.each(['top', 'bottom', 'left', 'right', 'both', 'none'] as const)(
    'keeps explicit %s visibility while scrolling',
    (visibility) => {
      const { container } = render(<Surface visibility={visibility} />);
      const element = container.firstElementChild as HTMLElement;
      measure(element, { scrollTop: 20, clientHeight: 100, scrollHeight: 400 });
      const active = Array.from(element.attributes).filter(
        (attribute) =>
          attribute.name.startsWith('data-') && attribute.value === 'true',
      );
      expect(active.map((attribute) => attribute.name)).toEqual(
        visibility === 'none'
          ? []
          : [
              `data-${visibility === 'both' ? 'top-bottom' : visibility}-scroll`,
            ],
      );
    },
  );

  it('clears old direction attributes when orientation or visibility changes', () => {
    const { container, rerender } = render(<Surface visibility="both" />);
    const element = container.firstElementChild as HTMLElement;
    rerender(<Surface orientation="horizontal" visibility="both" />);
    expect(element).not.toHaveAttribute('data-top-bottom-scroll');
    expect(element).toHaveAttribute('data-left-right-scroll', 'true');
    rerender(<Surface visibility="none" />);
    expect(element).not.toHaveAttribute('data-left-right-scroll');
  });

  it('updates after resize and content changes and disconnects on unmount', () => {
    const { container, unmount } = render(<Surface />);
    const element = container.firstElementChild as HTMLElement;
    Object.defineProperty(element, 'scrollHeight', {
      configurable: true,
      value: 300,
    });
    act(() => resized());
    expect(element).toHaveAttribute('data-bottom-scroll', 'true');

    Object.defineProperty(element, 'scrollHeight', {
      configurable: true,
      value: 0,
    });
    act(() => mutated());
    expect(element).toHaveAttribute('data-bottom-scroll', 'false');
    expect(observe).toHaveBeenCalledWith(element.firstElementChild);
    disconnect.mockClear();
    unmount();
    expect(disconnect).toHaveBeenCalledTimes(2);
  });

  it('uses physical edges for negative RTL horizontal offsets', () => {
    const { container } = render(<Surface orientation="horizontal" />);
    const element = container.firstElementChild as HTMLElement;
    element.style.direction = 'rtl';
    measure(element, { scrollLeft: 0, clientWidth: 100, scrollWidth: 300 });
    expect(element).toHaveAttribute('data-left-scroll', 'true');
    expect(element).toHaveAttribute('data-right-scroll', 'false');
    measure(element, { scrollLeft: -200 });
    expect(element).toHaveAttribute('data-left-scroll', 'false');
    expect(element).toHaveAttribute('data-right-scroll', 'true');
  });

  it('retains scrolling and window resizing without ResizeObserver', () => {
    vi.stubGlobal('ResizeObserver', undefined);
    const { container } = render(<Surface />);
    const element = container.firstElementChild as HTMLElement;
    Object.defineProperty(element, 'scrollHeight', {
      configurable: true,
      value: 300,
    });
    fireEvent(window, new Event('resize'));
    expect(element).toHaveAttribute('data-bottom-scroll', 'true');
  });
});
