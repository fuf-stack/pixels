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
  // Sonner defaults to z-index 999999999, which would render toasts above the
  // HeroUI modal (z-50). Lower it so modals opened from a toast's "More"
  // button stay on top. `--width` is passed inline because Sonner sets its
  // default `--width` inline on the same element, which beats class-based
  // overrides.
  const toasterStyle = {
    zIndex: 40,
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
