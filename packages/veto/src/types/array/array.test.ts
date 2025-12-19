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
            message: 'Invalid input: expected array, received object',
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
            inclusive: true,
            message: 'Too small: expected array to have >=2 items',
            minimum: 2,
            origin: 'array',
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
            inclusive: true,
            message: 'Too big: expected array to have <=1 items',
            maximum: 1,
            origin: 'array',
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
