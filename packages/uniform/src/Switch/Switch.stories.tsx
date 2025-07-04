import type { Meta, StoryObj } from '@storybook/react';

// Import icons for the stories
import { FaEnvelope, FaFlask, FaPhone, FaRocket } from 'react-icons/fa';

import { action } from '@storybook/addon-actions';
import { userEvent, within } from '@storybook/test';

import { SubmitButton } from '@fuf-stack/uniform';
import { veto } from '@fuf-stack/veto';
import * as vt from '@fuf-stack/veto';

import { Form } from '../Form';
import Switch from './Switch';

const meta: Meta<typeof Switch> = {
  title: 'uniform/Switch',
  component: Switch,
  decorators: [
    (Story, { parameters }) => (
      <Form
        className="min-w-60"
        onSubmit={action('onSubmit')}
        {...(parameters?.formProps || {})}
      >
        <Story />
        <div className="mt-4 flex justify-end">
          <SubmitButton />
        </div>
      </Form>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  args: {
    name: 'switchField',
    label: '🐛 Enable bugs in production',
  },
};

export const WithInitialValue: Story = {
  parameters: {
    formProps: { initialValues: { switchField: true } },
  },
  args: {
    name: 'switchField',
    label: '☕ Coffee is a vegetable',
  },
};

export const Disabled: Story = {
  args: {
    name: 'switchField',
    label: '📚 Read documentation first',
    disabled: true,
  },
};

const requiredValidation = veto({
  switchField: vt.boolean(),
});

export const Required: Story = {
  parameters: { formProps: { validation: requiredValidation } },
  args: {
    label: '🚀 Deploy on Friday',
    name: 'switchField',
  },
};

const validation = veto({
  switchField: vt
    .boolean()
    .refine((value: boolean) => !value, 'Please keep your sanity intact'),
});

export const Invalid: Story = {
  parameters: { formProps: { validation } },
  args: {
    label: '🤡 Use jQuery in 2024',
    name: 'switchField',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByTestId('switchfield');
    await userEvent.click(input, {
      delay: 300,
    });
  },
};

export const WithThumbIcon: Story = {
  parameters: {
    formProps: { initialValues: { switchField: true } },
  },
  args: {
    name: 'switchField',
    label: '🌙 Dark mode developer',
    thumbIcon: ({ isSelected, className }) =>
      isSelected ? (
        <FaRocket className={className} />
      ) : (
        <FaFlask className={className} />
      ),
  },
};

export const WithStartAndEndContent: Story = {
  parameters: {
    formProps: { initialValues: { switchField: true } },
  },
  args: {
    name: 'switchField',
    label: '📧 Send emails at 3 AM',
    startContent: <FaPhone />,
    endContent: <FaEnvelope />,
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Switch name="smallSwitch" label="🐭 Microservices" size="sm" />
      <Switch name="mediumSwitch" label="🏗️ Monolith" size="md" />
      <Switch name="largeSwitch" label="🏢 Enterprise Monolith" size="lg" />
    </div>
  ),
};
