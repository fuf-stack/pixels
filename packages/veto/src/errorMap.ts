import type { VetoErrorMap } from './types';

import { z } from 'zod';

import { issueCodes } from './issueCodes';

// global zod error map
// see: https://zod.dev/ERROR_HANDLING?id=global-error-map
const exErrorMap: VetoErrorMap = (issue, ctx) => {
  /*
  This is where you override the various error codes
  */
  switch (issue.code) {
    // set message to field is required for null and undefined fields
    case issueCodes.invalid_type:
      if (issue.received === 'null' || issue.received === 'undefined') {
        return { message: 'Field is required' };
      }
      return { message: ctx.defaultError };

    // improve error message of discriminated unions, when field is undefined
    case issueCodes.invalid_union_discriminator:
      // eslint-disable-next-line no-case-declarations
      const received = issue.path.reduce((acc, c) => {
        return acc?.[c];
      }, ctx.data);
      if (received === undefined) {
        return { message: 'Field is required' };
      }
      return { message: ctx.defaultError };

    default:
      // fall back to default message!
      return { message: ctx.defaultError };
  }
};

// set custom error map
z.setErrorMap(exErrorMap);
