import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { SwitchProps as HeroSwitchProps } from '@heroui/switch';
import type { ReactNode } from 'react';
import type { FieldValues } from 'react-hook-form';

import { Switch as HeroSwitch } from '@heroui/switch';

import { tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

import { useController, useFormContext, useInput } from '../hooks';
import { FieldCopyTestIdButton } from '../partials/FieldCopyTestIdButton';
import { FieldValidationError } from '../partials/FieldValidationError';

export const switchVariants = tv({
  slots: {
    base: '',
    endContent: '',
    errorMessage: 'mt-1 ml-1',
    // see HeroUI styles for group-data condition,
    // e.g.: https://github.com/heroui-inc/heroui/blob/main/packages/core/theme/src/components/select.ts
    label:
      'text-foreground group-data-[invalid=true]:!text-danger group-data-[required=true]:after:text-danger text-sm subpixel-antialiased group-data-[required=true]:after:ml-0.5 group-data-[required=true]:after:content-["*"]',
    outerWrapper: 'place-content-center',
    startContent: '',
    thumb: '',
    thumbIcon: '',
    wrapper: '',
  },
});

type VariantProps = TVProps<typeof switchVariants>;
type ClassName = TVClassName<typeof switchVariants>;

export interface SwitchProps extends VariantProps {
  /** CSS class name */
  className?: ClassName;
  /** whether the select should be disabled */
  disabled?: boolean;
  /** Icon to be displayed at the end of the switch (when enabled) */
  endContent?: ReactNode;
  /** component displayed next to the switch */
  label?: ReactNode;
  /** name the field is registered under */
  name: string;
  /* Size of the switch */
  size?: 'sm' | 'md' | 'lg';
  /** Icon to be displayed at the start of the switch (when disabled) */
  startContent?: ReactNode;
  /** HTML data-testid attribute used in e2e tests */
  testId?: string;
  /** Icon to be displayed inside the thumb */
  thumbIcon?: HeroSwitchProps['thumbIcon'];
}

/**
 *  Switch component based on [HeroUI Switch](https://www.heroui.com//docs/components/switch)
 */
const Switch = ({
  className = undefined,
  disabled = false,
  endContent = undefined,
  label: _label = undefined,
  name,
  size = undefined,
  startContent = undefined,
  testId: _testId = undefined,
  thumbIcon = undefined,
}: SwitchProps) => {
  const { control, debugMode, getFieldState } = useFormContext();
  const { error, required, testId, invalid } = getFieldState(name, _testId);

  const { field } = useController<FieldValues>({ name, control, disabled });
  const { disabled: isDisabled, value, ref, onBlur, onChange } = field;

  const { label, getInputProps, getErrorMessageProps } = useInput({
    errorMessage: JSON.stringify(error),
    isInvalid: invalid,
    isRequired: required,
    label: _label,
    labelPlacement: 'outside',
    placeholder: ' ',
  });

  const showTestIdCopyButton = debugMode === 'debug-testids';

  // classNames from slots
  const variants = switchVariants();
  const classNames = variantsToClassNames(variants, className, 'outerWrapper');

  return (
    <div className={classNames.outerWrapper}>
      <HeroSwitch
        ref={ref}
        // see HeroUI styles for group-data condition (data-invalid),
        // e.g.: https://github.com/heroui-inc/heroui/blob/main/packages/components/select/src/use-select.ts
        aria-describedby={getInputProps()['aria-describedby']}
        classNames={classNames}
        data-invalid={invalid}
        data-required={required}
        data-testid={testId}
        endContent={endContent}
        isDisabled={isDisabled}
        isSelected={!!value}
        name={name}
        onBlur={onBlur}
        onValueChange={onChange}
        required={required}
        size={size}
        startContent={startContent}
        thumbIcon={thumbIcon}
        value={value}
      >
        {label}
        {showTestIdCopyButton ? (
          <FieldCopyTestIdButton testId={testId} />
        ) : null}
      </HeroSwitch>
      {error ? (
        <div className={classNames.errorMessage}>
          <div {...getErrorMessageProps()}>
            <FieldValidationError error={error} testId={testId} />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Switch;
