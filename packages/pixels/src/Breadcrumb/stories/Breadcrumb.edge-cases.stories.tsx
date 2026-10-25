import type { Meta, StoryObj } from '@storybook/react-vite';

import edgeCaseDecorator from '@repo/storybook-config/edge-case-decorator';

import Breadcrumb from '../Breadcrumb';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: Meta<typeof Breadcrumb> = {
  title: 'pixels/Breadcrumb/Edge Cases',
  decorators: [edgeCaseDecorator],
  component: Breadcrumb,
};

export default meta;

type Story = StoryObj<typeof Breadcrumb>;

// -----------------------------------------------------------------------------
// Edge Cases
// -----------------------------------------------------------------------------

export const Empty: Story = {
  parameters: {
    edgeCaseDescription: 'An empty item list renders without navigation items.',
  },
  args: { breadcrumbItems: [] },
};

export const Disabled: Story = {
  parameters: {
    edgeCaseDescription: 'Disabled breadcrumb items cannot be activated.',
  },
  args: {
    breadcrumbItems: [{ children: 'Home' }, { children: 'Current' }],
    disabled: true,
  },
};

export const RichContent: Story = {
  parameters: {
    edgeCaseDescription:
      'Rich labels and icons remain usable as breadcrumb content.',
  },
  args: {
    breadcrumbItems: [
      { children: 'Home', startContent: <span aria-hidden="true">⌂</span> },
      { children: 'Current', endContent: <span>(3)</span> },
    ],
    separator: null,
  },
};
