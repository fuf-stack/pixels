import type { Meta, StoryObj } from '@storybook/react-vite';

import { FaRocket } from 'react-icons/fa6';

import { action } from 'storybook/actions';

import { string, veto } from '@fuf-stack/veto';

import { Form } from '../Form';
import SubmitButton from './SubmitButton';

const meta: Meta<typeof SubmitButton> = {
  title: 'uniform/Form/subcomponents/SubmitButton',
  component: SubmitButton,
  decorators: [
    (Story, { parameters }) => {
      return (
        <Form {...(parameters.formProps ?? {})} onSubmit={action('onSubmit')}>
          <Story />
        </Form>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof SubmitButton>;

export const Default: Story = {
  args: {
    testId: 'some-test-id',
  },
};

export const IconOnly: Story = {
  args: {
    testId: 'some-test-id',
    children: null,
    icon: <FaRocket />,
    loading: false,
  },
};

const validation = veto({
  inputField: string(),
});

export const InvalidForm: Story = {
  parameters: { formProps: { validation } },
  args: {
    testId: 'some-test-id',
  },
};
