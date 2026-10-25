import type { Meta, StoryObj } from '@storybook/react-vite';

import edgeCaseDecorator from '@repo/storybook-config/edge-case-decorator';
import { expect, userEvent, within } from 'storybook/test';

import DataTable from '../DataTable';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta = {
  title: 'megapixels/DataTable/Edge Cases',
  decorators: [edgeCaseDecorator],
  component: DataTable,
} satisfies Meta<typeof DataTable>;

export default meta;

type Story = StoryObj<typeof meta>;

// -----------------------------------------------------------------------------
// Edge Cases
// -----------------------------------------------------------------------------

export const EmptyAfterFiltering: Story = {
  tags: ['visual'],
  parameters: {
    visual: { target: '[data-component="data-table"]' },
    edgeCaseDescription:
      'A search matching no rows shows the empty state while preserving column headings.',
  },
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
  parameters: {
    edgeCaseDescription:
      'A table with no columns or rows renders its empty state without crashing.',
  },
  args: { columns: [], data: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('table')).toBeInTheDocument();
    await expect(canvas.getByText('No results.')).toBeInTheDocument();
  },
};
