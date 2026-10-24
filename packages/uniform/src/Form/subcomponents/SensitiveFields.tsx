import type { ReactNode } from 'react';

import {
  createContext,
  useContext,
  useLayoutEffect,
  useSyncExternalStore,
} from 'react';

/**
 * Diagnostic redaction for explicitly registered form paths.
 *
 * Flow:
 * 1. FormProvider creates one registry for its form and supplies it through context.
 * 2. useUniformField calls useSensitiveField for declared password inputs and
 *    fields marked sensitive. This module does not infer secrets from names,
 *    inspect the DOM, or search strings for password-like content.
 * 3. Field layout effects register their paths before the provider marks the
 *    initial registry ready. The debug viewer waits for that ready signal.
 * 4. The viewer and Uniform's debug logger redact diagnostic copies using the
 *    same registry. JSON copy actions receive the viewer's redacted data too.
 *
 * This is protection against accidental disclosure in Uniform diagnostics,
 * not encryption or a boundary against browser inspection. Real values remain
 * available to inputs, validation, submission, and application callbacks.
 * Application logging and secrets embedded in unrelated paths/custom messages
 * are outside this path-based redaction mechanism.
 */

// A fixed placeholder avoids exposing the secret's content, type, or length.
const REDACTED = '[REDACTED]';

/**
 * Build a diagnostic copy with each registered field replaced by [REDACTED].
 *
 * Matching a field masks its entire subtree. For validation errors, that also
 * removes error metadata/messages beneath that field, which may contain input.
 * The source object is never changed: redacting form state itself would corrupt
 * validation and the values ultimately delivered to onSubmit.
 *
 * Paths use React Hook Form dot notation, with numeric bracket indices accepted
 * as well. Normalization removes Uniform's __FLAT__ transport wrapper so the
 * same registration covers raw form data and normalized/submitted array values.
 *
 * Traversal covers arrays and plain objects. Non-data instances such as dates
 * and DOM refs are preserved unless their path or an ancestor is sensitive.
 * This is deliberately not a general-purpose serializer or secret detector.
 *
 * @param data - Form values or errors destined for Uniform diagnostics
 * @param paths - Sensitive field paths registered for this form
 * @returns A diagnostic copy with registered fields replaced, or the unchanged
 * primitive/non-data instance when no traversal is necessary
 */
export const redactDebugData = (
  data: unknown,
  paths: readonly string[],
): unknown => {
  const sensitivePaths = new Set(
    paths.map((path) => {
      return path
        .replace(/\[(\d+)\]/g, '.$1')
        .split('.')
        .filter((part) => {
          return part !== '__FLAT__';
        })
        .join('.');
    }),
  );
  // Track only the current recursion's ancestors. This breaks traversal cycles
  // without reusing a differently redacted copy at another field path.
  const copies = new WeakMap<object, unknown>();
  const visit = (value: unknown, path: string): unknown => {
    // Check before descending or returning an object reference: a sensitive
    // field must be replaced wholesale, even when its value is an object.
    if (sensitivePaths.has(path)) {
      return REDACTED;
    }
    if (!value || typeof value !== 'object') {
      return value;
    }
    const existing = copies.get(value);
    if (existing) {
      return existing;
    }
    if (Array.isArray(value)) {
      const copy: unknown[] = [];
      copies.set(value, copy);
      value.forEach((item, index) => {
        copy[index] = visit(item, path ? `${path}.${index}` : String(index));
      });
      copies.delete(value);
      return copy;
    }
    // Preserve non-data objects, such as dates and refs in non-sensitive errors.
    const prototype: unknown = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      return value;
    }
    const copy: Record<string, unknown> = {};
    copies.set(value, copy);
    Object.entries(value as Record<string, unknown>).forEach(([key, entry]) => {
      // Define an own property rather than assigning through __proto__ or any
      // inherited setter when copying arbitrary form-data keys.
      Object.defineProperty(copy, key, {
        value: visit(entry, path ? `${path}.${key}` : key),
        enumerable: true,
        writable: true,
        configurable: true,
      });
    });
    // Cache only ancestors for cycle handling: shared objects at other paths
    // need their own redaction pass because sensitivity belongs to the path.
    copies.delete(value);
    return copy;
  };
  return visit(data, '');
};

