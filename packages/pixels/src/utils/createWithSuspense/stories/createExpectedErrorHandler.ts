import type { RootOptions } from 'react-dom/client';

/** Handles one deliberate story error and reports every other caught error */
const createExpectedErrorHandler = (
  expectedError: Error,
): NonNullable<RootOptions['onCaughtError']> => {
  return (error, errorInfo) => {
    if (error !== expectedError) {
      console.error(error, errorInfo);
    }
  };
};

export default createExpectedErrorHandler;
