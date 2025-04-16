import type { ProgressProps } from '@heroui/progress';
import type { Meta, StoryObj } from '@storybook/react';

import Progress, { progressVariants } from './Progress';

const meta: Meta<typeof Progress> = {
  title: 'pixels/Progress',
  component: Progress,
  decorators: [
    (Story) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
} as Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = {};

export const WithLabel: Story = {
  args: {
    label: 'label',
  },
};

export const NoValueLabel: Story = {
  args: {
    showValueLabel: false,
  },
};

export const CompletedSuccess: Story = {
  render: (args) => (
    <>
      <Progress {...args} percent={42} successOnComplete />
      <Progress {...args} percent={100} successOnComplete />
      <Progress {...args} percent={150} successOnComplete />
    </>
  ),
  args: {},
};

export const AllStyleVariants: Story = {
  render: (args) => (
    <>
      {Object.keys(progressVariants.variants.color).map((color) => (
        <div key={color} style={{ marginTop: '10px' }}>
          <Progress
            {...args}
            label={color}
            percent={42}
            color={color as ProgressProps['color']}
          />
        </div>
      ))}
    </>
  ),
  argTypes: {
    // do not show styleVariant in controls table
    color: {
      table: {
        disable: true,
      },
    },
  },
};

/** SOME PERCENTAGES */
const percent = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 150] as number[];
export const SomePercentages: Story = {
  render: (args) => (
    <>
      {percent.map((p) => (
        <div key={p} style={{ marginTop: '10px' }}>
          <Progress {...args} percent={p} />
        </div>
      ))}
    </>
  ),
  argTypes: {
    // do not show percent in controls table
    percent: {
      table: {
        disable: true,
      },
    },
  },
};
