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
      // eslint-disable-next-line react/jsx-props-no-spreading
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
        {/* eslint-disable-next-line react/jsx-props-no-spreading  */}
        <input {...getInputProps()} />
      </VisuallyHidden>
      {/* eslint-disable-next-line react/jsx-props-no-spreading  */}
      <span {...getWrapperProps()}>
        {/* eslint-disable-next-line react/jsx-props-no-spreading  */}
        <span {...getControlProps()} />
      </span>
      {icon}
      <div
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...getLabelWrapperProps()}
        className={cn(getLabelWrapperProps().className, 'grow')}
      >
        {/* eslint-disable-next-line react/jsx-props-no-spreading  */}
        {children && <span {...getLabelProps()}>{children}</span>}
        {description && (
          <span className="text-small text-foreground opacity-70">
            {description}
          </span>
        )}
      </div>
    </Component>
  );
};

export default RadioBox;
