import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { TabsProps } from '@fuf-stack/pixels';
import type { TabProps } from '@fuf-stack/pixels/Tabs';
import type { ReactElement, ReactNode } from 'react';

import { RadioGroup as HeroRadioGroup } from '@heroui/radio';

import { tv, variantsToClassNames } from '@fuf-stack/pixel-utils';
import Tabs from '@fuf-stack/pixels/Tabs';

import { Controller } from '../Controller';
import { useFormContext } from '../hooks';
import { FieldCopyTestIdButton } from '../partials/FieldCopyTestIdButton';
import { FieldValidationError } from '../partials/FieldValidationError';

export const radioTabsVariants = tv({
  slots: {
    base: 'group', // Needs group for group-data condition
    label:
      'text-sm text-foreground subpixel-antialiased group-data-[invalid=true]:text-danger',
    wrapper: '',
    tabList: '',
    tab: '',
    tabContent: '',
    cursor: '',
    panel: '',
  },
});

type VariantProps = TVProps<typeof radioTabsVariants>;
type ClassName = TVClassName<typeof radioTabsVariants>;

export interface RadioTabsProps extends VariantProps {
  /** CSS class name */
  className?: ClassName;
  /** Determines if the Buttons are disabled or not. */
  disabled?: boolean;
  /** determines orientation of the Buttons. */
  inline?: boolean;
  /** Label displayed next to the RadioButton. */
  label?: ReactNode;
  /** Name the RadioButtons are registered at in HTML forms (react-hook-form). */
  name: string;
  /** Radio button configuration. */
  options: (Omit<TabProps, 'content'> & { content?: ReactNode })[];
  /** Id to grab element in internal tests. */
  testId?: string;
  /** How the RadioTabs should look like. */
  variant?: TabsProps['variant'];
}

/**
 * RadioTabs component based on [HeroUI RadioGroup](https://www.heroui.com//docs/components/radio-group)
 *                          and [HeroUI Tabs](https://www.heroui.com//docs/components/tabs)
 */
const RadioTabs = ({
  className = undefined,
  disabled = false,
  inline = false,
  label = undefined,
  name,
  options,
  testId: _testId = undefined,
  variant = undefined,
}: RadioTabsProps): ReactElement => {
  const { control, debugMode, getFieldState, getValues } = useFormContext();

  const { error, invalid, required, testId } = getFieldState(name, _testId);

  const showTestIdCopyButton = debugMode === 'debug-testids';
  const showLabel = label || showTestIdCopyButton;

  const variants = radioTabsVariants();
  const classNames = variantsToClassNames(variants, className, 'base');

  const disabledKeys: string[] | undefined = options?.map(
    (option) => option.key as string,
  );

  return (
    <Controller
      control={control}
      disabled={disabled}
      name={name}
      render={({ field: { onChange, disabled: isDisabled, onBlur, ref } }) => {
        return (
          <HeroRadioGroup
            classNames={classNames}
            // see HeroUI styles for group-data condition (data-invalid),
            // e.g.: https://github.com/heroui-inc/heroui/blob/main/packages/components/select/src/use-select.ts
            data-invalid={invalid}
            data-required={required}
            data-testid={testId}
            errorMessage={error && <FieldValidationError error={error} />}
            isDisabled={isDisabled}
            isInvalid={invalid}
            isRequired={required}
            label={
              showLabel && (
                // eslint-disable-next-line jsx-a11y/label-has-associated-control
                <label>
                  {label}
                  {showTestIdCopyButton && (
                    <FieldCopyTestIdButton testId={testId} />
                  )}
                </label>
              )
            }
            name={name}
            orientation={inline ? 'horizontal' : 'vertical'}
            onBlur={onBlur}
            onChange={onChange}
            ref={ref}
          >
            <Tabs
              disabledKeys={disabled ? disabledKeys : undefined}
              variant={variant}
              fullWidth={false}
              tabs={options as TabProps[]}
              onSelectionChange={onChange}
              defaultSelectedKey={getValues()[name]}
            />
          </HeroRadioGroup>
        );
      }}
    />
  );
};

export default RadioTabs;
