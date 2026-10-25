import type { Meta, StoryObj } from '@storybook/react-vite';

import edgeCaseDecorator from '@repo/storybook-config/edge-case-decorator';
import { expect, fn, within } from 'storybook/test';

import Filter from '../Filter';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta = {
  title: 'megapixels/Filter/Edge Cases',
  decorators: [edgeCaseDecorator],
  component: Filter,
} satisfies Meta<typeof Filter>;

export default meta;

type Story = StoryObj<typeof meta>;

// -----------------------------------------------------------------------------
// Edge Cases
// -----------------------------------------------------------------------------

export const NoConfiguredFilters: Story = {
  parameters: {
    edgeCaseDescription:
      'An empty filter configuration renders without search controls or an open dialog.',
  },
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
