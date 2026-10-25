import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, fn, within } from 'storybook/test';

import Filter from '../Filter';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta = {
  title: 'megapixels/Filter/Edge cases',
  component: Filter,
} satisfies Meta<typeof Filter>;

export default meta;

type Story = StoryObj<typeof meta>;

// -----------------------------------------------------------------------------
// Edge cases
// -----------------------------------------------------------------------------

export const NoConfiguredFilters: Story = {
  args: {
    config: { filters: [] },
    onChange: fn(),
    values: {},
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryByRole('textbox')).not.toBeInTheDocument();
    await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-component="filter"]'),
    ).toBeInTheDocument();
  },
};
