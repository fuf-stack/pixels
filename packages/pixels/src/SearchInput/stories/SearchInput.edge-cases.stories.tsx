import type { Meta, StoryObj } from '@storybook/react-vite';

import { fn } from 'storybook/test';

import SearchInput from '../SearchInput';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: Meta<typeof SearchInput> = {
  title: 'pixels/SearchInput/Edge Cases',
  component: SearchInput,
  args: { onChange: fn(), testId: 'inputField' },
};

export default meta;

type Story = StoryObj<typeof SearchInput>;

// -----------------------------------------------------------------------------
// Edge cases
// -----------------------------------------------------------------------------

export const Disabled: Story = { args: { disabled: true } };

export const DisabledWithValue: Story = {
  args: { disabled: true, initialValue: 'Stored search' },
};

export const NoPlaceholder: Story = {};
