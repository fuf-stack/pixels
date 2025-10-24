import type { ClassValue } from '@fuf-stack/pixel-utils';

import { FaPlus } from 'react-icons/fa';

import { cn } from '@fuf-stack/pixel-utils';
import { Button } from '@fuf-stack/pixels';

interface ElementAppendButtonProps {
  /** text of the append element button */
  appendButtonText?: string;
  /** CSS class name */
  className?: ClassValue;
  /** click handler */
  onClick: () => void;
  /** HTML data-testid attribute used in e2e tests */
  testId?: string;
}

const ElementAppendButton = ({
  appendButtonText = 'Add Element',
  className = undefined,
  onClick,
  testId = undefined,
}: ElementAppendButtonProps) => {
  return (
    <Button
      disableAnimation
      className={cn(className)}
      onClick={onClick}
      size="sm"
      testId={testId}
      variant="light"
    >
      <FaPlus />
      <span>{appendButtonText}</span>
    </Button>
  );
};

export default ElementAppendButton;
