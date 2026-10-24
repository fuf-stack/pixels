import type { TabProps } from '../Tabs';
import type { TabsClassNames } from '../tabsVariants';

import { SelectionIndicator, Tab } from 'react-aria-components';

import { slugify } from '@fuf-stack/pixel-utils';

interface TabsItemProps {
  /** CSS class name */
  className: TabsClassNames;
  /** Disables selection-indicator animation */
  disableAnimation: boolean;
  /** Unique collection key */
  id: string | number;
  /** Label, content and disabled state */
  item: TabProps;
  /** Prefix for the tab's test ID */
  testId: string;
}

/** Tab control and shared selection indicator within its owning tab list
 *
 * @see https://react-aria.adobe.com/Tabs
 * @see https://react-aria.adobe.com/SelectionIndicator
 */
const TabsItem = ({
  className,
  disableAnimation,
  id,
  item,
  testId,
}: TabsItemProps) => {
  return (
    <Tab
      className={className.tab}
      data-slot="tab"
      data-testid={slugify(`${testId}_${item.testId ?? item.key}`)}
      id={id}
      isDisabled={item.disabled}
    >
      {!disableAnimation ? (
        <SelectionIndicator className={className.cursor} data-slot="cursor" />
      ) : null}
      <div className={className.tabContent} data-slot="tabContent">
        {item.label}
      </div>
    </Tab>
  );
};

export default TabsItem;
