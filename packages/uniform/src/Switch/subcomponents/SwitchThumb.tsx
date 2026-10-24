import type { ReactNode } from 'react';

import SwitchIcon from './SwitchIcon';

export interface SwitchThumbIconProps {
  /** CSS class name */
  className: string;
  /** Selected state as a string */
  'data-checked': string;
  /** Icon height */
  height: string;
  /** Current toggle state */
  isSelected: boolean;
  /** Icon width */
  width: string;
}

interface SwitchThumbProps {
  /** CSS class name */
  className: string;
  /** Current toggle state supplied to the icon callback */
  selected: boolean;
  /** Content or render callback inside the toggle thumb */
  thumbIcon?: ReactNode | ((props: SwitchThumbIconProps) => ReactNode);
}

/** Thumb icon content, including the consumer's selection-aware render callback */
const SwitchThumb = ({
  className,
  selected,
  thumbIcon = undefined,
}: SwitchThumbProps) => {
  return (
    <>
      {typeof thumbIcon === 'function' ? (
        thumbIcon({
          width: '1em',
          height: '1em',
          className,
          'data-checked': String(selected),
          isSelected: selected,
        })
      ) : (
        <SwitchIcon className={className}>{thumbIcon}</SwitchIcon>
      )}
    </>
  );
};

export default SwitchThumb;
