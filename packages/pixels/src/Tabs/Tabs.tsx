import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { ReactNode } from 'react';

import { Tab as HeroTab, Tabs as HeroTabs } from '@heroui/tabs';

import { slugify, tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

export const tabsVariants = tv({
  slots: {
    base: '',
    cursor: '',
    panel: '',
    tab: 'data-[hover-unselected=true]:opacity-100',
    tabContent: 'text-foreground',
    tabList: '',
    tabWrapper: '',
  },
});

type VariantProps = TVProps<typeof tabsVariants>;
type ClassName = TVClassName<typeof tabsVariants>;

type Key = string | number;

export interface TabProps {
  /** Content to be displayed in the tab panel */
  content: ReactNode;
  /** Disables the tab so it can not be selected */
  disabled?: boolean;
  /** Unique identifier for the tab */
  key: Key;
  /** Label content displayed in the tab button */
  label: ReactNode;
  /** HTML data-testid attribute used in e2e tests */
  testId?: string;
}

export interface TabsProps extends VariantProps {
  /** Accessible label for the tabs component */
  ariaLabel?: string;
  /** CSS class name */
  className?: ClassName;
  /** Key of the tab that should be selected by default */
  defaultSelectedKey?: string | number;
  /** Whether to destroy inactive tab panel DOM nodes */
  destroyInactiveTabPanel?: boolean;
  /** Whether the animation should be disabled. */
  disableAnimation?: boolean;
  /** Array of keys for the tabs to disable */
  disabledKeys?: string[];
  /** Whether tabs should take up full container width */
  fullWidth?: boolean;
  /** Callback fired when tab selection changes */
  onSelectionChange?: (key: Key | null) => void;
  /** Position of the tab list relative to the content */
  placement?: 'top' | 'bottom' | 'start' | 'end' | undefined;
  /** Radius of the tabs */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  /** Selected tab key (controlled) */
  selectedKey?: Key;
  /** Size of the tabs */
  size?: 'sm' | 'md' | 'lg';
  /** Array of tab configurations */
  tabs: TabProps[];
  /** HTML data-testid attribute used in e2e tests */
  testId?: string;
  /** Style variant of the tabs */
  variant?: 'bordered' | 'light' | 'solid' | 'underlined';
  /** Whether to display tabs vertically */
  vertical?: boolean;
}

/**
 * Tabs component based on [HeroUI Tabs](https://www.heroui.com//docs/components/tabs)
 */
const Tabs = ({
  ariaLabel = undefined,
  className = undefined,
  defaultSelectedKey = undefined,
  destroyInactiveTabPanel = true,
  disableAnimation = false,
  disabledKeys = undefined,
  fullWidth = true,
  onSelectionChange = undefined,
  placement = undefined,
  radius = undefined,
  selectedKey = undefined,
  size = 'md',
  tabs,
  testId = 'tab',
  variant = 'solid',
  vertical = false,
}: TabsProps) => {
  const variants = tabsVariants();
  const classNames = variantsToClassNames(variants, className, 'base');

  return (
    <HeroTabs
      aria-label={ariaLabel}
      classNames={classNames}
      defaultSelectedKey={defaultSelectedKey}
      destroyInactiveTabPanel={destroyInactiveTabPanel}
      disableAnimation={disableAnimation}
      disabledKeys={disabledKeys}
      fullWidth={fullWidth}
      isVertical={vertical}
      items={tabs || []}
      onSelectionChange={onSelectionChange}
      placement={placement}
      radius={radius}
      selectedKey={selectedKey}
      size={size}
      variant={variant}
    >
      {(item) => (
        <HeroTab
          key={item.key}
          isDisabled={!!item.disabled}
          title={item.label}
          data-testid={slugify(`${testId}_${item.testId || item.key}`)}
        >
          {item.content}
        </HeroTab>
      )}
    </HeroTabs>
  );
};

export default Tabs;
