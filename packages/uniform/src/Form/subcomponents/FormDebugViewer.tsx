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
    setDebugMode,
    validation: { errors },
    watch,
  } = useFormContext();

  const showDebugButton = debugMode === 'off';
  const showDebugCard = debugMode === 'debug' || debugMode === 'debug-testids';
  const showDebugTestIds = debugMode === 'debug-testids';

  // TODO: maybe use new Watch component?
  // see: https://github.com/react-hook-form/react-hook-form/pull/12986
  const values = watch();

  if (showDebugButton) {
    return (
      <Button
        ariaLabel="Enable form debug mode"
        className="text-default-400 fixed right-2.5 bottom-2.5 w-5"
        icon={<FaBug />}
        variant="light"
        onClick={() => {
          setDebugMode('debug');
        }}
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
            size="sm"
            variant="light"
            onClick={() => {
              setDebugMode('off');
            }}
          />
        </div>
      }
    >
      <Button
        className="mr-auto mb-4 ml-auto"
        icon={<FaBullseye />}
        variant={showDebugTestIds ? 'solid' : 'light'}
        onClick={() => {
          setDebugMode(debugMode === 'debug' ? 'debug-testids' : 'debug');
        }}
      >
        {showDebugTestIds ? 'Hide CopyButton' : 'Show CopyButton'}
      </Button>
      <Json
        value={{
          values,
          errors: errors ?? null,
          isValid,
          isSubmitting,
        }}
      />
    </Card>
  );
};

export default FormDebugViewer;
