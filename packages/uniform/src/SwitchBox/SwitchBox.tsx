import type { TVClassName } from '@fuf-stack/pixel-utils';
import type { ReactNode } from 'react';
import type { SwitchProps } from '../Switch/Switch';

import { useRef } from 'react';
import { mergeProps } from 'react-aria/mergeProps';
import { useFocusRing } from 'react-aria/useFocusRing';
import { useHover } from 'react-aria/useHover';
import { useSwitch } from 'react-aria/useSwitch';
import { VisuallyHidden } from 'react-aria/VisuallyHidden';
import { useToggleState } from 'react-stately/useToggleState';

import { tv } from '@fuf-stack/pixel-utils';
import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import useUniformFieldState from '../hooks/useUniformField/useUniformFieldState';
import { FieldHints } from '../partials/FieldLayout/FieldLayout';
import { switchVariants } from '../Switch/Switch';

export const switchBoxVariants = tv({
  slots: {
    box: 'group inline-flex w-full cursor-pointer items-center justify-between rounded-lg border-2 border-default hover:bg-content2 data-[selected=true]:border-focus',
    description: 'text-foreground opacity-70',
    icon: '',
    label: 'font-medium text-foreground',
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
  thumbIcon?: SwitchProps['thumbIcon'];
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
    disabled,
    errorMessage,
    field: { value, onChange, onBlur },
    invalid,
    label,
    ref,
    required,
    ids,
    testId,
    getControlProps,
  } = useUniformFieldState({ name, description, ...uniformFieldProps });
  const inputRef = useRef<HTMLInputElement>(null);
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
    inputRef,
  );
  const { focusProps, isFocused, isFocusVisible } = useFocusRing();
  const { hoverProps, isHovered } = useHover({ isDisabled: disabled });
  const styling = useStyling();
  const classes = styling.variantsToClassNames(
    styling.resolve(switchBoxVariants, {
      isDisabled: disabled,
      isInvalid: invalid,
      size,
    }),
    className,
    'box',
  );
  const track = styling.resolve(switchVariants);
  const trackSizes = { sm: 'h-6 w-10', md: '', lg: 'h-8 w-14' };
  const thumbSizes = {
    sm: 'h-4 w-4 text-tiny group-data-[selected=true]:ms-4 group-data-[selected=true]:group-data-[pressed=true]:ms-3 group-data-[pressed=true]:w-5',
    md: '',
    lg: 'h-6 w-6 text-medium group-data-[selected=true]:ms-6 group-data-[selected=true]:group-data-[pressed=true]:ms-5 group-data-[pressed=true]:w-7',
  };
  const trackClass = styling.cn(
    track.wrapper(),
    trackSizes[size ?? 'md'],
    classes.wrapper,
  );
  const thumbClass = styling.cn(
    track.thumb(),
    thumbSizes[size ?? 'md'],
    classes.thumb,
  );
  const thumb = (
    <span aria-hidden className={trackClass} data-slot="wrapper">
      <span className={thumbClass} data-slot="thumb">
        {typeof thumbIcon === 'function'
          ? thumbIcon({
              isSelected: state.isSelected,
              className: styling.cn(track.thumbIcon(), classes.thumbIcon),
              width: '1em',
              height: '1em',
              'data-checked': String(state.isSelected),
            })
          : thumbIcon}
      </span>
    </span>
  );

  return (
    <>
      <label
        {...mergeProps(labelProps, hoverProps)}
        className={classes.box}
        data-focus={isFocused || undefined}
        data-focus-visible={isFocusVisible || undefined}
        data-hover={isHovered || undefined}
        data-pressed={isPressed || undefined}
        data-selected={state.isSelected || undefined}
        data-invalid={invalid}
        data-required={required}
        data-testid={testId}
        htmlFor={ids.control}
      >
        <VisuallyHidden elementType="span">
          <input
            {...mergeProps(inputProps, focusProps, associations)}
            ref={(node) => {
              inputRef.current = node;
              ref(node);
            }}
            data-slot="input"
          />
        </VisuallyHidden>
        {!icon ? thumb : null}
        {icon ? <div className={classes.icon}>{icon}</div> : null}
        <div className="grow">
          {label ? (
            <div className={classes.label} data-slot="label" id={ids.label}>
              {label}
              {required ? (
                <span aria-hidden className="ml-0.5 text-danger">
                  *
                </span>
              ) : null}
            </div>
          ) : null}
          {description ? (
            <div className={classes.description} id={ids.description}>
              {description}
            </div>
          ) : null}
        </div>
        {icon ? thumb : null}
      </label>
      <FieldHints
        classes={{
          helperWrapper: 'relative ml-0 block p-0',
          errorMessage: 'text-danger text-tiny',
        }}
        errorMessage={errorMessage}
        ids={ids}
        invalid={invalid}
      />
    </>
  );
};

export default SwitchBox;