/**
 * Create an isolated, append-only sensitivity registry for one form instance.
 *
 * Only field paths and readiness are stored here; the registry does not retain
 * password values. Paths intentionally survive input unmounts, resets, and a
 * later sensitive=false declaration because RHF can retain the original value.
 * A new form instance gets a fresh registry; there is no cross-form path sharing.
 *
 * Snapshot objects stay referentially stable until metadata actually changes.
 * useSyncExternalStore depends on that stability to avoid repeated renders.
 */
export const createSensitiveFields = () => {
  let snapshot: { paths: readonly string[]; ready: boolean } = {
    paths: [],
    ready: false,
  };
  const listeners = new Set<() => void>();
  const notify = () => {
    listeners.forEach((listener) => {
      listener();
    });
  };
  return {
    /** Return the current stable metadata snapshot, without reading form values. */
    getSnapshot: () => {
      return snapshot;
    },
    /** Subscribe to metadata changes; cleanup removes the listener, not paths. */
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    /** Mark a path once; duplicate registrations and Strict Mode repeats are safe. */
    register: (name: string) => {
      if (snapshot.paths.includes(name)) {
        return;
      }
      // RHF retains values for unmounted fields. Retain their sensitivity for
      // the form's lifetime too, so hiding an input never reveals its secret.
      snapshot = { ...snapshot, paths: [...snapshot.paths, name] };
      notify();
    },
    /** Allow the debug viewer to render after initial field registration finishes. */
    ready: () => {
      if (snapshot.ready) {
        return;
      }
      snapshot = { ...snapshot, ready: true };
      notify();
    },
    /** Use the latest paths for logs, even while the debug viewer is closed. */
    redact: (data: unknown) => {
      return redactDebugData(data, snapshot.paths);
    },
  };
};

type SensitiveFields = ReturnType<typeof createSensitiveFields>;
// An immutable-in-practice empty fallback supports isolated viewer tests and
// consumers without this provider. useSensitiveField never writes to it, so it
// cannot leak registrations between unrelated forms or component tests.
const defaultSensitiveFields = createSensitiveFields();
defaultSensitiveFields.ready();
const SensitiveFieldsContext = createContext<SensitiveFields | undefined>(
  undefined,
);

/**
 * Supply the form-owned registry and release the initial debug-render gate.
 *
 * React runs descendant layout effects before this provider's layout effect,
 * so initially mounted fields register before ready becomes true. The viewer
 * must not render raw values while ready is false, even if debug mode was
 * restored from localStorage before the form's first render.
 */
export const SensitiveFieldsProvider = ({
  children,
  registry,
}: {
  children: ReactNode;
  registry: SensitiveFields;
}) => {
  // Child layout effects register initial fields before debug data is shown.
  useLayoutEffect(() => {
    registry.ready();
  }, [registry]);
  return (
    <SensitiveFieldsContext.Provider value={registry}>
      {children}
    </SensitiveFieldsContext.Provider>
  );
};

/**
 * Register a field's sensitivity as declared by its renderer/shared field hook.
 *
 * Registration happens during commit, not render, so abandoned React renders
 * cannot mutate the registry. Layout timing makes new registrations available
 * before paint. Password detection uses the declared input type in
 * useUniformField, so toggling the rendered type to text does not reveal debug
 * values. Once registered, a path is never downgraded within this form instance.
 *
 * @param name - The field path used for form registration
 * @param sensitive - Whether the renderer declares this field sensitive
 */
export const useSensitiveField = (name: string, sensitive: boolean) => {
  const registry = useContext(SensitiveFieldsContext);
  useLayoutEffect(() => {
    if (sensitive) {
      registry?.register(name);
    }
  }, [registry, name, sensitive]);
};

/**
 * Observe sensitivity metadata for rendering diagnostic copies.
 *
 * This subscription contains neither passwords nor RHF's mutable value objects.
 * The debug viewer keeps its existing value subscription and applies these paths
 * when handing values/errors to Json; getValues and onSubmit stay untouched.
 * Callers must honor ready before exposing an initial diagnostic payload.
 */
export const useSensitiveDebug = () => {
  const registry = useContext(SensitiveFieldsContext) ?? defaultSensitiveFields;
  // Subscribe only to stable metadata snapshots, not RHF's mutable value objects.
  return useSyncExternalStore(
    registry.subscribe,
    registry.getSnapshot,
    registry.getSnapshot,
  );
};
