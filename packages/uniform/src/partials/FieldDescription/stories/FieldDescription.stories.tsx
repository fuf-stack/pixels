import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, within } from 'storybook/test';

import FieldDescription from '../FieldDescription';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: Meta<typeof FieldDescription> = {
  title: 'uniform/partials/FieldDescription',
  component: FieldDescription,
  args: {
    children: 'Use the address where you receive work email',
    className: 'text-foreground-500 text-small',
    id: 'email-description',
  },
  render: (args) => {
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor="email">
          Email
          <input aria-describedby={args.id} id="email" />
        </label>
        <FieldDescription {...args} />
      </div>
    );
  },
};

export default meta;
type Story = StoryObj<typeof FieldDescription>;

// -----------------------------------------------------------------------------
// Normal stories
// -----------------------------------------------------------------------------

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('textbox', { name: 'Email' }),
    ).toHaveAccessibleDescription(
      'Use the address where you receive work email',
    );
  },
};

export const RichContent: Story = {
  args: {
    children: (
      <span>
        Use your <strong>work email</strong>, not your personal address
      </span>
    ),
  },
};
