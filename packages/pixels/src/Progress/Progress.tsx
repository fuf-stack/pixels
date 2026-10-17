import type { ReactNode } from 'react';
import type { ClassName, VariantProps } from './progressVariants';

import { useProgressBar } from 'react-aria';

import { useIsInitialRenderCycle } from '../hooks/useIsInitialRenderCycle';
import { useStyling } from '../StylingProvider';
import { progressVariants } from './progressVariants';
import ProgressIndicator from './subcomponents/ProgressIndicator';

export { progressVariants } from './progressVariants';
export type { VariantProps } from './progressVariants';

export interface ProgressProps {
  /** Accessible name */
  ariaLabel?: string;
  /** CSS class name */
  className?: ClassName;
  /** Progress indicator color */
  color?: VariantProps['color'];
  /** Disables progress animations */
  disableAnimation?: boolean;
  /** Keeps the configured color when progress reaches one hundred */
  disableFinishedState?: boolean;
  /** Formatter for the displayed percentage */
  format?: (percent: number) => ReactNode;
  /** Shows activity without a known completion percentage */
  indeterminate?: boolean;
  /** Description above the progress track */
  label?: ReactNode;
  /** Completion percentage */
  percent: number;
  /** Shows the formatted percentage above the track */
  showValueLabel?: boolean;
  /** Progress track and label size */
  size?: 'sm' | 'md' | 'lg';
  /** HTML data-testid attribute for e2e tests */
  testId?: string;
}

const defaultFormat = (percent = 0) => {
  return `${percent}%`;
};

/** Progress bar showing how much of a task is complete */
const Progress = ({
  ariaLabel = 'progress',
  className = undefined,
  color = 'info',
  disableAnimation = false,
  disableFinishedState = false,
  format = defaultFormat,
  indeterminate = false,
  label = undefined,
  percent,
  showValueLabel = false,
  size = 'md',
  testId = undefined,
}: ProgressProps) => {
  const styling = useStyling();
  const isInitialRenderCycle = useIsInitialRenderCycle();
  // rich content is rendered visually, ARIA keeps a plain value description
  const value = format(percent);
  const valueLabel =
    typeof value === 'string' || typeof value === 'number'
      ? String(value)
      : undefined;
  const { progressBarProps, labelProps } = useProgressBar({
    'aria-label': ariaLabel,
    isIndeterminate: indeterminate,
    label,
    value: percent || 0,
    valueLabel: percent ? valueLabel : undefined,
  });

  const isFinished = percent >= 100 && !disableFinishedState;
  const percentage = Math.min(100, Math.max(0, percent || 0));
  const displayValue = percent ? value : progressBarProps['aria-valuetext'];

  // classNames from slots
  const variants = styling.resolve(progressVariants, {
    color: isFinished ? 'success' : color,
    disableAnimation: isInitialRenderCycle || disableAnimation,
    indeterminate,
    size,
  });
  const classNames = styling.variantsToClassNames(variants, className, 'base');

  return (
    <div
      {...progressBarProps}
      className={classNames.base}
      data-indeterminate={indeterminate || undefined}
      data-slot="base"
      data-testid={testId}
    >
      {/* description and formatted progress */}
      {label || showValueLabel ? (
        <div className={classNames.labelWrapper} data-slot="labelWrapper">
          {label ? (
            <span
              {...labelProps}
              className={classNames.label}
              data-slot="label"
            >
              {label}
            </span>
          ) : null}
          {showValueLabel ? (
            <span className={classNames.value} data-slot="value">
              {indeterminate ? null : displayValue}
            </span>
          ) : null}
        </div>
      ) : null}

      {/* track and filled indicator */}
      <div className={classNames.track} data-slot="track">
        <ProgressIndicator
          className={classNames.indicator}
          disableAnimation={disableAnimation}
          indeterminate={indeterminate}
          percentage={percentage}
        />
      </div>
    </div>
  );
};

export default Progress;
