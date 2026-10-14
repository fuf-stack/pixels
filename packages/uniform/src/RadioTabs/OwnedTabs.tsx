import type { RadioTabsProps } from './RadioTabs';

import { useLayoutEffect, useState } from 'react';
import { Tab, TabList, TabPanel, Tabs } from 'react-aria-components';

import { tv } from '@fuf-stack/pixel-utils';

import radioTabsVariants from './radioTabsVariants';

export const radioTabsStateVariants = tv({
  extend: radioTabsVariants,
  slots: {
    base: 'relative',
    label: 'relative',
    tabBase: 'inline-flex w-full',
    tabList:
      'relative flex h-fit w-full flex-nowrap items-center gap-2 overflow-x-auto rounded-medium bg-default-100 p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
    tab: 'outline-solid group relative z-0 flex h-8 w-full cursor-pointer items-center justify-center rounded-small px-3 py-1 outline-transparent transition-opacity text-small data-[focus-visible=true]:z-10 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-30 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-focus motion-reduce:transition-none',
    tabContent:
      'relative z-10 whitespace-nowrap text-foreground transition-colors group-data-[selected=true]:text-default-foreground motion-reduce:transition-none',
    cursor:
      'pointer-events-none absolute z-0 rounded-small bg-background shadow-small transition-[left,top,width,height] duration-250 ease-out motion-reduce:transition-none dark:bg-default',
    tabPanel:
      'outline-solid p-3 outline-transparent data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-focus',
  },
  variants: {
    appearance: {
      solid: {},
      light: { tabList: 'bg-transparent dark:bg-transparent' },
      bordered: {
        tabList:
          'shadow-xs border-2 border-default-200 bg-transparent dark:bg-transparent',
      },
      underlined: {
        tabList: 'rounded-none bg-transparent dark:bg-transparent',
        cursor:
          'rounded-none bg-foreground shadow-[0_1px_0px_0_rgba(0,0,0,0.05)] dark:bg-foreground',
        tab: 'rounded-none',
      },
    },
  },
});

/** Uniform's tab engine avoids the legacy all-disabled keyboard-delegate loop. */
const OwnedTabs = ({
  options,
  selectedKey,
  disabled,
  classes,
  testId,
  label,
  variant,
  onChange,
  describedBy,
}: {
  options: RadioTabsProps['options'];
  selectedKey: string;
  disabled: boolean | undefined;
  classes: Record<string, string>;
  testId: (value: string | number | boolean, explicit?: string) => string;
  label: string;
  variant: RadioTabsProps['variant'];
  onChange: (value: string) => void;
  describedBy: string | undefined;
}) => {
  const [list, setList] = useState<HTMLDivElement | null>(null);
  const [cursor, setCursor] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);
  useLayoutEffect(() => {
    if (!list) return undefined;
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
    list
      .querySelectorAll('[role="tab"]')
      .forEach((tab) => observer.observe(tab));
    return () => observer.disconnect();
  }, [list, selectedKey, variant, options]);
  return (
    <Tabs
      data-slot="tabWrapper"
      data-placement="top"
      data-vertical="horizontal"
      className={classes.tabWrapper}
      selectedKey={selectedKey}
      onSelectionChange={(key) => {
        if (key != null) onChange(String(key));
      }}
      disabledKeys={options
        .filter((option) => !!disabled || !!option.disabled)
        .map((option) => String(option.value))}
    >
      <div className={classes.tabBase} data-slot="base">
        <TabList
          aria-label={label}
          aria-describedby={describedBy}
          className={classes.tabList}
          data-slot="tabList"
          ref={setList}
          render={(props) => (
            <div {...props}>
              {cursor ? (
                <span
                  aria-hidden
                  className={classes.cursor}
                  data-slot="cursor"
                  data-initialized="true"
                  data-animated="true"
                  style={cursor}
                />
              ) : null}
              {props.children}
            </div>
          )}
        >
          {options.map((option) => (
            <Tab
              key={String(option.value)}
              id={String(option.value)}
              className={classes.tab}
              data-slot="tab"
              data-key={String(option.value)}
              render={(props, state) => (
                <div
                  {...props}
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
              )}
              data-testid={testId(option.value, option.testId)}
              isDisabled={!!disabled || !!option.disabled}
              aria-describedby={describedBy}
              aria-label={
                option.label == null && typeof option.value === 'boolean'
                  ? String(option.value)
                  : undefined
              }
            >
              <span className={classes.tabContent} data-slot="tabContent">
                {option.label ?? option.value}
              </span>
            </Tab>
          ))}
        </TabList>
      </div>
      {options.map((option) =>
        option.content != null ? (
          <TabPanel
            key={String(option.value)}
            id={String(option.value)}
            className={classes.tabPanel}
            data-slot="panel"
          >
            {option.content}
          </TabPanel>
        ) : null,
      )}
    </Tabs>
  );
};

export default OwnedTabs;
