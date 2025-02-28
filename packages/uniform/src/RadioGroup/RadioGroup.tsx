import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { TabProps } from '@fuf-stack/pixels/Tabs';
import type { ReactElement, ReactNode } from 'react';

import { RadioGroup as HeroRadioGroup, Radio } from '@heroui/radio';

import { cn, slugify, tv, variantsToClassNames } from '@fuf-stack/pixel-utils';
import ButtonGroup from '@fuf-stack/pixels/ButtonGroup';
import Tabs from '@fuf-stack/pixels/Tabs';

import { Controller } from '../Controller';
import { useFormContext } from '../hooks';
import { FieldCopyTestIdButton } from '../partials/FieldCopyTestIdButton';
import { FieldValidationError } from '../partials/FieldValidationError';
import { RadioBox } from './Variants/RadioBox';
import { RadioButton } from './Variants/RadioButton';

export const radioGroupVariants = tv({
  slots: {
    base: 'group', // Needs group for group-data condition
    buttonGroup:
      'rounded-xl group-data-[invalid=true]:border group-data-[invalid=true]:border-danger', // optional if a button group is used
    itemBase: '',
    itemBaseActive: 'bg-opacity-50', // optional if a button group is used
    itemControl: 'bg-focus group-data-[invalid=true]:bg-danger',
    itemDescription: '',
    itemLabel: 'text-sm',
    itemLabelWrapper: '',
    itemWrapper:
      'group-data-[invalid=true]:!border-danger [&:not(group-data-[invalid="true"]):not(group-data-[selected="false"])]:border-focus', // TODO: get rid of !.
    // see HeroUI styles for group-data condition,
    // e.g.: https://github.com/heroui-inc/heroui/blob/main/packages/core/theme/src/components/select.ts
    label:
      'text-sm text-foreground subpixel-antialiased group-data-[invalid=true]:text-danger',
    wrapper: '',
    // Tabs
    tabList: '',
    tab: '',
    tabContent: '',
    cursor: '',
    panel: '',
  },
});

type VariantProps = TVProps<typeof radioGroupVariants>;
type ClassName = TVClassName<typeof radioGroupVariants>;

export interface RadioGroupOption {
  /** Description of the value. Works with variant radioBox. */
  description?: React.ReactNode;
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

export interface RadioGroupProps<
  V extends 'default' | 'radioBox' | 'radioButton' | 'tabs',
> extends VariantProps {
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
  options: V extends 'default' | 'radioBox' | 'radioButton'
    ? RadioGroupOption[]
    : TabProps[];
  /** Id to grab element in internal tests. */
  testId?: string;
  /** How the RadioGroup should look like. */
  variant?: V;
}

/**
 * RadioGroup component based on [HeroUI RadioGroup](https://www.heroui.com//docs/components/radio-group)
 */
const RadioGroup = ({
  className = undefined,
  disabled = false,
  inline = false,
  label = undefined,
  name,
  options,
  testId: _testId = undefined,
  variant = 'default',
}: RadioGroupProps<
  'default' | 'radioBox' | 'radioButton' | 'tabs'
>): ReactElement => {
  const { control, debugMode, getFieldState, getValues } = useFormContext();

  const { error, invalid, required, testId } = getFieldState(name, _testId);

  const showTestIdCopyButton = debugMode === 'debug-testids';
  const showLabel = label || showTestIdCopyButton;

  const variants = radioGroupVariants();
  const classNames = variantsToClassNames(variants, className, 'base');

  return (
    <Controller
      control={control}
      disabled={disabled}
      name={name}
      render={({ field: { onChange, disabled: isDisabled, onBlur, ref } }) => {
        let RadioComponents: ReactNode;

        const itemClassNames = {
          base: classNames.itemBase,
          control: classNames.itemControl,
          description: classNames.itemDescription,
          label: classNames.itemLabel,
          labelWrapper: classNames.itemLabelWrapper,
          wrapper: classNames.itemWrapper,
          tabList: classNames.tabList,
          tab: classNames.tab,
          tabContent: classNames.tabContent,
          cursor: classNames.cursor,
          panel: classNames.panel,
        };

        switch (variant) {
          case 'radioBox':
            RadioComponents = options.map((option) => {
              if ('value' in option) {
                return (
                  <RadioBox
                    classNames={itemClassNames}
                    data-testid={slugify(
                      `${testId}_option_${option.testId || option.value}`,
                    )}
                    description={option.description}
                    icon={option.icon}
                    isDisabled={isDisabled || option.disabled}
                    key={option.value}
                    onChange={onChange}
                    value={option.value}
                  >
                    {option.label ? option.label : option.value}
                  </RadioBox>
                );
              }
              return null;
            });
            break;
          case 'radioButton':
            RadioComponents = options.map((option) => {
              if ('value' in option) {
                return (
                  <RadioButton
                    className={cn(classNames.itemBase, {
                      [classNames.itemBaseActive]:
                        getValues()[name] !== option.value,
                    })}
                    isDisabled={isDisabled || option.disabled}
                    key={option.value}
                    testID={slugify(
                      `${testId}_option_${option.testId || option.value}`,
                    )}
                    onChange={onChange}
                    value={option.value}
                    // TODO: how to do the classNames properly (make selected option darker with same color)
                  >
                    {option.label ? option.label : option.value}
                  </RadioButton>
                );
              }
              return null;
            });
            break;

          case 'tabs':
            RadioComponents = (
              <Tabs
                fullWidth={false}
                tabs={options as TabProps[]}
                onSelectionChange={onChange}
              />
            );
            break;
          default:
            RadioComponents = options.map((option) => {
              if ('value' in option) {
                return (
                  <Radio
                    classNames={itemClassNames}
                    data-testid={slugify(
                      `${testId}_option_${option.testId || option.value}`,
                    )}
                    isDisabled={isDisabled || option.disabled}
                    key={option.value}
                    onChange={onChange}
                    value={option.value}
                  >
                    {option.label ? option.label : option.value}
                  </Radio>
                );
              }
              return null;
            });
        }

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
            {variant === 'radioButton' ? (
              <ButtonGroup className={classNames.buttonGroup}>
                {RadioComponents}
              </ButtonGroup>
            ) : (
              RadioComponents
            )}
          </HeroRadioGroup>
        );
      }}
    />
  );
};

export default RadioGroup;
