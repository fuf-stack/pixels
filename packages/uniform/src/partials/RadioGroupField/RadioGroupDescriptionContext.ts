import { createContext } from 'react';

/** Supporting message IDs inherited by each option */
const RadioGroupDescriptionContext = createContext<string | undefined>(
  undefined,
);

export default RadioGroupDescriptionContext;
