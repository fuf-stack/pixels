import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, userEvent, within } from 'storybook/test';

import DataTable from '../DataTable';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta = {
  title: 'megapixels/DataTable/Edge cases',
  component: DataTable,
} satisfies Meta<typeof DataTable>;

export default meta;

type Story = StoryObj<typeof meta>;

// -----------------------------------------------------------------------------
// Edge cases
// -----------------------------------------------------------------------------

export const EmptyAfterFiltering: Story = {
  args: {
    columns: [{ accessorKey: 'name', header: 'Name' }],
    data: [{ name: 'Apple' }],
    features: { search: { columns: [{ column: 'name' }] } },
    testId: 'empty-after-filtering',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByRole('textbox'), 'No match');

    await expect(canvas.getByText('No results.')).toBeVisible();
    await expect(canvas.getByRole('columnheader')).toHaveTextContent('Name');
    await expect(canvas.queryByText('Apple')).not.toBeInTheDocument();
  },
};

export const NoColumns: Story = {
  args: { columns: [], data: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('table')).toBeInTheDocument();
    await expect(canvas.getByText('No results.')).toBeInTheDocument();
  },
};
