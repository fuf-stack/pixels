import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { CircularProgressProps as HeroCircularProgressProps } from '@heroui/progress';
import type { ReactNode } from 'react';

import { FaCheck, FaTimes } from 'react-icons/fa';

import { CircularProgress as HeroCircularProgress } from '@heroui/progress';
import { circularProgress as heroCircularProgressVariants } from '@heroui/theme';

import { tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

import { useIsInitialRenderCycle } from '../hooks';

export const progressCircularVariants = tv({
  slots: {
    // wrapper around the whole component
    base: '',
    // indicator of the circle (finished part)
    indicator: '',
    // label next to the svgWrapper
    label: '',
    // wrapper for the circle
    svg: '',
    // wrapper around progress svg and value span
    svgWrapper: '',
    // track of the circle (not finished part)
    track: 'stroke-default-300',
    // outer span next to the svg
    value: '',
  },
  variants: {
    color: {
      info: {
        svg: 'text-info',
      },
      // see: https://github.com/heroui-inc/heroui/blob/canary/packages/core/theme/src/components/progress.ts
      ...heroCircularProgressVariants.variants.color,
    },
    hasError: {
      true: {
        svg: 'text-danger',
      },
    },
    isFinished: {
      true: {
        svg: 'text-success',
      },
    },
    size: {
      xs: {
        svg: 'h-10 w-10',
        value: 'text-[0.6rem]',
      },
      sm: {
        svg: 'h-12 w-12',
        value: 'text-xs',
      },
      md: {
        svg: 'h-16 w-16',
        value: 'text-md',
      },
      lg: {
        svg: 'h-20 w-20',
        value: 'text-lg',
      },
      xl: {
        svg: 'h-24 w-24',
        value: 'text-xl',
      },
    },
  },
});

type VariantProps = TVProps<typeof progressCircularVariants>;
type ClassName = TVClassName<typeof progressCircularVariants>;

export interface ProgressCircularProps extends VariantProps {
  /** sets HTML aria-label attribute */
  ariaLabel?: string;
  /** CSS class name */
  className?: ClassName;
  /** color options */
  color?: VariantProps['color'];
  /** disables all animations */
  disableAnimation?: boolean;
  /** formats the display value of the progress in the center */
  format?: (percent?: number) => ReactNode;
  /** enables error version */
  hasError?: boolean;
  /** percentage / progress of the circular progress bar */
  percent: number;
  /** size options */
  size?: VariantProps['size'];
}

/** formats percent with percent sign */
const defaultFormat = (percent = 0) => `${percent}%`;

/**
 * ProgressCircular component based on [HeroUI CircularProgress](https://www.heroui.com/docs/components/circular-progress)
 */
const ProgressCircular = ({
  ariaLabel = 'progress',
  className = undefined,
  format = defaultFormat,
  hasError = false,
  percent,
  disableAnimation = false,
  size = 'md',
  color = 'info',
}: ProgressCircularProps) => {
  // used to disable animation on initial render cycle
  const isInitialRenderCycle = useIsInitialRenderCycle();

  const isFinished = !hasError && percent >= 100;
  const variants = progressCircularVariants({
    color,
    hasError,
    isFinished,
    size,
  });
  const classNames = variantsToClassNames(variants, className, 'base');

  // format value
  let value = format(percent);

  // set strokeWidth based on size prop
  let strokeWidth = 1.6;
  switch (size) {
    case 'xs':
      strokeWidth = 2.2;
      break;
    case 'sm':
      strokeWidth = 2;
      break;
    default:
      break;
  }

  // handle special states
  let progressColor: VariantProps['color'] = color;
  if (hasError) {
    progressColor = 'danger';
    value = <FaTimes className="text-danger" />;
  } else if (isFinished) {
    progressColor = 'success';
    value = <FaCheck className="text-success" />;
  }

  // pass only HeroUI colors as props
  const heroUiColor = Object.keys(
    heroCircularProgressVariants.variants.color,
  ).includes(color)
    ? (progressColor as HeroCircularProgressProps['color'])
    : undefined;

  return (
    <HeroCircularProgress
      aria-label={ariaLabel}
      classNames={classNames}
      color={heroUiColor}
      disableAnimation={isInitialRenderCycle || disableAnimation}
      showValueLabel
      strokeWidth={strokeWidth}
      // we do not use spinner animation when no percent provided
      value={percent || 0}
      valueLabel={value}
    />
  );
};

export default ProgressCircular;
