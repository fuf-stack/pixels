/* eslint-disable import/no-extraneous-dependencies */

import type { KeyboardEvent, MouseEvent } from 'react';

import { HiOutlineClipboard, HiOutlineClipboardCheck } from 'react-icons/hi';

// INFO: react-json-view is bundled with --dts-resolve for now (dev dep)
import JsonView from '@uiw/react-json-view';

import { cn } from '@fuf-stack/pixel-utils';

/**
 * A custom renderer for the JsonView's copy functionality that provides an accessible
 * and interactive copy button with visual feedback.
 *
 * This component overrides the default copy button implementation from @uiw/react-json-view
 * to fix flickering issues and improve accessibility. It renders a button that:
 * - Shows different icons for copied/not copied states
 * - Supports keyboard navigation
 * - Provides proper ARIA labels
 * - Maintains consistent positioning
 *
 * @returns A JsonView.Copied component with custom render implementation
 */
const CopiedRenderer = () => {
  return (
    <JsonView.Copied
      render={(props) => {
        // eslint-disable-next-line react/prop-types
        const { style, onClick, className } = props;

        // @ts-expect-error this is ok
        // eslint-disable-next-line react/prop-types
        const isCopied = props['data-copied'] as boolean;

        const elmClasses = cn(
          className,
          'absolute -top-[2px] -right-4 h-4 w-4 fill-transparent! pl-1',
          { 'text-success': isCopied },
        );

        const handleKeyDown = (e: KeyboardEvent<HTMLSpanElement>) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onClick?.(e as unknown as MouseEvent<SVGSVGElement>);
          }
        };

        return (
          <span
            className="relative ml-0! h-[1em]! w-0!"
            style={style}
            data-testid="copy-button"
            role="button"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onClick={(e) =>
              onClick?.(e as unknown as MouseEvent<SVGSVGElement>)
            }
            aria-label={isCopied ? 'Copied to clipboard' : 'Copy to clipboard'}
          >
            {isCopied ? (
              <HiOutlineClipboardCheck className={elmClasses} />
            ) : (
              <HiOutlineClipboard className={elmClasses} />
            )}
          </span>
        );
      }}
    />
  );
};

export default CopiedRenderer;
