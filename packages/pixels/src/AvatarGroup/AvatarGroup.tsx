import type { AvatarProps } from '../Avatar/Avatar';

import { AvatarGroup as NextAvatarGroup } from '@nextui-org/avatar';

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
 * AvatarGroup component based on [NextUI AvatarGroup](https://nextui.org/docs/components/avatar)
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
    <NextAvatarGroup
      max={max}
      className={className}
      isBordered={bordered}
      isDisabled={disabled}
      radius={rounded}
      size={size}
    >
      {avatars?.map((avatar) => {
        return AvatarWrapper ? (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <AvatarWrapper {...avatar.wrapperProps}>
            <Avatar
              key={avatar.src}
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...avatar}
              disabled={disabled || avatar?.disabled}
              rounded={rounded}
              bordered={bordered}
              size={size}
            />
          </AvatarWrapper>
        ) : (
          <Avatar
            key={avatar.src}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...avatar}
            disabled={disabled || avatar?.disabled}
            rounded={rounded}
            bordered={bordered}
            size={size}
          />
        );
      })}
    </NextAvatarGroup>
  );
};

export default AvatarGroup;
