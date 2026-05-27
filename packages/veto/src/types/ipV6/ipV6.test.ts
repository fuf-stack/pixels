/* eslint-disable vitest/expect-expect */

import type { VIpV6Schema } from './ipV6';

import { describe, expect, expectTypeOf, it } from 'vitest';

import veto, { ipV6 } from 'src';

it('exposes ipv6 schema typing', () => {
  const schema = ipV6();
  const refined = schema.default('::1');

  expectTypeOf(ipV6).returns.toEqualTypeOf<VIpV6Schema>();
  expectTypeOf(schema).toEqualTypeOf<VIpV6Schema>();
  expectTypeOf(refined.parse(undefined)).toEqualTypeOf<string>();
});

it('rejects non-string value', () => {
  const schema = { ipv6Field: ipV6() };
  const result = veto(schema).validate({ ipv6Field: 42 });
  expect(result).toMatchObject({
    success: false,
    data: null,
    errors: {
      ipv6Field: [{ code: 'invalid_type' }],
    },
  });
});

it('rejects malformed ipv6 string', () => {
  const schema = { ipv6Field: ipV6() };
  const result = veto(schema).validate({ ipv6Field: 'not-an-ip' });
  expect(result).toMatchObject({
    success: false,
    data: null,
    errors: {
      ipv6Field: [
        {
          code: 'invalid_format',
          format: 'ipv6',
          message: 'Invalid IPv6 address',
        },
      ],
    },
  });
});

it('can be optional', () => {
  const schema = { ipv6Field: ipV6().optional() };
  const result = veto(schema).validate({});
  expect(result).toStrictEqual({
    success: true,
    data: {},
    errors: null,
  });
});

describe('accepts valid ipv6 addresses', () => {
  const validAddresses = [
    '::1',
    '::',
    '2001:db8::1',
    '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
    'fe80::1',
  ];

  validAddresses.forEach((value) => {
    it(`accepts '${value}'`, () => {
      const schema = { ipv6Field: ipV6() };
      const result = veto(schema).validate({ ipv6Field: value });
      expect(result).toStrictEqual({
        success: true,
        data: { ipv6Field: value },
        errors: null,
      });
    });
  });
});

describe('rejects invalid ipv6 addresses', () => {
  const invalidAddresses = [
    '127.0.0.1',
    '2001:db8:::1',
    'gggg::1',
    '2001:db8::/32',
    '',
  ];

  invalidAddresses.forEach((value) => {
    it(`rejects '${value}'`, () => {
      const schema = { ipv6Field: ipV6() };
      const result = veto(schema).validate({ ipv6Field: value });
      expect(result.success).toBe(false);
    });
  });
});
