import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, within } from 'storybook/test';

import FieldValidationError from '../FieldValidationError';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: Meta<typeof FieldValidationError> = {
  title: 'uniform/partials/FieldValidationError',
  component: FieldValidationError,
};

export default meta;
type Story = StoryObj<typeof FieldValidationError>;

// -----------------------------------------------------------------------------
// Normal stories
// -----------------------------------------------------------------------------

export const Default: Story = {
  args: {
    className: { wrapper: 'text-danger text-small' },
    error: [{ type: 'required', message: 'Email is required' }],
    id: 'email-error',
    testId: 'email',
  },
  render: (args) => {
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor="email">
          Email
          <input aria-describedby={args.id} aria-invalid="true" id="email" />
        </label>
        <FieldValidationError {...args} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('textbox', { name: 'Email' }),
    ).toHaveAccessibleDescription('Email is required');
    await expect(canvas.getByRole('list')).toHaveAccessibleName(
      'Validation errors of field email',
    );
  },
};

export const SingleError: Story = {
  args: {
    error: [{ type: 'custom', message: 'single error message' }],
    testId: 'email',
  },
};

export const MultipleErrors: Story = {
  args: {
    error: [
      { type: 'custom', message: 'first error' },
      { type: 'custom', message: 'second error' },
    ],
    testId: 'email',
  },
};

export const CustomStyling: Story = {
  ...Default,
  args: {
    ...Default.args,
    className: {
      base: 'list-disc ps-5',
      item: 'font-semibold',
      message: 'px-0',
      wrapper: 'rounded-small bg-danger-50 p-2 text-danger',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole('list');
    const message = canvas.getByText('Email is required');

    await expect(list).toHaveClass('list-disc', 'ps-5');
    await expect(list.parentElement).toHaveClass(
      'rounded-small',
      'bg-danger-50',
      'p-2',
    );
    await expect(canvas.getByRole('listitem')).toHaveClass('font-semibold');
    await expect(message).toHaveClass('px-0');
    await expect(message).not.toHaveClass('px-1');
    await expect(
      canvas.getByRole('textbox', { name: 'Email' }),
    ).toHaveAccessibleDescription('Email is required');
  },
};
