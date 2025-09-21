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
  /** color of the submit button */
  color?: ButtonProps['color'];
  /** icon of the submit button */
  icon?: ButtonProps['icon'];
  /** If set loading animation is shown */
  loading?: boolean;
  /** size of the submit button */
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
  icon = undefined,
  loading = false,
  size = 'md',
  testId = 'form_submit_button',
}: SubmitButtonProps) => {
  const {
    formState: { isSubmitting },
    triggerSubmit,
  } = useFormContext();

  return (
    <Button
      className={cn(className)}
      color={color}
      disabled={isSubmitting}
      icon={icon}
      loading={loading || isSubmitting}
      // @ts-expect-error we use form context triggerSubmit
      // here so that submit button also works in special
      // scenarios (e.g. when used in modal)
      onClick={triggerSubmit}
      size={size}
      testId={slugify(testId, { replaceDots: true })}
      type="submit"
    >
      {children}
    </Button>
  );
};

export default SubmitButton;
