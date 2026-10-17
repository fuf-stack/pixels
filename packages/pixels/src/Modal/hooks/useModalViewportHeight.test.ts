import { afterEach, describe, expect, it, vi } from 'vitest';

import { act, renderHook } from '@testing-library/react';

import useModalViewportHeight from './useModalViewportHeight';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useModalViewportHeight', () => {
  it('tracks the visible viewport when the mobile keyboard resizes it', () => {
    const viewport = Object.assign(new EventTarget(), { height: 480 });
    vi.stubGlobal('visualViewport', viewport);
    vi.stubGlobal('innerHeight', 800);

    const { result } = renderHook(useModalViewportHeight);
    expect(result.current).toBe(480);

    act(() => {
      viewport.height = 320;
      viewport.dispatchEvent(new Event('resize'));
    });
    expect(result.current).toBe(320);
  });

  it('tracks window height when VisualViewport is unavailable', () => {
    vi.stubGlobal('visualViewport', undefined);
    vi.stubGlobal('innerHeight', 800);

    const { result } = renderHook(useModalViewportHeight);
    expect(result.current).toBe(800);

    act(() => {
      vi.stubGlobal('innerHeight', 600);
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current).toBe(600);
  });
});
