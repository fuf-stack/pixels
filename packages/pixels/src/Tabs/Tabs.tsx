import type { ReactNode } from 'react';
import type { ClassName } from './tabsVariants';

import { Tabs as AriaTabs, TabList, TabPanel } from 'react-aria-components';

import { useStyling } from '../StylingProvider';
import TabsItem from './subcomponents/TabsItem';
import { tabsVariants } from './tabsVariants';

export { tabsVariants } from './tabsVariants';

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

export interface TabsProps {
  /** Accessible label for the tabs component */
  ariaLabel?: string;
  /** CSS class name */
  className?: ClassName;
  /** Key of the tab that should be selected by default */
  defaultSelectedKey?: string | number;
  /** Whether to destroy inactive tab panel DOM nodes */
  destroyInactiveTabPanel?: boolean;
  /** Disables selection-indicator animation */
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

/** Sections of content selected through a row or column of tab controls */
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
  const styling = useStyling();

  // start/end placement uses vertical keyboard navigation as well as vertical layout
  const resolvedPlacement = placement ?? (vertical ? 'start' : 'top');
  const orientation =
    vertical || resolvedPlacement === 'start' || resolvedPlacement === 'end'
      ? 'vertical'
      : 'horizontal';
  const items = tabs ?? [];
  const unavailableKeys = [
    ...(disabledKeys ?? []),
    ...items
      .filter((item) => {
        return item.disabled;
      })
      .map((item) => {
        return item.key;
      }),
  ];

  // classNames from slots
  const variants = styling.resolve(tabsVariants, {
    disableAnimation,
    fullWidth,
    placement: vertical ? 'start' : resolvedPlacement,
    radius,
    size,
    variant,
  });
  const classNames = styling.variantsToClassNames(variants, className, 'base');

  return (
    <AriaTabs
      className={classNames.tabWrapper}
      data-placement={resolvedPlacement}
      data-slot="tabWrapper"
      data-vertical={orientation}
      defaultSelectedKey={defaultSelectedKey}
      disabledKeys={unavailableKeys}
      onSelectionChange={onSelectionChange}
      orientation={orientation}
      selectedKey={selectedKey}
    >
      {/* tab controls and their animated selection indicator */}
      <div className={classNames.base} data-slot="base">
        <TabList
          aria-label={ariaLabel ?? 'Tabs'}
          className={classNames.tabList}
          data-slot="tabList"
          items={items}
        >
          {(item) => {
            return (
              <TabsItem
                className={classNames}
                disableAnimation={disableAnimation}
                id={item.key}
                item={item}
                testId={testId}
              />
            );
          }}
        </TabList>
      </div>

      {/* inactive panels unmount unless the owner requests state retention */}
      {items.map((item) => {
        return (
          <TabPanel
            key={item.key}
            className={classNames.panel}
            data-slot="panel"
            id={item.key}
            shouldForceMount={!destroyInactiveTabPanel}
          >
            {item.content}
          </TabPanel>
        );
      })}
    </AriaTabs>
  );
};

export default Tabs;
