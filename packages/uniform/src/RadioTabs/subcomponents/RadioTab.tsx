import type { ComponentPropsWithRef } from 'react';
import type { RadioTabOption } from '../RadioTabs';
import type { RadioTabsClassNames } from '../radioTabsVariants';

import { Tab } from 'react-aria-components';

interface RadioTabProps {
  /** CSS class name */
  className: RadioTabsClassNames;
  /** Supporting description and validation message IDs */
  describedBy: string | undefined;
  /** Disables the whole field */
  disabled: boolean | undefined;
  /** Option label, value and optional panel */
  option: RadioTabOption;
  /** HTML data-testid attribute for e2e tests */
  testId: string;
}

/**
 * Selectable tab with option labeling, panel association and interaction styles
 *
 * @see https://react-aria.adobe.com/Tabs
 */
const RadioTab = ({
  className: classNames,
  describedBy,
  disabled,
  option,
  testId,
}: RadioTabProps) => {
  return (
    <Tab
      aria-describedby={describedBy}
      aria-label={
        option.label == null && typeof option.value === 'boolean'
          ? String(option.value)
          : undefined
      }
      className={classNames.tab}
      data-key={String(option.value)}
      data-slot="tab"
      data-testid={testId}
      id={String(option.value)}
      isDisabled={!!disabled || !!option.disabled}
      render={(props, state) => {
        // options expose no href, React Aria always uses div attributes here
        const divProps = props as ComponentPropsWithRef<'div'>;

        return (
          <div
            {...divProps}
            aria-controls={
              option.content != null ? props['aria-controls'] : undefined
            }
            data-focus={state.isFocused || undefined}
            data-hover={state.isHovered || undefined}
            data-hover-unselected={
              (state.isHovered && !state.isSelected) || undefined
            }
          >
            {props.children}
          </div>
        );
      }}
    >
      <span className={classNames.tabContent} data-slot="tabContent">
        {option.label ?? option.value}
      </span>
    </Tab>
  );
};

export default RadioTab;
