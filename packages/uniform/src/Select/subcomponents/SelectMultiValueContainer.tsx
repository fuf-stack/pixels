import { useContext } from 'react';
import { components } from 'react-select';

import { useStyling } from '@fuf-stack/pixels/StylingProvider';

import { SelectSlotContext } from './SelectContext';

/** Props inherited from the corresponding React Select adapter */
type SelectMultiValueContainerProps = Parameters<
  typeof components.MultiValueContainer
>[0];

const SelectMultiValueContainer = (props: SelectMultiValueContainerProps) => {
  const slots = useContext(SelectSlotContext);
  const { cn } = useStyling();

  const { innerProps } = props;
  return (
    <components.MultiValueContainer
      {...props}
      innerProps={{
        ...innerProps,
        className: cn(innerProps.className, slots.multiValueContainer),
      }}
    />
  );
};

export default SelectMultiValueContainer;
