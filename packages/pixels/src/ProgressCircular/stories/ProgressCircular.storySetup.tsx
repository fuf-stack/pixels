import type { Meta, StoryObj } from '@storybook/react-vite';

import { useState } from 'react';

import { Button } from '../../Button';
import ProgressCircular from '../ProgressCircular';

// -----------------------------------------------------------------------------
// Shared metadata and fixtures
// -----------------------------------------------------------------------------

export const meta: Meta<typeof ProgressCircular> = {
  title: 'pixels/ProgressCircular',
  component: ProgressCircular,
};

export type Story = StoryObj<typeof ProgressCircular>;

export const UpdatingExample = () => {
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
