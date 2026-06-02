import { useEffect } from 'react';

import Modal from './Modal';
import { modal, useModalEntries } from './modalStore';

/**
 * Renders all modals opened via the imperative `modal.open()` API.
 *
 * Mount once at the top level of your app, similar to `<Toaster />`:
 *
 * ```tsx
 * <ModalHost />
 * ```
 *
 * Then open modals from anywhere with `modal.open({ ... })`.
 */
const ModalHost = () => {
  const entries = useModalEntries();

  // Clear the store when the host unmounts so any still-open
  // modal does not re-appear when a new host mounts.
  useEffect(() => {
    return () => {
      modal.reset();
    };
  }, []);
  return (
    <>
      {entries.map((entry) => {
        const { id, isOpen, content, onClose: _onClose, ...modalProps } = entry;
        return (
          <Modal
            key={id}
            {...modalProps}
            isOpen={isOpen}
            onClose={() => {
              modal.close(id);
            }}
          >
            {content}
          </Modal>
        );
      })}
    </>
  );
};

export default ModalHost;
