import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { ReactNode } from 'react';

import { cloneElement, isValidElement, useRef } from 'react';
import { mergeProps } from 'react-aria/mergeProps';
import { useFocusRing } from 'react-aria/useFocusRing';
import { useHover } from 'react-aria/useHover';
import { useSwitch } from 'react-aria/useSwitch';
import { VisuallyHidden } from 'react-aria/VisuallyHidden';
import { useToggleState } from 'react-stately/useToggleState';

import { tv } from '@fuf-stack/pixel-utils';
import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import useUniformField from '../hooks/useUniformField/useUniformField';
import FieldDescription from '../partials/FieldDescription/FieldDescription';
import FieldLabel from '../partials/FieldLabel/FieldLabel';

export interface SwitchThumbIconProps {
  width: string;
  height: string;
  'data-checked': string;
  isSelected: boolean;
  className: string;
}

export const switchVariants = tv({
  slots: {
    base: 'group relative inline-flex max-w-fit cursor-pointer touch-none select-none items-center justify-start tap-highlight-transparent',
    wrapper:
      'relative inline-flex h-7 w-12 shrink-0 items-center justify-start overflow-hidden rounded-full bg-default-200 px-1 transition-background group-data-[selected=true]:bg-primary group-data-[selected=true]:text-primary-foreground group-data-[focus-visible=true]:ring-2 group-data-[focus-visible=true]:ring-focus group-data-[focus-visible=true]:ring-offset-2 group-data-[focus-visible=true]:ring-offset-background motion-reduce:transition-none',
    thumb:
      'pointer-events-none z-10 flex h-5 w-5 origin-right items-center justify-center rounded-full bg-white shadow-small transition-all text-small group-data-[selected=true]:group-data-[pressed=true]:ms-4 group-data-[selected=true]:ms-5 group-data-[pressed=true]:w-6 motion-reduce:transition-none',
    label:
      'group-data-[invalid=true]:text-danger! relative ms-2 select-none text-sm text-foreground subpixel-antialiased',
    outerWrapper: 'place-content-center',
    startContent:
      'absolute start-1.5 z-0 scale-50 text-current opacity-0 transition-transform-opacity text-small group-data-[selected=true]:scale-100 group-data-[selected=true]:opacity-100 motion-reduce:transition-none',
    endContent:
      'absolute end-1.5 z-0 text-default-600 opacity-100 transition-transform-opacity text-small group-data-[selected=true]:translate-x-3 group-data-[selected=true]:opacity-0 motion-reduce:transition-none',
    thumbIcon: 'text-black',
    errorMessage: 'text-danger text-tiny',
  },
});

const switchStateVariants = tv({
  extend: switchVariants,
  slots: {
    helperWrapper: 'relative ml-0 block p-0',
    description: 'text-foreground-500 text-tiny',
  },
  variants: {
    size: {
      sm: {
        wrapper: 'h-6 w-10',
        thumb:
          'h-4 w-4 text-tiny group-data-[selected=true]:group-data-[pressed=true]:ms-3 group-data-[selected=true]:ms-4 group-data-[pressed=true]:w-5',
        startContent: 'text-tiny',
        endContent: 'text-tiny',
      },
      md: {},
      lg: {
        wrapper: 'h-8 w-14',
        thumb:
          'h-6 w-6 text-medium group-data-[selected=true]:group-data-[pressed=true]:ms-5 group-data-[selected=true]:ms-6 group-data-[pressed=true]:w-7',
        startContent: 'text-medium',
        endContent: 'text-medium',
      },
    },
    disabled: { true: { base: 'pointer-events-none opacity-disabled' } },
  },
});

type VariantProps = TVProps<typeof switchVariants>;
type ClassName = TVClassName<typeof switchVariants>;

