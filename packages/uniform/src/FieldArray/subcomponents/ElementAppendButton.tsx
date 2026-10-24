import type { ClassValue } from '@fuf-stack/pixel-utils';

import { FaPlus } from 'react-icons/fa';

import { Button } from '@fuf-stack/pixels';
import { useStyling } from '@fuf-stack/pixels/StylingProvider';

interface ElementAppendButtonProps {
  /** text of the append element button */
  appendButtonText?: string;
  /** CSS class name */
  className?: ClassValue;
  /** click handler */
  onClick: () => void;
  /** HTML data-testid attribute for e2e tests */
  testId?: string;
}

const ElementAppendButton = ({
  appendButtonText = 'Add Element',
  className = undefined,
  onClick,
  testId = undefined,
}: ElementAppendButtonProps) => {
  const { cn } = useStyling();
  return (
    <Button
      className={cn(className)}
      disableAnimation
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
