import type { Meta, StoryObj } from '@storybook/react-vite';

import Breadcrumb from '../Breadcrumb';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: Meta<typeof Breadcrumb> = {
  title: 'pixels/Breadcrumb/Edge Cases',
  component: Breadcrumb,
};

export default meta;

type Story = StoryObj<typeof Breadcrumb>;

// -----------------------------------------------------------------------------
// Edge cases
// -----------------------------------------------------------------------------

export const Empty: Story = { args: { breadcrumbItems: [] } };

export const Disabled: Story = {
  args: {
    breadcrumbItems: [{ children: 'Home' }, { children: 'Current' }],
    disabled: true,
  },
};

export const RichContent: Story = {
  args: {
    breadcrumbItems: [
      { children: 'Home', startContent: <span aria-hidden="true">⌂</span> },
      { children: 'Current', endContent: <span>(3)</span> },
    ],
    separator: null,
  },
};
