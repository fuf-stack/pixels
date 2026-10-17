import type { Meta, StoryObj } from '@storybook/react-vite';

import { useState } from 'react';

import { Button } from '../../Button';
import Progress from '../Progress';

// -----------------------------------------------------------------------------
// Shared metadata and fixtures
// -----------------------------------------------------------------------------

export const isSSR = typeof window === 'undefined';

export const meta: Meta<typeof Progress> = {
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

export type Story = StoryObj<typeof Progress>;

export const UpdatingExample = () => {
  const [percent, setPercent] = useState(25);

  const handleAdvance = () => {
    setPercent((value) => {
      return Math.min(100, value + 25);
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <Progress label="Upload" percent={percent} showValueLabel />
      <Button onClick={handleAdvance}>Advance</Button>
    </div>
  );
};
