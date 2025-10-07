import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { TabsProps } from '@fuf-stack/pixels';
import type { TabProps } from '@fuf-stack/pixels/Tabs';
import type { ReactElement, ReactNode } from 'react';

import { RadioGroup as HeroRadioGroup } from '@heroui/radio';

import { slugify, tv, variantsToClassNames } from '@fuf-stack/pixel-utils';
import Tabs from '@fuf-stack/pixels/Tabs';

import { useController, useFormContext } from '../hooks';
import { FieldCopyTestIdButton } from '../partials/FieldCopyTestIdButton';
import { FieldValidationError } from '../partials/FieldValidationError';

export const radioTabsVariants = tv({
  slots: {
    base: 'group', // Needs group for group-data condition
    cursor: '',
    label:
      'text-foreground group-data-[invalid=true]:text-danger text-sm subpixel-antialiased',
    tab: '',
    tabBase: '',
    tabContent: '',
    tabList: '',
    tabPanel: 'p-3',
    tabWrapper: '',
    wrapper: '',
  },
  variants: {
    hasContent: {
      true: {
        base: 'p-1',
        tabBase: 'p-1 pb-0',
        tabWrapper: [
          // border style
          'border-divider rounded-medium border',
          // full width
          'w-full',
        ],
      },
    },
    fullWidth: {
      true: {
        tabWrapper: 'w-full',
      },
    },
  },
});

type VariantProps = TVProps<typeof radioTabsVariants>;
type ClassName = TVClassName<typeof radioTabsVariants>;

export interface RadioTabsOption {
  /** Optional content inside of the tab */
  content?: ReactNode;
  /** disables the option */
  disabled?: boolean;
  /** option label */
  label?: React.ReactNode;
  /** option icon */
  icon?: ReactNode;
  /** HTML data-testid attribute of the option */
  testId?: string;
  /** option value */
  value: string;
}

export interface RadioTabsProps extends Omit<VariantProps, 'hasContent'> {
  /** CSS class name */
  className?: ClassName;
  /** Determines if the Buttons are disabled or not. */
  disabled?: boolean;
  /** Whether tabs should take up full container width */
  fullWidth?: boolean;
  /** determines orientation of the Buttons. */
  inline?: boolean;
  /** Label displayed next to the RadioButton. */
  label?: ReactNode;
  /** Name the RadioButtons are registered at in HTML forms (react-hook-form). */
  name: string;
  /** Radio button configuration. */
  options: RadioTabsOption[];
  /** Id to grab element in internal tests. */
  testId?: string;
  /** How the RadioTabs should look like. */
  variant?: TabsProps['variant'];
}

/**
 * RadioTabs component based on [HeroUI RadioGroup](https://www.heroui.com//docs/components/radio-group)
 * and [HeroUI Tabs](https://www.heroui.com//docs/components/tabs)
 */
const RadioTabs = ({
  className = undefined,
  disabled = false,
  fullWidth = false,
  inline = false,
  label = undefined,
  name,
  options,
  testId: _testId = undefined,
  variant = undefined,
}: RadioTabsProps): ReactElement => {
  const { control, debugMode, getFieldState } = useFormContext();
  const { error, invalid, required, testId } = getFieldState(name, _testId);

  const { field } = useController({ control, disabled, name });
  const { disabled: isDisabled, onBlur, onChange, ref, value } = field;

  const showTestIdCopyButton = debugMode === 'debug-testids';
  const showLabel = label ?? showTestIdCopyButton;

  // check if any option has content
  // eslint-disable-next-line @typescript-eslint/no-misused-promises, @typescript-eslint/promise-function-async
  const hasContent = options.some((option) => {
    return option.content;
  });

  // classNames from slots
  const variants = radioTabsVariants({ hasContent, fullWidth });
  const classNames = variantsToClassNames(variants, className, 'base');

  const tabOptions = options.map<TabProps>((option) => {
    return {
      content: option?.content,
      disabled: option?.disabled,
      key: option.value,
      label: option?.label ?? option?.value,
      testId: slugify(`option_${option?.testId ?? option?.value}`, {
        replaceDots: true,
      }),
    };
  });

  const disabledAllKeys: string[] | undefined = tabOptions?.map((option) => {
    return option.key as string;
  });

  return (
    <HeroRadioGroup
      ref={ref}
      // see HeroUI styles for group-data condition (data-invalid),
      // e.g.: https://github.com/heroui-inc/heroui/blob/main/packages/components/select/src/use-select.ts
      data-invalid={invalid}
      data-required={required}
      data-testid={testId}
      isDisabled={isDisabled}
      isInvalid={invalid}
      isRequired={required}
      name={name}
      onBlur={onBlur}
      orientation={inline ? 'horizontal' : 'vertical'}
      classNames={{
        base: classNames.base,
        label: classNames.label,
        wrapper: classNames.wrapper,
      }}
      errorMessage={
        error ? (
          <FieldValidationError error={error} testId={testId} />
        ) : undefined
      }
      label={
        showLabel ? (
          // eslint-disable-next-line jsx-a11y/label-has-associated-control
          <label>
            {label}
            {showTestIdCopyButton ? (
              <FieldCopyTestIdButton testId={testId} />
            ) : null}
          </label>
        ) : undefined
      }
    >
      <Tabs
        disabledKeys={disabled ? disabledAllKeys : undefined}
        onSelectionChange={onChange}
        // make sure component is controlled
        selectedKey={value ?? ''}
        tabs={tabOptions}
        testId={testId}
        variant={variant}
        className={{
          base: classNames.tabBase,
          cursor: classNames.cursor,
          panel: classNames.tabPanel,
          tab: classNames.tab,
          tabContent: classNames.tabContent,
          tabList: classNames.tabList,
          tabWrapper: classNames.tabWrapper,
        }}
      />
    </HeroRadioGroup>
  );
};

export default RadioTabs;
