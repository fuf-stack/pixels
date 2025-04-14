import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { ReactNode } from 'react';

import { FaCheck, FaTimes } from 'react-icons/fa';

import { CircularProgress as NextCircularProgress } from '@heroui/progress';

import { tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

export const circularProgressVariants = tv({
  slots: {
    base: '', // wrapper around the whole component
    svgWrapper: '', // wrapper around progress svg and value span
    svg: '', // wrapper for the circle
    track: 'stroke-default-50', // track of the circle (not finished part)
    indicator: '', // indicator of the circle (finished part)
    value: '', // outer span next to the svg
    label: '', // label next to the svgWrapper
  },
  variants: {
    size: {
      xs: {
        value: 'text-xs',
        svg: 'h-10 w-10',
      },
      sm: {
        value: 'text-sm',
        svg: 'h-12 w-12',
      },
      md: {
        svg: 'h-14 w-14',
        value: 'text-md',
      },
      lg: {
        svg: 'h-16 w-16',
        value: 'text-lg',
      },
    },
  },
});

export type VariantProps = TVProps<typeof circularProgressVariants>;
type ClassName = TVClassName<typeof circularProgressVariants>;

export const circularProgressStyleVariantOptions = [
  'default',
  'warning',
  'danger',
  'success',
  'primary',
] as const;
export type CircularProgressStyleVariant =
  (typeof circularProgressStyleVariantOptions)[number];

export interface CircularProgressProps extends VariantProps {
  className?: ClassName;
  format?: (percent?: number) => ReactNode;
  hasError?: boolean;
  size?: VariantProps['size'];
  styleVariant?: CircularProgressStyleVariant;
  percent: number;
}

const defaultFormat = (percent?: number) => `${percent}%`;

/**
 * CircularProgress component based on [HeroUI CircularProgress](https://www.heroui.com/docs/components/circular-progress)
 */
const CircularProgress = ({
  className = undefined,
  format = defaultFormat,
  hasError = false,
  styleVariant = 'primary',
  size = 'sm',
  percent,
}: CircularProgressProps) => {
  const variants = circularProgressVariants({ size });
  const classNames = variantsToClassNames(variants, className, 'base');
  let color = styleVariant;
  let value = format(percent);

  if (hasError) {
    color = 'danger';
    value = <FaTimes className="text-danger" />;
  } else if (percent >= 100) {
    color = 'success';
    value = <FaCheck className="text-success" />;
  }

  return (
    <NextCircularProgress
      classNames={classNames}
      aria-label="Loading..."
      formatOptions={undefined}
      size="sm"
      value={percent || 0}
      valueLabel={percent && value}
      color={color}
      showValueLabel
      strokeWidth={2}
      disableAnimation
    />
  );
};

export default CircularProgress;
