import { useEffect } from 'react';

import { useFormContext } from '../useFormContext/useFormContext';

export interface UseWatchFormResetOptions {
  /**
   * Callback that runs whenever a programmatic form reset is observed.
   *
   * Resets are signalled via the uniform `formReset` pub/sub channel. The event
   * is emitted by the wrapped `reset()` method in `useFormContext`.
   *
   * Current primary use case:
   * - `useUniformFieldArray` listens for reset events to normalize stale
   *   placeholder rows left by RHF after reset when array defaults are missing.
   */
  onReset: () => void;
}

/**
 * Hook that watches for programmatic form reset events.
 *
 * It lets consumers run a callback when a programmatic form reset is triggered
 * through the wrapped `reset()` from `useFormContext`.
 *
 * Why this exists:
 * - Components should not infer "a reset happened" from field values alone.
 *   Value-based heuristics can conflict with valid user interactions.
 * - This hook provides an explicit reset signal so components can run
 *   reset-only logic safely.
 *
 * Current usage:
 * - `useUniformFieldArray` uses this hook to handle resets when no default
 *   array value was provided. In that case, RHF can leave stale empty
 *   placeholder rows. It normalizes only on reset and does not collapse rows
 *   during normal editing.
 */
export const useWatchFormReset = ({ onReset }: UseWatchFormResetOptions) => {
  const { formReset } = useFormContext();

  useEffect(() => {
    const listener = () => {
      onReset();
    };

    const unsubscribe = formReset.subscribe(listener);
    return unsubscribe;
  }, [formReset, onReset]);
};
