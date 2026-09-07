/* eslint-disable import-x/prefer-default-export */

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

  // Reading this mount marker is the purpose of the hook; it never drives a
  // mutation during render and changes only after the initial commit.
  // eslint-disable-next-line react-hooks/refs
  return isInitialRender.current;
};
