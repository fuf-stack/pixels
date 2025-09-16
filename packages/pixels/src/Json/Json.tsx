/* eslint-disable import-x/no-extraneous-dependencies */

import type { ReactNode } from 'react';

import { useState } from 'react';

// INFO: react-json-view is bundled with --dts-resolve for now (dev dep)
import JsonView from '@uiw/react-json-view';

import { cn } from '@fuf-stack/pixel-utils';

import { getValue } from './jsonParser';
import CopiedRenderer from './subcomponents/CopiedRenderer';
import ErrorRenderer from './subcomponents/ErrorRenderer';
import NullRenderer from './subcomponents/NullRenderer';

import './theme.css';

/**
 * Handles copying text or object values to clipboard.
 *
 * @param rawValue - The original value to copy (can be an object or primitive)
 * @param onCopy - Optional callback function triggered after copying with the copied value
 *
 * This function:
 * 1. Detects if the value is an object (not null and typeof 'object')
 * 2. Converts objects to JSON strings for clipboard copying
 * 3. Uses setTimeout to write the value to clipboard in the next render cycle
 *    - This is necessary because JsonView (CopiedRenderer) normally handles copying itself,
 *      but its copied value doesn't follow the same isObject logic
 *    - By using setTimeout, we ensure our properly formatted value overwrites any previous copy operation
 * 4. Calls the optional onCopy callback with the copied value if provided
 *
 * Note: The text parameter is kept for API consistency but is not used in the copying process
 */
const handleCopy = (rawValue?: unknown, onCopy?: JsonProps['onCopy']) => {
  // determine of copied value is object-like
  let isObject = false;
  try {
    if (rawValue !== NullRenderer && typeof rawValue === 'object') {
      isObject = true;
    }
  } catch (_err) {
    // ignore
  }
  const copyValue = isObject
    ? JSON.stringify(rawValue as string, null, 2)
    : (rawValue as string);

  // JsonView (CopiedRenderer) does copy on its own but doesn't handle
  // object serialization correctly. We use setTimeout to overwrite its
  // clipboard value with our properly formatted version in the next tick.
  setTimeout(() => navigator.clipboard.writeText(copyValue), 1);

  // if cb provided call it with copyValue
  if (onCopy) {
    onCopy(copyValue);
  }
};

export interface JsonProps {
  /** CSS class name */
  className?: string;
  /** When set to true, all nodes will be collapsed by default. Use an integer value to collapse at a particular depth. */
  collapsed?: boolean | number;
  /** Optional custom error renderer */
  errorRenderer?: (error: Error, data: string | object) => ReactNode;
  /** Optional maximum height of the JSON viewer */
  maxHeight?: string | number;
  /** Callback when copy action is performed */
  onCopy?: (copiedValue: string) => void;
  /** Object to be visualized JSON string or object */
  value: string | object;
}

/**
 * Json renderer based on [react-json-view](https://uiwjs.github.io/react-json-view)
 * with improved error handling, accessibility, and customization options
 */
const Json = ({
  className = undefined,
  collapsed = false,
  errorRenderer = undefined,
  maxHeight = undefined,
  onCopy = undefined,
  value,
}: JsonProps) => {
  const [showDetails, setShowDetails] = useState(false);

  let content: ReactNode = null;
  let error: ReactNode = null;

  try {
    const parsedValue = getValue(value);
    content = (
      <div
        style={{ maxHeight, overflowY: maxHeight ? 'auto' : undefined }}
        className="relative"
      >
        <JsonView
          className="pr-5"
          collapsed={collapsed}
          displayDataTypes={false}
          value={parsedValue}
          onCopied={(_, rawValue) => handleCopy(rawValue, onCopy)}
        >
          <CopiedRenderer />
          <NullRenderer />
        </JsonView>
      </div>
    );
  } catch (err) {
    const defaultError = (
      <ErrorRenderer
        error={err}
        data={value}
        showDetails={showDetails}
        onToggleDetails={() => setShowDetails(!showDetails)}
      />
    );

    error = errorRenderer ? errorRenderer(err as Error, value) : defaultError;
  }

  return (
    <div aria-label="JSON viewer" className={cn(className)} role="region">
      {error || content}
    </div>
  );
};

export default Json;
