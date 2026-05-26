import type {
  VDiscriminatedUnion,
  VDiscriminatedUnionSchema,
} from './discriminatedUnion';

import { expect, expectTypeOf, it } from 'vitest';

import veto, {
  discriminatedUnion,
  literal,
  number,
  object,
  objectLoose,
  string,
} from 'src';

const schema = {
  discriminatedUnionField: discriminatedUnion('mode', [
    object({ mode: literal('STRING'), stringField: string() }),
    object({ mode: literal('NUMBER'), numberField: number() }),
  ]),
};

it('exposes discriminated union typing', () => {
  const union = discriminatedUnion('mode', [
    object({ mode: literal('STRING'), stringField: string() }),
    object({ mode: literal('NUMBER'), numberField: number() }),
  ]);
  const typedFactory: VDiscriminatedUnion = discriminatedUnion;
  const typedUnion: VDiscriminatedUnionSchema = union;

  expectTypeOf(typedFactory).toEqualTypeOf<VDiscriminatedUnion>();
  expectTypeOf(typedUnion).toEqualTypeOf<VDiscriminatedUnionSchema>();
  expectTypeOf(
    union.parse({ mode: 'STRING', stringField: 'ok' }),
  ).toEqualTypeOf<
    | { mode: 'STRING'; stringField: string }
    | { mode: 'NUMBER'; numberField: number }
  >();
  expect(union.safeParse({ mode: 'STRING', stringField: 'ok' }).success).toBe(
    true,
  );
});

it('rejects undefined discriminator', () => {
  const result = veto(schema).validate({
    discriminatedUnionField: {},
  });
  expect(result).toStrictEqual({
    success: false,
    data: null,
    errors: {
      discriminatedUnionField: {
        mode: [
          {
            // Zod v4 collapsed `invalid_union_discriminator` into `invalid_union`.
            code: 'invalid_union',
            message: 'Field is required',
            options: ['STRING', 'NUMBER'],
            received: 'undefined',
          },
        ],
      },
    },
  });
});

it('includes received value for invalid discriminator', () => {
  const result = veto(schema).validate({
    discriminatedUnionField: { mode: 'OTHER' },
  });

  expect(result).toStrictEqual({
    success: false,
    data: null,
    errors: {
      discriminatedUnionField: {
        mode: [
          {
            code: 'invalid_union',
            discriminator: 'mode',
            message:
              "Invalid discriminator value. Expected 'STRING' | 'NUMBER', received 'OTHER'",
            note: 'No matching discriminator',
            options: ['STRING', 'NUMBER'],
            received: 'OTHER',
          },
        ],
      },
    },
  });
});

it('rejects fields that are not defined in option', () => {
  const result = veto(schema).validate({
    discriminatedUnionField: { mode: 'STRING', numberField: 123 },
  });
  expect(result).toStrictEqual({
    success: false,
    data: null,
    errors: {
      discriminatedUnionField: {
        _errors: [
          {
            code: 'unrecognized_keys',
            keys: ['numberField'],
            message: "Unrecognized key(s) in object: 'numberField'",
          },
        ],
        stringField: [
          {
            code: 'invalid_type',
            expected: 'string',
            message: 'Field is required',
            received: 'undefined',
          },
        ],
      },
    },
  });
});

it('rejects unknown keys on the selected branch', () => {
  const branchSchema = {
    config: discriminatedUnion('enabled', [
      object({
        enabled: literal(false),
      }),
      object({
        enabled: literal(true),
        value: string(),
      }),
    ]),
  };

  const result = veto(branchSchema).validate({
    config: {
      enabled: false,
      value: 'unexpected',
    },
  });

  expect(result).toStrictEqual({
    success: false,
    data: null,
    errors: {
      config: {
        _errors: [
          {
            code: 'unrecognized_keys',
            keys: ['value'],
            message: "Unrecognized key(s) in object: 'value'",
          },
        ],
      },
    },
  });
});

