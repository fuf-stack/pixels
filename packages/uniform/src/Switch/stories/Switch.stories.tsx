import type { Meta, StoryObj } from '@storybook/react-vite';

import { FaEnvelope, FaFlask, FaPhone, FaRocket } from 'react-icons/fa';

import { action } from 'storybook/actions';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { boolean, veto } from '@fuf-stack/veto';

import Form from '../../Form';
import SubmitButton from '../../SubmitButton';
import Switch from '../Switch';

// Import icons for the stories

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: Meta<typeof Switch> = {
  title: 'uniform/Switch',
  component: Switch,
  decorators: [
    (Story, { parameters }) => {
      return (
        <Form
          className={{ form: 'min-w-60' }}
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

// -----------------------------------------------------------------------------
// Normal stories
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// Composition
// -----------------------------------------------------------------------------

export const KeyboardAndRequired: Story = {
  ...Required,
  args: { ...Required.args, description: 'Toggle with Space.' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('switch', { name: '🚀 Deploy on Friday' });
    await expect(input).toHaveAttribute('aria-required', 'true');
    await expect(input).not.toHaveAttribute('required');
    await expect(input).toHaveAccessibleDescription('Toggle with Space.');
    await userEvent.click(canvas.getByTestId('form_submit_button'));
    await waitFor(async () => {
      await expect(input).toHaveFocus();
      await expect(input).toHaveAttribute('aria-invalid', 'true');
    });
    await userEvent.keyboard(' ');
    await expect(input).toBeChecked();
    await userEvent.keyboard(' ');
    await expect(input).not.toBeChecked();
    await userEvent.tab();
  },
};
