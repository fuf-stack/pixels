import { createMockedIcon } from './fa';

// re-export everything (else) unchanged
export * from 'react-icons/fa6';

// mock some used fa6 icons
export const FaBug = createMockedIcon('FaBug');
export const FaBullseye = createMockedIcon('FaBullseye');
