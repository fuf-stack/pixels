import type { RadioProps as HeroRadioProps } from '@heroui/radio';
import type { ReactNode } from 'react';

import { useRadio } from '@heroui/radio';
import { VisuallyHidden } from '@react-aria/visually-hidden';

import { cn } from '@fuf-stack/pixel-utils';

interface RadioProps extends HeroRadioProps {
  /** icon for the option */
  icon?: ReactNode;
}

export const RadioBox = ({ icon = undefined, ...props }: RadioProps) => {
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
  } = useRadio(props);

  return (
    <Component
      {...getBaseProps()}
      className={cn(
        'group border-default hover:bg-content2 data-[selected=true]:border-focus inline-flex flex-auto cursor-pointer items-center justify-between gap-4 rounded-lg border-2 p-4',
        {
          // disabled styles
          'opacity-disabled pointer-events-none': isDisabled,
        },
      )}
    >
      <VisuallyHidden>
        {}
        <input {...getInputProps()} />
      </VisuallyHidden>
      {}
      <span {...getWrapperProps()}>
        {}
        <span {...getControlProps()} />
      </span>
      {icon}
      <div
        {...getLabelWrapperProps()}
        className={cn(getLabelWrapperProps().className, 'grow')}
      >
        {}
        {children ? <span {...getLabelProps()}>{children}</span> : null}
        {description ? (
          <span className="text-small text-foreground opacity-70">
            {description}
          </span>
        ) : null}
      </div>
    </Component>
  );
};

export default RadioBox;
