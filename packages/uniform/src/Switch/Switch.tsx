import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { SwitchProps as HeroSwitchProps } from '@heroui/switch';
import type { ReactNode } from 'react';

import { useRef } from 'react';

import { Switch as HeroSwitch } from '@heroui/switch';
import { VisuallyHidden } from '@react-aria/visually-hidden';

import { cn, tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

import { useUniformField } from '../hooks';

export const switchVariants = tv({
  slots: {
    base: '',
    endContent: '',
    errorMessage: 'ml-1 mt-1',
    // see HeroUI styles for group-data condition,
    // e.g.: https://github.com/heroui-inc/heroui/blob/main/packages/core/theme/src/components/select.ts
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
  endContent = undefined,
  name,
  size = undefined,
  startContent = undefined,
  thumbIcon = undefined,
  ...uniformFieldProps
}: SwitchProps) => {
  const {
    defaultValue,
    disabled,
    errorMessage,
    field,
    getErrorMessageProps,
    getHelperWrapperProps,
    invalid,
    label,
    onBlur,
    onChange,
    ref,
    required,
    testId,
  } = useUniformField({
    name,
    ...uniformFieldProps,
  });

  // Ref for the visual switch to forward focus
  const visualSwitchRef = useRef<HTMLInputElement>(null);

  // classNames from slots
  const variants = switchVariants();
  const classNames = variantsToClassNames(variants, className, 'outerWrapper');

  return (
    <div className={classNames.outerWrapper}>
      {/* Visually hidden input for form accessibility and focus management */}
      <VisuallyHidden>
        <input
          ref={ref}
          aria-label={typeof label === 'string' ? label : name}
          checked={!!field.value}
          name={name}
          onBlur={onBlur}
          type="checkbox"
          onChange={(e) => {
            onChange(e.target.checked);
          }}
          onFocus={() => {
            // When RHF focuses this hidden input (e.g., on validation error),
            // forward focus to the visual switch to show focus ring
            visualSwitchRef.current?.focus();
          }}
        />
      </VisuallyHidden>
      {/* Visual HeroSwitch component */}
      <HeroSwitch
        ref={visualSwitchRef}
        classNames={classNames}
        data-invalid={invalid}
        data-required={required}
        data-testid={testId}
        defaultSelected={!!defaultValue}
        endContent={endContent}
        isDisabled={disabled}
        isSelected={!!field.value}
        name={`${name}_switch`}
        onValueChange={onChange}
        size={size}
        startContent={startContent}
        thumbIcon={thumbIcon}
      >
        {label}
      </HeroSwitch>
      {invalid ? (
        <div
          {...getHelperWrapperProps()}
          className={cn(
            getHelperWrapperProps()?.className,
            // force helper to be visible (for some reason it's hidden by default) and remove margin
            'ml-0 block',
          )}
        >
          <div {...getErrorMessageProps()}>{errorMessage}</div>
        </div>
      ) : null}
    </div>
  );
};

export default Switch;
