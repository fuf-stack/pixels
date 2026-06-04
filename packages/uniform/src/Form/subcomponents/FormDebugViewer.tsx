import { useRef, useSyncExternalStore } from 'react';
import { FaTimes } from 'react-icons/fa';
import { FaBug, FaBullseye } from 'react-icons/fa6';

import { cn } from '@fuf-stack/pixel-utils';
import { Button } from '@fuf-stack/pixels/Button';
import { Card } from '@fuf-stack/pixels/Card';
import { Json } from '@fuf-stack/pixels/Json';

import { useFormContext } from '../../hooks/useFormContext';

// import Json css (theme)
import '@fuf-stack/pixels/Json.css';

// Stable empty snapshot used by useSyncExternalStore to avoid re-render loops.
const EMPTY_VALUES: Record<string, unknown> = {};

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
  const latestValuesRef = useRef<Record<string, unknown>>(EMPTY_VALUES);

  // Subscribe to RHF as an external store so this component updates itself
  // without forcing parent re-renders via watch().
  const values = useSyncExternalStore<Record<string, unknown>>(
    // subscribe: tell React how to listen for external store changes
    (onStoreChange) => {
      if (!showDebugCard) {
        // No-op while the panel is hidden to avoid unnecessary subscriptions.
        return () => {};
      }

      // Seed the snapshot once when the debug panel becomes visible.
      latestValuesRef.current = getValues() ?? EMPTY_VALUES;
      onStoreChange();

      const unsubscribe = subscribe({
        formState: { values: true },
        callback: (state) => {
          latestValuesRef.current = state.values ?? EMPTY_VALUES;
          // Notify React that a new snapshot is available.
          onStoreChange();
        },
      });

      return () => {
        // Ensure RHF subscription is always cleaned up.
        unsubscribe();
      };
    },
    // getSnapshot: return the current client-side value for this render.
    () => {
      if (!showDebugCard) {
        // Keep the debug payload empty when the panel is not visible.
        return EMPTY_VALUES;
      }

      return latestValuesRef.current;
    },
    // getServerSnapshot: stable fallback for non-client rendering environments.
    () => {
      return EMPTY_VALUES;
    },
  );

  if (showDebugButton) {
    return (
      <Button
        ariaLabel="Enable form debug mode"
        className="fixed bottom-2.5 right-2.5 w-5 text-default-400"
        icon={<FaBug />}
        onClick={() => {
          setDebugMode('debug');
        }}
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
