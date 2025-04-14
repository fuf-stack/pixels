import type { Meta, StoryObj } from '@storybook/react';
import type { CircularProgressVariantProps } from '.';

import CircularProgress, {
  circularProgressStyleVariantOptions,
  circularProgressVariants,
} from './CircularProgress';

const meta: Meta<typeof CircularProgress> = {
  title: 'pixels/CircularProgress',
  component: CircularProgress,
} as Meta<typeof CircularProgress>;

export default meta;
type Story = StoryObj<typeof CircularProgress>;

const sizes = [...Object.keys(circularProgressVariants.variants.size)] as const;

export const Default: Story = {};

export const HasError: Story = {
  args: {
    hasError: true,
    percent: 42,
  },
};

export const AllStyleVariants: Story = {
  render: (args) => (
    <>
      {circularProgressStyleVariantOptions.map((styleVariant) => (
        <div key={styleVariant} style={{ marginTop: '10px' }}>
          <CircularProgress
            {...args}
            percent={42}
            styleVariant={styleVariant}
          />
          <span style={{ marginLeft: '10px' }}> {styleVariant}</span>
        </div>
      ))}
    </>
  ),
  argTypes: {
    // do not show styleVariant in controls table
    styleVariant: {
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
          <CircularProgress {...args} percent={p} />
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

/** SOME PERCENTAGES */
export const Sizes: Story = {
  render: (args) => (
    <>
      {sizes.map((s) => (
        <div key={s} style={{ marginTop: '10px' }}>
          <CircularProgress
            {...args}
            size={s as CircularProgressVariantProps['size']}
          />
        </div>
      ))}
    </>
  ),
  argTypes: {
    // do not show size in controls table
    size: {
      table: {
        disable: true,
      },
    },
  },
};
