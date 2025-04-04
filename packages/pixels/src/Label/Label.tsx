import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { ChipProps } from '@heroui/chip';
import type { ReactNode } from 'react';

import { Chip as HeroLabel } from '@heroui/chip';

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
  },
});

type VariantProps = TVProps<typeof labelVariants>;
type ClassName = TVClassName<typeof labelVariants>;

export interface LabelProps extends VariantProps {
  /** content of the label */
  children: ReactNode;
  /** CSS class name */
  className?: ClassName;
  /** color of the label */
  color?: ChipProps['color'];
  /** element to be rendered in the right side of the label */
  endContent?: ChipProps['endContent'];
  /** optional label icon, when only icon provided without children and endContent  */
  icon?: ReactNode;
  /** add close button to endContent */
  onClose?: ChipProps['onClose'];
  /** radius of the label */
  radius?: ChipProps['radius'];
  /** size of the label */
  size?: ChipProps['size'];
  /** style variant of the label */
  variant?: 'solid' | 'bordered' | 'light' | 'flat' | 'faded' | 'dot';
}

/**
 * Label component based on [HeroUI Chip](https://www.heroui.com//docs/components/chip)
 */
const Label = ({
  children,
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
  const variants = labelVariants({ isIconOnly, hasEndContent });
  const classNames = variantsToClassNames(variants, _className, 'base');

  return (
    <HeroLabel
      classNames={classNames}
      color={color}
      endContent={endContent}
      radius={radius}
      onClose={onClose}
      size={size}
      variant={variant}
    >
      {icon && <span className={classNames.icon}>{icon}</span>}
      {children}
    </HeroLabel>
  );
};

export default Label;
