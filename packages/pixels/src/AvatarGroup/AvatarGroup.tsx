import type { JSX } from 'react';
import type { AvatarProps } from '../Avatar/Avatar';

import { AvatarGroup as HeroAvatarGroup } from '@heroui/avatar';

import { Avatar } from '../Avatar';

export interface AvatarGroupProps {
  /* Display a border ring around the Avatar */
  bordered?: boolean;
  /* Roundness of the border around the Avatar */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  /** CSS class name */
  className?: string;
  /* Disables the Avatar */
  disabled?: boolean;
  /* Size of the Avatar */
  size?: 'sm' | 'md' | 'lg';
  /* Maximum number of avatars to display before +X is displayed */
  max?: number;
  /* Array of avatarProps */
  avatars?: (Omit<AvatarProps, 'size' | 'rounded' | 'bordered'> & {
    /* Custom wrapperProps for each avatarWrapper */
    wrapperProps?: Record<string, unknown>;
  })[];
  /* Custom wrapper for each avatar */
  avatarWrapper?: JSX.ElementType;
}

/**
 * AvatarGroup component based on [HeroUI AvatarGroup](https://www.heroui.com//docs/components/avatar)
 */
const AvatarGroup = ({
  bordered = false,
  rounded = 'full',
  className = '',
  disabled = false,
  size = 'md',
  avatars = [],
  max = 3,
  avatarWrapper: AvatarWrapper = undefined,
}: AvatarGroupProps) => {
  return (
    <HeroAvatarGroup
      className={className}
      isBordered={bordered}
      isDisabled={disabled}
      max={max}
      radius={rounded}
      size={size}
    >
      {avatars?.map((avatar, index) => {
        const avatarKey = avatar.src
          ? `${avatar.src}-${index}`
          : `avatar-${index}`;
        const { wrapperProps, ...avatarProps } = avatar;
        return AvatarWrapper ? (
          <AvatarWrapper key={avatarKey} {...wrapperProps}>
            <Avatar
              {...avatarProps}
              bordered={bordered}
              disabled={disabled || avatar?.disabled}
              rounded={rounded}
              size={size}
            />
          </AvatarWrapper>
        ) : (
          <Avatar
            key={avatarKey}
            {...avatarProps}
            bordered={bordered}
            disabled={disabled || avatar?.disabled}
            rounded={rounded}
            size={size}
          />
        );
      })}
    </HeroAvatarGroup>
  );
};

export default AvatarGroup;
