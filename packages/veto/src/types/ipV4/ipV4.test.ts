/* eslint-disable vitest/expect-expect */

import type { VIpV4Schema } from './ipV4';

import { describe, expect, expectTypeOf, it } from 'vitest';

import veto, { ipV4 } from 'src';

it('exposes ipv4 schema typing', () => {
  const schema = ipV4();
  const refined = schema.default('127.0.0.1');

  expectTypeOf(ipV4).returns.toEqualTypeOf<VIpV4Schema>();
  expectTypeOf(schema).toEqualTypeOf<VIpV4Schema>();
  expectTypeOf(refined.parse(undefined)).toEqualTypeOf<string>();
});

it('rejects non-string value', () => {
  const schema = { ipv4Field: ipV4() };
  const result = veto(schema).validate({ ipv4Field: 42 });
  expect(result).toMatchObject({
    success: false,
    data: null,
    errors: {
      ipv4Field: [{ code: 'invalid_type' }],
    },
  });
});

it('rejects malformed ipv4 string', () => {
  const schema = { ipv4Field: ipV4() };
  const result = veto(schema).validate({ ipv4Field: 'not-an-ip' });
  expect(result).toMatchObject({
    success: false,
    data: null,
    errors: {
      ipv4Field: [
        {
          code: 'invalid_format',
          format: 'ipv4',
          message: 'Invalid IPv4 address',
        },
      ],
    },
  });
});

it('can be optional', () => {
  const schema = { ipv4Field: ipV4().optional() };
  const result = veto(schema).validate({});
  expect(result).toStrictEqual({
    success: true,
    data: {},
    errors: null,
  });
});

describe('accepts valid ipv4 addresses', () => {
  const validAddresses = [
    '127.0.0.1',
    '0.0.0.0',
    '192.168.1.1',
    '255.255.255.255',
  ];

  validAddresses.forEach((value) => {
    it(`accepts '${value}'`, () => {
      const schema = { ipv4Field: ipV4() };
      const result = veto(schema).validate({ ipv4Field: value });
      expect(result).toStrictEqual({
        success: true,
        data: { ipv4Field: value },
        errors: null,
      });
    });
  });
});

describe('rejects invalid ipv4 addresses', () => {
  const invalidAddresses = [
    '256.0.0.1',
    '1.2.3',
    '1.2.3.4.5',
    '::1',
    '192.168.1.0/24',
    '',
  ];

  invalidAddresses.forEach((value) => {
    it(`rejects '${value}'`, () => {
      const schema = { ipv4Field: ipV4() };
      const result = veto(schema).validate({ ipv4Field: value });
      expect(result.success).toBe(false);
    });
  });
});
