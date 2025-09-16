import { describe, expect, it } from 'vitest';

import * as OriginalFramerMotion from 'framer-motion';

import * as FramerMotionReexport from '.';

describe('Framer Motion Re-exports', () => {
  it('should re-export all items from framer-motion', () => {
    const reexportKeys = Object.keys(FramerMotionReexport);
    const originalKeys = Object.keys(OriginalFramerMotion);

    expect(reexportKeys).toEqual(originalKeys);
  });

  it('should maintain the same types for exported items', () => {
    // Test a few key exports to ensure they maintain the same type
    expect(typeof FramerMotionReexport.motion).toBe(
      typeof OriginalFramerMotion.motion,
    );
    expect(typeof FramerMotionReexport.animate).toBe(
      typeof OriginalFramerMotion.animate,
    );
    expect(typeof FramerMotionReexport.useAnimation).toBe(
      typeof OriginalFramerMotion.useAnimation,
    );
  });

  it('should have working motion components', () => {
    expect(FramerMotionReexport.motion.div).toBeTruthy();
    expect(FramerMotionReexport.motion.button).toBeTruthy();
    expect(FramerMotionReexport.motion.span).toBeTruthy();
  });
});
