import type { SwitchProps } from '../Switch';

import SwitchIcon from './SwitchIcon';

interface SwitchThumbProps extends Pick<SwitchProps, 'thumbIcon'> {
  /** CSS class name */
  className: string;
  /** Current toggle state supplied to the icon callback */
  selected: boolean;
}

/** Thumb icon content, including the consumer's selection-aware render callback */
const SwitchThumb = ({ className, selected, thumbIcon }: SwitchThumbProps) => {
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
