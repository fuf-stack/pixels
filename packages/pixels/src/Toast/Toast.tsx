import type { ReactElement, ReactNode } from 'react';
import type { ExternalToast } from 'sonner';
import type { AlertProps } from '../Alert';

import { toast as sonnerToast } from 'sonner';

import AlertComponent from '../Alert';

type AlertColor = NonNullable<AlertProps['color']>;

/** Props passed to a custom render function */
export interface ToastRenderProps {
  /** The toast message */
  message: ReactNode;
  /** The color/severity of the toast */
  color: AlertColor;
  /** Function to close the toast */
  close: () => void;
  /** Whether the toast can be closed by the user */
  closable?: boolean;
  /** Title displayed above the toast message */
  title?: ReactNode;
  /** Content displayed at the end of the toast */
  endContent?: ReactNode;
}

/** Options passed to each toast method */
export interface ToastOptions {
  /** Title displayed above the toast message */
  title?: ReactNode;
  /** Whether the toast can be closed by the user */
  closable?: boolean;
  /** Duration in milliseconds before the toast auto-closes */
  duration?: number;
  /** Position of the toast on the screen */
  position?: ExternalToast['position'];
  /** Callback fired when the toast auto-closes */
  onAutoClose?: ExternalToast['onAutoClose'];
  /** Callback fired when the toast is closed */
  onClose?: ExternalToast['onDismiss'];
  /** Content displayed at the end of the toast */
  endContent?: ReactNode;
  /** Custom render function to override the default AlertComponent */
  render?: (props: ToastRenderProps) => ReactElement;
}

const showToast = (
  message: ReactNode,
  color: AlertColor,
  options?: ToastOptions,
) => {
  // Map custom ToastOptions to Sonner's ExternalToast format:
  // - onClose is mapped to Sonner's onDismiss
  // - closable is handled separately (not a Sonner option)
  // - position defaults to 'top-center'
  const { onClose, closable, title, endContent, render, ...rest } =
    options ?? {};
  const sonnerOptions: ExternalToast = {
    position: 'top-center' as const,
    onDismiss: onClose,
    ...rest,
  };
  return sonnerToast.custom((id) => {
    // Close function passed to custom render or AlertComponent
    const close = () => {
      return sonnerToast.dismiss(id);
    };

    // Allow custom rendering via render prop
    if (render) {
      return render({ message, color, close, closable, title, endContent });
    }

    // Default: render AlertComponent
    return (
      <AlertComponent
        closable={closable}
        color={color}
        endContent={endContent}
        onClose={closable ? close : undefined}
        title={title}
      >
        {message}
      </AlertComponent>
    );
  }, sonnerOptions);
};

/** Toast object with convenience methods for different severity levels */
const toast = {
  /**
   * Show a default toast.
   * @returns The toast id which can be passed to `toast.close()`
   */
  default: (message: ReactNode, options?: ToastOptions) => {
    return showToast(message, 'default', options);
  },
  /**
   * Show an info toast.
   * @returns The toast id which can be passed to `toast.close()`
   */
  info: (message: ReactNode, options?: ToastOptions) => {
    return showToast(message, 'info', options);
  },
  /**
   * Show a warning toast.
   * @returns The toast id which can be passed to `toast.close()`
   */
  warn: (message: ReactNode, options?: ToastOptions) => {
    return showToast(message, 'warning', {
      duration: 60000,
      closable: true,
      ...options,
    });
  },
  /**
   * Show a success toast.
   * @returns The toast id which can be passed to `toast.close()`
   */
  success: (message: ReactNode, options?: ToastOptions) => {
    return showToast(message, 'success', options);
  },
  /**
   * Show an error toast.
   * @returns The toast id which can be passed to `toast.close()`
   */
  error: (message: ReactNode, options?: ToastOptions) => {
    return showToast(message, 'danger', {
      duration: 60000,
      closable: true,
      ...options,
    });
  },
  /** Close a toast by its id */
  close: (toastId: string | number) => {
    sonnerToast.dismiss(toastId);
  },
};

export default toast;
