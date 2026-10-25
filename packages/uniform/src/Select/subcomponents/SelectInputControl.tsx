import { components } from 'react-select';

/** Props inherited from the corresponding React Select adapter */
type SelectInputControlProps = Parameters<typeof components.Control>[0];

/** Wraps the control root to expose a stable `*_select` test id hook. */
const SelectInputControl = (props: SelectInputControlProps) => {
  // @ts-expect-error data-testid is not a default prop
  // eslint-disable-next-line react/destructuring-assignment
  const testId = `${props.selectProps['data-testid']}_select`;

  return (
    <div data-testid={testId}>
      <components.Control {...props} />
    </div>
  );
};

export default SelectInputControl;
