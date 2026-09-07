import { FaBullseye } from 'react-icons/fa6';

import { cn } from '@fuf-stack/pixel-utils';
import { Button } from '@fuf-stack/pixels';

export interface FieldCopyTestIdButtonProps {
  /** CSS class name */
  className?: string;
  /** HTML data-testid attribute used in e2e tests */
  testId: string;
}

const FieldCopyTestIdButton = ({
  className = undefined,
  testId,
}: FieldCopyTestIdButtonProps) => {
  const copyToClipboard = () => {
    // This component runs in the browser; the Node compatibility rule cannot
    // distinguish the DOM Clipboard API from Node's global navigator.
    // eslint-disable-next-line n/no-unsupported-features/node-builtins
    navigator.clipboard.writeText(testId).catch((err) => {
      console.error('Error copying TestId to clipboard', err);
    });
  };

  return (
    <Button
      className={cn(className, 'pointer-events-auto')}
      icon={<FaBullseye />}
      onClick={copyToClipboard}
      size="sm"
      variant="light"
    />
  );
};
export default FieldCopyTestIdButton;
