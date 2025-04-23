import type { Meta, StoryObj } from '@storybook/react';
import type { ProgressCircularProps } from './ProgressCircular';

import ProgressCircular, { progressCircularVariants } from './ProgressCircular';

const meta: Meta<typeof ProgressCircular> = {
  title: 'pixels/ProgressCircular',
  component: ProgressCircular,
} as Meta<typeof ProgressCircular>;

export default meta;
type Story = StoryObj<typeof ProgressCircular>;

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

export const HasError: Story = {
  args: {
    hasError: true,
    percent: 42,
  },
};

export const AllColors: Story = {
  render: (args) => (
    <>
      {Object.keys(progressCircularVariants.variants.color).map((color) => (
        <div key={color} style={{ marginTop: '10px' }}>
          <ProgressCircular
            {...args}
            color={color as ProgressCircularProps['color']}
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

export const AllSizes: Story = {
  render: (args) => (
    <>
      {Object.keys(progressCircularVariants.variants.size).map((size) => (
        <div key={size} style={{ marginTop: '10px' }}>
          <ProgressCircular
            {...args}
            size={size as ProgressCircularProps['size']}
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
        <div key={p} style={{ marginTop: '10px' }}>
          <ProgressCircular {...args} percent={p} />
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
  args: { percent: 101, disableFinishedState: true },
};

export const WithoutPercentProp: Story = {};
