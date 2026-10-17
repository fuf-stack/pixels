import type { Meta, StoryObj } from '@storybook/react-vite';

import Alert from '../Alert';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: Meta<typeof Alert> = {
  title: 'pixels/Alert/Edge Cases',
  component: Alert,
};

export default meta;

type Story = StoryObj<typeof Alert>;

// -----------------------------------------------------------------------------
// Edge cases
// -----------------------------------------------------------------------------

export const Empty: Story = {};

export const Zero: Story = { args: { children: 0 } };
