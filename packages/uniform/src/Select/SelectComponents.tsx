import type { HTMLAttributes } from 'react';

import { createContext, useContext } from 'react';
import { components } from 'react-select';

import { slugify } from '@fuf-stack/pixel-utils';
import { useStyling } from '@fuf-stack/pixels/StylingProvider';

export const SelectSlotContext = createContext<Record<string, string>>({});

export const SelectControlContext = createContext<
  HTMLAttributes<HTMLInputElement>
>({});

/** Mirrors the select test id onto the underlying react-select input element. */
export const InputComponent: typeof components.Input = (props) => {
  // @ts-expect-error data-testid is not a default prop
  // eslint-disable-next-line react/destructuring-assignment
  const testId = `${props.selectProps['data-testid']}`;
  const associations = useContext(SelectControlContext);
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
      <components.DropdownIndicator {...props}>
        <DownChevronComponent />
      </components.DropdownIndicator>
    </div>
  );
};

/** Bind the declared icon/container slots to React Select's corresponding elements. */
export const CrossIconComponent: typeof components.CrossIcon = (props) => {
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

export const ClearIndicatorComponent: typeof components.ClearIndicator = (
  props,
) => {
  return (
    <components.ClearIndicator {...props}>
      <CrossIconComponent />
    </components.ClearIndicator>
  );
};

export const MultiValueRemoveComponent: typeof components.MultiValueRemove = (
  props,
) => {
  return (
    <components.MultiValueRemove {...props}>
      <CrossIconComponent size={14} />
    </components.MultiValueRemove>
  );
};

export const DownChevronComponent: typeof components.DownChevron = (props) => {
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

export const MultiValueContainerComponent: typeof components.MultiValueContainer =
  (props) => {
    const { innerProps } = props;
    const slots = useContext(SelectSlotContext);
    const { cn } = useStyling();
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
