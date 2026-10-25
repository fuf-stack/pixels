import { useContext } from 'react';
import { components } from 'react-select';

import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import { SelectSlotContext } from './SelectContext';

/** Props inherited from the corresponding React Select adapter */
type SelectCrossIconProps = Parameters<typeof components.CrossIcon>[0];

/** Bind the declared icon/container slots to React Select's corresponding elements. */
const SelectCrossIcon = (props: SelectCrossIconProps) => {
  const { className } = props;
  const slots = useContext(SelectSlotContext);
  const { cn } = useStyling();
  return (
    <components.CrossIcon
      {...props}
      className={cn(className, slots.crossIcon)}
    />
  );
};

export default SelectCrossIcon;
