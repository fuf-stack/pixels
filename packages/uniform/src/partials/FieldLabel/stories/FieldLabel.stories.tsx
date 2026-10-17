import type { Meta, StoryObj } from '@storybook/react-vite';

import { Input, Label, TextField } from 'react-aria-components';

import { expect, userEvent, within } from 'storybook/test';

import FieldLabel from '../FieldLabel';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: Meta<typeof FieldLabel> = {
  title: 'uniform/partials/FieldLabel',
  component: FieldLabel,
  args: {
    children: 'Email',
    className: 'block text-small',
    htmlFor: 'email',
    id: 'email-label',
  },
  render: (args) => {
    return (
      <div className="flex flex-col gap-1">
        <FieldLabel {...args} />
        <input id="email" />
      </div>
    );
  },
};

export default meta;
type Story = StoryObj<typeof FieldLabel>;

// -----------------------------------------------------------------------------
// Normal stories
// -----------------------------------------------------------------------------

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByText('Email'));

    await expect(canvas.getByRole('textbox', { name: 'Email' })).toHaveFocus();
  },
};

export const Required: Story = {
  args: { required: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('textbox')).toHaveAccessibleName('Email');
    await expect(canvas.getByText('*')).toHaveAttribute('aria-hidden', 'true');
  },
};

// -----------------------------------------------------------------------------
// Composition stories
// -----------------------------------------------------------------------------

export const ReactAriaLabel: Story = {
  args: { as: Label, htmlFor: undefined, required: true },
  render: (args) => {
    return (
      <TextField className="flex flex-col gap-1">
        <FieldLabel {...args} />
        <Input />
      </TextField>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByText('Email'));

    await expect(canvas.getByRole('textbox', { name: 'Email' })).toHaveFocus();
  },
};

export const GroupHeading: Story = {
  args: {
    as: 'div',
    children: 'Contact details',
    htmlFor: undefined,
    required: true,
    role: 'heading',
    'aria-level': 3,
  },
  render: (args) => {
    return (
      <div aria-labelledby={args.id} role="group">
        <FieldLabel {...args} />
        <label htmlFor="contact-email">
          Email
          <input id="contact-email" />
        </label>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('group')).toHaveAccessibleName(
      'Contact details',
    );
    await expect(
      canvas.getByRole('heading', { level: 3 }),
    ).toHaveAccessibleName('Contact details');
  },
};
