import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, userEvent, waitFor, within } from 'storybook/test';

import { string, veto } from '@fuf-stack/veto';

import Form from '../../Form';
import SubmitButton from '../../SubmitButton';
import useUniformField from './useUniformField';

const CustomEditor = () => {
  const {
    field,
    ids,
    label,
    description,
    errorMessage,
    invalid,
    getControlProps,
  } = useUniformField({
    name: 'editor',
    label: 'Editor',
    description: 'Enter at least three characters.',
  });
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={ids.control} id={ids.label}>
        {label}
      </label>
      <textarea
        {...field}
        {...getControlProps()}
        className="rounded-small border-small border-default-200 bg-content1 p-2"
        value={field.value ?? ''}
      />
      <div className="text-sm text-foreground-500" id={ids.description}>
        {description}
      </div>
      {invalid ? (
        <div className="text-danger text-tiny" id={ids.error}>
          {errorMessage}
        </div>
      ) : null}
    </div>
  );
};

const Example = () => {
  return (
    <Form
      initialValues={{ editor: '' }}
      onSubmit={() => {}}
      validation={veto({ editor: string({ min: 3 }) })}
    >
      <CustomEditor />
      <SubmitButton />
    </Form>
  );
};

const meta: Meta<typeof Example> = {
  title: 'uniform/hooks/useUniformField',
  component: Example,
};
export default meta;
type Story = StoryObj<typeof Example>;

export const CustomControl: Story = {
  render: () => {
    return <Example />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const editor = canvas.getByRole('textbox', { name: 'Editor' });
    await expect(editor).toHaveAccessibleDescription(
      'Enter at least three characters.',
    );
    await expect(editor).not.toHaveAttribute('required');
    await userEvent.type(editor, 'no');
    await userEvent.tab();
    await waitFor(async () => {
      await expect(editor).toHaveAttribute('aria-invalid', 'true');
    });
    const error = canvas.getByTestId('editor_error');
    await expect(error).toBeVisible();
    await expect(editor).toHaveAccessibleDescription(
      `Enter at least three characters. ${error.textContent}`,
    );
    await userEvent.type(editor, ' more');
    await waitFor(async () => {
      await expect(editor).not.toHaveAttribute('aria-invalid');
    });
  },
};
