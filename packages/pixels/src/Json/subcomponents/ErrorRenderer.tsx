import { FaChevronDown, FaChevronUp, FaTimesCircle } from 'react-icons/fa';

import { Button } from '../../Button';

interface ErrorRendererProps {
  /** The error that occurred during JSON parsing or processing */
  error: unknown;
  /** The original data that caused the error */
  data: string | object;
  /** Controls whether detailed error information is visible */
  showDetails: boolean;
  /** Callback function to toggle the visibility of error details */
  onToggleDetails: () => void;
}

/**
 * Displays JSON parsing or processing errors in a user-friendly format with expandable details.
 *
 * This component provides a consistent error display with:
 * - A prominent error message
 * - Expandable details section
 * - Original data preview
 * - Accessibility support via ARIA attributes
 */
const ErrorRenderer = ({
  error,
  data,
  showDetails,
  onToggleDetails,
}: ErrorRendererProps) => {
  return (
    <div
      className="border-danger bg-danger-50 text-danger mb-4 flex flex-col items-center rounded-lg border p-4 text-sm"
      role="alert"
      aria-live="polite"
    >
      <div className="flex w-full justify-between gap-6">
        <div className="flex items-center">
          <FaTimesCircle className="mr-2" aria-hidden="true" />
          <span className="font-medium">Failed to parse JSON data</span>
        </div>
        <Button
          color="danger"
          size="sm"
          variant="light"
          onClick={onToggleDetails}
          aria-expanded={showDetails}
          aria-controls="error-details"
        >
          {showDetails ? (
            <>
              <FaChevronUp aria-hidden="true" /> Hide Details
            </>
          ) : (
            <>
              <FaChevronDown aria-hidden="true" /> Show Details
            </>
          )}
        </Button>
      </div>
      {showDetails && (
        <div id="error-details" className="mt-4 w-full text-left">
          <div>
            <strong>Error:</strong>
            <pre>
              {error instanceof Error
                ? `${error.name}: ${error.message}`
                : 'Unknown error'}
            </pre>
          </div>
          <div className="mt-4">
            <strong>Data:</strong>
            <pre>
              {typeof data !== 'string' ? JSON.stringify(data, null, 2) : data}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default ErrorRenderer;
