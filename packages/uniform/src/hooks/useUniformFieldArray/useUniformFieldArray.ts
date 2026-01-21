import type { ReactNode } from 'react';
import type { ArrayPath, FieldValues, Path } from 'react-hook-form';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useFieldArray as useRHFFieldArray } from 'react-hook-form';

import { useReducedMotion } from '@fuf-stack/pixel-motion';

import { flatArrayKey } from '../../helpers';
import { useFormContext } from '../useFormContext';
import { useUniformField } from '../useUniformField';

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
  /** Optional label content */
  label?: ReactNode;
}

/**
 * Enhanced useFieldArray hook with initialization and animation logic.
 * Based on React Hook Form's useFieldArray with additional features:
 * - Automatic initialization when lastElementNotRemovable is set
 * - Animation control (disabled during initialization)
 * - Support for flat arrays (arrays of primitives)
 *
 * Note: Automatic validation triggering on length change is disabled to prevent
 * triggering form-wide validation. Array validation still runs on form submission.
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
}: UseUniformFieldArrayProps<TFieldValues>) => {
  // Get uniform field state and utilities
  const uniformField = useUniformField<TFieldValues>({
    name: name as Path<TFieldValues> & string,
    disabled,
    testId: explicitTestId,
    label,
  });

  const { control } = uniformField;

  const { fields, append, remove, insert, move } = useRHFFieldArray({
    control,
    name,
  });

  const { trigger, setValue } = useFormContext<TFieldValues>();

  // Determine if initialization is needed (initially or after reset).
  // This flag automatically handles both scenarios:
  // - Initial mount: fields.length starts at 0
  // - Form reset: fields.length becomes 0 again
  // Additional initialization conditions can be added here later (e.g., minElements > 0)
  // Using useMemo ensures this value is properly tracked by React and effects can depend on it
  const needsInitialize = useMemo(() => {
    return lastElementNotRemovable && fields.length === 0;
  }, [lastElementNotRemovable, fields.length]);

  // Track whether initialization has completed. Initialized contextually:
  // - If initialization IS needed (needsInitialize = true): starts as false, set to true after init
  // - If initialization is NOT needed (needsInitialize = false): starts as true (already initialized)
  // This ref is used to:
  // 1. Skip validation during initialization/re-initialization
  // 2. Gate animation enabling until after initialization
  // 3. Gate motion preference effect until after initialization
  const hasInitialized = useRef(!needsInitialize);

  // Reset initialization flag when needsInitialize changes to true.
  // This handles form reset: when fields become empty (needsInitialize becomes true),
  // hasInitialized is reset to false, triggering re-initialization in the effect below.
  useEffect(() => {
    if (needsInitialize) {
      hasInitialized.current = false;
    }
  }, [needsInitialize]);

  // Validate array-level constraints (min/max items) when length changes.
  // This ensures min/max errors appear instantly when user adds/removes items.
  // Note: Child field validation also runs, but new empty fields won't show as invalid
  // because useFormContext only sets invalid=true for touched fields or after form submission.
  // Skip validation during initialization/re-initialization to avoid showing errors prematurely.
  useEffect(() => {
    if (hasInitialized.current) {
      setTimeout(() => {
        trigger(name as Path<TFieldValues>);
      }, 200);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields.length]);

  // Animation control: Start with animations disabled to prevent animating in initial elements.
  // Will be enabled after initialization completes (unless user prefers reduced motion).
  const [disableAnimation, setDisableAnimation] = useState(true);

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

  // Initialization/Re-initialization: Add initial element when needed.
  // This handles both initial mount and form reset scenarios by reacting to needsInitialize.
  // CRITICAL: This effect MUST be the LAST hook in this component.
  // It sets hasInitialized.current = true, which acts as a gate for other effects.
  // If this runs before other effects, hasInitialized will be true during their first run,
  // causing them to execute logic meant only for post-initialization (e.g., validation,
  // animation enabling). By placing this last, all other effects run first with
  // hasInitialized = false, allowing them to skip initialization-phase logic.
  useEffect(
    () => {
      if (needsInitialize) {
        // use setValue instead of append to avoid focusing the added element
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setValue(name as Path<TFieldValues>, [elementInitialValue] as any, {
          shouldDirty: false,
          shouldTouch: false,
        });

        // Mark initialization as complete
        hasInitialized.current = true;

        // Enable animations after a brief delay (unless user prefers reduced motion or animations are already enabled).
        // This only runs on initial mount when animations start disabled.
        // On reset, disableAnimation is typically false, so this setTimeout won't run and animations stay enabled.
        if (!prefersReducedMotion && disableAnimation) {
          setTimeout(() => {
            setDisableAnimation(false);
          }, 1);
        }
      }
    },
    // Run when needsInitialize changes (initial mount or reset)
    // needsInitialize is memoized based on fields.length and lastElementNotRemovable
    // Other dependencies are intentionally omitted:
    // - append, setValue, trigger, setDisableAnimation are stable refs/functions
    // - elementInitialValue, name, flat, prefersReducedMotion, disableAnimation are props/stable values
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [needsInitialize],
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
