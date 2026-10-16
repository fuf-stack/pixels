import { components } from 'react-select';

import SelectCrossIcon from './SelectCrossIcon';

/** Props inherited from the corresponding React Select adapter */
type SelectClearIndicatorProps = Parameters<
  typeof components.ClearIndicator
>[0];

const SelectClearIndicator = (props: SelectClearIndicatorProps) => {
  return (
    <components.ClearIndicator {...props}>
      <SelectCrossIcon />
    </components.ClearIndicator>
  );
};

export default SelectClearIndicator;
