import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { DividerProps } from '@heroui/divider';
import type { ReactNode } from 'react';

import {
  Accordion as HeroAccordion,
  AccordionItem as HeroAccordionItem,
} from '@heroui/accordion';

import { tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

// accordion styling variants
// see: https://www.heroui.com//docs/components/accordion#accordion-item-slots
export const accordionVariants = tv({
  slots: {
    base: '',
    content: 'px-4',
    heading: 'px-4',
    indicator: '',
    startContent: '',
    subtitle: '',
    title: '',
    titleWrapper: '',
    trigger: 'cursor-pointer',
    // outer accordion wrapper
    wrapper: 'px-0',
  },
  variants: {
    indicatorLeft: {
      true: {
        content: 'pl-7',
        indicator: '-rotate-180 data-[open=true]:-rotate-90',
        trigger: 'flex-row-reverse',
      },
    },
    showDivider: {
      true: {
        wrapper: 'divide-y divide-solid divide-divider',
      },
    },
    showBottomTopDivider: {
      true: {
        wrapper: 'border-b border-t border-solid border-divider',
      },
    },
  },
});

export interface AccordionItemProps {
  /** Content of the accordion item */
  children: ReactNode;
  /** Disables the accordion item */
  disabled?: boolean;
  /** Accordion item title */
  title: ReactNode;
  /** Accordion item subtitle */
  subtitle?: ReactNode;
}

type VariantProps = TVProps<typeof accordionVariants>;
type ClassName = TVClassName<typeof accordionVariants>;

export interface AccordionProps extends VariantProps {
  /** Props for AccordionItems, will render the accordion items programmatically */
  accordionItems: AccordionItemProps[];
  /** CSS class name */
  className?: ClassName;
  /** Array of keys for the AccordionItem(s) to be expanded by default */
  defaultSelectedKeys?: undefined | 'all' | Iterable<number | string>;
  /** Disables the Accordion */
  disabled?: boolean;
  /** Array of keys for the AccordionItems to disable */
  disabledKeys?: Iterable<number | string>;
  /** Force always one AccordionItem to be open. */
  disallowEmptySelection?: boolean;
  /** props for styling the Divider */
  dividerProps?: DividerProps;
  /** Hide the expanded/collapsed indicator icon */
  hideIndicator?: boolean;
  /** Callback function for when a Accordion Item is expanded or collapsed */
  onSelectionChange?: (keys: 'all' | Iterable<number | string>) => unknown;
  /** Selected keys (controlled) */
  selectedKeys?: undefined | 'all' | Iterable<number | string>;
  /** Set whether multiple or only a single AccordionItems can be expanded */
  selectionMode?: 'single' | 'multiple';
  /** Enable or disable the divider between each AccordionItem */
  showDivider?: boolean;
  /** Style variant of the Accordion */
  variant?: 'light' | 'shadow' | 'bordered' | 'splitted';
}

/**
 * Accordion component based on [HeroUI Accordion](https://www.heroui.com//docs/components/accordion)
 */
const Accordion = ({
  accordionItems,
  className: _className = undefined,
  defaultSelectedKeys = [],
  disabled = false,
  disabledKeys = [],
  disallowEmptySelection = false,
  dividerProps = {},
  indicatorLeft = false,
  onSelectionChange = undefined,
  selectedKeys = undefined,
  selectionMode = 'multiple',
  showDivider = true,
  variant = 'light',
}: AccordionProps) => {
  // itemClasses from className slots
  const variants = accordionVariants({
    indicatorLeft,
    showDivider: showDivider && variant !== 'splitted',
    showBottomTopDivider: showDivider && variant === 'light',
  });
  const classNames = variantsToClassNames(variants, _className, 'wrapper');

  return (
    <HeroAccordion
      className={classNames.wrapper}
      defaultSelectedKeys={defaultSelectedKeys}
      disabledKeys={disabledKeys}
      disallowEmptySelection={disallowEmptySelection}
      dividerProps={dividerProps}
      isDisabled={disabled}
      itemClasses={classNames}
      onSelectionChange={onSelectionChange}
      selectedKeys={selectedKeys}
      selectionMode={selectionMode}
      showDivider={false}
      variant={variant}
    >
      {accordionItems.map((item, index) => {
        return (
          <HeroAccordionItem
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            isDisabled={disabled || item?.disabled}
            {...item}
          />
        );
      })}
    </HeroAccordion>
  );
};

export default Accordion;
