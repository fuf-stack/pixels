import { components } from 'react-select';

import SelectDownChevron from './SelectDownChevron';

/** Props inherited from the corresponding React Select adapter */
type SelectDropdownIndicatorProps = Parameters<
  typeof components.DropdownIndicator
>[0];

/** Wraps the dropdown indicator with a predictable test id for automation. */
const SelectDropdownIndicator = (props: SelectDropdownIndicatorProps) => {
  // @ts-expect-error data-testid is not a default prop
  const testId = props?.selectProps['data-testid'] as string;
  return (
    <div data-testid={`${testId}_select_dropdown`}>
      <components.DropdownIndicator {...props}>
        <SelectDownChevron />
      </components.DropdownIndicator>
    </div>
  );
};

export default SelectDropdownIndicator;
