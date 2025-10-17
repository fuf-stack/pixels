import { expect, it } from 'vitest';

import v, { array, string } from 'src';

it('rejects non-array value', () => {
  const result = v({ arrayField: array(string()) }).validate({
    arrayField: { key: 'an object' },
  });
  expect(result).toStrictEqual({
    success: false,
    data: null,
    errors: {
      arrayField: {
        _errors: [
          {
            code: 'invalid_type',
            expected: 'array',
            message: 'Expected array, received object',
            received: 'object',
          },
        ],
      },
    },
  });
});

it('rejects invalid min length', () => {
  const result = v({ arrayField: array(string()).min(2) }).validate({
    arrayField: [],
  });
  expect(result).toStrictEqual({
    success: false,
    data: null,
    errors: {
      arrayField: {
        _errors: [
          {
            code: 'too_small',
            exact: false,
            inclusive: true,
            message: 'Array must contain at least 2 element(s)',
            minimum: 2,
            type: 'array',
          },
        ],
      },
    },
  });
});

it('rejects invalid max length', () => {
  const result = v({ arrayField: array(string()).max(1) }).validate({
    arrayField: ['one', 'two'],
  });
  expect(result).toStrictEqual({
    success: false,
    data: null,
    errors: {
      arrayField: {
        _errors: [
          {
            code: 'too_big',
            exact: false,
            inclusive: true,
            message: 'Array must contain at most 1 element(s)',
            maximum: 1,
            type: 'array',
          },
        ],
      },
    },
  });
});

it('rejects global array errors and element errors at the same time', () => {
  const result = v({ arrayField: array(string()).min(10) }).validate({
    arrayField: ['one', 2, 'three'],
  });
  expect(result).toMatchObject({
    success: false,
    data: null,
    errors: {
      arrayField: {
        '1': [{ code: 'invalid_type' }],
        _errors: [
          {
            code: 'too_small',
          },
        ],
      },
    },
  });
});

// INFO: this is used in forms to add new items to flat field arrays
it('rejects null array element with field is required error message', () => {
  const result = v({ arrayField: array(string()) }).validate({
    arrayField: ['one', null, 'three'],
  });
  expect(result).toMatchObject({
    success: false,
    data: null,
    errors: {
      arrayField: {
        '1': [
          {
            code: 'invalid_type',
            message: 'Field is required',
            expected: 'string',
            received: 'null',
          },
        ],
      },
    },
  });
});
