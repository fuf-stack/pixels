import type { Meta, StoryObj } from '@storybook/react';

import Table from './Table';

const meta: Meta<typeof Table> = {
  title: 'pixels/Table',
  component: Table,
};

export default meta;
type Story = StoryObj<typeof Table>;

const columns = [
  {
    key: 'name',
    label: 'NAME',
  },
  {
    key: 'role',
    label: 'ROLE',
  },
  {
    key: 'status',
    label: 'STATUS',
  },
];

const rows = [
  {
    key: '1',
    name: 'Tony Reichert',
    role: 'CEO',
    status: 'Active',
  },
  {
    key: '2',
    name: 'Zoey Lang',
    role: 'Technical Lead',
    status: 'Paused',
  },
  {
    key: '3',
    name: 'Jane Fisher',
    role: 'Senior Developer',
    status: 'Active',
  },
  {
    key: '4',
    name: 'William Howard',
    role: 'Community Manager',
    status: 'Vacation',
  },
];

export const Default: Story = {
  args: { columns, rows, ariaLabel: 'Employee information table' },
};

export const AllSeparators: Story = {
  args: { columns, rows, ariaLabel: 'Table with different separator styles' },
  render: (args) => (
    <div>
      {[
        'none',
        'divider-x',
        'divider-y',
        'divider',
        'striped',
        'striped-divider-x',
      ].map((s) => (
        <div key={s} className="mb-4">
          <span className="text-lg font-bold">{s}</span>
          <Table
            {...args}
            ariaLabel={`Employee table with ${s} separator`}
            // @ts-expect-error but it can.
            separation={s}
          />
        </div>
      ))}
    </div>
  ),
};

export const WithWrapper: Story = {
  args: {
    columns,
    rows,
    hasWrapper: true,
    ariaLabel: 'Employee table with wrapper',
  },
};

export const Loading: Story = {
  args: { columns, rows, loading: true, ariaLabel: 'Loading employee data' },
};

export const StickyHeader: Story = {
  // TODO: currently broken due to behavior of table without wrapper!?
  args: {
    columns,
    rows,
    stickyHeader: true,
    className: 'h-32 bg-red-200',
    ariaLabel: 'Employee table with sticky header',
  },
};

export const EmptyContent: Story = {
  args: {
    columns,
    emptyContent: 'No data available',
    ariaLabel: 'Empty employee table',
  },
};

export const ManyElements: Story = {
  args: { columns, className: '', ariaLabel: 'Large employee data table' },
  render: (args) => {
    const rows2 = Array.from({ length: 1000 }).map((_, index) => ({
      key: index + 1,
      name: `Person ${index + 1}`,
      role: `Role ${(index % 5) + 1}`,
      status: index % 2 ? 'Active' : 'Inactive',
    }));
    return (
      <div className="h-[800px] w-[600px]">
        <Table {...args} rows={rows2} />
      </div>
    );
  },
};

export const Virtualized: Story = {
  args: {
    columns,
    className: {
      wrapper: 'h-[400px] w-[600px] bg-transparent border-none shadow-none',
    },
    hasWrapper: true,
    virtualized: true,
    ariaLabel: 'Virtualized employee data table',
  },
  render: (args) => {
    const rows2 = Array.from({ length: 1000 }).map((_, index) => ({
      key: index + 1,
      name: `Person ${index + 1}`,
      role: `Role ${(index % 5) + 1}`,
      status: index % 2 ? 'Active' : 'Inactive',
    }));
    return (
      <div className="h-[800px] w-[600px]">
        <Table {...args} rows={rows2} />
      </div>
    );
  },
};
