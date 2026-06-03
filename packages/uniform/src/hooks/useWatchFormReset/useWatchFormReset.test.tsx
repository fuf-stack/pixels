import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderHook } from '@testing-library/react';

import { useWatchFormReset } from './useWatchFormReset';

let subscribedListener: (() => void) | undefined;
const mockSubscribe = vi.fn((listener: () => void) => {
  subscribedListener = listener;
  return vi.fn();
});

vi.mock('../useFormContext/useFormContext', () => ({
  useFormContext: () => ({
    formReset: {
      subscribe: mockSubscribe,
      notify: vi.fn(),
    },
  }),
}));

describe('useWatchFormReset', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    subscribedListener = undefined;
  });

  it('should subscribe to form reset notifications', () => {
    const onReset = vi.fn();

    renderHook(() =>
      useWatchFormReset({
        onReset,
      }),
    );

    expect(mockSubscribe).toHaveBeenCalledTimes(1);
    expect(mockSubscribe).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should fire when reset notification is emitted', () => {
    const onReset = vi.fn();

    renderHook(() =>
      useWatchFormReset({
        onReset,
      }),
    );

    subscribedListener?.();

    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('should unsubscribe on unmount', () => {
    const onReset = vi.fn();
    const unsubscribe = vi.fn();
    mockSubscribe.mockReturnValueOnce(unsubscribe);

    const { unmount } = renderHook(() =>
      useWatchFormReset({
        onReset,
      }),
    );

    unmount();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('should not fire on mount', () => {
    const onReset = vi.fn();

    renderHook(() =>
      useWatchFormReset({
        onReset,
      }),
    );

    expect(onReset).not.toHaveBeenCalled();
  });
});
