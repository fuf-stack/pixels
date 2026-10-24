import type { Meta, StoryObj } from '@storybook/react-vite';

import Table from '../Table';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: Meta<typeof Table> = {
  title: 'pixels/Table/Edge Cases',
  component: Table,
};

export default meta;

type Story = StoryObj<typeof Table>;

const columns = [
  { key: 'name', label: 'NAME' },
  { key: 'role', label: 'ROLE' },
  { key: 'status', label: 'STATUS' },
];
const rows = [
  { key: '1', name: 'Tony Reichert', role: 'CEO', status: 'Active' },
  { key: '2', name: 'Zoey Lang', role: 'Technical Lead', status: 'Paused' },
  { key: '3', name: 'Jane Fisher', role: 'Senior Developer', status: 'Active' },
  {
    key: '4',
    name: 'William Howard',
    role: 'Community Manager',
    status: 'Vacation',
  },
];

// -----------------------------------------------------------------------------
// Edge cases
// -----------------------------------------------------------------------------

export const Loading: Story = {
  args: { columns, rows, loading: true, ariaLabel: 'Loading employee data' },
};

export const EmptyContent: Story = {
  args: {
    columns,
    emptyContent: 'No data available',
    ariaLabel: 'Empty employee table',
  },
};

export const LoadingEmpty: Story = {
  args: {
    ariaLabel: 'Loading employees',
    columns,
    loading: true,
    loadingContent: 'Loading employees…',
  },
};

export const CellValues: Story = {
  args: {
    ariaLabel: 'Mixed values',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'value', label: 'Value' },
    ],
    rows: [
      { key: 0, name: 'Zero', value: 0 },
      {
        key: 'rich',
        name: 'Action',
        value: <button type="button">Open item</button>,
      },
    ],
  },
};
