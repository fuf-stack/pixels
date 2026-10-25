import type { Meta, StoryObj } from '@storybook/react-vite';

import edgeCaseDecorator from '@repo/storybook-config/edge-case-decorator';
import { fn } from 'storybook/test';

import SearchInput from '../SearchInput';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: Meta<typeof SearchInput> = {
  title: 'pixels/SearchInput/Edge Cases',
  decorators: [edgeCaseDecorator],
  component: SearchInput,
  args: { onChange: fn(), testId: 'inputField' },
};

export default meta;

type Story = StoryObj<typeof SearchInput>;

// -----------------------------------------------------------------------------
// Edge Cases
// -----------------------------------------------------------------------------

export const Disabled: Story = {
  parameters: {
    edgeCaseDescription: 'A disabled empty input cannot be edited.',
  },
  args: { disabled: true },
};

export const DisabledWithValue: Story = {
  parameters: {
    edgeCaseDescription:
      'A disabled input preserves its value and prevents editing or clearing.',
  },
  args: { disabled: true, initialValue: 'Stored search' },
};

export const NoPlaceholder: Story = {
  parameters: {
    edgeCaseDescription: 'The input remains usable without placeholder text.',
  },
};
