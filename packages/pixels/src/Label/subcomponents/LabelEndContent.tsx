import type { ReactNode } from 'react';
import type { PressEvent } from 'react-aria';
import type { LabelClassNames } from '../labelVariants';

import { cloneElement, isValidElement } from 'react';
import { Button } from 'react-aria-components';

import { useStyling } from '../../StylingProvider';

interface LabelEndContentProps {
  /** Element displayed after the text or inside the close action */
  children?: ReactNode;
  /** CSS class name */
  className: Pick<LabelClassNames, 'closeButton' | 'endContent'>;
  /** Callback when the close action is activated */
  onClose?: (event: PressEvent) => void;
}

/** Trailing label content and optional keyboard accessible close action
 *
 * @see https://react-aria.adobe.com/Button
 */
const LabelEndContent = ({
  children = undefined,
  className,
  onClose = undefined,
}: LabelEndContentProps) => {
  const styling = useStyling();

  const content = isValidElement<{ className?: string }>(children)
    ? cloneElement(children, {
        className: styling.cn(className.endContent, children.props.className),
      })
    : null;

  if (!onClose) {
    return content;
  }

  return (
    <Button
      aria-label="close chip"
      className={className.closeButton}
      data-slot="close-button"
      onPress={onClose}
      type="button"
    >
      {content ?? (
        <svg
          aria-hidden="true"
          fill="none"
          height="1em"
          viewBox="0 0 24 24"
          width="1em"
        >
          <path
            d="M12 2a10 10 0 1010 10A10.016 10.016 0 0012 2zm3.36 12.3a.754.754 0 010 1.06.748.748 0 01-1.06 0l-2.3-2.3-2.3 2.3a.748.748 0 01-1.06 0 .754.754 0 010-1.06l2.3-2.3-2.3-2.3A.75.75 0 019.7 8.64l2.3 2.3 2.3-2.3a.75.75 0 011.06 1.06l-2.3 2.3z"
            fill="currentColor"
          />
        </svg>
      )}
    </Button>
  );
};

export default LabelEndContent;
