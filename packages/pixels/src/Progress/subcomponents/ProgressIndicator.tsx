import { motion, useReducedMotion } from '@fuf-stack/pixel-motion';

interface ProgressIndicatorProps {
  /** CSS class name */
  className: string;
  /** Disables movement of an indeterminate indicator */
  disableAnimation: boolean;
  /** Shows activity without a known completion percentage */
  indeterminate: boolean;
  /** Filled percentage within the range from zero to one hundred */
  percentage: number;
}

/** Filled track segment with an optional repeating activity animation */
const ProgressIndicator = ({
  className,
  disableAnimation,
  indeterminate,
  percentage,
}: ProgressIndicatorProps) => {
  const reducedMotion = useReducedMotion();

  if (indeterminate && !disableAnimation && !reducedMotion) {
    return (
      <motion.div
        animate={{
          transform: [
            'translateX(-50%) scaleX(0.2)',
            'translateX(100%) scaleX(1)',
          ],
        }}
        className={className}
        data-slot="indicator"
        transition={{
          duration: 1.5,
          ease: [0.65, 0.815, 0.735, 0.395],
          repeat: Infinity,
        }}
      />
    );
  }

  // keep a visible activity segment when motion is disabled
  const transform = indeterminate
    ? 'translateX(25%) scaleX(0.5)'
    : `translateX(-${100 - percentage}%)`;

  return (
    <div className={className} data-slot="indicator" style={{ transform }} />
  );
};

export default ProgressIndicator;
