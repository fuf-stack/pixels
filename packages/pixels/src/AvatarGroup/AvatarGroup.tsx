import type { JSX } from 'react';
import type { AvatarProps } from '../Avatar/Avatar';

import { Avatar } from '../Avatar';
import AvatarGroupContext from '../Avatar/subcomponents/AvatarGroupContext';
import { useStyling } from '../StylingProvider';
import { avatarGroupVariants } from './avatarGroupVariants';
import AvatarGroupCount from './subcomponents/AvatarGroupCount';

export interface AvatarGroupProps {
  /** Avatars and props forwarded to their optional wrappers */
  avatars?: (Omit<AvatarProps, 'size' | 'rounded' | 'bordered'> & {
    /** Props for this avatar's wrapper */
    wrapperProps?: Record<string, unknown>;
  })[];
  /** Optional wrapper around each visible avatar */
  avatarWrapper?: JSX.ElementType;
  /** Border ring around each avatar */
  bordered?: boolean;
  /** CSS class name */
  className?: string;
  /** Disabled appearance and hover state for every avatar */
  disabled?: boolean;
  /** Maximum visible avatars, zero displays all entries */
  max?: number;
  /** Corner roundness of each avatar */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  /** Avatar size */
  size?: 'sm' | 'md' | 'lg';
}

/** Overlapping profile images with a count of entries beyond the visible limit */
const AvatarGroup = ({
  avatarWrapper: AvatarWrapper = undefined,
  avatars = [],
  bordered = false,
  className = '',
  disabled = false,
  max = 3,
  rounded = 'full',
  size = 'md',
}: AvatarGroupProps) => {
  const styling = useStyling();

  // classNames from slots
  const variants = styling.resolve(avatarGroupVariants);
  const classNames = styling.variantsToClassNames(variants, className, 'base');

  // zero retains the existing unlimited mode
  const visibleAvatars = max ? avatars.slice(0, max) : avatars;
  const remainingCount = max ? avatars.length - max : 0;

  return (
    <div className={classNames.base} data-slot="base" role="group">
      <AvatarGroupContext.Provider value>
        {visibleAvatars.map(({ wrapperProps, ...avatarProps }, index) => {
          const key = `${avatarProps.src || 'avatar'}-${index}`;
          const avatar = (
            <Avatar
              key={key}
              {...avatarProps}
              bordered={bordered}
              disabled={disabled || avatarProps.disabled}
              rounded={rounded}
              size={size}
            />
          );

          return AvatarWrapper ? (
            <AvatarWrapper key={key} {...wrapperProps}>
              {avatar}
            </AvatarWrapper>
          ) : (
            avatar
          );
        })}

        {remainingCount > 0 ? (
          <AvatarGroupCount
            bordered={bordered}
            className={classNames.count}
            count={remainingCount}
            disabled={disabled}
            rounded={rounded}
            size={size}
          />
        ) : null}
      </AvatarGroupContext.Provider>
    </div>
  );
};

export default AvatarGroup;
