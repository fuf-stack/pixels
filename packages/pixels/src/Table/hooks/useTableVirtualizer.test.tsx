import { describe, expect, it } from 'vitest';

import { getTableWindow } from './useTableVirtualizer';

describe('Table virtual row bounds', () => {
  it('includes overscan at the beginning, middle and end', () => {
    expect(getTableWindow(100, 0, 200, 40)).toEqual({ start: 0, end: 10 });
    expect(getTableWindow(100, 800, 200, 40)).toEqual({ start: 15, end: 30 });
    expect(getTableWindow(100, 3800, 200, 40)).toEqual({ start: 90, end: 100 });
  });

  it('clamps empty, negative and stale scroll positions after rows are removed', () => {
    expect(getTableWindow(0, 200, 200, 40)).toEqual({ start: 0, end: 0 });
    expect(getTableWindow(100, -100, 200, 40)).toEqual({ start: 0, end: 10 });
    expect(getTableWindow(2, 20000, 200, 40)).toEqual({ start: 0, end: 2 });
  });
});
