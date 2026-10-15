import type { CheckboxesProps } from '@fuf-stack/uniform/Checkboxes';
import type { InputProps } from '@fuf-stack/uniform/Input';
import type { RadioBoxesProps } from '@fuf-stack/uniform/RadioBoxes';
import type { RadiosProps } from '@fuf-stack/uniform/Radios';
import type { RadioTabsProps } from '@fuf-stack/uniform/RadioTabs';
import type { SelectProps } from '@fuf-stack/uniform/Select';
import type { SliderProps } from '@fuf-stack/uniform/Slider';
import type { SwitchProps } from '@fuf-stack/uniform/Switch';
import type { SwitchBoxProps } from '@fuf-stack/uniform/SwitchBox';
import type { TextAreaProps } from '@fuf-stack/uniform/TextArea';
import type { TimeProps } from '@fuf-stack/uniform/Time';

import { useUniformField } from '@fuf-stack/uniform/hooks/useUniformField';

type OptionNode = ReturnType<NonNullable<RadiosProps['children']>>;

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

export const radiosProps: RadiosProps = {
  name: 'choice',
  description: 'Pick one.',
  options: [{ value: 0, meta: { example: true } }],
  className: { itemLabel: 'text-option' },
  children: (items): OptionNode => items.map(({ radio }): OptionNode => radio),
};
export const radioBoxesProps: RadioBoxesProps = {
  name: 'choice',
  description: 'Pick one.',
  options: [{ value: 0, description: 'Zero' }],
  className: { boxControl: 'bg-danger' },
};
export const radioTabsProps: RadioTabsProps = {
  name: 'choice',
  description: 'Pick one.',
  options: [{ value: false, content: 'No' }],
  variant: 'underlined',
  className: { tabContent: 'text-option' },
};

export const checkboxesProps: CheckboxesProps = {
  name: 'choices',
  color: 'info',
  lineThrough: true,
  description: 'Choose one.',
  options: [{ value: 'first', labelSubline: 'First option', meta: { id: 1 } }],
  className: { optionLabel: 'text-option', errorMessage: 'text-tiny' },
  children: (items): OptionNode =>
    items.map(({ checkbox }): OptionNode => checkbox),
};

export const sliderProps: SliderProps = {
  name: 'amount',
  description: 'Choose an amount.',
  minValue: -10,
  maxValue: 10,
  step: 0.5,
  fillOffset: 0,
  size: 'lg',
  showSteps: true,
  className: {
    label: 'text-field',
    thumb: 'h-8 w-8',
    filler: 'bg-secondary',
    errorMessage: 'text-tiny',
  },
  transform: {
    toDisplayValue: (value) => Number(value) * 100,
    toFormValue: (value) => value / 100,
  },
};

export const timeProps: TimeProps = {
  name: 'appointment',
  description: 'Use UTC.',
  timeZone: 'UTC',
  hourAsNumber: true,
  hourCycle: 24,
  className: {
    input: 'text-body',
    segment: 'text-danger',
    helperWrapper: 'p-0',
  },
};
