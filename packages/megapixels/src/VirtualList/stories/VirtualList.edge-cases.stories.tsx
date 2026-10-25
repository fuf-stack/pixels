import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, within } from 'storybook/test';

import VirtualList from '../VirtualList';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const StringVirtualList = VirtualList<string>;

const meta = {
  title: 'megapixels/VirtualList/Edge cases',
  component: StringVirtualList,
} satisfies Meta<typeof StringVirtualList>;

export default meta;

type Story = StoryObj<typeof meta>;

// -----------------------------------------------------------------------------
// Edge cases
// -----------------------------------------------------------------------------

export const EmptyData: Story = {
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
