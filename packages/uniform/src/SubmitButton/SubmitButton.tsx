import type { ButtonProps } from '@fuf-stack/pixels';
import type { ReactNode } from 'react';

import { cn, slugify } from '@fuf-stack/pixel-utils';
import { Button } from '@fuf-stack/pixels';

import { useFormContext } from '../hooks';

export interface SubmitButtonProps {
  /** child components */
  children?: ReactNode;
  /** CSS class name */
  className?: string;
  /** color of the button */
  color?: ButtonProps['color'];
  /** If set loading animation is shown */
  loading?: boolean;
  /** function called when the button is pressed. */
  onClick?: ButtonProps['onClick'];
  /** size of the button */
  size?: ButtonProps['size'];
  /** HTML data-testid attribute used in e2e tests */
  testId?: string;
}

/**
 * From SubmitButton
 */
const SubmitButton = ({
  children = 'Submit',
  className = undefined,
  color = 'success',
  loading = false,
  onClick = undefined,
  size = 'md',
  testId = 'form_submit_button',
}: SubmitButtonProps) => {
  const {
    formState: { isSubmitting, isValidating },
  } = useFormContext();
  return (
    <Button
      className={cn(className)}
      color={color}
      testId={slugify(testId)}
      disabled={isSubmitting || isValidating}
      loading={loading}
      onClick={onClick}
      size={size}
      type="submit"
    >
      {children}
    </Button>
  );
};

export default SubmitButton;