it('treats generic branch objects as strict by default', () => {
  const strictSchema = {
    volumes: discriminatedUnion('databaseVendor', [
      object({
        databaseVendor: literal('MICROSOFT'),
        C: object({ extendSizeGb: number() }).optional(),
      }),
      object({
        databaseVendor: literal('MYSQL'),
        '/u01': object({ extendSizeGb: number() }).optional(),
      }),
    ]),
  };

  const result = veto(strictSchema).validate({
    volumes: {
      databaseVendor: 'MICROSOFT',
      C: { extendSizeGb: 100 },
      invalidKey: { extendSizeGb: 100 },
    },
  });

  expect(result).toStrictEqual({
    success: false,
    data: null,
    errors: {
      volumes: {
        _errors: [
          {
            code: 'unrecognized_keys',
            keys: ['invalidKey'],
            message: "Unrecognized key(s) in object: 'invalidKey'",
          },
        ],
      },
    },
  });
});

it('strips unknown keys when branch uses objectLoose', () => {
  const looseSchema = {
    volumes: discriminatedUnion('databaseVendor', [
      objectLoose({
        databaseVendor: literal('MICROSOFT'),
        C: object({ extendSizeGb: number() }).optional(),
      }),
      objectLoose({
        databaseVendor: literal('MYSQL'),
        '/u01': object({ extendSizeGb: number() }).optional(),
      }),
    ]),
  };

  const input = {
    volumes: {
      databaseVendor: 'MICROSOFT',
      C: { extendSizeGb: 100 },
      invalidKey: { extendSizeGb: 100 },
    },
  };
  const result = veto(looseSchema).validate(input);

  expect(result).toStrictEqual({
    success: true,
    data: {
      volumes: {
        databaseVendor: 'MICROSOFT',
        C: { extendSizeGb: 100 },
      },
    },
    errors: null,
  });
});

it('accepts valid option', () => {
  const data = {
    discriminatedUnionField: { mode: 'NUMBER', numberField: 123 },
  };
  const result = veto(schema).validate(data);
  expect(result).toStrictEqual({
    success: true,
    data,
    errors: null,
  });
});

it('keeps "Field is required" for nested missing discriminator', () => {
  const nestedSchema = {
    network: discriminatedUnion('zone', [
      object({ zone: literal('apz'), cidr: string() }),
      object({ zone: literal('dmz'), vlan: number() }),
    ]),
  };

  const result = veto(nestedSchema).validate({
    network: {},
  });

  expect(result).toStrictEqual({
    success: false,
    data: null,
    errors: {
      network: {
        zone: [
          {
            code: 'invalid_union',
            message: 'Field is required',
            options: ['apz', 'dmz'],
            received: 'undefined',
          },
        ],
      },
    },
  });
});

it('keeps unknown-key errors in array items with nested union errors', () => {
  const minimalSchema = {
    config: discriminatedUnion('enabled', [
      object({
        enabled: literal(false),
      }),
      object({
        enabled: literal(true),
        items: object({
          itemName: string(),
          itemFlag: number(),
          variant: discriminatedUnion('kind', [
            object({ kind: literal('A'), value: string() }),
            object({ kind: literal('B'), count: number() }),
          ]),
        })
          .array()
          .min(1),
      }),
    ]),
  };

  const result = veto(minimalSchema).validate({
    config: {
      enabled: true,
      items: [
        {
          variant: {},
          unknownBlock: {},
        },
      ],
    },
  });

  expect(result).toStrictEqual({
    success: false,
    data: null,
    errors: {
      config: {
        items: {
          0: {
            _errors: [
              {
                code: 'unrecognized_keys',
                keys: ['unknownBlock'],
                message: "Unrecognized key(s) in object: 'unknownBlock'",
              },
            ],
            itemFlag: [
              {
                code: 'invalid_type',
                expected: 'number',
                message: 'Field is required',
                received: 'undefined',
              },
            ],
            itemName: [
              {
                code: 'invalid_type',
                expected: 'string',
                message: 'Field is required',
                received: 'undefined',
              },
            ],
            variant: {
              kind: [
                {
                  code: 'invalid_union',
                  message: 'Field is required',
                  options: ['A', 'B'],
                  received: 'undefined',
                },
              ],
            },
          },
        },
      },
    },
  });
});
