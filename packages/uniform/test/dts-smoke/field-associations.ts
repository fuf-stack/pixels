import { useUniformField } from '@fuf-stack/uniform/hooks/useUniformField';
import type { InputProps } from '@fuf-stack/uniform/Input';
import type { TextAreaProps } from '@fuf-stack/uniform/TextArea';

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
