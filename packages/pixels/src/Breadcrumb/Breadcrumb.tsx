import type { ReactNode } from 'react';
import type { ClassName, VariantProps } from './breadcrumbVariants';

import { useBreadcrumbs } from 'react-aria';

import { useStyling } from '../StylingProvider';
import { breadcrumbVariants } from './breadcrumbVariants';
import BreadcrumbItem from './subcomponents/BreadcrumbItem';

export { breadcrumbVariants } from './breadcrumbVariants';

export interface BreadcrumbItemProps {
  /** Content of the breadcrumb item */
  children: ReactNode;
  /** Disables the breadcrumb item */
  disabled?: boolean;
  /** Content displayed after the item */
  endContent?: ReactNode;
  /** Content displayed before the item */
  startContent?: ReactNode;
}

export interface BreadcrumbProps {
  /** Hierarchy items, ordered from the root to the current page */
  breadcrumbItems: BreadcrumbItemProps[];
  /** CSS class name */
  className?: ClassName;
  /** Color of the current page */
  color?: VariantProps['color'];
  /** Disables item opacity transitions */
  disableAnimation?: boolean;
  /** Disables all items */
  disabled?: boolean;
  /** Hides the separator between items */
  hideSeparator?: boolean;
  /** Maximum number of items to show without "..." in between */
  maxItems?: number;
  /** Radius of the breadcrumb */
  radius?: VariantProps['radius'];
  /** Separator between items */
  separator?: ReactNode;
  /** Size of the breadcrumb */
  size?: VariantProps['size'];
  /** Adjust when the breadcrumb items should be underlined */
  underline?: VariantProps['underline'];
  /** Style variant of the breadcrumb */
  variant?: VariantProps['variant'];
}

/** Hierarchy of items indicating the current page and its parent locations */
const Breadcrumb = ({
  breadcrumbItems,
  className = undefined,
  color = 'foreground',
  disableAnimation = false,
  disabled = false,
  hideSeparator = false,
  maxItems = 8,
  radius = 'none',
  separator = undefined,
  size = 'md',
  underline = 'hover',
  variant = 'light',
}: BreadcrumbProps) => {
  const styling = useStyling();
  const { navProps } = useBreadcrumbs({});

  // classNames from slots
  const variants = styling.resolve(breadcrumbVariants, {
    color,
    disableAnimation,
    radius,
    size,
    underline,
    variant,
  });
  const classNames = styling.variantsToClassNames(variants, className, 'nav');

  // retain the first item and last two when the middle of a long path is collapsed
  const items = breadcrumbItems.map((item, index) => {
    return { collapsed: false, item, key: String(index) };
  });
  const shouldCollapse = items.length >= maxItems && items.length > 3;
  const visibleItems = shouldCollapse
    ? [items[0], { ...items[1], collapsed: true }, ...items.slice(-2)]
    : items;

  return (
    <nav {...navProps} className={classNames.nav} data-slot="base">
      <ol className={classNames.list} data-slot="list">
        {visibleItems.map(({ collapsed, item, key }, index) => {
          return (
            <BreadcrumbItem
              key={key}
              {...item}
              className={className}
              collapsed={collapsed}
              color={color}
              current={index === visibleItems.length - 1}
              disableAnimation={disableAnimation}
              disabled={disabled || item.disabled}
              hideSeparator={hideSeparator}
              separator={separator}
              size={size}
              underline={underline}
            />
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
