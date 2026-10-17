import type { AvatarProps } from '../../Avatar';

import { avatarVariants } from '../../Avatar/avatarVariants';
import { useStyling } from '../../StylingProvider';

interface AvatarGroupCountProps extends Pick<
  AvatarProps,
  'bordered' | 'disabled' | 'rounded' | 'size'
> {
  /** CSS class name */
  className: string;
  /** Number of avatars outside the visible group */
  count: number;
}

/** Compact overflow indicator announcing the number of hidden avatars */
const AvatarGroupCount = ({
  bordered,
  className,
  count,
  disabled,
  rounded,
  size,
}: AvatarGroupCountProps) => {
  const styling = useStyling();

  // classNames from slots
  const variants = styling.resolve(avatarVariants, {
    bordered,
    disabled,
    grouped: true,
    rounded,
    size,
  });
  const classNames = styling.variantsToClassNames(variants, className, 'base');

  return (
    <span className={classNames.base} data-slot="count" tabIndex={-1}>
      <span
        aria-label={`+${count}`}
        className={classNames.name}
        data-slot="name"
        role="img"
      >
        +
      </span>
    </span>
  );
};

export default AvatarGroupCount;
