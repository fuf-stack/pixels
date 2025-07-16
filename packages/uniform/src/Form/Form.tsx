import type { VetoInstance } from '@fuf-stack/veto';
import type { ReactNode } from 'react';
import type { FieldValues, SubmitHandler } from 'react-hook-form';
import type { DebugModeSettings } from './subcomponents/FormContext';

import { cn, slugify } from '@fuf-stack/pixel-utils';

import FormProvider from './subcomponents/FormContext';
import FormDebugViewer from './subcomponents/FormDebugViewer';

const IS_TEST = process.env.NODE_ENV === 'test';

export interface FormProps {
  /** form children */
  children: ReactNode | ReactNode[];
  /** CSS class name */
  className?: string | string[];
  /** settings for from debug mode */
  debug?: DebugModeSettings;
  /** initial form values */
  initialValues?: FieldValues;
  /** name of the form */
  name?: string;
  /** form submit handler */
  onSubmit: SubmitHandler<FieldValues>;
  /** HTML data-testid attribute used in e2e tests */
  testId?: string;
  /** veto validation schema */
  validation?: VetoInstance;
  /** when the validation should be triggered */
  validationTrigger?: 'onChange' | 'onBlur' | 'onSubmit' | 'onTouched' | 'all';
}

/**
 * Form component that has to wrap every uniform
 */
const Form = ({
  children,
  className = undefined,
  debug = undefined,
  initialValues = undefined,
  name = undefined,
  onSubmit,
  testId = undefined,
  validation = undefined,
  validationTrigger = 'all',
}: FormProps) => {
  return (
    <FormProvider
      debugModeSettings={debug}
      initialValues={initialValues}
      onSubmit={onSubmit}
      validation={validation}
      validationTrigger={validationTrigger}
    >
      {({ handleSubmit, isValid }) => (
        <div className="flex w-full flex-row justify-between gap-6">
          <form
            className={cn('grow', className)}
            data-form-is-valid={isValid}
            data-testid={slugify(testId || name || '')}
            name={name}
            onSubmit={handleSubmit}
          >
            {children}
          </form>
          {/* render debug viewer when not in test environment and debug not disabled */}
          {!IS_TEST && !debug?.disable && (
            <FormDebugViewer className="w-96 shrink" />
          )}
        </div>
      )}
    </FormProvider>
  );
};

export default Form;
