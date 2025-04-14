import type { VetoError } from '@fuf-stack/veto';

import { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { FaBug, FaBullseye } from 'react-icons/fa6';

import { cn } from '@fuf-stack/pixel-utils';
import { Button } from '@fuf-stack/pixels/Button';
import { Card } from '@fuf-stack/pixels/Card';
import { Json } from '@fuf-stack/pixels/Json';

import { toValidationFormat } from '../../helpers';
import { useFormContext } from '../../hooks';

// import Json css (theme)
import '@fuf-stack/pixels/Json.css';

interface FormDebugViewerProps {
  /** CSS class name */
  className?: string;
}

/** Renders a form debug panel with information about the current form state */
const FormDebugViewer = ({ className = undefined }: FormDebugViewerProps) => {
  const {
    debugMode,
    formState: { dirtyFields, isValid, isSubmitting },
    setDebugMode,
    validation,
    watch,
  } = useFormContext();

  const [validationErrors, setValidationErrors] = useState<
    VetoError['errors'] | null
  >(null);

  const validationValues = toValidationFormat(watch());
  const debugTestIdsEnabled = debugMode === 'debug-testids';

  useEffect(
    () => {
      const updateValidationErrors = async () => {
        if (validation) {
          const validateResult =
            await validation?.validateAsync(validationValues);
          setValidationErrors(validateResult?.errors);
        }
      };
      updateValidationErrors();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(validationValues)],
  );

  if (!debugMode || debugMode === 'off') {
    return (
      <Button
        ariaLabel="Enable form debug mode"
        onClick={() => setDebugMode('debug')}
        className="fixed bottom-2.5 right-2.5 w-5 text-default-400"
        variant="light"
        icon={<FaBug />}
      />
    );
  }

  return (
    <Card
      className={cn(className)}
      header={
        <div className="flex w-full flex-row justify-between">
          <span className="text-lg">Debug Mode</span>
          <Button
            icon={<FaTimes className="text-danger" />}
            onClick={() => setDebugMode('off')}
            size="sm"
            variant="flat"
          />
        </div>
      }
    >
      <Button
        variant={debugTestIdsEnabled ? 'solid' : 'light'}
        icon={<FaBullseye />}
        className="mb-4 ml-auto mr-auto"
        onClick={() =>
          setDebugMode(debugMode === 'debug' ? 'debug-testids' : 'debug')
        }
      >
        {debugTestIdsEnabled ? 'Hide CopyButton' : 'Show CopyButton'}
      </Button>
      <Json
        value={{
          values: validationValues,
          errors: validationErrors,
          dirtyFields,
          isValid,
          isSubmitting,
        }}
      />
    </Card>
  );
};
export default FormDebugViewer;
