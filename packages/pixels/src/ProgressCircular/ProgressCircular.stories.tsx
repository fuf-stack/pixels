import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ProgressCircularProps } from './ProgressCircular';

import { useState } from 'react';

import { expect, userEvent, within } from 'storybook/test';

import { Button } from '../Button';
import ProgressCircular, { progressCircularVariants } from './ProgressCircular';

// -----------------------------------------------------------------------------
// Story setup
// -----------------------------------------------------------------------------

const meta: Meta<typeof ProgressCircular> = {
  title: 'pixels/ProgressCircular',
  component: ProgressCircular,
};

export default meta;
type Story = StoryObj<typeof ProgressCircular>;

// -----------------------------------------------------------------------------
// Normal stories
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

// -----------------------------------------------------------------------------
// Composition
// -----------------------------------------------------------------------------

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

const UpdatingExample = () => {
  const [percent, setPercent] = useState(25);

  const handleAdvance = () => {
    setPercent((value) => {
      return Math.min(100, value + 25);
    });
  };

  return (
    <div className="flex items-center gap-4">
      <ProgressCircular ariaLabel="Upload progress" percent={percent} />
      <Button onClick={handleAdvance}>Advance</Button>
    </div>
  );
};

export const UpdatingProgress: Story = {
  render: () => {
    return <UpdatingExample />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Advance' }));
    await expect(
      canvas.getByRole('progressbar', { name: 'Upload progress' }),
    ).toHaveAttribute('aria-valuenow', '50');
    await expect(canvas.getByText('50%')).toBeVisible();
  },
};

// -----------------------------------------------------------------------------
// Edge cases
// -----------------------------------------------------------------------------

export const ErrorAtCompletion: Story = {
  args: { percent: 100, hasError: true },
};

export const CustomStrokeWidth: Story = {
  args: { percent: 42, strokeWidth: 4 },
};

export const RichValue: Story = {
  args: {
    percent: 42,
    size: 'xl',
    format: (percent) => {
      return <strong>{percent} files</strong>;
    },
  },
};
