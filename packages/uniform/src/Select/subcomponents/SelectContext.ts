import type { HTMLAttributes } from 'react';

import { createContext } from 'react';

/** Resolved slot classes shared with the select's engine adapters */
export const SelectSlotContext = createContext<Record<string, string>>({});

/** Native input associations supplied by the field binding */
export const SelectControlContext = createContext<
  HTMLAttributes<HTMLInputElement>
>({});
