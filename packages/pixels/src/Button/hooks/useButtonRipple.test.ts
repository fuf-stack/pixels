import type { ButtonProps } from 'react-aria-components';

import { describe, expect, it } from 'vitest';

import { act, renderHook } from '@testing-library/react';

import { useButtonRipple } from './useButtonRipple';

type PressEvent = Parameters<NonNullable<ButtonProps['onPress']>>[0];

const createPress = (x: number, y: number): PressEvent => {
  const target = document.createElement('button');
  Object.defineProperties(target, {
    clientWidth: { value: 100 },
    clientHeight: { value: 40 },
  });

  return {
    type: 'press',
    pointerType: 'mouse',
    target,
    x,
    y,
    shiftKey: false,
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    continuePropagation: () => {},
  };
};

describe('useButtonRipple', () => {
  it('centers feedback at the press and retains overlapping animations independently', () => {
    const { result } = renderHook(() => useButtonRipple());

    act(() => {
      result.current.handleRipplePress(createPress(20, 10));
    });
    act(() => {
      result.current.handleRipplePress(createPress(80, 30));
    });
    expect(result.current.ripples).toEqual([
      { key: 0, size: 100, x: -30, y: -40 },
      { key: 1, size: 100, x: 30, y: -20 },
    ]);

    act(() => {
      result.current.handleRippleComplete(0);
    });
    expect(result.current.ripples.map((ripple) => ripple.key)).toEqual([1]);

    act(() => {
      result.current.handleRippleComplete(1);
    });
    expect(result.current.ripples).toEqual([]);
  });

  it('discards active feedback when ripple animation is turned off', () => {
    const { result, rerender } = renderHook(
      ({ enabled }) => useButtonRipple(enabled),
      { initialProps: { enabled: true } },
    );

    act(() => {
      result.current.handleRipplePress(createPress(20, 10));
    });
    rerender({ enabled: false });
    expect(result.current.ripples).toEqual([]);

    rerender({ enabled: true });
    expect(result.current.ripples).toEqual([]);
  });
});
