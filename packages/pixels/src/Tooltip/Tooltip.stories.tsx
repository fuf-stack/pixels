import type { Meta, StoryObj } from '@storybook/react';
import type { TooltipPlacement } from './Tooltip';

import Tooltip from './Tooltip';

const meta: Meta<typeof Tooltip> = {
  title: 'pixels/Tooltip',
  component: Tooltip,
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  args: {
    content: 'tooltip content',
    children: 'hover me',
  },
};

export const Delay: Story = {
  args: {
    content: 'I took 1 second',
    children: '1000 ms delay',
    delay: 1000,
  },
};

export const CloseDelay: Story = {
  args: {
    content: 'I will go in 3s',
    children: '3000 ms close delay',
    closeDelay: 3000,
  },
};

const tooltipPlacementOptions: TooltipPlacement[] = [
  'top',
  'bottom',
  'left',
  'right',
  'top-start',
  'top-end',
  'bottom-start',
  'bottom-end',
  'left-start',
  'left-end',
  'right-start',
  'right-end',
];

export const AllPlacements: Story = {
  render: (args) => (
    <>
      {tooltipPlacementOptions.map((placement) => (
        <div key={placement} className="mb-6">
          <Tooltip placement={placement} {...args}>
            {placement}
          </Tooltip>
        </div>
      ))}
    </>
  ),
  args: {
    content: 'tooltip content',
  },
};

export const DefaultOpen: Story = {
  args: {
    content: 'tooltip content',
    children: 'hover me',
    defaultOpen: true,
  },
};
