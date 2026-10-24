import { describe, expect, it } from 'vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';
import { fireEvent, render, screen, within } from '@testing-library/react';

import * as edgeCases from './stories/Table.edge-cases.stories';
import * as interactions from './stories/Table.interactions.stories';
import * as stories from './stories/Table.stories';
import Table from './Table';

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'value', label: 'Value' },
];
const rows = [
  { key: 0, name: 'Zero', value: 0 },
  { key: 'one', name: 'One', value: <button type="button">Open</button> },
];

describe('Story Snapshots', () => {
  storySnapshots({ ...stories, ...edgeCases, ...interactions });
});

describe('Table behavior', () => {
  it('associates native column and row headers, retaining zero and rich cell content', () => {
    render(
      <Table
        ariaLabel="Values"
        columns={columns}
        rows={rows}
        testId="Value table"
      />,
    );
    expect(screen.getByTestId('value_table')).toContainElement(
      screen.getByRole('grid', { name: 'Values' }),
    );
    expect(screen.getAllByRole('columnheader')).toHaveLength(2);
    expect(screen.getByRole('rowheader', { name: 'Zero' })).toBeInTheDocument();
    expect(screen.getByRole('gridcell', { name: '0' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument();
  });

  it('renders an empty message and replaces it with an announced loader', () => {
    const { rerender } = render(
      <Table columns={columns} emptyContent="No values" />,
    );
    expect(screen.getByText('No values')).toBeInTheDocument();
    rerender(
      <Table
        columns={columns}
        emptyContent="No values"
        loading
        loadingContent="Fetching values"
      />,
    );
    expect(screen.queryByText('No values')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Fetching values');
    expect(screen.getByRole('grid')).toHaveAttribute('aria-busy', 'true');
  });

  it('keeps loaded rows and trailing content available while loading', () => {
    render(
      <Table
        bottomContent={<button type="button">Next page</button>}
        columns={columns}
        loading
        rows={rows}
      />,
    );
    expect(screen.getByRole('rowheader', { name: 'Zero' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('...');
    expect(
      screen.getByRole('button', { name: 'Next page' }),
    ).toBeInTheDocument();
  });

  it('uses an optional card surface and applies header/body row slot overrides', () => {
    const { container, rerender } = render(
      <Table
        className={{ tr: 'bg-danger', th: 'text-primary' }}
        columns={columns}
        rows={rows}
      />,
    );
    expect(
      container.querySelector('[data-slot="wrapper"]'),
    ).not.toBeInTheDocument();
    screen
      .getAllByRole('row')
      .forEach((row) => expect(row).toHaveClass('bg-danger'));
    rerender(<Table columns={columns} hasWrapper rows={rows} />);
    expect(
      container.querySelector('[data-slot="wrapper"]'),
    ).toBeInTheDocument();
  });

  it('preserves row order and values when the data changes', () => {
    const { rerender } = render(<Table columns={columns} rows={rows} />);
    rerender(
      <Table
        columns={columns}
        rows={[{ key: 'new', name: 'New row', value: 2 }]}
      />,
    );
    expect(screen.queryByText('Zero')).not.toBeInTheDocument();
    expect(
      within(screen.getByRole('row', { name: /New row/ })).getByText('2'),
    ).toBeInTheDocument();
  });

  it('windows a large collection while exposing its full row count', () => {
    const data = Array.from({ length: 1000 }, (_, index) => ({
      key: index,
      name: `Person ${index}`,
      value: index,
    }));
    const { container, rerender } = render(
      <Table columns={columns} maxTableHeight={320} rows={data} virtualized />,
    );
    const surface = container.querySelector<HTMLElement>(
      '[data-slot="wrapper"]',
    );
    if (!surface) {
      throw new Error('Missing virtual surface');
    }
    expect(screen.getByRole('grid')).toHaveAttribute('aria-rowcount', '1001');
    expect(screen.getAllByRole('row').length).toBeLessThan(40);
    fireEvent.scroll(surface, { target: { scrollTop: 20000 } });
    expect(screen.getByText('Person 500')).toBeInTheDocument();
    expect(screen.queryByText('Person 0')).not.toBeInTheDocument();
    rerender(
      <Table
        columns={columns}
        maxTableHeight={320}
        rows={data.slice(0, 2)}
        virtualized
      />,
    );
    expect(screen.getByRole('grid')).toHaveAttribute('aria-rowcount', '3');
    expect(screen.getByText('Person 1')).toBeInTheDocument();
  });
});
