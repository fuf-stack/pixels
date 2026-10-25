import type { Meta, StoryObj } from '@storybook/react-vite';
import type { NotificationHost } from '..';

import { useState } from 'react';

import edgeCaseDecorator from '@repo/storybook-config/edge-case-decorator';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '@fuf-stack/pixels/Button';
import { Modal } from '@fuf-stack/pixels/Modal';

import { notification } from '..';
import meta from './notification.stories';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const edgeCaseMeta: Meta<typeof NotificationHost> = {
  ...meta,
  title: 'megapixels/Notification/Edge Cases',
  decorators: [...[meta.decorators ?? []].flat(), edgeCaseDecorator],
};

export default edgeCaseMeta;
type Story = StoryObj<typeof NotificationHost>;

/**
 * Notifications and modals stack in **both** directions, depending on which one
 * was opened from the other:
 *
 * - **Notification above a modal:** a **normal modal** sits at the Pixels
 *   default `z-50`, while the Toaster sits at `z-60`, so a notification raised
 *   while the modal is open appears **on top of** it (left button).
 * - **Notification below a modal:** a modal opened *from* a notification is
 *   raised to `z-70`, so it appears **on top of** the notification it was
 *   opened from — the notification then sits **underneath** the modal (right
 *   button). The same flow is shown in `WithErrorModal` /
 *   `WithLargeMoreContentModal`.
 */
// -----------------------------------------------------------------------------
// Normal stories
// -----------------------------------------------------------------------------

export const StackingOverModal: Story = {
  name: 'Stacking Over Modal',
  parameters: {
    edgeCaseDescription:
      'Notifications remain interactive above an open modal, and a modal opened from a notification stacks above both.',
  },
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div className="flex flex-wrap gap-2">
        {/* Notification ABOVE the modal: normal modal (z-50) < Toaster (z-60). */}
        <Button
          onClick={() => {
            setIsOpen(true);
          }}
        >
          Open modal
        </Button>
        <Modal
          header="Normal modal"
          isOpen={isOpen}
          onClose={() => {
            setIsOpen(false);
          }}
        >
          <div className="space-y-3">
            <p>I am a normal modal (z-50).</p>
            <Button
              onClick={() => {
                notification.error('A notification on top of the modal.', {
                  title: 'Notification',
                });
              }}
            >
              Show notification
            </Button>
          </div>
        </Modal>

        {/* Notification BELOW the modal: Toaster (z-60) < modal-from-notification (z-70). */}
        <Button
          onClick={() => {
            notification.warn('A notification beneath the modal.', {
              title: 'Notification',
              // TODO: on close
              endContent: ({ modal, closeNotification }) => {
                return (
                  <Button
                    onClick={() => {
                      closeNotification();
                      modal.open({
                        content: (
                          <p>I am a modal opened from a notification (z-70).</p>
                        ),
                        header: 'Modal from notification',
                      });
                    }}
                    size="sm"
                    type="button"
                    variant="flat"
                  >
                    Open modal from notification
                  </Button>
                );
              },
            });
          }}
        >
          Show notification with modal
        </Button>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Modals and toasts render in a portal on document.body, outside the canvas.
    const body = within(document.body);

    // Raise a notification that can open its own modal (its action button lives
    // on the Toaster, z-60).
    await userEvent.click(canvas.getByText('Show notification with modal'));
    await waitFor(() => {
      expect(
        body.getByText('A notification beneath the modal.'),
      ).toBeInTheDocument();
    });

    // Open the normal modal (z-50). The Toaster (z-60) keeps the notification
    // on top of it.
    await userEvent.click(canvas.getByText('Open modal'));
    await waitFor(() => {
      expect(body.getByText('I am a normal modal (z-50).')).toBeInTheDocument();
    });

    // Case 1 — notification ABOVE the modal: raise another notification from
    // inside the open modal. The Toaster (z-60) stacks over the modal (z-50).
    await userEvent.click(body.getByText('Show notification'));
    await waitFor(() => {
      expect(
        body.getByText('A notification on top of the modal.'),
      ).toBeInTheDocument();
    });

    // Case 2 / regression — notification BELOW the modal: with the normal modal
    // STILL open, clicking the notification's action must open the modal from
    // it (z-70), stacking over both. The Toaster is marked as a react-aria top
    // layer, so the open modal no longer swallows this click as an "interact
    // outside" (which previously required closing the modal first).
    await userEvent.click(body.getByText('Open modal from notification'));
    await waitFor(() => {
      expect(
        body.getByText('I am a modal opened from a notification (z-70).'),
      ).toBeInTheDocument();
    });
  },
};
