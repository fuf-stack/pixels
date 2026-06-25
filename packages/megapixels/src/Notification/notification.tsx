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
  /** Closes the notification this render function belongs to. */
  closeNotification: () => void;
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

// Modal API exposed to render props. The exposed `modal.open` elevates the
// modal above the Toaster so it stacks on top of the notification it was opened
// from: the Toaster sits at z-60 (see NotificationHost) while HeroUI defaults
// the modal z-index (on its `wrapper` + `backdrop` slots) to z-50, so we raise
// both to z-70 via the `className` slot.
const renderPropsModal: ModalStoreApi = {
  ...modal,
  open: (options) => {
    return modal.open({
      className: { backdrop: 'z-[70]', wrapper: 'z-[70]' },
      ...options,
    });
  },
};

/**
 * Maps `NotificationOptions` to `ToastOptions` by resolving `endContent`:
 * a render function receives the render props and its returned node is used.
 */
const resolveOptions = (
  options: NotificationOptions | undefined,
  renderProps: NotificationRenderProps,
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
 * Shows a notification via the given toast method, wiring up the render props.
 *
 * The toast id is only known after the toast is shown, but the `endContent`
 * render function runs before that — so we stash the id in a holder that the
 * `closeNotification` closure reads when invoked (always after the id is set).
 */
const show = (
  showToast: (message: ReactNode, options?: ToastOptions) => string | number,
  message: ReactNode,
  options?: NotificationOptions,
) => {
  const idHolder: { id?: string | number } = {};
  const renderProps: NotificationRenderProps = {
    modal: renderPropsModal,
    closeNotification: () => {
      if (idHolder.id !== undefined) {
        toast.close(idHolder.id);
      }
    },
  };
  const id = showToast(message, resolveOptions(options, renderProps));
  idHolder.id = id;
  return id;
};

/**
 * Imperative API for showing notifications: `default` / `info` / `warn` /
 * `success` / `error` show a notification (each returns an id), and `close`
 * dismisses one by id.
 *
 * Besides a plain node, `endContent` may be a render function that receives
 * the {@link NotificationRenderProps} — including a `modal` API and a
 * `closeNotification` helper that dismisses this notification — and returns
 * the node to render, e.g. to open a modal showing details that do not fit
 * into the notification itself.
 *
 * Requires a `<NotificationHost />` to be mounted in the React tree.
 *
 * @example
 * ```tsx
 * notification.error('A request failed.', {
 *   title: 'Request failed',
 *   endContent: ({ modal, closeNotification }) => (
 *     <>
 *       <Button onClick={() => modal.open({ content: details })}>More</Button>
 *       <Button onClick={closeNotification}>Dismiss</Button>
 *     </>
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
    return show(toast.default, message, options);
  },
  /**
   * Show an info notification.
   * @returns The toast id which can be passed to `notification.close()`
   */
  info: (message: ReactNode, options?: NotificationOptions) => {
    return show(toast.info, message, options);
  },
  /**
   * Show a warning notification.
   * @returns The toast id which can be passed to `notification.close()`
   */
  warn: (message: ReactNode, options?: NotificationOptions) => {
    return show(toast.warn, message, options);
  },
  /**
   * Show a success notification.
   * @returns The toast id which can be passed to `notification.close()`
   */
  success: (message: ReactNode, options?: NotificationOptions) => {
    return show(toast.success, message, options);
  },
  /**
   * Show an error notification.
   * @returns The toast id which can be passed to `notification.close()`
   */
  error: (message: ReactNode, options?: NotificationOptions) => {
    return show(toast.error, message, options);
  },
  /** Close a notification by its id */
  close: (id: string | number) => {
    toast.close(id);
  },
};

export default notification;
