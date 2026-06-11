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
 * Mounts the Toaster and ModalHost.
 *
 * Use once at the top level of your app:
 *
 * ```tsx
 * <NotificationHost />
 * ```
 */
const NotificationHost = ({ width = 600 }: NotificationHostProps) => {
  // Stacking layers (see notification.tsx for the modal side):
  //   1. normal app-level modal — HeroUI default z-50
  //   2. notification / Toaster  — z-60 (this), so notifications appear ABOVE
  //      a normal modal that is already open
  //   3. modal opened FROM a notification — z-70 (set in notification.tsx),
  //      so it appears above the notification again
  // Sonner defaults the Toaster to z-index 999999999, so we override it here.
  // `--width` is passed inline because Sonner sets its default `--width` inline
  // on the same element, which beats class-based overrides.
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
