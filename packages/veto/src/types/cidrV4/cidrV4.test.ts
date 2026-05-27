/* eslint-disable vitest/expect-expect */

import type { VCidrV4Schema } from './cidrV4';

import { describe, expect, expectTypeOf, it } from 'vitest';

import veto, { cidrV4 } from 'src';

it('exposes cidrv4 schema typing', () => {
  const schema = cidrV4();
  const refined = schema.default('10.0.0.0/8');

  expectTypeOf(cidrV4).returns.toEqualTypeOf<VCidrV4Schema>();
  expectTypeOf(schema).toEqualTypeOf<VCidrV4Schema>();
  expectTypeOf(refined.parse(undefined)).toEqualTypeOf<string>();
});

it('rejects non-string value', () => {
  const schema = { cidrField: cidrV4() };
  const result = veto(schema).validate({ cidrField: 42 });
  expect(result).toMatchObject({
    success: false,
    data: null,
    errors: {
      cidrField: [{ code: 'invalid_type' }],
    },
  });
});

it('rejects malformed cidrv4 string', () => {
  const schema = { cidrField: cidrV4() };
  const result = veto(schema).validate({ cidrField: 'not-a-cidr' });
  expect(result).toMatchObject({
    success: false,
    data: null,
    errors: {
      cidrField: [
        {
          code: 'invalid_format',
          format: 'cidrv4',
          message: 'Invalid IPv4 range',
        },
      ],
    },
  });
});

it('can be optional', () => {
  const schema = { cidrField: cidrV4().optional() };
  const result = veto(schema).validate({});
  expect(result).toStrictEqual({
    success: true,
    data: {},
    errors: null,
  });
});

describe('accepts valid cidrv4 ranges', () => {
  const validRanges = [
    '0.0.0.0/0',
    '10.0.0.0/8',
    '192.168.1.0/24',
    '127.0.0.1/32',
  ];

  validRanges.forEach((value) => {
    it(`accepts '${value}'`, () => {
      const schema = { cidrField: cidrV4() };
      const result = veto(schema).validate({ cidrField: value });
      expect(result).toStrictEqual({
        success: true,
        data: { cidrField: value },
        errors: null,
      });
    });
  });
});

describe('rejects invalid cidrv4 ranges', () => {
  const invalidRanges = [
    '192.168.1.0',
    '192.168.1.0/33',
    '256.0.0.0/8',
    '2001:db8::/32',
    '',
  ];

  invalidRanges.forEach((value) => {
    it(`rejects '${value}'`, () => {
      const schema = { cidrField: cidrV4() };
      const result = veto(schema).validate({ cidrField: value });
      expect(result.success).toBe(false);
    });
  });
});
