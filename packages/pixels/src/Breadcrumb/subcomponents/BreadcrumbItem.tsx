import type { ReactNode } from 'react';
import type { BreadcrumbItemProps, BreadcrumbProps } from '../Breadcrumb';

import { useRef } from 'react';
import { mergeProps, useBreadcrumbItem, useFocusRing } from 'react-aria';

import { useStyling } from '../../StylingProvider';
import { breadcrumbVariants } from '../breadcrumbVariants';
import BreadcrumbSeparator from './BreadcrumbSeparator';

interface BreadcrumbItemControlProps
  extends
    BreadcrumbItemProps,
    Pick<
      BreadcrumbProps,
      'className' | 'color' | 'disableAnimation' | 'size' | 'underline'
    > {
  /** Whether this entry represents collapsed middle items */
  collapsed: boolean;
  /** Whether this entry represents the current page */
  current: boolean;
  /** Hides the separator after this entry */
  hideSeparator: boolean;
  /** Content separating this entry from its neighbor */
  separator?: ReactNode;
}

/** Breadcrumb item associations, focus feedback and optional collapsed indicator
 *
 * @see https://react-aria.adobe.com/Breadcrumbs
 */
const BreadcrumbItem = ({
  children,
  className = undefined,
  collapsed,
  color = 'foreground',
  current,
  disableAnimation = false,
  disabled = false,
  endContent = undefined,
  hideSeparator,
  separator = undefined,
  size = 'md',
  startContent = undefined,
  underline = 'hover',
}: BreadcrumbItemControlProps) => {
  const styling = useStyling();
  const ref = useRef<HTMLSpanElement>(null);
  const { itemProps } = useBreadcrumbItem(
    { children, elementType: 'span', isCurrent: current, isDisabled: disabled },
    ref,
  );
  const { focusProps, isFocused, isFocusVisible } = useFocusRing();

  // classNames from slots
  const variants = styling.resolve(breadcrumbVariants, {
    color,
    current,
    disableAnimation,
    disabled,
    size,
    underline,
  });
  const classNames = styling.variantsToClassNames(variants, className, 'nav');

  return (
    <li className={classNames.itemBase} data-slot="base">
      <span
        {...mergeProps(itemProps, disabled ? {} : focusProps)}
        ref={ref}
        aria-label={collapsed ? 'Collapsed breadcrumbs' : undefined}
        className={classNames.item}
        data-current={current || undefined}
        data-disabled={disabled || undefined}
        data-focus={isFocused || undefined}
        data-focus-visible={isFocusVisible || undefined}
        data-slot="item"
      >
        {startContent}
        {collapsed ? (
          <svg
            aria-hidden="true"
            className={classNames.ellipsis}
            data-slot="ellipsis"
            fill="none"
            height="1em"
            shapeRendering="geometricPrecision"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            width="1em"
          >
            <circle cx="12" cy="12" fill="currentColor" r="1" />
            <circle cx="19" cy="12" fill="currentColor" r="1" />
            <circle cx="5" cy="12" fill="currentColor" r="1" />
          </svg>
        ) : (
          children
        )}
        {endContent}
      </span>

      {!current && !hideSeparator ? (
        <BreadcrumbSeparator
          className={classNames.separator}
          disabled={disabled}
        >
          {separator}
        </BreadcrumbSeparator>
      ) : null}
    </li>
  );
};

export default BreadcrumbItem;
