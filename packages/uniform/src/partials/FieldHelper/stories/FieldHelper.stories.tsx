import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, within } from 'storybook/test';

import FieldHelper from '../FieldHelper';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const ids = { description: 'email-description', error: 'email-error' };

const meta: Meta<typeof FieldHelper> = {
  title: 'uniform/partials/FieldHelper',
  component: FieldHelper,
  args: {
    className: {
      description: 'text-foreground-500 text-tiny',
      errorMessage: 'text-danger text-tiny',
      helperWrapper: 'relative flex flex-col p-0',
    },
    description: 'Use the address where you receive work email',
    errorMessage: 'Invalid email address',
    ids,
    invalid: false,
  },
  render: (args) => {
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor="email">
          Email
          <input
            aria-describedby={`${ids.description} ${ids.error}`}
            aria-invalid={args.invalid}
            id="email"
          />
        </label>
        <FieldHelper {...args} />
      </div>
    );
  },
};

export default meta;
type Story = StoryObj<typeof FieldHelper>;

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
    await expect(
      canvas.queryByText('Invalid email address'),
    ).not.toBeInTheDocument();
  },
};

export const Invalid: Story = {
  args: { invalid: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('textbox', { name: 'Email' }),
    ).toHaveAccessibleDescription(
      'Use the address where you receive work email Invalid email address',
    );
  },
};

export const ErrorOnly: Story = {
  args: { description: undefined, invalid: true },
};
