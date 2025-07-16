import type { Meta, StoryObj } from '@storybook/react-vite';

import { action } from 'storybook/actions';

import v, * as vt from '@fuf-stack/veto';

import { Form } from '../Form';
import SubmitButton from './SubmitButton';

const meta: Meta<typeof SubmitButton> = {
  title: 'uniform/Form/subcomponents/SubmitButton',
  component: SubmitButton,
  decorators: [
    (Story, { parameters }) => (
      <Form {...(parameters.formProps || {})} onSubmit={action('onSubmit')}>
        <Story />
      </Form>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SubmitButton>;

export const Default: Story = {
  args: {
    testId: 'some-test-id',
  },
};

const validation = v({
  inputField: vt.string(),
});

export const InvalidForm: Story = {
  parameters: { formProps: { validation } },
  args: {
    testId: 'some-test-id',
  },
};
