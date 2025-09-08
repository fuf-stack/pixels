import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { ReactElement, ReactNode } from 'react';

import { RadioGroup as HeroRadioGroup } from '@heroui/radio';

import { slugify, tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

import { useController, useFormContext } from '../hooks';
import { FieldCopyTestIdButton } from '../partials/FieldCopyTestIdButton';
import { FieldValidationError } from '../partials/FieldValidationError';
import { RadioBox } from './RadioBox';

export const radioBoxesVariants = tv({
  slots: {
    base: 'group', // Needs group for group-data condition
    itemBase: '',
    itemControl: 'bg-focus group-data-[invalid=true]:bg-danger',
    itemDescription: '',
    itemLabel: 'text-sm',
    itemLabelWrapper: '',
    itemWrapper:
      'group-data-[invalid=true]:!border-danger [&:not(group-data-[invalid="true"]):not(group-data-[selected="false"])]:border-focus', // TODO: get rid of !.
    // see HeroUI styles for group-data condition,
    // e.g.: https://github.com/heroui-inc/heroui/blob/main/packages/core/theme/src/components/select.ts
    label:
      'text-foreground group-data-[invalid=true]:text-danger text-sm subpixel-antialiased',
    wrapper: '',
  },
});

type VariantProps = TVProps<typeof radioBoxesVariants>;
type ClassName = TVClassName<typeof radioBoxesVariants>;

export interface RadioBoxesOption {
  /** Description of the value. Works with variant radioBox. */
  description?: ReactNode;
  /** disables the option */
  disabled?: boolean;
  /** option label */
  label?: ReactNode;
  /** option icon */
  icon?: ReactNode;
  /** HTML data-testid attribute of the option */
  testId?: string;
  /** option value */
  value: string;
}

export interface RadioBoxesProps extends VariantProps {
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
  options: RadioBoxesOption[];
  /** Id to grab element in internal tests. */
  testId?: string;
}

/**
 * RadioBoxes component based on [HeroUI RadioGroup](https://www.heroui.com//docs/components/radio-group)
 */
const RadioBoxes = ({
  className = undefined,
  disabled = false,
  inline = false,
  label = undefined,
  name,
  options,
  testId: _testId = undefined,
}: RadioBoxesProps): ReactElement => {
  const { control, debugMode, getFieldState, getValues } = useFormContext();

  const { error, invalid, required, testId } = getFieldState(name, _testId);

  const { field } = useController({ control, disabled, name });
  const { onChange, disabled: isDisabled, onBlur, ref } = field;

  const showTestIdCopyButton = debugMode === 'debug-testids';
  const showLabel = label || showTestIdCopyButton;

  const variants = radioBoxesVariants();
  const classNames = variantsToClassNames(variants, className, 'base');

  const itemClassNames = {
    base: classNames.itemBase,
    control: classNames.itemControl,
    description: classNames.itemDescription,
    label: classNames.itemLabel,
    labelWrapper: classNames.itemLabelWrapper,
    wrapper: classNames.itemWrapper,
  };

  return (
    <HeroRadioGroup
      classNames={classNames}
      // see HeroUI styles for group-data condition (data-invalid),
      // e.g.: https://github.com/heroui-inc/heroui/blob/main/packages/components/select/src/use-select.ts
      data-invalid={invalid}
      data-required={required}
      data-testid={testId}
      defaultValue={getValues()[name]}
      errorMessage={
        error && <FieldValidationError error={error} testId={testId} />
      }
      isDisabled={isDisabled}
      isInvalid={invalid}
      isRequired={required}
      label={
        showLabel && (
          // eslint-disable-next-line jsx-a11y/label-has-associated-control
          <label>
            {label}
            {showTestIdCopyButton && <FieldCopyTestIdButton testId={testId} />}
          </label>
        )
      }
      name={name}
      orientation={inline ? 'horizontal' : 'vertical'}
      onBlur={onBlur}
      ref={ref}
    >
      {options.map((option) => {
        if ('value' in option) {
          const optionTestId = slugify(
            `${testId}_option_${option.testId || option.value}`,
            { replaceDots: true },
          );
          return (
            <RadioBox
              classNames={itemClassNames}
              data-testid={optionTestId}
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
      })}
    </HeroRadioGroup>
  );
};

export default RadioBoxes;
