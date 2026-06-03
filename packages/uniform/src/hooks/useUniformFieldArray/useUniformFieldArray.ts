import type { ReactNode } from 'react';
import type { ArrayPath, FieldValues, Path } from 'react-hook-form';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useFieldArray as useRHFFieldArray } from 'react-hook-form';

import { useReducedMotion } from '@fuf-stack/pixel-motion';

import { flatArrayKey, isValueEmpty } from '../../helpers';
import { useFormContext } from '../useFormContext';
import { useUniformField } from '../useUniformField';
import { useWatchFormReset } from '../useWatchFormReset';

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
 * - Reset-only normalization for stale empty placeholder rows (via useWatchFormReset)
 * - Animation control (disabled during initialization)
 * - Temporary animation disable during reset normalization collapse
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

  const { fields, append, remove, insert, move, replace } = useRHFFieldArray({
    control,
    name,
  });

  const { trigger, setValue, getValues } = useFormContext<TFieldValues>();

  // Determine if initialization is needed (initially or after reset).
  // lastElementNotRemovable is purely a minimum-count guarantee: when there are
  // no rows, add one. This handles both:
  // - Initial mount: fields.length starts at 0
  // - Form reset to an empty array: fields.length becomes 0 again
  // It intentionally does NOT inspect row contents, so manually added empty rows
  // are never collapsed.
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

  // Reset normalization:
  // Run ONLY when an actual form reset is emitted (via useWatchFormReset), not
  // on regular field edits. This does not collapse rows users add manually.
  //
  // Why this exists:
  // RHF can keep stale field-array rows after reset when array defaults are
  // missing (e.g. value becomes undefined or [null, null] while UI still has
  // multiple rows). We normalize this reset-only state to:
  // - one row when lastElementNotRemovable is enabled
  // - zero rows otherwise
  useWatchFormReset({
    onReset: () => {
      const currentValue = getValues(name as Path<TFieldValues>) as unknown;
      const valueIsArray = Array.isArray(currentValue);
      const arrayValue = valueIsArray ? (currentValue as unknown[]) : [];
      const normalizedLength = lastElementNotRemovable ? 1 : 0;
      const alreadyNormalized =
        valueIsArray && arrayValue.length === normalizedLength;

      // Treat these as "effectively empty after reset":
      // - value missing/not-array
      // - empty array
      // - array where all entries are empty placeholders
      const isEffectivelyEmptyAfterReset =
        !valueIsArray ||
        arrayValue.length === 0 ||
        arrayValue.every((entry) => {
          return isValueEmpty(entry);
        });

      // Nothing to fix when the reset restored real values (e.g. from defaults).
      if (!isEffectivelyEmptyAfterReset) {
        return;
      }

      // Already normalized to the target row count.
      if (alreadyNormalized) {
        return;
      }

      // Avoid collapse animation flicker during reset normalization.
      setDisableAnimation(true);

      // use replace so the RHF field-array length actually matches the target.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      replace((lastElementNotRemovable ? [elementInitialValue] : []) as any);

      // Restore normal animation state right after normalization.
      if (!prefersReducedMotion) {
        setTimeout(() => {
          setDisableAnimation(false);
        }, 1);
      }
    },
  });

  // Initialization/Re-initialization: add one element only when array length is 0.
  // This is the min-count behavior for lastElementNotRemovable and is intentionally
  // separate from reset normalization above.
  //
  // Reset behavior in this hook is split into two phases:
  // 1) Reset normalization (useWatchFormReset): collapse stale placeholder rows
  //    left by reset edge cases.
  // 2) Length-based initialization (this effect): ensure a min-one array when
  //    the field array is truly empty.
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
