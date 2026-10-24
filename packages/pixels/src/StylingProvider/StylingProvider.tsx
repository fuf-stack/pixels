import type { Styling } from '@fuf-stack/pixel-utils';
import type { ReactNode } from 'react';

import { createContext, useContext } from 'react';

import { defaultStyling } from '@fuf-stack/pixel-utils';

const StylingContext = createContext<Styling>(defaultStyling);

export interface StylingProviderProps {
  children: ReactNode;
  styling: Styling;
}

/** Share an immutable styling instance with descendants, including React portals. */
export const StylingProvider = ({
  children,
  styling,
}: StylingProviderProps) => {
  return (
    <StylingContext.Provider value={styling}>
      {children}
    </StylingContext.Provider>
  );
};

export const useStyling = (): Styling => {
  return useContext(StylingContext);
};
