/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { FaBug, FaBullseye } from 'react-icons/fa6';

import { cn } from '@fuf-stack/pixel-utils';
import { Button } from '@fuf-stack/pixels/Button';
import { Card } from '@fuf-stack/pixels/Card';
import { Json } from '@fuf-stack/pixels/Json';

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
    formState: { isValid, isSubmitting },
    getValues,
    setDebugMode,
    subscribe,
    validation: { errors },
  } = useFormContext();

  const showDebugButton = debugMode === 'off';
  const showDebugCard = debugMode === 'debug' || debugMode === 'debug-testids';
  const showDebugTestIds = debugMode === 'debug-testids';

  const [validationValues, setValidationValues] = useState<Record<
    string,
    unknown
  > | null>(getValues() || null);

  // Subscribe to value updates only when needed and cleanup properly
  useEffect(() => {
    if (!showDebugCard) {
      return undefined;
    }

    const unsubscribe = subscribe({
      formState: { values: true },
      callback: ({ values }) => {
        setValidationValues(values);
      },
    });

    return unsubscribe;
  }, [showDebugCard, subscribe]);

  if (showDebugButton) {
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

  // do not show card
  if (!showDebugCard) {
    return null;
  }

  return (
    <Card
      className={cn(className)}
      header={
        <div className="flex w-full flex-row justify-between">
          <span className="text-lg">Debug Mode</span>
          <Button
            color="danger"
            icon={<FaTimes />}
            onClick={() => setDebugMode('off')}
            size="sm"
            variant="light"
          />
        </div>
      }
    >
      <Button
        variant={showDebugTestIds ? 'solid' : 'light'}
        icon={<FaBullseye />}
        className="mb-4 ml-auto mr-auto"
        onClick={() =>
          setDebugMode(debugMode === 'debug' ? 'debug-testids' : 'debug')
        }
      >
        {showDebugTestIds ? 'Hide CopyButton' : 'Show CopyButton'}
      </Button>
      <Json
        value={{
          values: validationValues,
          errors: errors || null,
          isValid,
          isSubmitting,
        }}
      />
    </Card>
  );
};

export default FormDebugViewer;
