import type { ModalOpenOptions } from '@fuf-stack/pixels/Modal';
import type { ToastOptions } from '@fuf-stack/pixels/Toast';
import type { ReactNode } from 'react';

import { isTestEnvironment } from '@fuf-stack/pixel-utils';
import { Button } from '@fuf-stack/pixels/Button';
import { modal } from '@fuf-stack/pixels/Modal';
import { toast } from '@fuf-stack/pixels/Toast';

/** Options accepted by every `notification.<variant>()` call */
export interface NotificationOptions extends ToastOptions {
  /**
   * Extra content that is **not** rendered inside the toast itself. When set,
   * a centered "More" button appears below the message and opens a modal
   * containing this content. The toast's `endContent` slot is preserved.
   */
  moreContent?: ReactNode;
  /** Header used for the modal opened by the "More" button */
  moreContentHeader?: ReactNode;
  /** Label of the "More" button (defaults to "More") */
  moreButtonLabel?: ReactNode;
  /** Size of the modal opened by the "More" button */
  moreContentModalSize?: ModalOpenOptions['size'];
}

/**
 * Splits `NotificationOptions`
 */
const buildToastArgs = (
  message: ReactNode,
  options?: NotificationOptions,
): [ReactNode, ToastOptions | undefined] => {
  if (!options) {
    return [message, undefined];
  }
  const {
    moreContent,
    moreContentHeader,
    moreButtonLabel = 'More',
    moreContentModalSize = 'md',
    ...toastOptions
  } = options;
  if (moreContent == null) {
    return [message, toastOptions];
  }
  const wrappedMessage = message;

  return [
    wrappedMessage,
    {
      ...toastOptions,
      endContent: (
        <Button
          className="whitespace-nowrap border-inherit text-inherit"
          onClick={() => {
            modal.open({
              content: moreContent,
              header: moreContentHeader,
              size: moreContentModalSize,
              // Disable the open/close animation in tests so snapshots are
              // deterministic (the framer-motion opacity tween otherwise
              // captures a random mid-animation frame).
              disableAnimation: isTestEnvironment(),
            });
          }}
          size="sm"
          type="button"
          variant="bordered"
        >
          {moreButtonLabel}
        </Button>
      ),
    },
  ];
};

/**
 * Imperative notification API combining toasts with optional modal details.
 *
 * Mirrors the `toast` API but adds `moreContent`: extra content that is shown
 * in a modal opened via a "More" button on the toast, instead of inside the
 * toast body. Requires a `<NotificationHost />` to be mounted.
 */
const notification = {
  /**
   * Show a default notification.
   * @returns The toast id which can be passed to `notification.close()`
   */
  default: (message: ReactNode, options?: NotificationOptions) => {
    return toast.default(...buildToastArgs(message, options));
  },
  /**
   * Show an info notification.
   * @returns The toast id which can be passed to `notification.close()`
   */
  info: (message: ReactNode, options?: NotificationOptions) => {
    return toast.info(...buildToastArgs(message, options));
  },
  /**
   * Show a warning notification.
   * @returns The toast id which can be passed to `notification.close()`
   */
  warn: (message: ReactNode, options?: NotificationOptions) => {
    return toast.warn(...buildToastArgs(message, options));
  },
  /**
   * Show a success notification.
   * @returns The toast id which can be passed to `notification.close()`
   */
  success: (message: ReactNode, options?: NotificationOptions) => {
    return toast.success(...buildToastArgs(message, options));
  },
  /**
   * Show an error notification.
   * @returns The toast id which can be passed to `notification.close()`
   */
  error: (message: ReactNode, options?: NotificationOptions) => {
    return toast.error(...buildToastArgs(message, options));
  },
  /** Close a notification by its id */
  close: (id: string | number) => {
    toast.close(id);
  },
};

export default notification;
