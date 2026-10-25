import type { Story } from './Input.storySetup';

import { expect, userEvent, waitFor, within } from 'storybook/test';

import { number, string, veto } from '@fuf-stack/veto';

import { meta as sharedMeta } from './Input.storySetup';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: typeof sharedMeta = {
  ...sharedMeta,
  title: 'uniform/Input/Edge Cases',
};

export default meta;

// -----------------------------------------------------------------------------
// Edge Cases
// -----------------------------------------------------------------------------

export const NullishNumber: Story = {
  name: 'Nullish Number',
  parameters: {
    edgeCaseDescription:
      'A nullish number starts empty. Numeric zero remains visible and clearing returns to an empty control.',
    formProps: {
      initialValues: { numberField: null },
      validation: veto({ numberField: number().nullable().optional() }),
    },
  },
  args: {
    name: 'numberField',
    label: 'Nullable number',
    type: 'number',
    clearable: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByTestId('numberfield');
    await expect(input).toHaveValue('');
    await userEvent.type(input, '0');
    await expect(input).toHaveValue('0');
    await userEvent.click(canvas.getByRole('button', { name: 'clear input' }));
    await waitFor(async () => {
      await expect(input).toHaveValue('');
    });
  },
};

export const ValidationAfterClear: Story = {
  name: 'Cleared Validation',
  parameters: {
    edgeCaseDescription:
      'Clearing a required input shows its validation error after the value update and blur.',
    formProps: {
      validation: veto({
        inputField: string(),
      }),
    },
  },
  args: {
    label: 'Required Cleared Field',
    name: 'inputField',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByTestId('inputfield');

    // Initially, no validation error should be shown
    await expect(input.getAttribute('aria-invalid')).toBeNull();

    // Type some content
    await userEvent.type(input, 'test', {
      delay: 50,
    });

    // Field should be valid with content
    await expect(input.getAttribute('aria-invalid')).toBeNull();

    // Clear the field completely
    await userEvent.clear(input);
    input.blur();

    // Wait because of value debounce
    await waitFor(() => {
      // Now validation error should appear for required field
      expect(input.getAttribute('aria-invalid')).toBe('true');

      // Check that error message is displayed
      expect(canvas.getByText('Field is required')).toBeInTheDocument();
    });
  },
};
