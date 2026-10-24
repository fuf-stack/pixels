import type { ReactNode } from 'react';
import type { ClassName, VariantProps } from './badgeVariants';

import { useStyling } from '../StylingProvider';
import { badgeVariants } from './badgeVariants';

export { badgeVariants } from './badgeVariants';

export interface BadgeProps {
  /** Element carrying the badge */
  children: ReactNode;
  /** CSS class name */
  className?: ClassName;
  /** Badge color */
  color?: VariantProps['color'];
  /** Badge content, undefined renders the children alone */
  content?: ReactNode;
  /** Fixed circular size for short content */
  isOneChar?: boolean;
  /** Removes the contrasting border around the badge */
  noOutline?: boolean;
  /** Corner used to position the badge */
  placement?: VariantProps['placement'];
  /** Badge size */
  size?: VariantProps['size'];
}

/** Small count or status indicator attached to a corner of another element */
const Badge = ({
  children,
  className = undefined,
  color = 'default',
  content = undefined,
  isOneChar = false,
  noOutline = false,
  placement = 'top-right',
  size = 'md',
}: BadgeProps): ReactNode => {
  const styling = useStyling();

  // numeric zero and single characters use a fixed circle, empty strings use a dot
  const contentText = String(content);
  const oneChar = contentText.length === 1 || isOneChar;
  const isDot = contentText.length === 0;

  // classNames from slots
  const variants = styling.resolve(badgeVariants, {
    color,
    isDot,
    isOneChar: oneChar,
    noOutline,
    placement,
    size,
  });
  const classNames = styling.variantsToClassNames(variants, className, 'base');

  if (content === undefined) {
    return children;
  }

  return (
    <div className={classNames.base} data-component="badge" data-slot="base">
      {children}
      <span className={classNames.badge} data-slot="badge">
        {content}
      </span>
    </div>
  );
};

export default Badge;
