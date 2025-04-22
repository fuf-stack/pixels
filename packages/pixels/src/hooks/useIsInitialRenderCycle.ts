/* eslint-disable import/prefer-default-export */

import { useEffect, useRef } from 'react';

/**
 * A hook that returns true on initial render and false afterward.
 *
 * @returns {boolean} - True on initial render, false afterward
 */
export const useIsInitialRenderCycle = (): boolean => {
  // Use ref to avoid re-renders
  const isInitialRender = useRef(true);

  // Update ref after first render
  useEffect(() => {
    // Set to false after component mounts
    isInitialRender.current = false;

    // No cleanup needed for this effect
  }, []);

  return isInitialRender.current;
};
