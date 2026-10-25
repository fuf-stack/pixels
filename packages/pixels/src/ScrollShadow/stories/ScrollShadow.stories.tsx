import type { Story } from './ScrollShadow.storySetup';

import {
  HorizontalContent,
  meta as sharedMeta,
  VerticalContent,
} from './ScrollShadow.storySetup';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: typeof sharedMeta = { ...sharedMeta, title: 'pixels/ScrollShadow' };

export default meta;

// -----------------------------------------------------------------------------
// Normal and composition stories
// -----------------------------------------------------------------------------

export const Vertical: Story = {
  tags: ['visual'],
  parameters: { visual: { target: '[data-component="scroll-shadow"]' } },
  args: {
    className: 'w-[300px] h-[400px]',
    children: <VerticalContent />,
  },
};

export const Horizontal: Story = {
  tags: ['visual'],
  parameters: { visual: { target: '[data-component="scroll-shadow"]' } },
  args: {
    className: 'w-[400px] h-[120px]',
    orientation: 'horizontal',
    children: <HorizontalContent />,
  },
};

export const HideScrollBar: Story = {
  args: {
    className: 'w-[300px] h-[300px]',
    hideScrollBar: true,
    children: <VerticalContent />,
  },
};

export const LargeShadow: Story = {
  args: {
    className: 'w-[300px] h-[400px]',
    size: 120,
    children: <VerticalContent />,
  },
};

export const SmallShadow: Story = {
  args: {
    className: 'w-[300px] h-[400px]',
    size: 15,
    children: <VerticalContent />,
  },
};

export const TopOnlyShadow: Story = {
  args: {
    className: 'w-[300px] h-[400px]',
    visibility: 'top',
    children: <VerticalContent />,
  },
};

export const NoShadow: Story = {
  args: {
    className: 'w-[300px] h-[400px]',
    visibility: 'none',
    children: <VerticalContent />,
  },
};

export const MaxHeightViaStyle: Story = {
  args: {
    className: 'w-[300px]',
    style: { maxHeight: 260 },
    children: <VerticalContent />,
  },
};
