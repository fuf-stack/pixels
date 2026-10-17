import type {
  ComponentPropsWithoutRef,
  ElementType,
  KeyboardEvent,
  ReactNode,
  Ref,
} from 'react';
import type { ClassName, VariantProps } from './accordionVariants';

import { useState } from 'react';

import { useStyling } from '../StylingProvider';
import { accordionVariants } from './accordionVariants';
import AccordionItem from './subcomponents/AccordionItem';

export { accordionVariants } from './accordionVariants';

/** Attributes accepted by the reserved divider configuration */
export interface AccordionDividerProps extends ComponentPropsWithoutRef<'hr'> {
  /** Element used for the divider */
  as?: ElementType;
  /** Divider direction */
  orientation?: 'horizontal' | 'vertical';
  /** Ref to the divider element */
  ref?: Ref<HTMLElement>;
}

export interface AccordionItemProps {
  /** Content of the accordion item */
  children: ReactNode;
  /** Disables the accordion item */
  disabled?: boolean;
  /** Supporting text below the title */
  subtitle?: ReactNode;
  /** Accordion item title */
  title: ReactNode;
}

export interface AccordionProps extends Pick<
  VariantProps,
  'indicatorLeft' | 'showBottomTopDivider'
> {
  /** Expandable sections in display order */
  accordionItems: AccordionItemProps[];
  /** CSS class name */
  className?: ClassName;
  /** Initially expanded item indexes */
  defaultSelectedKeys?: undefined | 'all' | Iterable<number | string>;
  /** Disables the Accordion */
  disabled?: boolean;
  /** Indexes of disabled items */
  disabledKeys?: Iterable<number | string>;
  /** Keeps at least one item expanded after selection */
  disallowEmptySelection?: boolean;
  /** Reserved divider props, group dividers use styling slots */
  dividerProps?: AccordionDividerProps;
  /** Hide the expanded/collapsed indicator icon */
  hideIndicator?: boolean;
  /** Callback when the expanded index keys change */
  onSelectionChange?: (keys: 'all' | Iterable<number | string>) => unknown;
  /** Selected keys (controlled) */
  selectedKeys?: undefined | 'all' | Iterable<number | string>;
  /** Single or multiple expanded sections */
  selectionMode?: 'single' | 'multiple';
  /** Enable or disable the divider between each AccordionItem */
  showDivider?: boolean;
  /** Style variant of the Accordion */
  variant?: 'light' | 'shadow' | 'bordered' | 'splitted';
}

/** Expandable sections for showing related content under individual headings */
const Accordion = ({
  accordionItems,
  className = undefined,
  defaultSelectedKeys = [],
  disabled = false,
  disabledKeys = [],
  disallowEmptySelection = false,
  hideIndicator = false,
  indicatorLeft = false,
  onSelectionChange = undefined,
  selectedKeys = undefined,
  selectionMode = 'multiple',
  showDivider = true,
  variant = 'light',
}: AccordionProps) => {
  const styling = useStyling();
  const [uncontrolledKeys, setUncontrolledKeys] = useState<'all' | Set<string>>(
    () => {
      return defaultSelectedKeys === 'all'
        ? 'all'
        : new Set(Array.from(defaultSelectedKeys, String));
    },
  );

  // React collection keys are strings, accept numeric index keys at the boundary
  const selection = selectedKeys ?? uncontrolledKeys;
  const expandedKeys =
    selection === 'all'
      ? new Set(
          accordionItems.map((_, index) => {
            return String(index);
          }),
        )
      : new Set(Array.from(selection, String));
  const unavailableKeys = new Set(Array.from(disabledKeys, String));

  // classNames from slots
  const variants = styling.resolve(accordionVariants, {
    indicatorLeft,
    showDivider: showDivider && variant !== 'splitted',
    showBottomTopDivider: showDivider && variant === 'light',
    variant,
  });
  const classNames = styling.variantsToClassNames(
    variants,
    className,
    'wrapper',
  );

  // preserve controlled state and prevent closing the final required panel
  const handleToggle = (key: string) => {
    const nextKeys = new Set(expandedKeys);

    if (nextKeys.has(key)) {
      if (disallowEmptySelection && nextKeys.size === 1) {
        return;
      }
      nextKeys.delete(key);
    } else {
      if (selectionMode === 'single') {
        nextKeys.clear();
      }
      nextKeys.add(key);
    }

    if (selectedKeys === undefined) {
      setUncontrolledKeys(nextKeys);
    }
    onSelectionChange?.(nextKeys);
  };

  // move between this group's enabled headings, leaving panel controls alone
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const root = event.currentTarget.closest('[data-slot="wrapper"]');
    if (!root) {
      return;
    }

    const buttons = Array.from(
      root.querySelectorAll<HTMLButtonElement>(
        '[data-accordion-trigger]:not(:disabled)',
      ),
    ).filter((button) => {
      return button.closest('[data-slot="wrapper"]') === root;
    });
    const index = buttons.findIndex((button) => {
      return button === event.currentTarget;
    });
    if (index < 0) {
      return;
    }

    let nextIndex: number;
    switch (event.key) {
      case 'ArrowDown':
        nextIndex = (index + 1) % buttons.length;
        break;
      case 'ArrowUp':
        nextIndex = (index - 1 + buttons.length) % buttons.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = buttons.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    buttons[nextIndex]?.focus();
  };

  return (
    <div
      className={classNames.wrapper}
      data-orientation="vertical"
      data-slot="wrapper"

      role="group"
    >
      {accordionItems.map((item, index) => {
        const key = String(index);
        const itemDisabled =
          disabled || !!item.disabled || unavailableKeys.has(key);

        return (
          <AccordionItem
            key={key}
            {...item}
            className={classNames}
            disabled={itemDisabled}
            expanded={expandedKeys.has(key)}
            hideIndicator={hideIndicator}
            itemKey={key}
            onKeyDown={handleKeyDown}
            onToggle={handleToggle}
          />
        );
      })}
    </div>
  );
};

export default Accordion;
