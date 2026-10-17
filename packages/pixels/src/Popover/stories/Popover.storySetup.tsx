import type { Meta, StoryObj } from '@storybook/react-vite';

import { useState } from 'react';

import Popover from '../Popover';

// -----------------------------------------------------------------------------
// Shared metadata and fixtures
// -----------------------------------------------------------------------------

export const meta: Meta<typeof Popover> = {
  title: 'pixels/Popover',
  component: Popover,
};

export type Story = StoryObj<typeof Popover>;

export const ControlledPopover = () => {
  const [open, setOpen] = useState(false);

  return (
    <Popover
      content={
        <button
          onClick={() => {
            setOpen(false);
          }}
          type="button"
        >
          Done
        </button>
      }
      header="Controlled dialog"
      openControlled={{ open, setOpen }}
    >
      Open controlled
    </Popover>
  );
};

export const PortalPopover = () => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  return (
    <div>
      <div ref={setContainer} data-testid="portal-container" />
      <Popover
        content="Portalled details"
        portalContainer={container ?? undefined}
      >
        Open portal
      </Popover>
    </div>
  );
};
