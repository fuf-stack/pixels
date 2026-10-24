import type { Story } from './Modal.storySetup';

import { useState } from 'react';

import { expect, userEvent, waitFor, within } from 'storybook/test';

import Modal from '../Modal';
import { meta as sharedMeta } from './Modal.storySetup';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: typeof sharedMeta = {
  ...sharedMeta,
  title: 'pixels/Modal/Interactions',
};

export default meta;

const KeyboardExample = () => {
  const [open, setOpen] = useState(false);

  // open the controlled dialog
  const handleOpen = () => {
    setOpen(true);
  };

  // return focus to the opener when the dialog closes
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <button onClick={handleOpen} type="button">
        Edit profile
      </button>
      <Modal header="Profile details" isOpen={open} onClose={handleClose}>
        <button type="button">First action</button>
        <button type="button">Last action</button>
      </Modal>
    </>
  );
};

// -----------------------------------------------------------------------------
// Interaction stories
// -----------------------------------------------------------------------------

export const KeyboardDismissal: Story = {
  render: () => {
    return <KeyboardExample />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const trigger = canvas.getByRole('button', { name: 'Edit profile' });

    // establish the keyboard opener before the dialog captures its return target
    trigger.focus();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    const dialog = await body.findByRole('dialog', { name: 'Profile details' });

    await userEvent.tab();
    await expect(dialog).toContainElement(
      document.activeElement as HTMLElement,
    );
    await userEvent.tab({ shift: true });
    await expect(dialog).toContainElement(
      document.activeElement as HTMLElement,
    );

    await userEvent.keyboard('{Escape}');
    // focus restoration runs on an animation frame after the exit finishes
    await waitFor(
      async () => {
        await expect(body.queryByRole('dialog')).not.toBeInTheDocument();
        await expect(trigger).toHaveFocus();
      },
      { timeout: 5000 },
    );
  },
};
