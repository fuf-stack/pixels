import { useContext } from 'react';
import { components } from 'react-select';

import { SelectControlContext } from './SelectContext';

/** Props inherited from the corresponding React Select adapter */
type SelectInputProps = Parameters<typeof components.Input>[0];

/** Mirrors the select test id onto the underlying react-select input element. */
const SelectInput = (props: SelectInputProps) => {
  const associations = useContext(SelectControlContext);

  // @ts-expect-error data-testid is not a default prop
  // eslint-disable-next-line react/destructuring-assignment
  const testId = `${props.selectProps['data-testid']}`;

  const { 'aria-describedby': engineDescription } = props;
  const describedBy =
    [engineDescription, associations['aria-describedby']]
      .filter(Boolean)
      .join(' ') || undefined;
  return (
    <components.Input
      {...props}
      {...associations}
      aria-describedby={describedBy}
      data-testid={testId}
    />
  );
};

export default SelectInput;
