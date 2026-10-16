import type { SwitchProps } from '../Switch';

import SwitchIcon from './SwitchIcon';
import SwitchThumb from './SwitchThumb';

interface SwitchTrackProps extends Pick<
  SwitchProps,
  'endContent' | 'startContent' | 'thumbIcon'
> {
  /** CSS class name */
  className: Record<
    'endContent' | 'startContent' | 'thumb' | 'thumbIcon' | 'wrapper',
    string
  >;
  /** Current toggle state supplied to the thumb */
  selected: boolean;
}

/** Visual switch track, thumb and optional leading and trailing icons */
const SwitchTrack = ({
  className: classNames,
  endContent,
  selected,
  startContent,
  thumbIcon,
}: SwitchTrackProps) => {
  return (
    <span aria-hidden className={classNames.wrapper} data-slot="wrapper">
      {startContent ? (
        <SwitchIcon className={classNames.startContent}>
          {startContent}
        </SwitchIcon>
      ) : null}
      <span className={classNames.thumb} data-slot="thumb">
        <SwitchThumb
          className={classNames.thumbIcon}
          selected={selected}
          thumbIcon={thumbIcon}
        />
      </span>
      {endContent ? (
        <SwitchIcon className={classNames.endContent}>{endContent}</SwitchIcon>
      ) : null}
    </span>
  );
};

export default SwitchTrack;
