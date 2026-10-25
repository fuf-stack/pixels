import { components } from 'react-select';

import SelectCrossIcon from './SelectCrossIcon';

/** Props inherited from the corresponding React Select adapter */
type SelectMultiValueRemoveProps = Parameters<
  typeof components.MultiValueRemove
>[0];

const SelectMultiValueRemove = (props: SelectMultiValueRemoveProps) => {
  return (
    <components.MultiValueRemove {...props}>
      <SelectCrossIcon size={14} />
    </components.MultiValueRemove>
  );
};

export default SelectMultiValueRemove;
