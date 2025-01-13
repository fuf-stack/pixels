import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';

import { Switch as NextSwitch } from '@nextui-org/switch';

import { tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

import { Controller } from '../Controller';
import { useFormContext, useInput } from '../hooks';
import { FieldCopyTestIdButton } from '../partials/FieldCopyTestIdButton';
import { FieldValidationError } from '../partials/FieldValidationError';

export const switchVariants = tv({
  slots: {
    base: '',
    endContent: '',
    errorMessage: 'ml-1 mt-1',
    // See NextUI styles for group-data condition, e.g.: https://github.com/nextui-org/nextui/blob/main/packages/core/theme/src/components/select.ts
    label:
      'text-sm text-foreground subpixel-antialiased group-data-[invalid=true]:!text-danger group-data-[required=true]:after:ml-0.5 group-data-[required=true]:after:text-danger group-data-[required=true]:after:content-["*"]',
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
  /** component displayed next to the switch. */
  label?: React.ReactNode;
  /** name the field is registered under */
  name: string;
  /** HTML data-testid attribute used in e2e tests */
  testId?: string;
}

/**
 *  Switch component based on [NextUI Switch](https://nextui.org/docs/components/switch)
 */
const Switch = ({
  className = undefined,
  disabled = false,
  label: _label = undefined,
  name,
  testId: _testId = undefined,
}: SwitchProps) => {
  const { control, debugMode, getFieldState } = useFormContext();
  const { error, required, testId, invalid } = getFieldState(name, _testId);

  const { label, getInputProps, getErrorMessageProps } = useInput({
    errorMessage: JSON.stringify(error),
    isInvalid: invalid,
    isRequired: required,
    label: _label,
    labelPlacement: 'outside',
    placeholder: ' ',
  });

  const variants = switchVariants();
  const classNames = variantsToClassNames(variants, className, 'outerWrapper');

  const showTestIdCopyButton = debugMode === 'debug-testids';

  return (
    <Controller
      name={name}
      control={control}
      disabled={disabled}
      render={({
        field: { disabled: isDisabled, value, ref, onBlur, onChange },
      }) => {
        return (
          <div className={classNames.outerWrapper}>
            <NextSwitch
              aria-describedby={getInputProps()['aria-describedby']}
              classNames={classNames}
              // See NextUI styles for group-data condition (data-invalid), e.g.: https://github.com/nextui-org/nextui/blob/main/packages/components/select/src/use-select.ts
              data-invalid={invalid}
              data-required={required}
              data-testid={testId}
              isDisabled={isDisabled}
              isSelected={!!value}
              name={name}
              onBlur={onBlur}
              onValueChange={onChange}
              ref={ref}
              required={required}
              value={value}
            >
              {label}
              {showTestIdCopyButton && (
                <FieldCopyTestIdButton testId={testId} />
              )}
            </NextSwitch>
            {error && (
              <div className={classNames.errorMessage}>
                <div
                  /* eslint-disable-next-line react/jsx-props-no-spreading */
                  {...getErrorMessageProps()}
                >
                  <FieldValidationError error={error} />
                </div>
              </div>
            )}
          </div>
        );
      }}
    />
  );
};

export default Switch;
