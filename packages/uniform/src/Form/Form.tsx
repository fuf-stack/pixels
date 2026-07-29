import type { TVClassName, TVProps } from '@fuf-stack/pixel-utils';
import type { VetoInstance } from '@fuf-stack/veto';
import type { ReactNode } from 'react';
import type { FieldValues, SubmitHandler } from 'react-hook-form';
import type { DebugModeSettings } from './subcomponents/FormContext';
import type { FormDebugViewerProps } from './subcomponents/FormDebugViewer';

import { slugify, tv, variantsToClassNames } from '@fuf-stack/pixel-utils';

import FormProvider from './subcomponents/FormContext';
import FormDebugViewer from './subcomponents/FormDebugViewer';

const IS_TEST = process.env.NODE_ENV === 'test';

// form styling variants
export const formVariants = tv({
  slots: {
    /** class of the wrapper around form and debug viewer */
    base: 'flex w-full flex-row justify-between gap-6',
    /** class of the debug viewer card */
    debugViewer: 'w-96 shrink',
    /** class of the debug viewer button that toggles the field copy testid buttons */
    debugViewerCopyButtonToggle: '',
    /** class of the debug viewer card header */
    debugViewerHeader: '',
    /** class of the debug viewer json viewer */
    debugViewerJson: '',
    /** class of the debug viewer trigger button */
    debugViewerTriggerButton: '',
    /** class of the HTML form element */
    form: 'grow',
  },
});

type VariantProps = TVProps<typeof formVariants>;
type ClassName = TVClassName<typeof formVariants>;

export interface FormProps extends VariantProps {
  /** form children */
  children: ReactNode | ReactNode[];
  /** CSS class name */
  className?: ClassName;
  /** settings for from debug mode */
  debug?: DebugModeSettings;
  /** initial form values */
  initialValues?: FieldValues;
  /** name of the form */
  name?: string;
  /** form submit handler */
  onSubmit: SubmitHandler<FieldValues>;
  /** id set as the form's HTML `id`, so a SubmitButton rendered OUTSIDE this
   * form (e.g. a modal footer) can be associated with it via its own
   * `remoteFormId` prop (native HTML `form` attribute) */
  remoteFormId?: string;
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
  remoteFormId = undefined,
  testId = undefined,
  validation = undefined,
  validationTrigger = 'all',
}: FormProps) => {
  // classNames from slots
  const variants = formVariants();
  const classNames = variantsToClassNames(variants, className, 'base');
  const debugViewerClassNames: FormDebugViewerProps['className'] = {
    base: classNames.debugViewer,
    copyButtonToggle: classNames.debugViewerCopyButtonToggle,
    header: classNames.debugViewerHeader,
    json: classNames.debugViewerJson,
    triggerButton: classNames.debugViewerTriggerButton,
  };

  return (
    <FormProvider
      debugModeSettings={debug}
      initialValues={initialValues}
      onSubmit={onSubmit}
      validation={validation}
      validationTrigger={validationTrigger}
    >
      {({ handleSubmit, isValid }) => {
        return (
          <div className={classNames.base}>
            <form
              className={classNames.form}
              data-form-is-valid={isValid}
              data-testid={slugify(testId ?? name ?? '')}
              id={remoteFormId}
              name={name}
              // disable native HTML constraint validation so an invalid submit
              // (e.g. pressing Enter with empty required fields) still fires the
              // submit event and lets react-hook-form/veto validate and show
              // field errors, instead of the browser blocking the submit.
              noValidate
              onSubmit={handleSubmit}
            >
              {children}
            </form>
            {/* render debug viewer when not in test environment and debug not disabled */}
            {!IS_TEST && !debug?.disable && (
              <FormDebugViewer className={debugViewerClassNames} />
            )}
          </div>
        );
      }}
    </FormProvider>
  );
};

export default Form;
