import type {
  VetoFormattedError,
  VetoInstance,
  VetoTypeAny,
} from '@fuf-stack/veto';
import type { BaseSyntheticEvent, ReactNode } from 'react';
import type { FieldValues, SubmitHandler } from 'react-hook-form';

import React, { useMemo, useState } from 'react';
import { FormProvider as HookFormProvider, useForm } from 'react-hook-form';

import { useLocalStorage } from '@fuf-stack/pixels';

import { toFormFormat, toValidationFormat } from '../../helpers';
import { useExtendedValidation, useFormResolver } from './FormResolver';

type DebugMode = 'debug' | 'debug-testids' | 'off' | 'disabled';

export interface DebugModeSettings {
  /** disable form debug completely */
  disable?: boolean;
  /** custom localStorage key to save debug mode state */
  localStorageKey?: string;
}

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
 * 3. **Client Validation**: The `setClientValidationSchema` function allows setting dynamic client-side
 *    validation schemas that complement the base Veto validation.
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
  /** Form validation configuration */
  validation: {
    /** Veto validation schema instance for form validation */
    instance?: VetoInstance;
    /** Current validation errors in form */
    errors?: VetoFormattedError;
    /** Function to set client validation schema for a specific key */
    setClientValidationSchema: (
      key: string,
      schema: VetoTypeAny | null,
    ) => void;
  };
}>({
  debugMode: 'off',
  preventSubmit: () => {
    return undefined;
  },
  setDebugMode: () => {
    return undefined;
  },
  triggerSubmit: () => {
    return undefined;
  },
  validation: {
    setClientValidationSchema: () => {
      return undefined;
    },
  },
});

// Define props for the FormProvider component, extending HookForm's props
interface FormProviderProps {
  /** children form render function */
  children: (childProps: {
    handleSubmit: (e?: BaseSyntheticEvent) => Promise<void>;
    isValid: boolean;
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
 * - Veto validation schema context
 * - Client validation schema management
 * - Submit handler with automatic data conversion and submission control with preventSubmit
 * - Form Debug Mode state
 * - React Hook Form context
 */
const FormProvider: React.FC<FormProviderProps> = ({
  children,
  debugModeSettings = undefined,
  initialValues = undefined,
  onSubmit,
  validation: baseValidation = undefined,
  validationTrigger,
}) => {
  // Form Debug mode state is handled in the form context
  const [debugMode, setDebugMode] = useLocalStorage<DebugMode>(
    debugModeSettings?.localStorageKey ?? DEBUG_MODE_LOCAL_STORAGE_KEY_DEFAULT,
    'off',
  );

  // Create extended validation combining base + client validations
  const { extendedValidation, setClientValidationSchema } =
    useExtendedValidation(baseValidation);

  // Create resolver from extended validation + get current validation errors
  const { resolver, validationErrors, validationErrorsHash } =
    useFormResolver(extendedValidation);

  // Initialize react hook form with the resolver
  const methods = useForm({
    defaultValues: initialValues ? toFormFormat(initialValues) : initialValues,
    // set rhf mode
    // see: https://react-hook-form.com/docs/useform#mode
    mode: validationTrigger,
    resolver,
  });

  // Get isValid from React Hook Form's formState
  const isValid = methods.formState?.isValid;

  // Control if the form can currently be submitted
  const [preventSubmit, setPreventSubmit] = useState(false);

  // Create submit handler with automatic data conversion
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

    // Convert nullish strings and filter out empty values before submission
    const wrappedOnSubmit = (data: FieldValues, event?: BaseSyntheticEvent) => {
      const submitData = toValidationFormat(data) ?? {};
      return onSubmit(submitData, event);
    };

    await methods.handleSubmit(wrappedOnSubmit)(e);
  };

  // Memoize the context value to prevent re-renders
  const contextValue = useMemo(
    () => {
      return {
        // set debugMode to disabled when debugModeSettings.disable is true
        // otherwise use current debug mode from localStorage
        debugMode: debugModeSettings?.disable ? 'disabled' : debugMode,
        preventSubmit: (prevent: boolean) => {
          setPreventSubmit(prevent);
        },
        setClientValidationSchema,
        setDebugMode,
        triggerSubmit: handleSubmit,
        validation: {
          instance: extendedValidation,
          errors: validationErrors,
          setClientValidationSchema,
        },
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [debugMode, debugModeSettings?.disable, validationErrorsHash],
  );

  return (
    <UniformContext.Provider value={contextValue}>
      {/* Spread all hook form props into HookFormProvider */}
      <HookFormProvider {...methods}>
        {children({ handleSubmit, isValid })}
      </HookFormProvider>
    </UniformContext.Provider>
  );
};

export default FormProvider;
