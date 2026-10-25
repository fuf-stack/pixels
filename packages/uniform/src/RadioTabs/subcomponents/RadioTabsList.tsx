import type { Key } from 'react';
import type { RadioTabsProps } from '../RadioTabs';
import type { RadioTabsClassNames } from '../radioTabsVariants';

import { useLayoutEffect, useState } from 'react';
import { TabList, TabPanel, Tabs } from 'react-aria-components';

import RadioTab from './RadioTab';

interface RadioTabsListProps {
  /** CSS class name */
  className: RadioTabsClassNames;
  /** Supporting description and validation message IDs */
  describedBy: string | undefined;
  /** Disables the field */
  disabled: boolean | undefined;
  /** Field label */
  label: string;
  /** Callback with the selected option's string value */
  onChange: (value: string) => void;
  /** Available options */
  options: RadioTabsProps['options'];
  /** Selected option's string value */
  selectedKey: string;
  /** HTML data-testid attribute for e2e tests */
  testId: (value: string | number | boolean, explicit?: string) => string;
  /** Tab appearance */
  variant: RadioTabsProps['variant'];
}

/**
 * Tab list, selection indicator and panels with React Aria keyboard behavior
 *
 * @see https://react-aria.adobe.com/Tabs
 */
const RadioTabsList = ({
  className: classNames,
  describedBy,
  disabled,
  label,
  onChange,
  options,
  selectedKey,
  testId,
  variant,
}: RadioTabsListProps) => {
  const [list, setList] = useState<HTMLDivElement | null>(null);
  const [cursor, setCursor] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);

  // keep the selection indicator aligned after layout changes
  useLayoutEffect(() => {
    if (!list) {
      return undefined;
    }

    const update = () => {
      const active = list.querySelector<HTMLElement>(
        '[role="tab"][aria-selected="true"]',
      );

      if (!active) {
        setCursor(null);

        return;
      }

      setCursor({
        left:
          active.offsetLeft +
          (variant === 'underlined' ? active.offsetWidth * 0.1 : 0),
        top:
          variant === 'underlined'
            ? active.offsetTop + active.offsetHeight - 2
            : active.offsetTop,
        width:
          variant === 'underlined'
            ? active.offsetWidth * 0.8
            : active.offsetWidth,
        height: variant === 'underlined' ? 2 : active.offsetHeight,
      });
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(list);
    list.querySelectorAll('[role="tab"]').forEach((tab) => {
      observer.observe(tab);
    });

    return () => {
      observer.disconnect();
    };
  }, [list, selectedKey, variant, options]);

  // forward tab keys as option string values
  const handleSelectionChange = (key: Key | null) => {
    if (key != null) {
      onChange(String(key));
    }
  };

  return (
    <Tabs
      className={classNames.tabWrapper}
      data-placement="top"
      data-slot="tabWrapper"
      data-vertical="horizontal"
      disabledKeys={options
        .filter((option) => {
          return !!disabled || !!option.disabled;
        })
        .map((option) => {
          return String(option.value);
        })}
      onSelectionChange={handleSelectionChange}
      selectedKey={selectedKey}
    >
      <div className={classNames.tabBase} data-slot="base">
        <TabList
          ref={setList}
          aria-describedby={describedBy}
          aria-label={label}
          className={classNames.tabList}
          data-slot="tabList"
          render={(props) => {
            return (
              <div {...props}>
                {cursor ? (
                  <span
                    aria-hidden
                    className={classNames.cursor}
                    data-animated="true"
                    data-initialized="true"
                    data-slot="cursor"
                    style={cursor}
                  />
                ) : null}
                {props.children}
              </div>
            );
          }}
        >
          {options.map((option) => {
            return (
              <RadioTab
                key={String(option.value)}
                className={classNames}
                describedBy={describedBy}
                disabled={disabled}
                option={option}
                testId={testId(option.value, option.testId)}
              />
            );
          })}
        </TabList>
      </div>
      {options.map((option) => {
        return option.content != null ? (
          <TabPanel
            key={String(option.value)}
            className={classNames.tabPanel}
            data-slot="panel"
            id={String(option.value)}
          >
            {option.content}
          </TabPanel>
        ) : null;
      })}
    </Tabs>
  );
};

export default RadioTabsList;
