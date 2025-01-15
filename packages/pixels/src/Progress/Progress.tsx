import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { ReactNode } from 'react';

import { Progress as NextProgress } from '@nextui-org/progress';

import { tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

// progress styling variants
export const progressVariants = tv({
  slots: {
    base: '', // wrapper around the whole component
    indicator: '', // indicator of the progress (finished part)
    label: '', // label at the top left of the progress bar
    labelWrapper: '', // wrapper around progress label and label span
    track: '', // track of the progress (not finished part)
    value: '', // span around the progress value
  },
  variants: {
    // See: https://github.com/nextui-org/nextui/blob/canary/packages/core/theme/src/components/progress.ts
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
  /** CSS class name */
  className?: ClassName;
  /** color of the progress bar */
  color?: VariantProps['color'];
  /** function to format the progress value */
  format?: (percent: number) => ReactNode;
  /** label of the progress bar */
  label?: ReactNode;
  /** percentage/progress of the progress bar */
  percent: number;
  /** whether to show the value label */
  showValueLabel?: boolean;
  /** size of the progress bar */
  size?: 'sm' | 'md' | 'lg' | undefined;
  /** whether to show success color on complete */
  successOnComplete?: boolean;
  /** HTML data-testid attribute used in e2e tests */
  testId?: string;
}

const defaultFormat = (percent: number) => `${percent}%`;

/**
 * Progress component based on [NextUI Progress](https://nextui.org/docs/components/progress)
 */
const Progress = ({
  className = undefined,
  color = 'primary',
  format = defaultFormat,
  label = undefined,
  percent,
  showValueLabel = true,
  size = 'md',
  successOnComplete = false,
  testId = undefined,
}: ProgressProps) => {
  const processedColor =
    successOnComplete && percent >= 100 ? 'success' : color;

  const variants = progressVariants({ color: processedColor });
  const classNames = variantsToClassNames(variants, className, 'base');

  const value = format(percent);

  return (
    <NextProgress
      aria-label="Loading..."
      classNames={classNames}
      data-testid={testId}
      formatOptions={undefined}
      label={label}
      showValueLabel={showValueLabel}
      size={size}
      value={percent || 0}
      valueLabel={percent && value}
    />
  );
};

export default Progress;
