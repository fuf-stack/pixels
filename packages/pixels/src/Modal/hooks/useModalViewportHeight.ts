import { useSyncExternalStore } from 'react';

const subscribe = (onChange: () => void) => {
  const viewport = window.visualViewport;

  viewport?.addEventListener('resize', onChange);
  window.addEventListener('resize', onChange);

  return () => {
    viewport?.removeEventListener('resize', onChange);
    window.removeEventListener('resize', onChange);
  };
};

const getHeight = () => {
  return window.visualViewport?.height ?? window.innerHeight;
};

const getServerHeight = () => {
  return 0;
};

/**
 * Visible viewport height for modal and drawer positioning
 *
 * VisualViewport accounts for mobile keyboards that leave dynamic viewport
 * units unchanged, window height is the fallback for other browsers
 */
const useModalViewportHeight = () => {
  return useSyncExternalStore(subscribe, getHeight, getServerHeight);
};

export default useModalViewportHeight;
