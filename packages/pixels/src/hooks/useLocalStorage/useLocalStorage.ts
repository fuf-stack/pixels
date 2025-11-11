/* eslint-disable import-x/prefer-default-export */

import type { Dispatch, SetStateAction } from 'react';

import { useEffect, useState } from 'react';

export const useLocalStorage = <T>(
  key: string,
  initialValue: T | (() => T),
): [T, Dispatch<SetStateAction<T>>] => {
  // Get from local storage then
  // parse stored json or return initialValue
  const readValue = (): T => {
    // Helper to resolve initial value (handle function or direct value)
    const resolveInitialValue = (): T => {
      return typeof initialValue === 'function'
        ? (initialValue as () => T)()
        : initialValue;
    };

    // Prevent build error "window is undefined" but keep keep working
    if (typeof window === 'undefined') {
      return resolveInitialValue();
    }

    try {
      // eslint-disable-next-line n/no-unsupported-features/node-builtins
      const item = window.localStorage.getItem(key);
      if (item) {
        return JSON.parse(item) as T;
      }
      return resolveInitialValue();
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return resolveInitialValue();
    }
  };

  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue: Dispatch<SetStateAction<T>> = (value) => {
    // Prevent build error "window is undefined" but keeps working
    if (typeof window === 'undefined') {
      console.warn(
        `Tried setting localStorage key "${key}" even though environment is not a client`,
      );
      return;
    }

    try {
      // Allow value to be a function so we have the same API as useState
      const newValue = value instanceof Function ? value(storedValue) : value;

      // Save to local storage
      // eslint-disable-next-line n/no-unsupported-features/node-builtins
      window.localStorage.setItem(key, JSON.stringify(newValue));

      // Save state
      setStoredValue(newValue);

      // We dispatch a custom event so every useLocalStorage hook are notified
      window.dispatchEvent(new Event('local-storage'));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  useEffect(() => {
    setStoredValue(readValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Skip event listeners in SSR environment
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleStorageChange = () => {
      setStoredValue(readValue());
    };

    // this only works for other documents, not the current one
    window.addEventListener('storage', handleStorageChange);

    // this is a custom event, triggered in writeValueToLocalStorage
    window.addEventListener('local-storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage', handleStorageChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [storedValue, setValue];
};
