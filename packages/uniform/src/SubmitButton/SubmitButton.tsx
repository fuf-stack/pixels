import type { ButtonProps } from '@fuf-stack/pixels';
import type { ReactNode } from 'react';

import { cn, slugify } from '@fuf-stack/pixel-utils';
import { Button } from '@fuf-stack/pixels';

export interface SubmitButtonProps {
  /** sets HTML aria-label attribute */
  ariaLabel?: string;
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
  /** id of the form this button should submit when it is rendered OUTSIDE that
   * form (e.g. a modal footer). Associates the button with the form via the
   * native HTML `form` attribute — set the same id on `<Form remoteFormId>`. */
  remoteFormId?: string;
  /** size of the submit button */
  size?: ButtonProps['size'];
  /** HTML data-testid attribute used in e2e tests */
  testId?: string;
}

/**
 * Submit button for a uniform `Form`.
 *
 * It is a plain native submit button (`type="submit"`) and reads no form
 * context, so it works both inside a `<Form>` and standalone. Submission is
 * handled entirely by the browser:
 * - click submits the associated form,
 * - pressing Enter in a form field triggers native implicit form submission.
 *
 * When rendered OUTSIDE the form it belongs to, pass `remoteFormId` (matching the
 * form's `remoteFormId`) to associate them via the native HTML `form` attribute.
 *
 * See SUBMITBUTTON_CONTEXT.md for the (intentionally dropped) context-based
 * features `isSubmitting` and `triggerSubmit` and how to re-add them safely.
 */
const SubmitButton = ({
  ariaLabel = 'Submit form',
  children = 'Submit',
  className = undefined,
  color = 'success',
  icon = undefined,
  loading = false,
  remoteFormId = undefined,
  size = 'md',
  testId = 'form_submit_button',
}: SubmitButtonProps) => {
  return (
    <Button
      ariaLabel={ariaLabel}
      className={cn(className)}
      color={color}
      // associate with a form rendered elsewhere via the native `form` attribute
      // (see remoteFormId prop) so the button can submit a form it is not a DOM
      // descendant of
      form={remoteFormId}
      icon={icon}
      loading={loading}
      size={size}
      testId={slugify(testId, { replaceDots: true })}
      // type="submit" makes the button a submit control of its form. Required for
      // the browser's native "implicit form submission" (pressing Enter in a form
      // field submits the form and thereby runs its validation).
      type="submit"
    >
      {children}
    </Button>
  );
};

export default SubmitButton;
