import type { Meta, StoryObj } from '@storybook/react-vite';

import { useState } from 'react';

import { toast, Toaster } from '.';
import { Button } from '../Button';

const positions = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
] as const;

const meta: Meta<typeof Toaster> = {
  title: 'pixels/Toaster',
  component: Toaster,
};

export default meta;
type Story = StoryObj<typeof Toaster>;

const PositionExample = () => {
  const [position, setPosition] =
    useState<(typeof positions)[number]>('top-center');
  return (
    <>
      <Toaster position={position} />
      <div className="flex flex-wrap gap-2">
        {positions.map((pos) => {
          return (
            <Button
              key={pos}
              color={pos === position ? 'primary' : 'default'}
              onClick={() => {
                setPosition(pos);
                toast.info(`Toaster position: ${pos}`);
              }}
            >
              {pos}
            </Button>
          );
        })}
      </div>
    </>
  );
};

export const Position: Story = {
  render: () => {
    return <PositionExample />;
  },
};
