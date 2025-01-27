import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type React from 'react';

import { Avatar as HeroAvatar } from '@heroui/avatar';

import { tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

// avatar styling variants
export const avatarVariants = tv({
  slots: {
    base: '',
    fallback: '',
    icon: '',
    img: '',
    name: '',
  },
});

type VariantProps = TVProps<typeof avatarVariants>;
type ClassName = TVClassName<typeof avatarVariants>;
export interface AvatarProps extends VariantProps {
  /* Display a border ring around the Avatar */
  bordered?: boolean;
  /* Roundness of the border around the Avatar */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  /** CSS class name */
  className?: ClassName;
  /* Disables the Avatar */
  disabled?: boolean;
  /* Fallback content to display if the image fails to load or is not provided */
  fallback?: React.ReactNode;
  /* Size of the Avatar */
  size?: 'sm' | 'md' | 'lg';
  /* Image source */
  src: string;
}

/**
 * Avatar component based on [HeroUI Avatar](https://www.heroui.com//docs/components/avatar)
 */
const Avatar = ({
  bordered = false,
  rounded = 'full',
  className: _className = undefined,
  disabled = false,
  fallback = undefined,
  size = 'md',
  src,
}: AvatarProps) => {
  // className from slots
  const variants = avatarVariants();
  const className = variantsToClassNames(variants, _className, 'base');

  return (
    <HeroAvatar
      classNames={className}
      fallback={fallback}
      isBordered={bordered}
      isDisabled={disabled}
      radius={rounded}
      showFallback={!!fallback}
      size={size}
      src={src}
    />
  );
};

export default Avatar;
