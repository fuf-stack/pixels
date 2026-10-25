import { useContext } from 'react';
import { components } from 'react-select';

import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import { SelectSlotContext } from './SelectContext';

/** Props inherited from the corresponding React Select adapter */
type SelectDownChevronProps = Parameters<typeof components.DownChevron>[0];

const SelectDownChevron = (props: SelectDownChevronProps) => {
  const { className } = props;
  const slots = useContext(SelectSlotContext);
  const { cn } = useStyling();
  return (
    <components.DownChevron
      {...props}
      className={cn(className, slots.downChevron)}
    />
  );
};

export default SelectDownChevron;
