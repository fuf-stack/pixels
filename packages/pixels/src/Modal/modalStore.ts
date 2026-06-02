import type { ReactNode } from 'react';
import type { ModalProps } from './Modal';

import { useSyncExternalStore } from 'react';

/** Options accepted by `modal.open()` */
export interface ModalOpenOptions extends Omit<
  ModalProps,
  'isOpen' | 'onClose' | 'children'
> {
  /** Modal body content */
  content?: ReactNode;
  /** Callback fired when the modal is closed (by user or programmatically) */
  onClose?: () => void;
}

/** Internal entry tracked by the store */
export interface ModalEntry extends ModalOpenOptions {
  id: string;
  isOpen: boolean;
}

// Duration of the HeroUI modal close animation. Entries stay in the list this
// long after `close()` so the exit animation can play before unmounting.
const MODAL_CLOSE_ANIMATION_MS = 300;

let nextId = 0;
let entries: ModalEntry[] = [];
const listeners = new Set<() => void>();

const emit = () => {
  listeners.forEach((listener) => {
    listener();
  });
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => {
  return entries;
};

/** React hook used by `ModalHost` to subscribe to the modal stack */
export const useModalEntries = (): ModalEntry[] => {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};

const open = (options: ModalOpenOptions): string => {
  nextId += 1;
  const id = `modal-${nextId}`;
  entries = [...entries, { ...options, id, isOpen: true }];
  emit();
  return id;
};

const close = (id: string): void => {
  const entry = entries.find((e) => {
    return e.id === id;
  });
  if (!entry?.isOpen) {
    return;
  }
  entries = entries.map((e) => {
    return e.id === id ? { ...e, isOpen: false } : e;
  });
  emit();
  entry.onClose?.();
  setTimeout(() => {
    entries = entries.filter((e) => {
      return e.id !== id;
    });
    emit();
  }, MODAL_CLOSE_ANIMATION_MS);
};

const closeAll = (): void => {
  entries.forEach((entry) => {
    if (entry.isOpen) {
      close(entry.id);
    }
  });
};

// Hard-resets the store without firing onClose callbacks or close animations.
// Used by `ModalHost` on unmount so the store does not retain entries that
// would re-appear when a host mounts again (e.g. switching Storybook stories).
const reset = (): void => {
  entries = [];
  emit();
};

/**
 * Imperative API for opening modals from anywhere (e.g. from inside a toast).
 * Requires a `<ModalHost />` to be mounted somewhere in the React tree.
 */
export const modal = {
  open,
  close,
  closeAll,
  reset,
};
