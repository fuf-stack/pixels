import type { Meta, StoryObj } from '@storybook/react-vite';

import { action } from 'storybook/actions';
import { expect, userEvent, within } from 'storybook/test';

import Form from '../../Form';
import Input from '../../Input';
import Grid from '../Grid';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: Meta<typeof Grid> = {
  title: 'uniform/Grid',
  component: Grid,
  decorators: [
    (Story) => {
      return (
        <Form
          className={{ form: 'w-full max-w-2xl' }}
          debug={{ disable: true }}
          onSubmit={action('onSubmit')}
        >
          <Story />
        </Form>
      );
    },
  ],
  parameters: { layout: 'padded' },
  argTypes: { children: { control: false } },
  args: {
    children: (
      <>
        <Input label="First name" name="firstName" />
        <Input label="Last name" name="lastName" />
        <Input label="Email" name="email" />
      </>
    ),
    testId: 'contact-grid',
  },
};

export default meta;

type Story = StoryObj<typeof Grid>;

// -----------------------------------------------------------------------------
// Normal stories
// -----------------------------------------------------------------------------

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const firstName = canvas.getByRole('textbox', { name: 'First name' });
    const lastName = canvas.getByRole('textbox', { name: 'Last name' });
    const email = canvas.getByRole('textbox', { name: 'Email' });

    await userEvent.click(firstName);
    await userEvent.type(firstName, 'Ada');
    await expect(firstName).toHaveValue('Ada');

    await userEvent.tab();
    await expect(lastName).toHaveFocus();

    await userEvent.tab();
    await expect(email).toHaveFocus();
  },
};

export const ResponsiveColumns: Story = {
  args: {
    className: 'md:grid-cols-2',
    children: (
      <>
        <Input label="First name" name="firstName" />
        <Input label="Last name" name="lastName" />
        <Input
          className={{ base: 'md:col-span-2' }}
          label="Email"
          name="email"
        />
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Two columns at medium widths, with email spanning both. Resize the preview to see the single-column layout.',
      },
    },
  },
};

export const CustomStyling: Story = {
  args: {
    className: 'gap-3 rounded-medium border border-default-200 p-4',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Override the default spacing and add a border and padding through className.',
      },
    },
  },
};
