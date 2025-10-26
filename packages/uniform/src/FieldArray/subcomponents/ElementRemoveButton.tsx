import type { ClassValue } from '@fuf-stack/pixel-utils';

import { FaTimes } from 'react-icons/fa';

import { motion } from '@fuf-stack/pixel-motion';
import { cn } from '@fuf-stack/pixel-utils';
import { Button } from '@fuf-stack/pixels';

interface ElementRemoveButtonProps {
  /** CSS class name */
  className?: ClassValue;
  /** Globally disable animations (used for first render or prefers-reduced-motion) */
  disableAnimation?: boolean;
  /** click handler */
  onClick: () => void;
  /** HTML data-testid attribute used in e2e tests */
  testId?: string;
}

const ElementRemoveButton = ({
  className = undefined,
  disableAnimation = false,
  onClick,
  testId = undefined,
}: ElementRemoveButtonProps) => {
  const button = (
    <Button
      ariaLabel="remove element"
      className={cn(className)}
      color="danger"
      icon={<FaTimes />}
      onClick={onClick}
      size="sm"
      testId={testId}
      variant="light"
    />
  );

  if (disableAnimation) {
    return button;
  }

  return (
    <motion.div
      animate={{ opacity: 1, width: 'auto' }}
      className="flex"
      exit={{ opacity: 0, width: 0 }}
      initial={{ opacity: 0, width: 0 }}
      transition={{ duration: 0.2 }}
    >
      {button}
    </motion.div>
  );
};

export default ElementRemoveButton;
