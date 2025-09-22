import { Suspense } from 'react';
import { PiSlidersHorizontalBold } from 'react-icons/pi';

import Button from '@fuf-stack/pixels/Button';
import Modal from '@fuf-stack/pixels/Modal';
import SubmitButton from '@fuf-stack/uniform/SubmitButton';

import { useFilters } from './FiltersContext';

const FilterModal = () => {
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
      isOpen
      onClose={closeFilterModal}
      className={{
        footer: 'justify-between',
        header: 'text-default-700 flex items-center gap-3',
      }}
      footer={
        <>
          <Button
            color="danger"
            variant="flat"
            onClick={() => {
              removeFilter(modalFilterName);
            }}
          >
            Remove
          </Button>
          <SubmitButton>Apply Filter</SubmitButton>
        </>
      }
      header={
        <>
          {instance.icon ?? <PiSlidersHorizontalBold />}
          <div>{`${config?.text ?? modalFilterName} Filter`}</div>
        </>
      }
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
