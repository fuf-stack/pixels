import type { Meta, StoryObj } from '@storybook/react-vite';

import { useState } from 'react';

import { Button } from '../../Button';
import Drawer from '../Drawer';

export type Story = StoryObj<typeof Drawer>;

export const Template: Story['render'] = (args, { canvasElement }) => {
  const { isOpen: initialOpen = false } = args;
  const [open, setOpen] = useState(initialOpen);

  // open the controlled drawer
  const handleOpen = () => {
    setOpen(true);
  };

  // close the drawer when dismissal is requested
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button
        disableAnimation={process.env.NODE_ENV === 'test'}
        onClick={handleOpen}
        testId="drawer_trigger"
      >
        Reveal the Secrets!
      </Button>
      <Drawer
        {...args}
        isOpen={open}
        onClose={handleClose}
        portalContainer={canvasElement}
      />
    </>
  );
};

export const meta: Meta<typeof Drawer> = {
  title: 'pixels/Drawer',
  component: Drawer,
  render: Template,
};
