/* eslint-disable react-hooks/rules-of-hooks */
import type { Meta, StoryObj } from '@storybook/react-vite';

import { action } from 'storybook/actions';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '@fuf-stack/pixels';
import { SubmitButton } from '@fuf-stack/uniform';

import { Form } from '../Form';
import { Grid } from '../Grid';
import { useFormContext } from '../hooks/useFormContext';
import { Input } from '../Input';

const meta: Meta<typeof Form> = {
  title: 'uniform/_examples/InitialValues',
  component: Form,
  decorators: [
    (Story, { args }) => {
      return (
        <Form
          {...(args ?? {})}
          className="min-w-60"
          onSubmit={action('onSubmit')}
        >
          <Story />
          <div className="mt-4 flex justify-end">
            <SubmitButton />
          </div>
        </Form>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof Form>;

/**
 * Verifies that changing values and calling reset() restores initialValues.
 */
export const TwoInputsDebug: Story = {
  args: {
    initialValues: {
      field1: 'initial',
      field2: 'initial',
    },
  },
  render: () => {
    const { reset } = useFormContext();
    return (
      <Grid>
        <Input label="Field 1" name="field1" />
        <Input label="Field 2" name="field2" />
        <Button
          className="w-full"
          testId="reset_button"
          onClick={() => {
            reset();
          }}
        >
          Reset
        </Button>
      </Grid>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field1 = canvas.getByTestId('field1');
    const field2 = canvas.getByTestId('field2');

    await waitFor(() => {
      expect(field1).toHaveValue('initial');
      expect(field2).toHaveValue('initial');
    });

    await userEvent.clear(field1);
    await userEvent.type(field1, 'changed 1');
    await userEvent.clear(field2);
    await userEvent.type(field2, 'changed 2');

    expect(field1).toHaveValue('changed 1');
    expect(field2).toHaveValue('changed 2');

    // reset to initial values
    await userEvent.click(canvas.getByTestId('reset_button'));

    await waitFor(() => {
      expect(field1).toHaveValue('initial');
      expect(field2).toHaveValue('initial');
    });
  },
};
