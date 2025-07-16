import type { ProgressProps } from '@heroui/progress';
import type { Meta, StoryObj } from '@storybook/react-vite';

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

export const Default: Story = {
  args: {
    percent: 42,
  },
};

export const Finished: Story = {
  args: {
    percent: 100,
  },
};

export const Indeterminate: Story = {
  args: {
    indeterminate: true,
  },
};

export const ShowValueLabel: Story = {
  args: {
    showValueLabel: true,
    percent: 42,
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Some Label',
    percent: 42,
  },
};

export const WithLabelAndValueLabel: Story = {
  args: {
    label: 'Some Label',
    showValueLabel: true,
    percent: 42,
  },
};

export const AllColors: Story = {
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

export const AllSizes: Story = {
  render: (args) => (
    <>
      {['sm', 'md', 'lg'].map((size) => (
        <div key={size} style={{ marginTop: '10px' }}>
          <Progress
            {...args}
            label={size}
            size={size as ProgressProps['size']}
          />
        </div>
      ))}
    </>
  ),
  args: {
    percent: 42,
  },
  argTypes: {
    // do not show size in controls table
    size: {
      table: {
        disable: true,
      },
    },
  },
};

export const SomePercentages: Story = {
  render: (args) => (
    <>
      {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 150].map((p) => (
        <div key={p} style={{ marginTop: '20px' }}>
          <Progress {...args} percent={p} showValueLabel />
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

export const DisableFinishedState: Story = {
  args: { percent: 101, disableFinishedState: true, showValueLabel: true },
};

export const WithoutPercentProp: Story = {};
