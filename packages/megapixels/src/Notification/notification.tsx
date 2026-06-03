import type { ModalStoreApi } from '@fuf-stack/pixels/Modal';
import type { ToastOptions } from '@fuf-stack/pixels/Toast';
import type { ReactNode } from 'react';

import { modal } from '@fuf-stack/pixels/Modal';
import { toast } from '@fuf-stack/pixels/Toast';

/**
 * Props passed to function-based render props on a notification (e.g.
 * `endContent`), exposing helpers usable while rendering.
 */
export interface NotificationRenderProps {
  /** Imperative modal API for opening/closing a modal from a notification. */
  modal: ModalStoreApi;
}

/** Options accepted by every `notification.<variant>()` call */
export interface NotificationOptions extends Omit<ToastOptions, 'endContent'> {
  /**
   * The notification's end content. Either a node rendered directly, or a
   * render function that receives the {@link NotificationRenderProps} (incl. a
   * `modal` API to open a modal) and returns the node to render.
   */
  endContent?: ReactNode | ((props: NotificationRenderProps) => ReactNode);
}

// Render props passed to function-based options (e.g. `endContent`).
const renderProps: NotificationRenderProps = { modal };

/**
 * Maps `NotificationOptions` to `ToastOptions` by resolving `endContent`:
 * a render function receives the render props and its returned node is used.
 */
const resolveOptions = (
  options?: NotificationOptions,
): ToastOptions | undefined => {
  if (!options) {
    return undefined;
  }
  // Pull `endContent` out so the remaining options pass through unchanged.
  const { endContent, ...toastOptions } = options;

  return {
    ...toastOptions,
    // `ToastOptions.endContent` only accepts a node, so resolve the
    // render-function form down to one (a plain node passes through as-is).
    endContent:
      typeof endContent === 'function' ? endContent(renderProps) : endContent,
  };
};

/**
 * Imperative API for showing notifications: `default` / `info` / `warn` /
 * `success` / `error` show a notification (each returns an id), and `close`
 * dismisses one by id.
 *
 * Besides a plain node, `endContent` may be a render function that receives
 * the {@link NotificationRenderProps} — including a `modal` API — and returns
 * the node to render, e.g. to open a modal showing details that do not fit
 * into the notification itself.
 *
 * Requires a `<NotificationHost />` to be mounted in the React tree.
 *
 * @example
 * ```tsx
 * notification.error('A request failed.', {
 *   title: 'Request failed',
 *   endContent: ({ modal }) => (
 *     <Button onClick={() => modal.open({ content: details })}>More</Button>
 *   ),
 * });
 * ```
 */
const notification = {
  /**
   * Show a default notification.
   * @returns The toast id which can be passed to `notification.close()`
   */
  default: (message: ReactNode, options?: NotificationOptions) => {
    return toast.default(message, resolveOptions(options));
  },
  /**
   * Show an info notification.
   * @returns The toast id which can be passed to `notification.close()`
   */
  info: (message: ReactNode, options?: NotificationOptions) => {
    return toast.info(message, resolveOptions(options));
  },
  /**
   * Show a warning notification.
   * @returns The toast id which can be passed to `notification.close()`
   */
  warn: (message: ReactNode, options?: NotificationOptions) => {
    return toast.warn(message, resolveOptions(options));
  },
  /**
   * Show a success notification.
   * @returns The toast id which can be passed to `notification.close()`
   */
  success: (message: ReactNode, options?: NotificationOptions) => {
    return toast.success(message, resolveOptions(options));
  },
  /**
   * Show an error notification.
   * @returns The toast id which can be passed to `notification.close()`
   */
  error: (message: ReactNode, options?: NotificationOptions) => {
    return toast.error(message, resolveOptions(options));
  },
  /** Close a notification by its id */
  close: (id: string | number) => {
    toast.close(id);
  },
};

export default notification;
