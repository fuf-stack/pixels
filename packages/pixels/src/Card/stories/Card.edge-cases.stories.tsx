import type { Meta, StoryObj } from '@storybook/react-vite';

import Card from '../Card';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: Meta<typeof Card> = {
  title: 'pixels/Card/Edge Cases',
  component: Card,
};

export default meta;

type Story = StoryObj<typeof Card>;

// -----------------------------------------------------------------------------
// Edge cases
// -----------------------------------------------------------------------------

export const Empty: Story = {};

export const HeaderOnly: Story = { args: { header: 'Heading' } };

export const FooterOnly: Story = { args: { footer: 'Supporting content' } };

export const Zero: Story = { args: { children: 0 } };
