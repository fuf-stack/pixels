import { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { FaBug, FaBullseye } from 'react-icons/fa6';

import { cn } from '@fuf-stack/pixel-utils';
import { Button } from '@fuf-stack/pixels/Button';
import { Card } from '@fuf-stack/pixels/Card';
import { Json } from '@fuf-stack/pixels/Json';

import { useFormContext } from '../../hooks/useFormContext';

interface FormDebugViewerProps {
  /** CSS class name */
  className?: string;
}

/** Renders a form debug panel with information about the current form state */
const FormDebugViewer = ({ className = undefined }: FormDebugViewerProps) => {
  const {
    debugMode,
    formState: { isValid, isSubmitting, submitCount, isSubmitSuccessful },
    getValues,
    setDebugMode,
    validation: { errors },
    subscribe,
  } = useFormContext();

  const showDebugButton = debugMode === 'off';
  const showDebugCard = debugMode === 'debug' || debugMode === 'debug-testids';
  const showDebugTestIds = debugMode === 'debug-testids';

  // We intentionally keep the local state + subscription approach here.
  // A previous useSyncExternalStore refactor caused unstable runtime behavior
  // in consuming wizard apps (max update depth loops inside react-json-view).
  // Keeping this explicit state bridge is the currently stable baseline.
  // Use subscribe instead of watch() to avoid triggering re-renders on parent components.
  // This component manages its own state and only updates itself when form values change.
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    return getValues() ?? {};
  });

  useEffect(() => {
    // Only subscribe when debug card is visible
    if (!showDebugCard) {
      return undefined;
    }

    const subscription = subscribe({
      formState: { values: true },
      callback: (state) => {
        setValues(state.values ?? {});
      },
    });

    return () => {
      subscription();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDebugCard]);

  // handle show debug mode
  const handleShowDebugMode = () => {
    // Seed current values on open from an event handler (not effect body)
    // to avoid cascading-render lint warnings for sync setState in effects.
    setValues(getValues() ?? {});
    // set debug mode to debug
    setDebugMode('debug');
  };

  if (showDebugButton) {
    return (
      <Button
        ariaLabel="Enable form debug mode"
        className="fixed bottom-2.5 right-2.5 w-5 text-default-400"
        icon={<FaBug />}
        onClick={handleShowDebugMode}
        variant="light"
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
            onClick={() => {
              setDebugMode('off');
            }}
            size="sm"
            variant="light"
          />
        </div>
      }
    >
      <Button
        className="mb-4 ml-auto mr-auto"
        icon={<FaBullseye />}
        onClick={() => {
          setDebugMode(debugMode === 'debug' ? 'debug-testids' : 'debug');
        }}
        variant={showDebugTestIds ? 'solid' : 'light'}
      >
        {showDebugTestIds ? 'Hide CopyButton' : 'Show CopyButton'}
      </Button>
      <Json
        value={{
          values,
          errors: errors ?? null,
          submit: {
            isValid,
            isSubmitting,
            isSubmitSuccessful,
            submitCount,
          },
        }}
      />
    </Card>
  );
};

export default FormDebugViewer;
