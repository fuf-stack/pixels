/* eslint-disable import-x/prefer-default-export */

import type { VetoError, VetoSchema, VetoSuccess } from '../src';

// eslint-disable-next-line import-x/no-extraneous-dependencies
import { expect, it } from 'vitest';

import v from '../src';

const NON_STRING_INPUTS = [true, 1, 1.1, [], {}];

interface StringCommonTestOptions {
  shouldReject?: string[];
  shouldRejectMessageStart?: string;
  shouldAllow?: string[];
}

export const stringCommon = (
  vSchema: VetoSchema,
  options: StringCommonTestOptions,
) => {
  const stringFieldName = Object.keys(vSchema)[0];

  it(`${stringFieldName} => rejects undefined input`, () => {
    // @ts-expect-error we are testings for this
    const result = v(vSchema).validate(undefined) as VetoError;
    expect(result).toHaveProperty('success', false);
    expect(result.errors[stringFieldName][0].code).toBe('invalid_type');
    expect(result.errors[stringFieldName][0].message).toMatch(
      'Field is required',
    );
  });

  it(`${stringFieldName} => rejects null input`, () => {
    // @ts-expect-error we are testings for this
    const result = v(vSchema).validate(null) as VetoError;
    expect(result).toHaveProperty('success', false);
    expect(result.errors[stringFieldName][0].code).toBe('invalid_type');
    expect(result.errors[stringFieldName][0].message).toMatch(
      'Field is required',
    );
  });

  NON_STRING_INPUTS.forEach((value) => {
    it(`${stringFieldName} => rejects non string input '${value}' of type '${typeof value}'`, () => {
      const result = v(vSchema).validate({ [stringFieldName]: value });
      expect(result).toHaveProperty('success', false);
      const { errors } = result as VetoError;
      expect(errors[stringFieldName][0].code).toBe('invalid_type');
      expect(errors[stringFieldName][0].message).toMatch(
        'Expected string, received',
      );
    });
  });

  options.shouldReject?.forEach((value) => {
    it(`${stringFieldName} => rejects invalid input '${value}'`, () => {
      const result = v(vSchema).validate({ [stringFieldName]: value });
      expect(result).toHaveProperty('success', false);

      const { errors } = result as VetoError;
      expect(errors[stringFieldName][0].code).toBe('custom');
      if (options.shouldRejectMessageStart) {
        expect(errors[stringFieldName][0].message).toMatch(
          options.shouldRejectMessageStart,
        );
      }
    });
  });

  options.shouldAllow?.forEach((value) => {
    it(`${stringFieldName} => allows valid input '${value}'`, () => {
      const result = v(vSchema).validate({ [stringFieldName]: value });
      expect(result).not.toHaveProperty('error');
      expect(result).toHaveProperty('success', true);

      const { data } = result as VetoSuccess<typeof vSchema>;
      expect(data).toStrictEqual({ [stringFieldName]: value });
    });
  });
};
