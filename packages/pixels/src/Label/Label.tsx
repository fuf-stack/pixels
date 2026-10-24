import type { ReactNode } from 'react';
import type { PressEvent } from 'react-aria';
import type { ClassName, VariantProps } from './labelVariants';

import { useStyling } from '../StylingProvider';
import { labelVariants } from './labelVariants';
import LabelEndContent from './subcomponents/LabelEndContent';

export { labelVariants } from './labelVariants';

export interface LabelProps extends Pick<
  VariantProps,
  'hasEndContent' | 'isIconOnly'
> {
  /** Label content */
  children?: ReactNode;
  /** CSS class name */
  className?: ClassName;
  /** Label color */
  color?: VariantProps['color'];
  /** Element displayed after the text or inside the close action */
  endContent?: ReactNode;
  /** Icon before the text or on its own */
  icon?: ReactNode;
  /** Callback when the close action is activated */
  onClose?: (event: PressEvent) => void;
  /** Corner roundness */
  radius?: VariantProps['radius'];
  /** Label size */
  size?: VariantProps['size'];
  /** Color and border treatment */
  variant?: 'solid' | 'bordered' | 'light' | 'flat' | 'faded' | 'dot';
}

/** Compact text or icon label for categories and status, with optional dismissal */
const Label = ({
  children = undefined,
  className = undefined,
  color = 'default',
  endContent = undefined,
  icon = undefined,
  onClose = undefined,
  radius = 'full',
  size = 'md',
  variant = 'solid',
}: LabelProps) => {
  const styling = useStyling();

  const isIconOnly = !!icon && !children && !endContent;
  const hasEndContent = !!endContent;

  // classNames from slots
  const variants = styling.resolve(labelVariants, {
    closeable: !!onClose,
    color,
    hasEndContent,
    isIconOnly,
    radius,
    size,
    variant,
  });
  const classNames = styling.variantsToClassNames(variants, className, 'base');

  return (
    <div className={classNames.base} data-component="label" data-slot="base">
      {variant === 'dot' ? (
        <span className={classNames.dot} data-slot="dot" />
      ) : null}

      <span className={classNames.content} data-slot="content">
        {icon ? (
          <span className={classNames.icon} data-slot="icon">
            {icon}
          </span>
        ) : null}
        {children}
      </span>

      <LabelEndContent className={classNames} onClose={onClose}>
        {endContent}
      </LabelEndContent>
    </div>
  );
};

export default Label;
