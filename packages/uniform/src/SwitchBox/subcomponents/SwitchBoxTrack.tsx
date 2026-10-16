import type { SwitchBoxProps } from '../SwitchBox';

interface SwitchBoxTrackProps extends Pick<SwitchBoxProps, 'thumbIcon'> {
  /** CSS class name */
  className: Record<'thumb' | 'thumbIcon' | 'wrapper', string>;
  /** Current toggle state supplied to the icon callback */
  selected: boolean;
}

/** Visual toggle track and thumb, including the selection-aware icon callback */
const SwitchBoxTrack = ({
  className: trackClassNames,
  selected,
  thumbIcon,
}: SwitchBoxTrackProps) => {
  return (
    <span aria-hidden className={trackClassNames.wrapper} data-slot="wrapper">
      <span className={trackClassNames.thumb} data-slot="thumb">
        {typeof thumbIcon === 'function'
          ? thumbIcon({
              isSelected: selected,
              className: trackClassNames.thumbIcon,
              width: '1em',
              height: '1em',
              'data-checked': String(selected),
            })
          : thumbIcon}
      </span>
    </span>
  );
};

export default SwitchBoxTrack;
