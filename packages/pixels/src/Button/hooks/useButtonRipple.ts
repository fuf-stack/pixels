import type { ButtonProps } from 'react-aria-components';

import { useRef, useState } from 'react';

/** Position and size of one active press ripple */
export interface ButtonRippleState {
  /** Stable animation identity */
  key: number;
  /** Diameter covering the button */
  size: number;
  /** Horizontal offset from the button edge */
  x: number;
  /** Vertical offset from the button edge */
  y: number;
}

/** Tracks overlapping press ripples until their animations finish */
export const useButtonRipple = (enabled = true) => {
  const nextKey = useRef(0);
  const [ripples, setRipples] = useState<ButtonRippleState[]>([]);
  const [previousEnabled, setPreviousEnabled] = useState(enabled);

  // discard feedback when animations are disabled during an active press
  if (previousEnabled !== enabled) {
    setPreviousEnabled(enabled);
    if (!enabled) {
      setRipples([]);
    }
  }

  // center the ripple at the pointer or keyboard press coordinates
  const handleRipplePress: NonNullable<ButtonProps['onPress']> = (event) => {
    const size = Math.max(event.target.clientWidth, event.target.clientHeight);
    const ripple = {
      key: nextKey.current,
      size,
      x: event.x - size / 2,
      y: event.y - size / 2,
    };
    nextKey.current += 1;

    setRipples((current) => {
      return [...current, ripple];
    });
  };

  // release completed animations without interrupting newer presses
  const handleRippleComplete = (key: number) => {
    setRipples((current) => {
      return current.filter((ripple) => {
        return ripple.key !== key;
      });
    });
  };

  return { handleRippleComplete, handleRipplePress, ripples };
};
