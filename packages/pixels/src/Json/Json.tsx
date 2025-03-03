/* eslint-disable import/no-extraneous-dependencies */

import type { ReactNode } from 'react';

import { useMemo, useRef, useState } from 'react';

// INFO: react-json-view is bundled with --dts-resolve for now (dev dep)
import JsonView from '@uiw/react-json-view';
import { lightTheme } from '@uiw/react-json-view/light';
import { vscodeTheme } from '@uiw/react-json-view/vscode';
import { useTheme } from 'next-themes';

import { cn } from '@fuf-stack/pixel-utils';

import { getValue } from './jsonParser';
import CopiedRenderer from './subcomponents/CopiedRenderer';
import ErrorRenderer from './subcomponents/ErrorRenderer';
import NullRenderer from './subcomponents/NullRenderer';

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
  value,
  maxHeight = undefined,
  onCopy = undefined,
  errorRenderer = undefined,
}: JsonProps) => {
  const [showDetails, setShowDetails] = useState(false);
  // Needed to allow copying the raw value.
  const valueToCopyRef = useRef<string>('');

  // determine theme, if no theme context available (next-themes)
  // it will be determined by if body has dark class
  const { resolvedTheme } = useTheme();
  const isDarkMode = useMemo(
    () => resolvedTheme === 'dark' || document.body.classList.contains('dark'),
    [resolvedTheme],
  );

  // const handleCopy = (event: React.ClipboardEvent<HTMLDivElement>) => {
  const handleCopy = (text: string, rawValue?: unknown) => {
    valueToCopyRef.current = rawValue as string;
    onCopy?.(text || '');
  };

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
          style={{
            ...(isDarkMode ? vscodeTheme : lightTheme),
            backgroundColor: 'unset',
          }}
          value={parsedValue}
          onCopied={handleCopy}
        >
          <CopiedRenderer valueToCopyRef={valueToCopyRef} />
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
