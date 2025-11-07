import type { TVClassName } from '@fuf-stack/pixel-utils';
import type { RadioProps as HeroRadioProps } from '@heroui/radio';
import type { ReactNode } from 'react';

import { useRadio } from '@heroui/radio';
import { VisuallyHidden } from '@react-aria/visually-hidden';

import { cn, tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

export const radioBoxVariants = tv({
  slots: {
    base: 'group inline-flex flex-auto cursor-pointer items-center justify-between gap-4 rounded-lg border-2 border-default p-4 hover:bg-content2 data-[selected=true]:border-focus',
    control: '',
    description: 'text-foreground opacity-70 text-small',
    icon: '',
    label: '',
    labelWrapper: 'grow',
  },
  variants: {
    isDisabled: {
      true: {
        base: 'pointer-events-none opacity-disabled',
      },
    },
    isInvalid: {
      true: {
        base: '!border-danger',
      },
    },
  },
});

type ClassName = TVClassName<typeof radioBoxVariants>;

export interface RadioBoxProps extends Omit<HeroRadioProps, 'className'> {
  /** CSS class name */
  className?: ClassName;
  /** icon for the option */
  icon?: ReactNode;
  /** whether the radio is invalid */
  isInvalid?: boolean;
}

export const RadioBox = ({
  classNames: _classNames = undefined,
  icon = undefined,
  isInvalid = false,
  ...props
}: RadioBoxProps) => {
  const {
    children,
    Component,
    description,
    getBaseProps,
    getControlProps,
    getInputProps,
    getLabelProps,
    getLabelWrapperProps,
    getWrapperProps,
    isDisabled,
  } = useRadio(props as HeroRadioProps);

  // classNames from slots
  const variants = radioBoxVariants({
    isDisabled,
    isInvalid,
  });
  const classNames = variantsToClassNames(
    variants,
    // @ts-expect-error not sure here, but it works
    _classNames,
    'base',
  );

  return (
    <Component {...getBaseProps()} className={classNames.base}>
      <VisuallyHidden>
        <input {...getInputProps()} />
      </VisuallyHidden>
      {!icon ? (
        <span {...getWrapperProps()}>
          <span
            {...getControlProps()}
            className={cn(getControlProps().className, classNames.control)}
          />
        </span>
      ) : null}
      {icon ? <div className={classNames.icon}>{icon}</div> : null}
      <div
        {...getLabelWrapperProps()}
        className={cn(
          getLabelWrapperProps().className,
          classNames.labelWrapper,
        )}
      >
        {children ? (
          <span
            {...getLabelProps()}
            className={cn(getLabelProps().className, classNames.label)}
          >
            {children}
          </span>
        ) : null}
        {description ? (
          <div className={classNames.description}>{description}</div>
        ) : null}
      </div>
      {icon ? (
        <span {...getWrapperProps()}>
          <span
            {...getControlProps()}
            className={cn(getControlProps().className, classNames.control)}
          />
        </span>
      ) : null}
    </Component>
  );
};

export default RadioBox;
