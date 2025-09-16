import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { ChipProps as HeroLabelProps } from '@heroui/chip';
import type { ReactNode } from 'react';

import { Chip as HeroLabel } from '@heroui/chip';
import { chip as heroLabelVariants } from '@heroui/theme';

import { tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

// label variants
export const labelVariants = tv({
  slots: {
    base: '',
    closeButton: '',
    content: '',
    dot: '',
    icon: '',
  },
  variants: {
    color: {
      // see: https://github.com/heroui-inc/heroui/blob/canary/packages/core/theme/src/components/chip.ts
      info: {
        dot: 'bg-info',
      },
      ...heroLabelVariants.variants.color,
    },
    isIconOnly: {
      true: {
        content: 'px-1',
      },
      false: {
        content: 'flex items-center gap-2',
      },
    },
    hasEndContent: {
      true: {
        base: 'pr-2',
      },
    },
    variant: heroLabelVariants.variants.variant,
  },
  defaultVariants: heroLabelVariants.defaultVariants,
  compoundVariants: [
    // see: https://github.com/heroui-inc/heroui/blob/canary/packages/core/theme/src/components/chip.ts
    ...heroLabelVariants.compoundVariants,
    // solid / color info
    {
      variant: 'solid',
      color: 'info',
      class: {
        base: 'bg-info text-info-foreground',
      },
    },
    // bordered / color info
    {
      variant: 'bordered',
      color: 'info',
      class: {
        base: 'border-info text-info',
      },
    },
    // light / color info
    {
      variant: 'light',
      color: 'info',
      class: {
        base: 'text-info',
      },
    },
    // flat / color info
    {
      variant: 'flat',
      color: 'info',
      class: {
        base: 'bg-info/20 text-info-600',
      },
    },
    // faded / color info
    {
      variant: 'faded',
      color: 'info',
      class: {
        base: 'border-default text-info',
      },
    },
  ],
});

type VariantProps = TVProps<typeof labelVariants>;
type ClassName = TVClassName<typeof labelVariants>;

export interface LabelProps extends VariantProps {
  /** content of the label */
  children?: ReactNode;
  /** CSS class name */
  className?: ClassName;
  /** color of the label */
  color?: VariantProps['color'];
  /** element to be rendered in the right side of the label */
  endContent?: HeroLabelProps['endContent'];
  /** optional label icon, when only icon provided without children and endContent  */
  icon?: ReactNode;
  /** add close button to endContent */
  onClose?: HeroLabelProps['onClose'];
  /** radius of the label */
  radius?: HeroLabelProps['radius'];
  /** size of the label */
  size?: HeroLabelProps['size'];
  /** style variant of the label */
  variant?: 'solid' | 'bordered' | 'light' | 'flat' | 'faded' | 'dot';
}

/**
 * Label component based on [HeroUI Chip](https://www.heroui.com//docs/components/chip)
 */
const Label = ({
  children = undefined,
  className: _className = undefined,
  color = 'default',
  endContent = undefined,
  icon = undefined,
  onClose = undefined,
  radius = 'full',
  size = 'md',
  variant = 'solid',
}: LabelProps) => {
  // determine variants based on props
  const isIconOnly = !!icon && !children && !endContent;
  const hasEndContent = !!endContent;

  // classNames from slots
  const variants = labelVariants({ color, isIconOnly, hasEndContent, variant });
  const classNames = variantsToClassNames(variants, _className, 'base');

  return (
    <HeroLabel
      classNames={classNames}
      endContent={endContent}
      onClose={onClose}
      radius={radius}
      size={size}
      variant={variant}
    >
      {icon ? <span className={classNames.icon}>{icon}</span> : null}
      {children}
    </HeroLabel>
  );
};

export default Label;
