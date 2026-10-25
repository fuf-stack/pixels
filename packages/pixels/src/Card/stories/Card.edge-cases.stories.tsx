import type { Meta, StoryObj } from '@storybook/react-vite';

import edgeCaseDecorator from '@repo/storybook-config/edge-case-decorator';

import Card from '../Card';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: Meta<typeof Card> = {
  title: 'pixels/Card/Edge Cases',
  decorators: [edgeCaseDecorator],
  component: Card,
};

export default meta;

type Story = StoryObj<typeof Card>;

// -----------------------------------------------------------------------------
// Edge Cases
// -----------------------------------------------------------------------------

export const Empty: Story = {
  parameters: {
    edgeCaseDescription: 'An empty card renders its surface without content.',
  },
};

export const HeaderOnly: Story = {
  parameters: { edgeCaseDescription: 'A card can contain only a header.' },
  args: { header: 'Heading' },
};

export const FooterOnly: Story = {
  parameters: { edgeCaseDescription: 'A card can contain only a footer.' },
  args: { footer: 'Supporting content' },
};

export const Zero: Story = {
  parameters: {
    edgeCaseDescription: 'Numeric zero remains visible as card content.',
  },
  args: { children: 0 },
};
