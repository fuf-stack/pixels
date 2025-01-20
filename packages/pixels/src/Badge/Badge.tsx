import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { BadgeProps as NextBadgeProps } from '@heroui/badge';

import { Badge as NextBadge } from '@heroui/badge';

import { tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

// badge styling variants
export const badgeVariants = tv({
  slots: {
    badge: '',
    base: '',
  },
});

type VariantProps = TVProps<typeof badgeVariants>;
type ClassName = TVClassName<typeof badgeVariants>;

export interface BadgeProps extends VariantProps {
  /** component which is wrapped by the batch */
  children: NextBadgeProps['children'];
  /** CSS class name */
  className?: ClassName;
  /** badge content */
  content?: NextBadgeProps['content'];
  /** color of the badge */
  color?: NextBadgeProps['color'];
  /** if set the badge have the same height and width */
  isOneChar?: NextBadgeProps['isOneChar'];
  /** removes the badge outline */
  noOutline?: boolean;
  /** placement of the badge */
  placement?: NextBadgeProps['placement'];
  /** size of the badge */
  size?: NextBadgeProps['size'];
}

/**
 * Badge component based on [HeroUI Badge](https://www.heroui.com//docs/components/badge)
 */
const Avatar = ({
  children,
  className: _className = undefined,
  content = undefined,
  color = 'default',
  isOneChar = false,
  noOutline = false,
  placement = 'top-right',
  size = 'md',
}: BadgeProps) => {
  if (content === undefined) {
    return children;
  }
  // className from slots
  const variants = badgeVariants();
  const className = variantsToClassNames(variants, _className, 'base');

  return (
    <NextBadge
      classNames={className}
      color={color}
      content={content}
      isOneChar={isOneChar}
      placement={placement}
      showOutline={!noOutline}
      size={size}
    >
      {children}
    </NextBadge>
  );
};

export default Avatar;
