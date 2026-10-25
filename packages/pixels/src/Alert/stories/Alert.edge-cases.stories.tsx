import type { Meta, StoryObj } from '@storybook/react-vite';

import edgeCaseDecorator from '@repo/storybook-config/edge-case-decorator';

import Alert from '../Alert';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: Meta<typeof Alert> = {
  title: 'pixels/Alert/Edge Cases',
  decorators: [edgeCaseDecorator],
  component: Alert,
};

export default meta;

type Story = StoryObj<typeof Alert>;

// -----------------------------------------------------------------------------
// Edge Cases
// -----------------------------------------------------------------------------

export const Empty: Story = {
  parameters: {
    edgeCaseDescription:
      'An alert can render without title or message content.',
  },
};

export const Zero: Story = {
  parameters: {
    edgeCaseDescription: 'Numeric zero remains visible as alert content.',
  },
  args: { children: 0 },
};
