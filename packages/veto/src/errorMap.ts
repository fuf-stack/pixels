import { z } from 'zod';

import { issueCodes } from './issueCodes';

// Global zod error configuration using Zod v4's z.config()
// see: https://zod.dev/error-customization
z.config({
  customError: (issue) => {
    /*
    This is where you override the various error codes.
    In Zod v4, check `issue.input` to detect undefined/null values.
    */
    switch (issue.code) {
      // set message to field is required for null and undefined fields
      case issueCodes.invalid_type:
        if (issue.input === null || issue.input === undefined) {
          return 'Field is required';
        }
        return undefined; // Use default error message

      // improve error message of discriminated unions, when field is undefined
      // In Zod v4, invalid_union_discriminator is now invalid_union
      case issueCodes.invalid_union:
        // Check if this is due to an undefined/null discriminator
        if (issue.input === undefined || issue.input === null) {
          return 'Field is required';
        }
        return undefined; // Use default error message

      // handle enum/literal fields when empty - show "Field is required" instead of
      // "Invalid option: expected one of..." when the input is undefined, null, or empty string
      case issueCodes.invalid_value:
        if (
          issue.input === undefined ||
          issue.input === null ||
          issue.input === ''
        ) {
          return 'Field is required';
        }
        return undefined; // Use default error message

      default:
        // Return undefined to use default message
        return undefined;
    }
  },
});
