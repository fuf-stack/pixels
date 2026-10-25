import type { Meta, StoryObj } from '@storybook/react-vite';

import { FaFlask, FaPhone, FaRocket } from 'react-icons/fa';

import { action } from 'storybook/actions';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { boolean, veto } from '@fuf-stack/veto';

import Form from '../../Form';
import SubmitButton from '../../SubmitButton';
import SwitchBox from '../SwitchBox';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: Meta<typeof SwitchBox> = {
  title: 'uniform/SwitchBox',
  component: SwitchBox,
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
type Story = StoryObj<typeof meta>;

// -----------------------------------------------------------------------------
// Normal stories
// -----------------------------------------------------------------------------

export const Default: Story = {
  args: {
    name: 'switchBox',
    label: 'Enable notifications',
    description: 'Receive email notifications about your account activity',
  },
};

export const WithInitialValue: Story = {
  tags: ['visual'],
  parameters: {
    visual: { target: '[data-component="switch-box"]' },
    formProps: { initialValues: { switchBox: true } },
  },
  args: {
    name: 'switchBox',
    label: 'Dark mode',
    description: 'Toggle dark mode for better visibility at night',
  },
};

export const Disabled: Story = {
  tags: ['visual'],
  parameters: { visual: { target: '[data-component="switch-box"]' } },
  args: {
    name: 'switchBox',
    label: 'Pro features',
    description: 'Upgrade to unlock premium features',
    disabled: true,
  },
};

const requiredValidation = veto({
  switchBox: boolean(),
});

export const Required: Story = {
  parameters: { formProps: { validation: requiredValidation } },
  args: {
    name: 'switchBox',
    label: 'Accept terms',
    description: 'You must accept the terms and conditions to continue',
  },
};

const invalidValidation = veto({
  switchBox: boolean().refine((value: boolean) => {
    return !value;
  }, 'You must disable this option to continue'),
});

export const Invalid: Story = {
  tags: ['visual'],
  parameters: {
    visual: {
      target: '[data-component="switch-box"], [data-slot="error-message"]',
    },
    formProps: { validation: invalidValidation },
  },
  args: {
    name: 'switchBox',
    label: 'Enable chaos mode',
    description: 'Warning: This will break everything',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const switchElement = canvas.getByRole('switch');
    await userEvent.click(switchElement, {
      delay: 300,
    });

    // Wait for validation to complete and error message to appear
    await waitFor(() => {
      expect(
        canvas.getByText('You must disable this option to continue'),
      ).toBeVisible();
    });
  },
};

export const WithIcon: Story = {
  parameters: {
    formProps: { initialValues: { switchBox: true } },
  },
  args: {
    name: 'switchBox',
    label: 'Phone notifications',
    description: 'Receive push notifications on your mobile device',
    icon: <FaPhone className="text-2xl text-primary" />,
  },
};

export const WithThumbIcon: Story = {
  parameters: {
    formProps: { initialValues: { switchBox: true } },
  },
  args: {
    name: 'switchBox',
    label: 'Developer mode',
    description: 'Enable advanced developer tools and debugging',
    thumbIcon: ({ isSelected, className }) => {
      return isSelected ? (
        <FaRocket className={className} />
      ) : (
        <FaFlask className={className} />
      );
    },
  },
};

export const AllSizes: Story = {
  render: () => {
    return (
      <div className="flex w-full flex-col gap-4">
        <SwitchBox
          description="This is a small switch box"
          label="Small Switch Box"
          name="smallSwitchBox"
          size="sm"
          testId="smallswitch"
        />
        <SwitchBox
          description="This is a medium switch box"
          label="Medium Switch Box"
          name="mediumSwitchBox"
          size="md"
          testId="mediumswitch"
        />
        <SwitchBox
          description="This is a large switch box"
          label="Large Switch Box"
          name="largeSwitchBox"
          size="lg"
          testId="largeswitch"
        />
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
    const input = canvas.getByRole('switch', { name: 'Accept terms' });
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
