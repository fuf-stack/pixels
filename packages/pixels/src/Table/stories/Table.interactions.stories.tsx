import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, userEvent, waitFor, within } from 'storybook/test';

import Table from '../Table';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: Meta<typeof Table> = {
  title: 'pixels/Table/Interactions',
  component: Table,
};

export default meta;

type Story = StoryObj<typeof Table>;

// grid-wide Home/End uses Command on macOS and Control on other platforms
const modifier = document.defaultView?.navigator.platform.includes('Mac')
  ? 'Meta'
  : 'Control';

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'role', label: 'Role' },
];
const rows = Array.from({ length: 1000 }, (_, index) => {
  return {
    key: `row-${index}`,
    name: `Person ${index + 1}`,
    role: `Role ${index + 1}`,
  };
});

// -----------------------------------------------------------------------------
// Interaction stories
// -----------------------------------------------------------------------------

export const KeyboardNavigation: Story = {
  args: { ariaLabel: 'Keyboard employees', columns, rows: rows.slice(0, 3) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('rowheader', { name: 'Person 1' }));
    await expect(
      canvas.getByRole('rowheader', { name: 'Person 1' }),
    ).toHaveFocus();
    await expect(canvasElement.contains(document.activeElement)).toBe(true);
    await userEvent.keyboard('{ArrowRight}');
    await expect(
      canvas.getByRole('gridcell', { name: 'Role 1' }),
    ).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(
      canvas.getByRole('gridcell', { name: 'Role 2' }),
    ).toHaveFocus();
  },
};

export const VirtualScrolling: Story = {
  args: {
    ariaLabel: 'Virtual employees',
    columns,
    rows,
    virtualized: true,
    maxTableHeight: 320,
    rowHeight: 40,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const grid = canvas.getByRole('grid');
    const surface = canvasElement.querySelector<HTMLElement>(
      '[data-slot="wrapper"]',
    );
    if (!surface) {
      throw new Error('Missing virtual scroll surface');
    }
    await expect(grid).toHaveAttribute('aria-rowcount', '1001');
    await expect(canvas.getAllByRole('row').length).toBeLessThan(40);

    surface.scrollTop = 20000;
    surface.dispatchEvent(new Event('scroll'));
    await waitFor(async () => {
      return expect(canvas.queryByText('Person 500')).toBeInTheDocument();
    });
    await expect(canvas.queryByText('Person 1')).not.toBeInTheDocument();
    await expect(canvas.getAllByRole('row').length).toBeLessThan(40);
  },
};

export const VirtualKeyboard: Story = {
  args: { ...VirtualScrolling.args, stickyHeader: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    canvas.getByRole('grid').focus();
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard(`{${modifier}>}{End}{/${modifier}}`);
    await waitFor(async () => {
      return expect(canvas.getByText('Person 1000')).toBeInTheDocument();
    });
    await expect(
      canvas.getByRole('row', { name: /Person 1000/ }),
    ).toContainElement(document.activeElement as HTMLElement);
    const focused = document.activeElement?.getBoundingClientRect();
    const surface = canvasElement
      .querySelector('[data-slot="wrapper"]')
      ?.getBoundingClientRect();
    if (!focused || !surface) {
      throw new Error('Missing focused virtual row or surface');
    }
    await expect(focused.top).toBeGreaterThanOrEqual(surface.top);
    await expect(focused.bottom).toBeLessThanOrEqual(surface.bottom);
    await expect(canvas.getAllByRole('row').length).toBeLessThan(40);
  },
};

export const VirtualCellKeyboard: Story = {
  args: { ...VirtualScrolling.args, stickyHeader: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('rowheader', { name: 'Person 1' }));
    await userEvent.keyboard(`{${modifier}>}{End}{/${modifier}}`);
    await waitFor(async () => {
      return expect(
        canvas.getByRole('gridcell', { name: 'Role 1000' }),
      ).toHaveFocus();
    });
    await userEvent.keyboard(`{${modifier}>}{Home}{/${modifier}}`);
    await waitFor(async () => {
      return expect(
        canvas.getByRole('rowheader', { name: 'Person 1' }),
      ).toHaveFocus();
    });
    await userEvent.keyboard('{ArrowUp}');
    await expect(
      canvas.getByRole('columnheader', { name: 'Name' }),
    ).toHaveFocus();
    await expect(canvas.getAllByRole('row').length).toBeLessThan(40);
  },
};
