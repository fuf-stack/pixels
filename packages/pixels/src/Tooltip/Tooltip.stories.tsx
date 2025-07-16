import type { Meta, StoryObj } from '@storybook/react-vite';
import type { TooltipPlacement, TooltipProps } from './Tooltip';

import Tooltip, { tooltipVariants as heroTooltipVariants } from './Tooltip';

const meta: Meta<typeof Tooltip> = {
  title: 'pixels/Tooltip',
  component: Tooltip,
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

const sizes = Object.keys(heroTooltipVariants.variants.size);

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

export const TooltipInTooltip: Story = {
  args: {
    content: (
      <Tooltip content="2nd tooltip content">
        hover for 2nd tooltip content
      </Tooltip>
    ),
    children: 'hover me',
  },
};

export const Sizes: Story = {
  args: {
    content:
      'tooltip content. this can be very long. Or not. Depending on what you want. Just make sure to test it! To test it, we need a longer text. So I will just keep on writing more words. adjuifgoreiaidofgreougdnfigerigahrisuiasoghureiidfgjjuirghuidsghuegijuifghreugdjagvioeruhgidugdfsihguirghreuigjaiuhgfuidofhgidhgsuihagiuohegiofdpsjguoeriirgidosfhguihoeg',
    children: 'hover me',
  },
  render: (args) => {
    return (
      <div className="flex flex-col gap-4">
        {sizes.map((size) => (
          <Tooltip key={size} size={size as TooltipProps['size']} {...args}>
            {size}
          </Tooltip>
        ))}
      </div>
    );
  },
};

export const DefaultOpen: Story = {
  args: {
    content: 'tooltip content',
    footer: 'footer',
    header: 'header',
    children: 'hover me',
    defaultOpen: true,
  },
};
