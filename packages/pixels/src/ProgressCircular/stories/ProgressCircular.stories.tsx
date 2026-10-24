import type { ProgressCircularProps } from '../ProgressCircular';
import type { Story } from './ProgressCircular.storySetup';

import ProgressCircular, {
  progressCircularVariants,
} from '../ProgressCircular';
import { meta as sharedMeta } from './ProgressCircular.storySetup';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: typeof sharedMeta = {
  ...sharedMeta,
  title: 'pixels/ProgressCircular',
};

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

export const HasError: Story = {
  args: {
    hasError: true,
    percent: 42,
  },
};

export const AllColors: Story = {
  render: (args) => {
    return (
      <>
        {Object.keys(progressCircularVariants.variants.color).map((color) => {
          return (
            <div key={color} style={{ marginTop: '10px' }}>
              <ProgressCircular
                {...args}
                color={color as ProgressCircularProps['color']}
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

export const AllSizes: Story = {
  render: (args) => {
    return (
      <>
        {Object.keys(progressCircularVariants.variants.size).map((size) => {
          return (
            <div key={size} style={{ marginTop: '10px' }}>
              <ProgressCircular
                {...args}
                size={size as ProgressCircularProps['size']}
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
            <div key={p} style={{ marginTop: '10px' }}>
              <ProgressCircular {...args} percent={p} />
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
  args: { percent: 101, disableFinishedState: true },
};

export const WithoutPercentProp: Story = {};

export const CustomStyling: Story = {
  args: {
    percent: 42,
    className: {
      svg: 'h-24 w-24 text-secondary',
      track: 'stroke-secondary/20',
      value: 'font-semibold text-secondary',
    },
  },
};
