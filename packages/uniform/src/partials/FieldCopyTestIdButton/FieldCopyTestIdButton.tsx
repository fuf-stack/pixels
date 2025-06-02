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
    navigator.clipboard.writeText(testId).catch((err) => {
      console.error('Error copying TestId to clipboard', err);
    });
  };

  return (
    <Button
      className={cn(className, 'pointer-events-auto')}
      variant="light"
      onClick={copyToClipboard}
      icon={<FaBullseye />}
      size="sm"
    />
  );
};
export default FieldCopyTestIdButton;
