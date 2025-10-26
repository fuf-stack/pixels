import type { ReactNode } from 'react';
import type { ArrayPath, FieldValues, Path } from 'react-hook-form';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useFieldArray as useRHFFieldArray } from 'react-hook-form';

import { useReducedMotion } from '@fuf-stack/pixel-motion';

import { flatArrayKey } from '../../helpers';
import { useFormContext } from '../useFormContext/useFormContext';
import { useUniformField } from '../useUniformField/useUniformField';

export interface UseUniformFieldArrayProps<
  TFieldValues extends FieldValues = FieldValues,
> {
  /** Field name for the array */
  name: ArrayPath<TFieldValues>;
  /** Whether this is a flat array (array of primitives) */
  flat?: boolean;
  /** Initial value for new array elements */
  elementInitialValue?: unknown;
  /** Whether the last element cannot be removed (always maintain at least one element) */
  lastElementNotRemovable?: boolean;
  /** Disable the field */
  disabled?: boolean;
  /** Optional explicit test id used to build stable test ids */
  testId?: string;
  /** Optional label content; pass false to suppress label entirely */
  label?: ReactNode | false;
  /**
   * When to show the invalid state to users.
   * - 'touched': Only show errors after field is touched or form is submitted (default, good for text inputs)
   * - 'immediate': Show errors as soon as they occur (good for checkboxes, radios, arrays)
   */
  showInvalidWhen?: 'touched' | 'immediate';
}

/**
 * Enhanced useFieldArray hook with initialization and animation logic.
 * Based on React Hook Form's useFieldArray with additional features:
 * - Automatic initialization when lastElementNotRemovable is set
 * - Animation control (disabled during initialization)
 * - Automatic validation triggering
 * - Support for flat arrays (arrays of primitives)
 *
 * @see https://react-hook-form.com/docs/usefieldarray
 */
export const useUniformFieldArray = <
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  flat = false,
  elementInitialValue: _elementInitialValue = null,
  lastElementNotRemovable = false,
  disabled,
  testId: explicitTestId,
  label,
  showInvalidWhen = 'immediate',
}: UseUniformFieldArrayProps<TFieldValues>) => {
  // Get uniform field state and utilities
  const uniformField = useUniformField<TFieldValues>({
    name: name as Path<TFieldValues> & string,
    disabled,
    testId: explicitTestId,
    label,
    showInvalidWhen,
  });

  const { control } = uniformField;

  const { fields, append, remove, insert, move } = useRHFFieldArray({
    control,
    name,
  });

  const { trigger, setValue } = useFormContext<TFieldValues>();

  // Animation control: Start with animations disabled to prevent animating in initial elements.
  // Will be enabled after initialization completes (unless user prefers reduced motion).
  const [disableAnimation, setDisableAnimation] = useState(true);

  // Track whether initialization has completed. Used to:
  // 1. Skip validation during initial setup
  // 2. Only enable animations after initialization
  // 3. Only respond to motion preference changes after initialization
  const hasInitialized = useRef(false);

  // Validate array-level constraints (min/max items) when length changes.
  // Skip validation during initialization to avoid showing errors before initialization is complete.
  useEffect(() => {
    if (hasInitialized.current) {
      setTimeout(() => {
        // Trigger validation so min/max errors appear instantly when user adds/removes items
        trigger(name as Path<TFieldValues>);
      }, 200);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields.length]);

  // Respond to user's motion preference changes (after initialization).
  // During initialization, animations stay disabled regardless of preference.
  const prefersReducedMotion = useReducedMotion();
  useEffect(() => {
    if (hasInitialized.current) {
      setDisableAnimation(!!prefersReducedMotion);
    }
  }, [prefersReducedMotion]);

  // Prepare initial element value based on mode
  // - flat=true: arrays of primitives → object with flatArrayKey and null value by default
  // - flat=false: arrays of objects → empty object by default
  const elementInitialValue = useMemo(() => {
    return flat
      ? { [flatArrayKey]: _elementInitialValue ?? null }
      : (_elementInitialValue ?? {});
  }, [flat, _elementInitialValue]);

  // Initialization: Add initial element if lastElementNotRemovable is set.
  // CRITICAL: This effect MUST be the LAST hook in this component.
  // It sets hasInitialized.current = true, which acts as a gate for other effects.
  // If this runs before other effects, hasInitialized will be true during their first run,
  // causing them to execute logic meant only for post-initialization (e.g., validation,
  // animation enabling). By placing this last, all other effects run first with
  // hasInitialized = false, allowing them to skip initialization-phase logic.
  useEffect(
    () => {
      if (lastElementNotRemovable && fields.length === 0) {
        // use setValue instead of append to avoid focusing the added element
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setValue(name as Path<TFieldValues>, [elementInitialValue] as any);
      }

      // Mark initialization as complete
      hasInitialized.current = true;

      // Enable animations after a 1ms delay (unless user prefers reduced motion).
      // The delay ensures the initial setValue completes before animations turn on,
      // preventing the initial element from animating in.
      if (!prefersReducedMotion) {
        setTimeout(() => {
          setDisableAnimation(false);
        }, 1);
      }
    },
    // only run once when the component mounts
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return {
    // Field array methods and state
    fields,
    append,
    remove,
    insert,
    move,
    disableAnimation,
    elementInitialValue,
    // Uniform field state and utilities (spread all)
    ...uniformField,
  };
};
