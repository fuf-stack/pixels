import type { Meta, StoryObj } from '@storybook/react';

import Popover from './Popover';

const meta: Meta<typeof Popover> = {
  title: 'pixels/Popover',
  component: Popover,
};

export default meta;
type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  args: {
    children: 'i am the trigger',
    content: 'i am the content',
  },
};

export const TooMuchContent: Story = {
  args: {
    children: 'i am the trigger',
    placement: 'right',
    content: (
      <>
        {/* eslint-disable-next-line prefer-spread */}
        {Array.apply(null, Array(100)).map((_, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={i}>
            too much content
            <br />
          </div>
        ))}
      </>
    ),
    testId: 'testId42',
  },
};

export const DoubleScrollbar: Story = {
  args: {
    children: 'i am the trigger',
    placement: 'right',
    content: (
      <>
        {/* eslint-disable-next-line prefer-spread */}
        {Array.apply(null, Array(100)).map((_, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={i}>too much content</div>
        ))}
      </>
    ),
    footer: 'i am the footer',
    testId: 'testId42',
    title: 'i am the title',
  },
  render: (args) => (
    <div className="h-[2000px]">
      <Popover {...args} />
    </div>
  ),
};

export const BlockOuterScrollbar: Story = {
  args: {
    children: 'i am the trigger',
    content: (
      <>
        {/* eslint-disable-next-line prefer-spread */}
        {Array.apply(null, Array(100)).map((_, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={i}>too much content</div>
        ))}
      </>
    ),
    footer: 'i am the footer',
    placement: 'right',
    shouldBlockScroll: true,
    testId: 'testId42',
    title: 'i am the title',
  },
  render: (args) => (
    <div className="h-[2000px]">
      <Popover {...args} />
    </div>
  ),
};

export const Title: Story = {
  args: {
    title: 'i am the title',
    children: 'i am the trigger',
    content: 'i am the content',
  },
};

export const Footer: Story = {
  args: {
    footer: 'i am the footer',
    children: 'i am the trigger',
    content: 'i am the content',
  },
};

export const WithCustomTriggerButton: Story = {
  args: {
    content: 'i am the content',
    triggerButtonProps: {
      color: 'success',
      variant: 'shadow',
    },
    children: 'i am a custom trigger',
  },
};

export const AllSections: Story = {
  args: {
    title: 'i am the title',
    footer: 'i am the footer',
    children: 'i am the trigger',
    content: 'i am the content',
  },
};
