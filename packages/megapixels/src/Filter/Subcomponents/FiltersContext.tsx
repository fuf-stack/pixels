import type { ReactNode } from 'react';
import type { FilterInstance, FiltersConfiguration } from '../filters/types';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useFormContext } from '@fuf-stack/uniform/hooks';

interface FiltersContextValue {
  /** Active filters (names only) */
  activeFilters: string[];
  /** Seed default value and open modal for a filter usage. */
  addFilter: (name: string) => void;
  /** Close the modal. */
  closeFilterModal: () => void;
  /** Build fully-qualified form field path for a filter name */
  getFilterFormFieldName: (name: string) => string;
  /** Get current form value for a given filter name */
  getFilterValueByName: (name: string) => unknown;
  /** Get filter instance by name */
  getFilterInstanceByName: (name: string) => FilterInstance<unknown, unknown>;
  /** Validation helper for a specific filter field. */
  hasError: (name: string) => boolean;
  /** Name of the current filter that has its modal open */
  modalFilterName: string | undefined;
  /** Remove a filter from the form. */
  removeFilter: (name: string) => void;
  /** Open the modal for a given filter name. */
  showFilterModal: (name: string) => void;
  /** Filters that are not active (names only) */
  unusedFilters: string[];
}

/**
 * FiltersContext
 *
 * Central state for the filter UI with a clear boundary:
 * - The parent component controls committed filter values (via value/onChange)
 * - The form acts as an edit buffer (used by the modal)
 *
 * Design:
 * - activeFilters/unusedFilters are names-only and derived from the controlled
 *   form state
 * - getFilterInstanceByName gives access to the concrete registry entry to
 *   retrieve the correct Form/Display components
 * - add seeds defaults in the form and opens the modal
 * - remove un-registers the form field; if the removed filter is currently
 *   open in the modal, the modal is closed without rollback
 * - on a new successful form submit (Apply), the modal closes without rollback
 *   by subscribing to ex-forms submit state
 */
const FiltersContext = createContext<FiltersContextValue | undefined>(
  undefined,
);

