import type { InputProps } from '@fuf-stack/uniform/Input';
import type { SelectProps } from '@fuf-stack/uniform/Select';
import type { SwitchProps } from '@fuf-stack/uniform/Switch';
import type { SwitchBoxProps } from '@fuf-stack/uniform/SwitchBox';
import type { TextAreaProps } from '@fuf-stack/uniform/TextArea';

import { useUniformField } from '@fuf-stack/uniform/hooks/useUniformField';

// Exercise the existing input contract against the packed declarations.
export const inputProps: InputProps = {
  name: 'amount',
  type: 'number',
  size: 'sm',
  description: 'Enter an amount',
  clearable: true,
  className: {
    base: ['mt-4'],
    inputWrapper: 'border-danger',
    input: 'text-body text-danger',
    clearButton: 'text-danger',
  },
  transform: {
    toDisplayValue: (value) => String(value ?? ''),
    toFormValue: (value) => Number(value),
  },
  onClear: () => {},
};

export const textAreaProps: TextAreaProps = {
  name: 'editor',
  label: 'Editor',
  description: 'Multiline text',
  debounceDelay: 500,
  className: {
    base: ['mt-4'],
    inputWrapper: 'border-danger',
    input: 'text-body text-danger',
    clearButton: 'unused-existing-slot',
  },
};

export const selectProps: SelectProps = {
  name: 'choice',
  description: 'Choose a number',
  options: [{ label: 'Zero', value: 0 }],
  multiSelect: true,
  selectedOptionFallback: [{ label: 'Two', value: 2 }],
  className: {
    input: 'text-body',
    singleValue: 'text-body text-danger',
    multiValueContainer: 'rounded',
    crossIcon: 'text-danger',
    downChevron: 'text-danger',
  },
};

export const switchProps: SwitchProps = {
  name: 'enabled',
  size: 'lg',
  description: 'Toggle setting',
  className: { label: 'text-body', thumbIcon: 'text-danger' },
  thumbIcon: ({
    width,
    height,
    className,
    isSelected,
    'data-checked': checked,
  }) => {
    const dimensions: string[] = [width, height, className, checked];
    return isSelected ? dimensions.join(' ') : null;
  },
};

export const switchBoxProps: SwitchBoxProps = { ...switchProps, icon: null };

export default function useEditorField() {
  const field = useUniformField<{ editor: string }>({
    name: 'editor',
    label: 'Editor',
    description: 'Markdown supported',
  });
  const id: string = field.ids.control;
  const ariaRequired: boolean | 'true' | 'false' | undefined =
    field.getControlProps()['aria-required'];
  // @ts-expect-error field-name inference must remain constrained
  useUniformField<{ editor: string }>({ name: 'missing' });
  return { id, ariaRequired };
}
