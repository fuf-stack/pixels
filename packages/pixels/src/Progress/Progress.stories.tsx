import type { ProgressProps } from '@heroui/progress';
import type { Meta, StoryObj } from '@storybook/react-vite';

import Progress, { progressVariants } from './Progress';

// Determine SSR/test environment. In those cases we disable animations in
// stories to avoid timers outliving the test lifecycle, while keeping the
// component implementation free of environment checks.
const isSSR = typeof window === 'undefined';

const meta: Meta<typeof Progress> = {
  title: 'pixels/Progress',
  component: Progress,
  decorators: [
    (Story) => {
      return (
        <div style={{ width: '300px' }}>
          <Story />
        </div>
      );
    },
  ],
  // Global render to inject disableAnimation for SSR/test
  render: (args) => {
    return (
      <Progress {...args} disableAnimation={isSSR || args.disableAnimation} />
    );
  },
};

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
  render: (args) => {
    return (
      <>
        {Object.keys(progressVariants.variants.color).map((color) => {
          return (
            <div key={color} style={{ marginTop: '10px' }}>
              <Progress
                {...args}
                color={color as ProgressProps['color']}
                disableAnimation={isSSR || args.disableAnimation}
                label={color}
                percent={42}
              />
            </div>
          );
        })}
      </>
    );
  },
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
  render: (args) => {
    return (
      <>
        {['sm', 'md', 'lg'].map((size) => {
          return (
            <div key={size} style={{ marginTop: '10px' }}>
              <Progress
                {...args}
                disableAnimation={isSSR || args.disableAnimation}
                label={size}
                size={size as ProgressProps['size']}
              />
            </div>
          );
        })}
      </>
    );
  },
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
  render: (args) => {
    return (
      <>
        {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 150].map((p) => {
          return (
            <div key={p} style={{ marginTop: '20px' }}>
              <Progress
                {...args}
                showValueLabel
                disableAnimation={isSSR || args.disableAnimation}
                percent={p}
              />
            </div>
          );
        })}
      </>
    );
  },
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
