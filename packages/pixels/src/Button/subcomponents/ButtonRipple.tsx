import type { ButtonRippleState } from '../hooks/useButtonRipple';

import { motion } from '@fuf-stack/pixel-motion';
import { tv } from '@fuf-stack/pixel-utils';

import { useStyling } from '../../StylingProvider';

const rippleVariants = tv({
  base: 'pointer-events-none absolute inset-0 z-0 origin-center overflow-hidden rounded-full bg-current motion-reduce:hidden',
});

interface ButtonRippleProps {
  /** Removes the completed ripple */
  onComplete: (key: number) => void;
  /** Position and size of the press feedback */
  ripple: ButtonRippleState;
}

/** Expanding press feedback clipped by the surrounding button */
const ButtonRipple = ({ onComplete, ripple }: ButtonRippleProps) => {
  const styling = useStyling();

  const duration = Math.min(
    Math.max(0.01 * ripple.size, 0.2),
    ripple.size > 100 ? 0.75 : 0.5,
  );
  const className = styling.resolve(rippleVariants);

  // release this animation when the fade finishes
  const handleComplete = () => {
    onComplete(ripple.key);
  };

  return (
    <motion.span
      animate={{
        transform: `translate(${ripple.x}px, ${ripple.y}px) scale(2)`,
        opacity: 0,
      }}
      aria-hidden
      className={className}
      data-slot="ripple"
      initial={{
        transform: `translate(${ripple.x}px, ${ripple.y}px) scale(0)`,
        opacity: 0.35,
      }}
      onAnimationComplete={handleComplete}
      style={{ width: ripple.size, height: ripple.size }}
      transition={{ duration }}
    />
  );
};

export default ButtonRipple;
