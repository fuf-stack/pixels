import { useUniformField } from '@fuf-stack/uniform/hooks/useUniformField';

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
