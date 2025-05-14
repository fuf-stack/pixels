import type { VetoInstance } from '@fuf-stack/veto';
import type { BaseSyntheticEvent, ReactNode } from 'react';
import type { FieldValues, SubmitHandler } from 'react-hook-form';

import React, { useMemo, useState } from 'react';
import { FormProvider as HookFormProvider, useForm } from 'react-hook-form';

import { useLocalStorage } from '@fuf-stack/pixels';

import { toValidationFormat } from '../../helpers';

type DebugMode = 'debug' | 'debug-testids' | 'off' | 'disabled';

export type DebugModeSettings = {
  /** disable form debug completely */
  disable?: boolean;
  /** custom localStorage key to save debug mode state */
  localStorageKey?: string;
};

const DEBUG_MODE_LOCAL_STORAGE_KEY_DEFAULT = 'uniform:debug-mode';

/**
 * The `UniformContext` provides control over the form's submission behavior and may optionally include
 * a Veto validation schema for form validation.
 *
 * Specifically, this context offers:
 * 1. **Form Submission Control**: The `preventSubmit` function allows components to enable or disable
 *    form submissions.
 * 2. **Optional Validation Schema**: The `validation` property may hold a Veto validation schema instance
 *    that can be used to validate form fields and handle validation logic.
 *
 * This context is useful for components that need to interact with or control the form submission state,
 * or access the validation schema for managing form validation logic.
 */
export const UniformContext = React.createContext<{
  /** Form debug mode enabled or not */
  debugMode: DebugMode;
  /** settings for from debug mode */
  debugModeSettings?: DebugModeSettings;
  /** Function to update if the form can currently be submitted */
  preventSubmit: (prevent: boolean) => void;
  /** Setter to enable or disable form debug mode */
  setDebugMode: (debugMode: DebugMode) => void;
  /** Function to trigger form submit programmatically */
  triggerSubmit: (e?: BaseSyntheticEvent) => Promise<void> | void;
  /** Optional Veto validation schema instance for form validation */
  validation?: VetoInstance;
}>({
  debugMode: 'off',
  preventSubmit: () => undefined,
  setDebugMode: () => undefined,
  triggerSubmit: () => undefined,
  validation: undefined,
});

// Define props for the FormProvider component, extending HookForm's props
interface FormProviderProps {
  /** children form render function */
  children: (childProps: {
    handleSubmit: (e?: BaseSyntheticEvent) => Promise<void>;
  }) => ReactNode;
  /** settings for from debug mode */
  debugModeSettings?: DebugModeSettings;
  /** initial form values */
  initialValues?: FieldValues;
  /** form submit handler */
  onSubmit: SubmitHandler<FieldValues>;
  /** Veto validation schema instance */
  validation?: VetoInstance;
  /** when the validation should be triggered */
  validationTrigger: 'onChange' | 'onBlur' | 'onSubmit' | 'onTouched' | 'all';
}

/**
 * FormProvider component provides:
 * - The veto validation schema context
 * - Submit handler creation and submission control with preventSubmit
 * - Form Debug Mode state
 * - React Hook Form context
 */
const FormProvider: React.FC<FormProviderProps> = ({
  children,
  debugModeSettings = undefined,
  initialValues = undefined,
  onSubmit,
  validation = undefined,
  validationTrigger,
}) => {
  // Control if the form can currently be submitted
  const [preventSubmit, setPreventSubmit] = useState(false);

  // Form Debug mode state is handled in the form context
  const [debugMode, setDebugMode] = useLocalStorage<DebugMode>(
    debugModeSettings?.localStorageKey || DEBUG_MODE_LOCAL_STORAGE_KEY_DEFAULT,
    'off',
  );

  // Initialize react hook form
  const methods = useForm({
    defaultValues: initialValues,
    // add validation config when validation schema provided
    ...(validation
      ? {
          // set rhf mode
          // see: https://react-hook-form.com/docs/useform#mode
          mode: validationTrigger,
          resolver: async (values) => {
            const { data, errors, ...rest } = await validation.validateAsync(
              toValidationFormat(values),
            );
            // https://github.com/react-hook-form/resolvers/blob/master/zod/src/zod.ts
            return { values: data || {}, errors: errors || {}, ...rest };
          },
        }
      : {}),
  });

  // Create submit handler
  // eslint-disable-next-line consistent-return
  const handleSubmit = async (e?: React.BaseSyntheticEvent) => {
    // only prevent submit when form state is valid, because otherwise
    // submit will only trigger validation and add errors / focus invalid fields
    if (methods.formState.isValid && preventSubmit) {
      console.warn(
        '[FormProvider] form submit was prevented because preventSubmit is true...',
      );
      e?.preventDefault();
      return Promise.resolve();
    }
    await methods.handleSubmit(onSubmit)(e);
  };

  // Memoize the context value to prevent re-renders
  const contextValue = useMemo(
    () => ({
      // set debugMode to disabled when debugModeSettings.disable is true
      // otherwise use current debug mode from localStorage
      debugMode: debugModeSettings?.disable ? 'disabled' : debugMode,
      preventSubmit: (prevent: boolean) => {
        setPreventSubmit(prevent);
      },
      setDebugMode,
      triggerSubmit: handleSubmit,
      validation,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [debugMode, debugModeSettings?.disable],
  );

  return (
    <UniformContext.Provider value={contextValue}>
      {/* Spread all hook form props into HookFormProvider */}
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <HookFormProvider {...methods}>
        {children({ handleSubmit })}
      </HookFormProvider>
    </UniformContext.Provider>
  );
};

export default FormProvider;
