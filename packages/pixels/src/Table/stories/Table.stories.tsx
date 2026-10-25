import type { Meta, StoryObj } from '@storybook/react-vite';

import Table from '../Table';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// Normal stories
// -----------------------------------------------------------------------------

export const Default: Story = {
  tags: ['visual'],
  parameters: { visual: { target: '[data-component="table"]' } },
  args: { columns, rows, ariaLabel: 'Employee information table' },
};

export const AllSeparators: Story = {
  tags: ['visual'],
  parameters: { visual: { target: '[data-component="table"]' } },
  args: { columns, rows, ariaLabel: 'Table with different separator styles' },
  render: (args) => {
    return (
      <div>
        {(
          [
            'none',
            'divider-x',
            'divider-y',
            'divider',
            'striped',
            'striped-divider-x',
          ] as const
        ).map((s) => {
          return (
            <div key={s} className="mb-4">
              <span className="text-lg font-bold">{s}</span>
              <Table
                {...args}
                ariaLabel={`Employee table with ${s} separator`}
                separation={s}
              />
            </div>
          );
        })}
      </div>
    );
  },
};

export const WithWrapper: Story = {
  args: {
    columns,
    rows,
    hasWrapper: true,
    ariaLabel: 'Employee table with wrapper',
  },
};

export const StickyHeader: Story = {
  tags: ['visual'],
  parameters: { visual: { target: '[data-component="table"]' } },
  args: {
    columns,
    rows,
    stickyHeader: true,
    className: 'h-32 bg-red-200',
    ariaLabel: 'Employee table with sticky header',
  },
};

export const ManyElements: Story = {
  args: { columns, className: '', ariaLabel: 'Large employee data table' },
  render: (args) => {
    const rows2 = Array.from({ length: 1000 }).map((_, index) => {
      return {
        key: index + 1,
        name: `Person ${index + 1}`,
        role: `Role ${(index % 5) + 1}`,
        status: index % 2 ? 'Active' : 'Inactive',
      };
    });
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
    const rows2 = Array.from({ length: 1000 }).map((_, index) => {
      return {
        key: index + 1,
        name: `Person ${index + 1}`,
        role: `Role ${(index % 5) + 1}`,
        status: index % 2 ? 'Active' : 'Inactive',
      };
    });
    return (
      <div className="h-[800px] w-[600px]">
        <Table {...args} rows={rows2} />
      </div>
    );
  },
};

export const CustomStyling: Story = {
  args: {
    columns,
    rows,
    ariaLabel: 'Styled employees',
    className: { th: 'text-primary', td: 'text-base', wrapper: 'bg-content2' },
    hasWrapper: true,
  },
};

export const HiddenHeader: Story = {
  args: {
    columns,
    rows,
    hideHeader: true,
    ariaLabel: 'Employees without visible headings',
  },
};
