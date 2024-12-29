import type { ClassValue } from '@fuf-stack/pixel-utils';

import { FaTimes } from 'react-icons/fa';

import { cn } from '@fuf-stack/pixel-utils';
import { Button } from '@fuf-stack/pixels';

interface ElementRemoveButtonProps {
  /** CSS class name */
  className?: ClassValue;
  /** click handler */
  onClick: () => void;
  /** HTML data-testid attribute used in e2e tests */
  testId?: string;
}

const ElementRemoveButton = ({
  className = undefined,
  onClick,
  testId = undefined,
}: ElementRemoveButtonProps) => {
  return (
    <Button
      ariaLabel="remove element"
      className={cn(className)}
      color="danger"
      icon={<FaTimes />}
      onClick={onClick}
      testId={testId}
      variant="light"
    />
  );
};

export default ElementRemoveButton;
