import type { ReactNode } from 'react';
import type { ClassName, VariantProps } from './progressCircularVariants';

import { useProgressBar } from 'react-aria';
import { FaCheck, FaTimes } from 'react-icons/fa';

import { useIsInitialRenderCycle } from '../hooks/useIsInitialRenderCycle';
import { useStyling } from '../StylingProvider';
import { progressCircularVariants } from './progressCircularVariants';
import ProgressCircularRing from './subcomponents/ProgressCircularRing';

export { progressCircularVariants } from './progressCircularVariants';

export interface ProgressCircularProps {
  /** Accessible name */
  ariaLabel?: string;
  /** CSS class name */
  className?: ClassName;
  /** Progress indicator color */
  color?: VariantProps['color'];
  /** Disables progress animations */
  disableAnimation?: boolean;
  /** Keeps the formatted value and configured color on completion */
  disableFinishedState?: boolean;
  /** Formatter for the value inside the ring */
  format?: (percent?: number) => ReactNode;
  /** Shows an error icon and color instead of the formatted value */
  hasError?: boolean;
  /** Legacy recipe prop, completion is derived from percent */
  isFinished?: boolean;
  /** Completion percentage */
  percent: number;
  /** Progress ring and value size */
  size?: VariantProps['size'];
  /** Stroke width in SVG viewBox units */
  strokeWidth?: number;
}

const defaultFormat = (percent = 0) => {
  return `${percent}%`;
};

/** Progress ring showing completion or an error for a task */
const ProgressCircular = ({
  ariaLabel = 'progress',
  className = undefined,
  color = 'info',
  disableAnimation = false,
  disableFinishedState = false,
  format = defaultFormat,
  hasError = false,
  percent,
  size = 'md',
  strokeWidth = undefined,
}: ProgressCircularProps) => {
  const styling = useStyling();
  const isInitialRenderCycle = useIsInitialRenderCycle();

  // keep rich values and status icons out of ARIA attributes
  const formattedValue = format(percent);
  const valueLabel =
    typeof formattedValue === 'string' || typeof formattedValue === 'number'
      ? String(formattedValue)
      : undefined;
  const { progressBarProps } = useProgressBar({
    'aria-label': ariaLabel,
    value: percent || 0,
    valueLabel: hasError ? 'Error' : valueLabel,
  });

  const isFinished = !hasError && percent >= 100 && !disableFinishedState;
  const percentage = Math.min(100, Math.max(0, percent || 0));

  // classNames from slots
  const variants = styling.resolve(progressCircularVariants, {
    color,
    disableAnimation: isInitialRenderCycle || disableAnimation,
    hasError,
    isFinished,
    size,
  });
  const classNames = styling.variantsToClassNames(variants, className, 'base');

  // errors take precedence over the completed state
  let value = formattedValue;
  if (hasError) {
    value = <FaTimes aria-hidden="true" className={classNames.statusIcon} />;
  } else if (isFinished) {
    value = <FaCheck aria-hidden="true" className={classNames.statusIcon} />;
  }

  return (
    <div
      {...progressBarProps}
      className={classNames.base}
      data-component="progress-circular"
      data-slot="base"
    >
      <div className={classNames.svgWrapper} data-slot="svgWrapper">
        {/* track and completed arc */}
        <ProgressCircularRing
          className={classNames}
          percentage={percentage}
          size={size}
          strokeWidth={strokeWidth}
        />

        {/* formatted value or status icon */}
        <span className={classNames.value} data-slot="value">
          {value}
        </span>
      </div>
    </div>
  );
};

export default ProgressCircular;
