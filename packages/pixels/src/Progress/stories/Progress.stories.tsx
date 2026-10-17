import type { ProgressProps } from '../Progress';
import type { Story } from './Progress.storySetup';

import Progress, { progressVariants } from '../Progress';
import { isSSR, meta as sharedMeta } from './Progress.storySetup';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: typeof sharedMeta = { ...sharedMeta, title: 'pixels/Progress' };

export default meta;

// -----------------------------------------------------------------------------
// Normal and composition stories
// -----------------------------------------------------------------------------

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
                disableAnimation={isSSR || args.disableAnimation}
                percent={p}
                showValueLabel
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

export const CustomStyling: Story = {
  args: {
    label: 'Uploading files',
    percent: 42,
    showValueLabel: true,
    className: {
      indicator: 'bg-secondary',
      label: 'font-semibold',
      track: 'h-2',
      value: 'text-secondary',
    },
  },
};