export interface SwitchProps extends VariantProps {
  /** Custom aria-label for accessibility. If not provided, falls back to field name when no visible label exists */
  ariaLabel?: string;
  /** CSS class name */
  className?: ClassName;
  /** Optional help text associated with the switch input. */
  description?: ReactNode;
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
  thumbIcon?: ReactNode | ((props: SwitchThumbIconProps) => ReactNode);
}

/** Owned switch presentation with one RHF focus target and React Aria interactions. */
const Switch = ({
  className = undefined,
  endContent = undefined,
  name,
  size = 'md',
  startContent = undefined,
  thumbIcon = undefined,
  ...uniformProps
}: SwitchProps) => {
  const {
    field: { value, onChange, onBlur },
    ref,
    disabled,
    invalid,
    required,
    label,
    description,
    errorMessage,
    ids,
    testId,
    getControlProps,
  } = useUniformField({ name, ...uniformProps });
  const controlRef = useRef<HTMLInputElement>(null);
  const associations = getControlProps();
  const state = useToggleState({ isSelected: !!value, onChange });
  const { inputProps, labelProps, isPressed } = useSwitch(
    {
      ...associations,
      name,
      children: label,
      isDisabled: disabled,
      isInvalid: invalid,
      isRequired: required,
      validationBehavior: 'aria',
      onBlur,
    },
    state,
    controlRef,
  );
  const { focusProps, isFocused, isFocusVisible } = useFocusRing();
  const { hoverProps, isHovered } = useHover({ isDisabled: disabled });
  const styling = useStyling();
  const classes = styling.variantsToClassNames(
    styling.resolve(switchStateVariants, { size, disabled }),
    className,
    'outerWrapper',
  );
  const iconProps = {
    width: '1em',
    height: '1em',
    className: classes.thumbIcon,
    'data-checked': String(state.isSelected),
    isSelected: state.isSelected,
  };
  const renderIcon = (node: ReactNode, iconClassName: string) => {
    return (
      <>
        {isValidElement<{
          className?: string;
          width?: string;
          height?: string;
        }>(node)
          ? cloneElement(node, {
              width: '1em',
              height: '1em',
              className: iconClassName,
            })
          : node}
      </>
    );
  };
  const renderedThumb =
    typeof thumbIcon === 'function'
      ? thumbIcon(iconProps)
      : renderIcon(thumbIcon, classes.thumbIcon);

  return (
    <div className={classes.outerWrapper} data-slot="outer-wrapper">
      <label
        {...mergeProps(labelProps, hoverProps)}
        className={classes.base}
        data-disabled={disabled ? true : undefined}
        data-focus={isFocused || undefined}
        data-focus-visible={isFocusVisible || undefined}
        data-hover={isHovered || undefined}
        data-invalid={invalid}
        data-pressed={isPressed || undefined}
        data-required={required}
        data-selected={state.isSelected || undefined}
        data-slot="base"
        data-testid={testId}
        htmlFor={ids.control}
      >
        <VisuallyHidden elementType="span">
          <input
            {...mergeProps(inputProps, focusProps, associations)}
            ref={(node) => {
              controlRef.current = node;
              ref(node);
            }}
            data-slot="input"
          />
        </VisuallyHidden>
        <span aria-hidden className={classes.wrapper} data-slot="wrapper">
          {startContent ? renderIcon(startContent, classes.startContent) : null}
          <span className={classes.thumb} data-slot="thumb">
            {renderedThumb}
          </span>
          {endContent ? renderIcon(endContent, classes.endContent) : null}
        </span>
        {label ? (
          <FieldLabel
            as="span"
            className={classes.label}
            id={ids.label}
            required={required}
          >
            {label}
          </FieldLabel>
        ) : null}
      </label>
      {description || invalid ? (
        <div className={classes.helperWrapper} data-slot="helper-wrapper">
          <FieldDescription
            className={classes.description}
            id={ids.description}
          >
            {description}
          </FieldDescription>
          {invalid ? (
            <div
              className={classes.errorMessage}
              data-slot="error-message"
              id={ids.error}
            >
              {errorMessage}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default Switch;
