import { Suspense } from 'react';
import { PiSlidersHorizontalBold } from 'react-icons/pi';

import Button from '@fuf-stack/pixels/Button';
import Modal from '@fuf-stack/pixels/Modal';
import SubmitButton from '@fuf-stack/uniform/SubmitButton';

import { useFilters } from './FiltersContext';

interface FilterModalProps {
  classNames?: Partial<{
    header: string;
    footer: string;
    body: string;
  }>;
  /** disables the modal open/close animation */
  disableAnimation?: boolean;
  /** id of the Form this modal's SubmitButton belongs to. The footer is
   * portalled OUTSIDE the form's DOM subtree, so the button associates with the
   * form via the native `form` attribute (see SubmitButton `remoteFormId`). */
  remoteFormId?: string;
  /** container the modal portal is rendered into (defaults to document.body) */
  portalContainer?: HTMLElement;
}

const FilterModal = ({
  classNames = {},
  disableAnimation = false,
  portalContainer = undefined,
  remoteFormId = undefined,
}: FilterModalProps) => {
  const {
    closeFilterModal,
    getFilterFormFieldName,
    getFilterInstanceByName,
    modalFilterName,
    removeFilter,
  } = useFilters();

  // don't render if no filter is open
  if (!modalFilterName) {
    return null;
  }

  const instance = getFilterInstanceByName(modalFilterName);
  const config = instance.config as { text?: string };

  // get the form component from the instance
  const FormComponent = instance.components.Form;

  return (
    <Modal
      className={{
        body: classNames.body,
        footer: classNames.footer,
        header: classNames.header,
      }}
      disableAnimation={disableAnimation}
      footer={
        <>
          <Button
            ariaLabel="Remove filter"
            color="danger"
            onClick={() => {
              removeFilter(modalFilterName);
            }}
            testId="remove_filter_button"
            variant="flat"
          >
            Remove
          </Button>
          <SubmitButton
            ariaLabel="Apply filter"
            remoteFormId={remoteFormId}
            testId="apply_filter_button"
          >
            Apply Filter
          </SubmitButton>
        </>
      }
      header={
        <>
          {instance.icon ?? <PiSlidersHorizontalBold />}
          <div>{`${config?.text ?? modalFilterName} Filter`}</div>
        </>
      }
      isOpen
      onClose={closeFilterModal}
      portalContainer={portalContainer}
    >
      <Suspense>
        <FormComponent
          config={config}
          fieldName={getFilterFormFieldName(modalFilterName)}
        />
      </Suspense>
    </Modal>
  );
};

export default FilterModal;
