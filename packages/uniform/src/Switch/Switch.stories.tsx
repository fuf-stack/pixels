import type { Meta, StoryObj } from '@storybook/react-vite';

// Import icons for the stories
import { FaEnvelope, FaFlask, FaPhone, FaRocket } from 'react-icons/fa';

import { action } from 'storybook/actions';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { boolean, veto } from '@fuf-stack/veto';

import Form from '../Form';
import SubmitButton from '../SubmitButton';
import Switch from './Switch';

const meta: Meta<typeof Switch> = {
  title: 'uniform/Switch',
  component: Switch,
  decorators: [
    (Story, { parameters }) => {
      return (
        <Form
          className="min-w-60"
          onSubmit={action('onSubmit')}
          {...(parameters?.formProps ?? {})}
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
  switchField: boolean(),
});

export const Required: Story = {
  parameters: { formProps: { validation: requiredValidation } },
  args: {
    label: '🚀 Deploy on Friday',
    name: 'switchField',
  },
};

const validation = veto({
  switchField: boolean().refine((value: boolean) => {
    return !value;
  }, 'Please keep your sanity intact'),
});

export const Invalid: Story = {
  parameters: { formProps: { validation } },
  args: {
    label: '🤡 Use jQuery in 2024',
    name: 'switchField',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const switchField = canvas.getByTestId('switchfield');
    await userEvent.click(switchField, {
      delay: 300,
    });

    // Wait for validation to complete and error message to appear
    await waitFor(() => {
      expect(canvas.getByTestId('switchfield_error')).toBeVisible();
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
    thumbIcon: ({ isSelected, className }) => {
      return isSelected ? (
        <FaRocket className={className} />
      ) : (
        <FaFlask className={className} />
      );
    },
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
  render: () => {
    return (
      <div className="flex flex-col gap-4">
        <Switch label="🐭 Microservices" name="smallSwitch" size="sm" />
        <Switch label="🏗️ Monolith" name="mediumSwitch" size="md" />
        <Switch label="🏢 Enterprise Monolith" name="largeSwitch" size="lg" />
      </div>
    );
  },
};
