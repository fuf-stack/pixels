import type { ClassValue } from '@fuf-stack/pixel-utils';

import { FaPlus } from 'react-icons/fa6';

import { cn } from '@fuf-stack/pixel-utils';
import { Button } from '@fuf-stack/pixels';

interface ElementInsertAfterButtonProps {
  /** CSS class name */
  className?: ClassValue;
  /** click handler */
  onClick: () => void;
  /** HTML data-testid attribute used in e2e tests */
  testId?: string;
}

const ElementInsertAfterButton = ({
  className = undefined,
  onClick,
  testId = undefined,
}: ElementInsertAfterButtonProps) => {
  return (
    <Button
      className={cn(className)}
      color="success"
      icon={<FaPlus />}
      onClick={onClick}
      testId={testId}
      variant="light"
    />
  );
};

export default ElementInsertAfterButton;