export const FiltersContextProvider = ({
  children,
  config,
}: {
  children: ReactNode;
  config: FiltersConfiguration;
}) => {
  // ex-forms integration:
  // - setValue/unregister/getFieldState: core helpers to manipulate and validate fields
  // - formState: we subscribe to submit-success to auto-close the modal after Apply
  const {
    formState,
    getFieldState,
    setValue,
    triggerSubmit,
    unregister,
    watch,
  } = useFormContext();

  /**
   * currentModalFilter
   *
   * Single source of truth for the filter edit modal and its rollback snapshot.
   * - name: which filter's modal is currently open (null when closed)
   * - hadValue/previousValue: snapshot of the controlled value taken when the
   *   modal is opened; used to restore state if the user cancels/closes without
   *   applying.
   *
   * Lifecycle semantics:
   * - showFilterModal(name): capture snapshot (current controlled value) and open
   *   the modal for that filter.
   * - closeFilterModal(): if a snapshot exists, roll back un-applied edits by
   *   restoring the previous value (setValue) or removing the field (unregister)
   *   when it did not exist before; then clear currentModalFilter.
   * - On successful submit (Apply): close and clear currentModalFilter WITHOUT rollback
   *   so edits remain committed.
   * - removeFilter(name): unregisters the field; when removing the filter that is
   *   currently open, close the modal WITHOUT rollback (since removal is explicit).
   */
  const [currentModalFilter, setCurrentModalFilter] = useState<{
    name: string;
    hadValue: boolean;
    previousValue: unknown;
  } | null>(null);

  // Read current filter values from the form as the live edit buffer
  const filterValue = watch('filter', {});

  /**
   * getFilterFormFieldName
   *
   * Returns the fully-qualified field path for a given filter name,
   * e.g., `${filterUrlParam}.status`.
   */
  const getFilterFormFieldName = useCallback((name: string) => {
    return `filter.${name}`;
  }, []);

  /**
   * getFilterValueByName
   *
   * Returns the committed value for a filter from the controlled state.
   */
  const getFilterValueByName = useCallback(
    (name: string) => {
      return (filterValue as Record<string, unknown>)[name];
    },
    [filterValue],
  );

  /** Open the filter edit modal for the given filter name. */
  const showFilterModal = useCallback(
    (name: string) => {
      const prev = getFilterValueByName(name);
      setCurrentModalFilter({
        name,
        hadValue: typeof prev !== 'undefined',
        previousValue: prev,
      });
    },
    [getFilterValueByName],
  );

  /** Close the filter edit modal. Rollback un-applied edits to controlled state. */
  const closeFilterModal = useCallback(() => {
    if (currentModalFilter?.name) {
      const fieldName = getFilterFormFieldName(currentModalFilter.name);
      // if the filter had a value, set it back to the previous value,
      // otherwise unregister the field
      if (currentModalFilter.hadValue) {
        setValue(fieldName, currentModalFilter.previousValue);
      } else {
        unregister(fieldName);
      }
    }
    setCurrentModalFilter(null);
  }, [getFilterFormFieldName, currentModalFilter, setValue, unregister]);

  /**
   * Auto-close on submit success
   *
   * Close the modal only on new successful submissions. We track the last
   * submitCount and only react when it changes AND the form reports a
   * successful submit. This prevents closing when `isSubmitSuccessful` remains
   * true without a new submit event.
   */
  const lastSubmitCountRef = useRef<number>(0);
  useEffect(() => {
    if (
      formState.submitCount !== lastSubmitCountRef.current &&
      formState.isSubmitSuccessful
    ) {
      // On successful submit, close without rollback
      setCurrentModalFilter(null);
    }
    lastSubmitCountRef.current = formState.submitCount;
  }, [
    formState.submitCount,
    formState.isSubmitSuccessful,
    setCurrentModalFilter,
  ]);

  /**
   * activeFilters
   *
   * Filter names derived from the controlled form state. A filter is considered
   * active when a field exists at `filter.<name>`. Newly added filters become
   * active immediately (seeded default), and will be rolled back on cancel.
   */
  const activeFilters = useMemo(() => {
    return config
      .filter((f) => {
        return Object.hasOwn(filterValue ?? {}, f.name);
      })
      .map((f) => {
        return f.name;
      });
  }, [config, filterValue]);

  /**
   * unusedFilters
   *
   * Complement of activeFilters (names without a corresponding `filter.<name>`
   * field in the controlled form state).
   */
  const unusedFilters = useMemo(() => {
    return config
      .filter((f) => {
        return !Object.hasOwn(filterValue ?? {}, f.name);
      })
      .map((f) => {
        return f.name;
      });
  }, [config, filterValue]);

  /**
   * getRegistryFilterByName
   *
   * Looks up the concrete registry entry for a filter by name, enabling access
   * to typed Form/Display components and other registry-level metadata.
   */
  const getFilterInstanceByName = useCallback(
    (name: string) => {
      return config.find((f) => {
        return f.name === name;
      }) as FilterInstance<unknown, unknown>;
    },
    [config],
  );

  /**
   * addFilter
   *
   * Seeds the filter with its registry default value inside the form and opens
   * the modal for immediate editing. No URL writes happen here.
   */
  const addFilter = useCallback(
    (name: string) => {
      const inst = getFilterInstanceByName(name);
      showFilterModal(name);
      setValue(getFilterFormFieldName(name), inst.defaultValue);
    },
    [
      getFilterFormFieldName,
      getFilterInstanceByName,
      setValue,
      showFilterModal,
    ],
  );

  /**
   * removeFilter
   *
   * Unregisters the filter field from the form. This immediately removes the
   * filter from the active list since derived state watches the form. It
   * closes the modal without rollback if the removed filter is currently open.
   */
  const removeFilter = useCallback(
    (name: string) => {
      // unregister form field
      unregister(getFilterFormFieldName(name));
      // close filter modal if open
      if (currentModalFilter?.name === name) {
        // Explicit removal: close without rollback
        setCurrentModalFilter(null);
      }
      // trigger form submit (to update filter state)
      triggerSubmit();
    },
    [
      getFilterFormFieldName,
      currentModalFilter,
      setCurrentModalFilter,
      triggerSubmit,
      unregister,
    ],
  );

  /**
   * hasError
   *
   * Helper that checks the ex-forms field state for a specific filter and
   * reports whether the field is currently invalid.
   */
  const hasError = useCallback(
    (name: string) => {
      return getFieldState(getFilterFormFieldName(name)).invalid;
    },
    [getFieldState, getFilterFormFieldName],
  );

  const contextValue: FiltersContextValue = useMemo(() => {
    return {
      activeFilters,
      addFilter,
      closeFilterModal,
      getFilterFormFieldName,
      getFilterValueByName,
      getFilterInstanceByName,
      hasError,
      modalFilterName: currentModalFilter?.name,
      removeFilter,
      showFilterModal,
      unusedFilters,
    };
  }, [
    activeFilters,
    addFilter,
    closeFilterModal,
    getFilterFormFieldName,
    getFilterValueByName,
    getFilterInstanceByName,
    hasError,
    currentModalFilter,
    removeFilter,
    showFilterModal,
    unusedFilters,
  ]);

  return (
    <FiltersContext.Provider value={contextValue}>
      {children}
    </FiltersContext.Provider>
  );
};

/**
 * useFilters
 *
 * Convenience hook to consume the FiltersContext. Throws a descriptive error
 * when used outside of a FiltersContextProvider to make integration mistakes
 * obvious during development.
 */
export const useFilters = (): FiltersContextValue => {
  const ctx = useContext(FiltersContext);
  if (!ctx) {
    throw new Error('useFilters must be used within FiltersContextProvider');
  }
  return ctx;
};

export default FiltersContext;
