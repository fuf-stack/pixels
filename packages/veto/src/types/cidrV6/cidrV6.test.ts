/* eslint-disable vitest/expect-expect */

import type { VCidrV6Schema } from './cidrV6';

import { describe, expect, expectTypeOf, it } from 'vitest';

import veto, { cidrV6 } from 'src';

it('exposes cidrv6 schema typing', () => {
  const schema = cidrV6();
  const refined = schema.default('::/0');

  expectTypeOf(cidrV6).returns.toEqualTypeOf<VCidrV6Schema>();
  expectTypeOf(schema).toEqualTypeOf<VCidrV6Schema>();
  expectTypeOf(refined.parse(undefined)).toEqualTypeOf<string>();
});

it('rejects non-string value', () => {
  const schema = { cidrField: cidrV6() };
  const result = veto(schema).validate({ cidrField: 42 });
  expect(result).toMatchObject({
    success: false,
    data: null,
    errors: {
      cidrField: [{ code: 'invalid_type' }],
    },
  });
});

it('rejects malformed cidrv6 string', () => {
  const schema = { cidrField: cidrV6() };
  const result = veto(schema).validate({ cidrField: 'not-a-cidr' });
  expect(result).toMatchObject({
    success: false,
    data: null,
    errors: {
      cidrField: [
        {
          code: 'invalid_format',
          format: 'cidrv6',
          message: 'Invalid IPv6 range',
        },
      ],
    },
  });
});

it('can be optional', () => {
  const schema = { cidrField: cidrV6().optional() };
  const result = veto(schema).validate({});
  expect(result).toStrictEqual({
    success: true,
    data: {},
    errors: null,
  });
});

describe('accepts valid cidrv6 ranges', () => {
  const validRanges = [
    '::/0',
    '::1/128',
    '2001:db8::/32',
    'fe80::/10',
  ];

  validRanges.forEach((value) => {
    it(`accepts '${value}'`, () => {
      const schema = { cidrField: cidrV6() };
      const result = veto(schema).validate({ cidrField: value });
      expect(result).toStrictEqual({
        success: true,
        data: { cidrField: value },
        errors: null,
      });
    });
  });
});

describe('rejects invalid cidrv6 ranges', () => {
  const invalidRanges = [
    '2001:db8::',
    '2001:db8::/129',
    'gggg::/32',
    '192.168.1.0/24',
    '',
  ];

  invalidRanges.forEach((value) => {
    it(`rejects '${value}'`, () => {
      const schema = { cidrField: cidrV6() };
      const result = veto(schema).validate({ cidrField: value });
      expect(result.success).toBe(false);
    });
  });
});
