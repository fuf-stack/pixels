import type { CSSProperties } from 'react';

import { ModalHost } from '@fuf-stack/pixels/Modal';
import { Toaster } from '@fuf-stack/pixels/Toast';

export interface NotificationHostProps {
  /**
   * Width applied to all toasts. A number is treated as pixels; a string is
   * used verbatim (e.g. `'600px'`, `'40rem'`). Sets Sonner's `--width` CSS
   * variable on the Toaster.
   */
  width?: number | string;
}

/**
 * Application host for toast notifications and their related dialogs
 *
 * Use once at the top level of your app:
 *
 * ```tsx
 * <NotificationHost />
 * ```
 */
const NotificationHost = ({ width = 600 }: NotificationHostProps) => {
  // toasts sit above normal modals, notification-owned modals use z-70
  // Sonner defines width inline, so its override must also be inline
  const toasterStyle = {
    zIndex: 60,
    ...(width != null && {
      '--width': typeof width === 'number' ? `${width}px` : width,
    }),
  } as CSSProperties;

  return (
    <>
      <Toaster style={toasterStyle} />
      <ModalHost />
    </>
  );
};

export default NotificationHost;
