import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { ReactNode } from 'react';

import { Tab as NextTab, Tabs as NextTabs } from '@nextui-org/tabs';

import { tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

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

export interface TabProps {
  /** Content to be displayed in the tab panel */
  content: ReactNode;
  /** Disables the tab so it can not be selected */
  disabled?: boolean;
  /** Unique identifier for the tab */
  key: React.Key;
  /** Label content displayed in the tab button */
  label: ReactNode;
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
  /** Array of keys for the tabs to disable */
  disabledKeys?: string[];
  /** Whether tabs should take up full container width */
  fullWidth?: boolean;
  /** Callback fired when tab selection changes */
  onSelectionChange?: (key: React.Key) => void;
  /** Position of the tab list relative to the content */
  placement?: 'top' | 'bottom' | 'start' | 'end' | undefined;
  /** Radius of the tabs */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  /** Selected tab key (controlled) */
  selectedKey?: string | number | null;
  /** Size of the tabs */
  size?: 'sm' | 'md' | 'lg';
  /** Array of tab configurations */
  tabs: TabProps[];
  /** Style variant of the tabs */
  variant?: 'bordered' | 'light' | 'solid' | 'underlined';
  /** Whether to display tabs vertically */
  vertical?: boolean;
}

/**
 * Tabs component based on [NextUI Tabs](https://nextui.org/docs/components/tabs)
 */
const Tabs = ({
  ariaLabel = undefined,
  className = undefined,
  defaultSelectedKey = undefined,
  destroyInactiveTabPanel = true,
  disabledKeys = undefined,
  fullWidth = true,
  onSelectionChange = undefined,
  placement = undefined,
  radius = undefined,
  selectedKey = undefined,
  size = 'md',
  tabs,
  variant = 'solid',
  vertical = false,
}: TabsProps) => {
  const variants = tabsVariants();
  const classNames = variantsToClassNames(variants, className, 'base');

  return (
    <NextTabs
      aria-label={ariaLabel}
      classNames={classNames}
      defaultSelectedKey={defaultSelectedKey}
      destroyInactiveTabPanel={destroyInactiveTabPanel}
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
        <NextTab key={item.key} isDisabled={!!item.disabled} title={item.label}>
          {item.content}
        </NextTab>
      )}
    </NextTabs>
  );
};

export default Tabs;
