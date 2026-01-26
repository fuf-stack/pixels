import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { TabsProps } from '@fuf-stack/pixels';
import type { TabProps } from '@fuf-stack/pixels/Tabs';
import type { ReactElement, ReactNode } from 'react';

import { useRef } from 'react';

import { RadioGroup as HeroRadioGroup } from '@heroui/radio';
import { VisuallyHidden } from '@react-aria/visually-hidden';

import { slugify, tv, variantsToClassNames } from '@fuf-stack/pixel-utils';
import Tabs from '@fuf-stack/pixels/Tabs';

import { createOptionValueConverter } from '../helpers';
import { useUniformField } from '../hooks/useUniformField';

export const radioTabsVariants = tv({
  slots: {
    base: 'group gap-0', // Needs group for group-data condition
    cursor: '',
    label:
      'mb-2 inline-flex text-sm text-foreground subpixel-antialiased group-data-[invalid=true]:text-danger',
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
        base: '',
        tabBase: 'p-1',
        tabWrapper: [
          // border style
          'rounded-medium border border-divider',
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
    isInvalid: {
      true: {
        tabWrapper: 'rounded-medium border-2 !border-danger',
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
  label?: ReactNode;
  /** option icon */
  icon?: ReactNode;
  /** HTML data-testid attribute of the option */
  testId?: string;
  /** option value */
  value: string | number;
}

export interface RadioTabsProps extends Omit<VariantProps, 'hasContent'> {
  /** Custom aria-label for accessibility. If not provided, falls back to field name when no visible label exists */
  ariaLabel?: string;
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
  fullWidth = false,
  inline = false,
  name,
  options,
  variant = undefined,
  ...uniformFieldProps
}: RadioTabsProps): ReactElement => {
  const {
    ariaLabel,
    disabled,
    errorMessage,
    field: { onBlur, onChange, ref, value },
    invalid,
    label,
    required,
    testId,
  } = useUniformField({
    name,
    ...uniformFieldProps,
  });

  // Create a ref for the visual radio group to forward focus
  const visualRadioGroupRef = useRef<HTMLDivElement>(null);

  // Create converter to preserve number types for option values
  const { convertToOriginalType } = createOptionValueConverter(options);

  const tabOptions = options.map<TabProps>((option) => {
    return {
      content: option?.content,
      disabled: option?.disabled,
      // Tabs component uses string keys internally
      key: String(option.value),
      label: option?.label ?? option?.value,
      testId: slugify(`option_${option?.testId ?? option?.value}`, {
        replaceDots: true,
      }),
    };
  });

  const disabledAllKeys: string[] | undefined = tabOptions?.map((option) => {
    return option.key as string;
  });

  // check if any option has content
  // eslint-disable-next-line @typescript-eslint/no-misused-promises, @typescript-eslint/promise-function-async
  const hasContent = options.some((option) => {
    return option.content;
  });

  // classNames from slots
  const variants = radioTabsVariants({
    fullWidth,
    hasContent,
    isInvalid: invalid,
  });
  const classNames = variantsToClassNames(variants, className, 'base');

  return (
    <>
      {/* Visually hidden input for React Hook Form focus management */}
      <VisuallyHidden>
        <input
          ref={ref}
          aria-label={ariaLabel}
          name={name}
          onBlur={onBlur}
          value={value ?? ''}
          onChange={(e) => {
            onChange(convertToOriginalType(e.target.value));
          }}
          onFocus={() => {
            // Forward focus to the first tab when RHF focuses this input
            const firstTab = visualRadioGroupRef.current?.querySelector(
              '[role="tab"]',
            ) as HTMLElement;
            firstTab?.focus();
          }}
        />
      </VisuallyHidden>

      <HeroRadioGroup
        ref={visualRadioGroupRef}
        aria-label={ariaLabel}
        // see HeroUI styles for group-data condition (data-invalid),
        // e.g.: https://github.com/heroui-inc/heroui/blob/main/packages/components/select/src/use-select.ts
        data-invalid={invalid}
        data-required={required}
        data-testid={testId}
        errorMessage={errorMessage}
        isDisabled={disabled}
        isInvalid={invalid}
        isRequired={required}
        label={label ? <legend>{label}</legend> : null}
        name={`${name}_radiotabs`}
        orientation={inline ? 'horizontal' : 'vertical'}
        classNames={{
          base: classNames.base,
          label: classNames.label,
          wrapper: classNames.wrapper,
        }}
      >
        <Tabs
          disabledKeys={disabled ? disabledAllKeys : undefined}
          // make sure component is controlled (convert to string for Tabs)
          selectedKey={value != null ? String(value) : ''}
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
          onSelectionChange={(key) => {
            if (key != null) {
              onChange(convertToOriginalType(key));
            }
          }}
        />
      </HeroRadioGroup>
    </>
  );
};

export default RadioTabs;
