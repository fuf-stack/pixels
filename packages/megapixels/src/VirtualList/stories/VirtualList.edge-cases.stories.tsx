import type { Meta, StoryObj } from '@storybook/react-vite';

import edgeCaseDecorator from '@repo/storybook-config/edge-case-decorator';
import { expect, within } from 'storybook/test';

import VirtualList from '../VirtualList';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const StringVirtualList = VirtualList<string>;

const meta = {
  title: 'megapixels/VirtualList/Edge Cases',
  decorators: [edgeCaseDecorator],
  component: StringVirtualList,
} satisfies Meta<typeof StringVirtualList>;

export default meta;

type Story = StoryObj<typeof meta>;

// -----------------------------------------------------------------------------
// Edge Cases
// -----------------------------------------------------------------------------

export const EmptyData: Story = {
  parameters: {
    edgeCaseDescription:
      'An empty dataset renders an empty list without a load-more or retry action.',
  },
  args: {
    data: [],
    renderItem: (item) => {
      return item;
    },
    virtualization: { maxHeight: 300 },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('list')).toBeEmptyDOMElement();
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
};
