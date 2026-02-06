import type { TVClassName } from '@fuf-stack/pixel-utils';
import type { SwitchProps as HeroSwitchProps } from '@heroui/switch';
import type { ReactNode } from 'react';

import { useRef } from 'react';

import { useSwitch } from '@heroui/switch';
import { VisuallyHidden } from '@react-aria/visually-hidden';

import { cn, tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

import { useUniformField } from '../hooks/useUniformField';

export const switchBoxVariants = tv({
  slots: {
    box: 'group inline-flex w-full cursor-pointer items-center justify-between rounded-lg border-2 border-default hover:bg-content2 data-[selected=true]:border-focus',
    description: 'text-foreground opacity-70',
    icon: '',
    label:
      'font-medium text-foreground group-data-[required=true]:after:ml-0.5 group-data-[required=true]:after:text-danger group-data-[required=true]:after:content-["*"]',
    wrapper: '',
    thumb: '',
    thumbIcon: '',
  },
  variants: {
    isDisabled: {
      true: {
        box: 'pointer-events-none opacity-disabled',
      },
    },
    isInvalid: {
      true: {
        box: '!border-danger',
        label: '!text-danger',
      },
    },
    size: {
      sm: {
        box: 'gap-2 p-3',
        description: 'text-xs',
        label: 'text-xs',
      },
      md: {
        box: 'gap-4 p-4',
        description: 'text-small',
        label: 'text-sm',
      },
      lg: {
        box: 'gap-4 p-5',
        description: 'text-small',
        label: 'text-base',
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

type ClassName = TVClassName<typeof switchBoxVariants>;

export interface SwitchBoxProps {
  /** CSS class name */
  className?: ClassName;
  /** Description text displayed below the label */
  description?: ReactNode;
  /** whether the switch should be disabled */
  disabled?: boolean;
  /** Icon to be displayed in the box */
  icon?: ReactNode;
  /** component displayed as the label */
  label?: ReactNode;
  /** name the field is registered under */
  name: string;
  /** whether the field is required */
  required?: boolean;
  /* Size of the switch */
  size?: 'sm' | 'md' | 'lg';
  /** HTML data-testid attribute used in e2e tests */
  testId?: string;
  /** Icon to be displayed inside the thumb */
  thumbIcon?: HeroSwitchProps['thumbIcon'];
}

/**
 * SwitchBox component - A card-like box with a switch control
 */
const SwitchBox = ({
  className = undefined,
  description = undefined,
  icon = undefined,
  name,
  size = undefined,
  thumbIcon = undefined,
  ...uniformFieldProps
}: SwitchBoxProps) => {
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

  // Use the useSwitch hook to get access to all the necessary props
  const {
    Component,
    slots,
    isSelected,
    getBaseProps,
    getInputProps,
    getWrapperProps,
  } = useSwitch({
    defaultSelected: !!defaultValue,
    isDisabled: disabled,
    isSelected: !!field.value,
    name: `${name}_switch`,
    onValueChange: onChange,
    size,
    thumbIcon,
  });

  // classNames from slots
  const variants = switchBoxVariants({
    isDisabled: disabled,
    isInvalid: invalid,
    size,
  });
  const classNames = variantsToClassNames(variants, className, 'box');

  return (
    <>
      <Component
        {...getBaseProps()}
        className={classNames.box}
        data-invalid={invalid}
        data-required={required}
        data-testid={testId}
      >
        <VisuallyHidden>
          <input
            ref={ref}
            aria-label={typeof label === 'string' ? label : name}
            checked={!!field.value}
            name={name}
            tabIndex={-1}
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
          {/* Visual switch input for focus ring */}
          <input
            ref={visualSwitchRef}
            {...getInputProps()}
            onBlur={(e) => {
              // Call HeroUI's internal onBlur to clear focus state and remove focus ring
              getInputProps().onBlur?.(e);
              // Then call RHF's onBlur to mark field as touched
              onBlur();
            }}
          />
        </VisuallyHidden>
        {!icon ? (
          <span
            {...getWrapperProps()}
            className={cn(getWrapperProps().className, classNames.wrapper)}
          >
            <span className={cn(slots.thumb({ class: classNames.thumb }))}>
              {thumbIcon && typeof thumbIcon === 'function'
                ? thumbIcon({
                    isSelected: !!isSelected,
                    className: slots.thumbIcon({ class: classNames.thumbIcon }),
                    width: '1em',
                    height: '1em',
                    'data-checked': isSelected ? 'true' : 'false',
                  })
                : thumbIcon}
            </span>
          </span>
        ) : null}
        {icon ? <div className={classNames.icon}>{icon}</div> : null}
        <div className="grow">
          {label ? <div className={classNames.label}>{label}</div> : null}
          {description ? (
            <div className={classNames.description}>{description}</div>
          ) : null}
        </div>
        {icon ? (
          <span
            {...getWrapperProps()}
            className={cn(getWrapperProps().className, classNames.wrapper)}
          >
            <span className={cn(slots.thumb({ class: classNames.thumb }))}>
              {thumbIcon && typeof thumbIcon === 'function'
                ? thumbIcon({
                    isSelected: !!isSelected,
                    className: slots.thumbIcon({ class: classNames.thumbIcon }),
                    width: '1em',
                    height: '1em',
                    'data-checked': isSelected ? 'true' : 'false',
                  })
                : thumbIcon}
            </span>
          </span>
        ) : null}
      </Component>
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
    </>
  );
};

export default SwitchBox;
