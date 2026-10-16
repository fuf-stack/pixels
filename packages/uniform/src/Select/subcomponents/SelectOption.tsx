import { components } from 'react-select';

import { slugify } from '@fuf-stack/pixel-utils';

/** Props inherited from the corresponding React Select adapter */
type SelectOptionProps = Parameters<typeof components.Option>[0];

/** Adds deterministic option test ids and forwards disabled state semantics. */
const SelectOption = (props: SelectOptionProps) => {
  const { isDisabled } = props;

  // @ts-expect-error data-testid is not a default prop
  // eslint-disable-next-line react/destructuring-assignment
  const testId = `${props.selectProps['data-testid']}_select_option_${slugify(String(props?.data?.testId ?? props?.data?.value), { replaceDots: true })}`;
  return (
    <div aria-disabled={isDisabled ? true : undefined} data-testid={testId}>
      <components.Option {...props} />
    </div>
  );
};

export default SelectOption;
