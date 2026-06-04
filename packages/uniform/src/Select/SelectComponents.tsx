import { components } from 'react-select';

import { slugify } from '@fuf-stack/pixel-utils';

/** Mirrors the select test id onto the underlying react-select input element. */
export const InputComponent: typeof components.Input = (props) => {
  // @ts-expect-error data-testid is not a default prop
  // eslint-disable-next-line react/destructuring-assignment
  const testId = `${props.selectProps['data-testid']}`;
  return <components.Input data-testid={testId} {...props} />;
};

/** Wraps the control root to expose a stable `*_select` test id hook. */
export const ControlComponent: typeof components.Control = (props) => {
  // @ts-expect-error data-testid is not a default prop
  // eslint-disable-next-line react/destructuring-assignment
  const testId = `${props.selectProps['data-testid']}_select`;
  return (
    <div data-testid={testId}>
      <components.Control {...props} />
    </div>
  );
};

/** Adds deterministic option test ids and forwards disabled state semantics. */
export const OptionComponent: typeof components.Option = (props) => {
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

/** Wraps the dropdown indicator with a predictable test id for automation. */
export const DropdownIndicatorComponent: typeof components.DropdownIndicator = (
  props,
) => {
  // @ts-expect-error data-testid is not a default prop
  const testId = props?.selectProps['data-testid'] as string;
  return (
    <div data-testid={`${testId}_select_dropdown`}>
      <components.DropdownIndicator {...props} />
    </div>
  );
};
