import type { ReactNode } from 'react';
import type { ClassName } from './avatarVariants';

import { useContext } from 'react';
import { useHover } from 'react-aria';

import { useStyling } from '../StylingProvider';
import { avatarVariants } from './avatarVariants';
import AvatarGroupContext from './subcomponents/AvatarGroupContext';
import AvatarImage from './subcomponents/AvatarImage';

export { avatarVariants } from './avatarVariants';

export interface AvatarProps {
  /** Border ring around the avatar */
  bordered?: boolean;
  /** CSS class name */
  className?: ClassName;
  /** Disabled appearance and hover state */
  disabled?: boolean;
  /** Content shown while the image is unavailable */
  fallback?: ReactNode;
  /** Corner roundness */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  /** Avatar size */
  size?: 'sm' | 'md' | 'lg';
  /** Image source */
  src: string;
}

/** Profile image with optional fallback content and a border ring */
const Avatar = ({
  bordered = false,
  className = undefined,
  disabled = false,
  fallback = undefined,
  rounded = 'full',
  size = 'md',
  src,
}: AvatarProps) => {
  const styling = useStyling();
  const grouped = useContext(AvatarGroupContext);
  const { hoverProps, isHovered } = useHover({ isDisabled: disabled });

  // classNames from slots
  const variants = styling.resolve(avatarVariants, {
    bordered,
    disabled,
    grouped,
    rounded,
    size,
  });
  const classNames = styling.variantsToClassNames(variants, className, 'base');

  return (
    <span
      {...hoverProps}
      className={classNames.base}
      data-hover={isHovered || undefined}
      data-slot="base"
      tabIndex={-1}
    >
      <AvatarImage
        key={src}
        className={classNames}
        fallback={fallback}
        src={src}
      />
    </span>
  );
};

export default Avatar;
