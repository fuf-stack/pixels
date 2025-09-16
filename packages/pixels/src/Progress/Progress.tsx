import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { ReactNode } from 'react';

import { Progress as HeroProgress } from '@heroui/progress';

import { tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

import { useIsInitialRenderCycle } from '../hooks';

// progress styling variants
export const progressVariants = tv({
  slots: {
    // wrapper around the whole component
    base: '',
    // indicator of the progress (finished part)
    indicator: '',
    // label at the top left of the progress bar
    label: '',
    // wrapper around progress label and label span
    labelWrapper: '',
    // track of the progress (not finished part)
    track: '',
    // span around the progress value
    value: '',
  },
  variants: {
    // see: https://github.com/heroui-inc/heroui/blob/canary/packages/core/theme/src/components/progress.ts
    color: {
      danger: {
        indicator: 'bg-danger',
      },
      default: {
        indicator: 'bg-default-400',
      },
      info: {
        indicator: 'bg-info',
      },
      primary: {
        indicator: 'bg-primary',
      },
      secondary: {
        indicator: 'bg-secondary',
      },
      success: {
        indicator: 'bg-success',
      },
      warning: {
        indicator: 'bg-warning',
      },
    },
  },
});

export type VariantProps = TVProps<typeof progressVariants>;
type ClassName = TVClassName<typeof progressVariants>;

export interface ProgressProps extends VariantProps {
  /** sets HTML aria-label attribute */
  ariaLabel?: string;
  /** CSS class name */
  className?: ClassName;
  /** color of the progress bar */
  color?: VariantProps['color'];
  /** disables all animations */
  disableAnimation?: boolean;
  /** disables special finished state (checkmark icon and success color) */
  disableFinishedState?: boolean;
  /** function to format the progress value */
  format?: (percent: number) => ReactNode;
  /** shows indeterminate progress animation */
  indeterminate?: boolean;
  /** label of the progress bar */
  label?: ReactNode;
  /** percentage / progress of the progress bar */
  percent: number;
  /** whether to show the value label */
  showValueLabel?: boolean;
  /** size of the progress bar */
  size?: 'sm' | 'md' | 'lg';
  /** HTML data-testid attribute used in e2e tests */
  testId?: string;
}

/** formats percent with percent sign */
const defaultFormat = (percent = 0) => {
  return `${percent}%`;
};

/**
 * Progress component based on [HeroUI Progress](https://www.heroui.com//docs/components/progress)
 */
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
  // used to disable animation on initial render cycle
  const isInitialRenderCycle = useIsInitialRenderCycle();

  // Apply finished state if percent is 100 or more and not disabled by disableFinishedState
  const isFinished = percent >= 100 && !disableFinishedState;

  // handle special states
  let progressColor: VariantProps['color'] = color;
  if (isFinished) {
    progressColor = 'success';
  }

  const variants = progressVariants({ color: progressColor });
  const classNames = variantsToClassNames(variants, className, 'base');

  const value = format(percent);

  return (
    <HeroProgress
      aria-label={ariaLabel}
      classNames={classNames}
      data-testid={testId}
      disableAnimation={isInitialRenderCycle || disableAnimation}
      isIndeterminate={indeterminate}
      label={label}
      showValueLabel={showValueLabel}
      size={size}
      value={percent || 0}
      valueLabel={!!percent && value}
    />
  );
};

export default Progress;
