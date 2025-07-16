import type { Meta, StoryObj } from '@storybook/react-vite';

import FieldValidationError from './FieldValidationError';

const meta: Meta<typeof FieldValidationError> = {
  title: 'uniform/partials/FieldValidationError',
  component: FieldValidationError,
};

export default meta;
type Story = StoryObj<typeof FieldValidationError>;

export const SingleError: Story = {
  args: {
    error: [{ message: 'single error message' }],
  },
};

export const MultipleErrors: Story = {
  args: {
    error: [{ message: 'first error' }, { message: 'second error' }],
  },
};
