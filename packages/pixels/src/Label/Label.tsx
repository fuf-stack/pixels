import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { ChipProps } from '@heroui/chip';
import type { ReactNode } from 'react';

import { Chip as NextLabel } from '@heroui/chip';

import { tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

// label variants
export const labelVariants = tv({
  slots: {
    avatar: '',
    base: '',
    closeButton: '',
    content: '',
    dot: '',
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
  /** radius of the label */
  radius?: ChipProps['radius'];
  /** size of the label */
  size?: ChipProps['size'];
  /** element to be rendered in the left side of the label */
  startContent?: ChipProps['startContent'];
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
  radius = 'full',
  size = 'md',
  startContent = undefined,
  variant = 'solid',
}: LabelProps) => {
  // classNames from slots
  const variants = labelVariants();
  const classNames = variantsToClassNames(variants, _className, 'base');

  return (
    <NextLabel
      classNames={classNames}
      color={color}
      endContent={endContent}
      radius={radius}
      size={size}
      startContent={startContent}
      variant={variant}
    >
      {children}
    </NextLabel>
  );
};

export default Label;
