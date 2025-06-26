import { beforeEach, describe, expect, it, vi } from 'vitest';

// TODO: not sure why we have to import veto src here
import v, * as vt from '@fuf-stack/veto/src/index';

import { checkFieldIsRequired, useFormContext } from './useFormContext';

describe('checkFieldIsRequired', () => {
  it('required flat', () => {
    const validation = v({
      name: vt.string(),
    });
    const fieldPath = ['name']; // `arrayField[0].name`;
    const result = checkFieldIsRequired(validation, fieldPath);
    expect(result).toBe(true);
  });

  it('optional flat', () => {
    const validation = v({
      name: vt.string().optional(),
    });
    const fieldPath = ['name']; // `arrayField[0].name`;
    const result = checkFieldIsRequired(validation, fieldPath);
    expect(result).toBe(false);
  });

  it('optional nullable', () => {
    const validation = v({
      name: vt.string().optional().nullable(),
    });
    const fieldPath = ['name']; // `arrayField[0].name`;
    const result = checkFieldIsRequired(validation, fieldPath);
    expect(result).toBe(false);
  });

  it('nullable optional', () => {
    const validation = v({
      name: vt.string().nullable().optional(),
    });
    const fieldPath = ['name']; // `arrayField[0].name`;
    const result = checkFieldIsRequired(validation, fieldPath);
    expect(result).toBe(false);
  });

  it('required object with optional field', () => {
    const validation = v({
      object: vt.object({ name: vt.string().optional() }),
    });

    // field in the object is optional
    let fieldPath = ['object', 'name'];
    let result = checkFieldIsRequired(validation, fieldPath);
    expect(result).toBe(false);

    // object required
    fieldPath = ['object'];
    result = checkFieldIsRequired(validation, fieldPath);
    expect(result).toBe(true);
  });

  it('optional object with required field', () => {
    const validation = v({
      object: vt.object({ name: vt.string() }).optional(),
    });

    // field in the object is required
    let fieldPath = ['object', 'name'];
    let result = checkFieldIsRequired(validation, fieldPath);
    expect(result).toBe(true);

    // object is optional
    fieldPath = ['object'];
    result = checkFieldIsRequired(validation, fieldPath);
    expect(result).toBe(false);
  });

  it('required array with optional field', () => {
    const validation = v({
      arrayField: vt
        .object({
          name: vt.string().optional(),
        })
        .array(),
    });

    // field in the array is optional
    let fieldPath = ['arrayField', '0', 'name'];
    let result = checkFieldIsRequired(validation, fieldPath);
    expect(result).toBe(false);

    // array is required
    fieldPath = ['arrayField'];
    result = checkFieldIsRequired(validation, fieldPath);
    expect(result).toBe(true);
  });

  it('optional array with required field', () => {
    const validation = v({
      arrayField: vt
        .object({
          name: vt.string(),
        })
        .array()
        .optional(),
    });

    // field in the array is required
    let fieldPath = ['arrayField', 'name'];
    let result = checkFieldIsRequired(validation, fieldPath);
    expect(result).toBe(true);

    // array is optional
    fieldPath = ['arrayField'];
    result = checkFieldIsRequired(validation, fieldPath);
    expect(result).toBe(false);
  });

  it('not found', () => {
    const validation = v({
      name: vt.string(),
    });
    const fieldPath = ['waitWhat']; // `arrayField[0].name`;
    const result = checkFieldIsRequired(validation, fieldPath);
    expect(result).toBe(false);
  });

  it('refine array with required fields in object', () => {
    const validation = v({
      refineArray: vt.refineArray(vt.array(vt.object({ name: vt.string() })))({
        unique: {
          elementMessage: 'Contains duplicate places',
          mapFn: (val) => {
            return val?.place;
          },
          elementErrorPath: ['place'],
        },
      }),
    });

    // field in the array is required
    let fieldPath = ['refineArray', 'name'];
    let result = checkFieldIsRequired(validation, fieldPath);
    expect(result).toBe(true);

    // object required
    fieldPath = ['refineArray'];
    result = checkFieldIsRequired(validation, fieldPath);
    expect(result).toBe(true);
  });

  it('Intersection with fieldName', () => {
    const validation = v({
      andField: vt
        .and(
          vt.object({ left: vt.string() }),
          vt.object({ right: vt.number().optional() }),
        )
        .optional(),
    });

    let fieldPath = ['andField', 'left'];
    let result = checkFieldIsRequired(validation, fieldPath);
    expect(result).toBe(true);

    fieldPath = ['andField', 'right'];
    result = checkFieldIsRequired(validation, fieldPath);
    expect(result).toBe(false);

    fieldPath = ['andField'];
    result = checkFieldIsRequired(validation, fieldPath);
    expect(result).toBe(false);
  });

  it('Intersection v1', () => {
    const validation = v(
      vt.and(
        vt.object({ left: vt.string() }),
        vt.object({ right: vt.number().optional() }),
      ),
    );
    // field in the array is required
    let fieldPath = ['left'];
    let result = checkFieldIsRequired(validation, fieldPath);
    expect(result).toBe(true);

    // object required
    fieldPath = ['right'];
    result = checkFieldIsRequired(validation, fieldPath);
    expect(result).toBe(false);
  });

  it('Intersection v2', () => {
    const validation1 = vt.object({
      nameUri: vt.string().optional(),
    });

    const validation2 = vt.object({
      name: vt
        .string()
        .max(256)
        .regex(
          /^[0-9a-z ]+$/i,
          'Name can only contain alphanumeric characters and spaces',
        ),
      description: vt.string({ min: 0 }).max(256),
    });

    const validation = v(vt.and(validation2, validation1));

    let fieldPath = ['nameUri'];
    let result = checkFieldIsRequired(validation, fieldPath);
    expect(result).toBe(false);

    fieldPath = ['name'];
    result = checkFieldIsRequired(validation, fieldPath);
    expect(result).toBe(true);
  });

  it('FieldArray', () => {
    const validation = v({
      fieldArray: vt
        .array(
          vt
            .object({
              name: vt
                .string()
                .regex(
                  /^[a-z0-9\s]+$/i,
                  'Must only contain alphanumeric characters and spaces.',
                )
                .min(8),
            })
            .refine(() => false, {
              message: 'Custom error at the object level 1.',
            })
            .refine(() => false, {
              message: 'Custom error at the object level 2.',
            }),
        )
        .min(3),
    });

    const fieldName1 = ['fieldArray'];
    const result1 = checkFieldIsRequired(validation, fieldName1);
    expect(result1).toBe(true);

    const fieldName2 = ['fieldArray', 'name'];
    const result2 = checkFieldIsRequired(validation, fieldName2);
    expect(result2).toBe(true);
  });
});

// Mock the dependencies outside of the describe block
const mockGetValues = vi.fn();
const mockWatch = vi.fn();
const mockSubscribe = vi.fn();
const mockGetFieldState = vi.fn();

vi.mock('react-hook-form', () => ({
  useFormContext: () => ({
    getValues: mockGetValues,
    watch: mockWatch,
    subscribe: mockSubscribe,
    getFieldState: mockGetFieldState,
    formState: { isDirty: false },
  }),
}));

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(actual as any),
    useContext: () => ({
      validation: { instance: null },
    }),
  };
});

describe('useFormContext nullish string conversion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getValues converts nullish strings and filters empty values', () => {
    // Mock getValues to return form data with nullish string markers
    mockGetValues.mockReturnValue({
      searchField: '__NULL__',
      activeField: '__FALSE__',
      countField: '__ZERO__',
      normalField: 'test',
      emptyString: '',
      nullValue: null,
    });

    const { getValues } = useFormContext();
    const result = getValues();

    expect(result).toEqual({
      normalField: 'test',
      countField: 0,
      activeField: false,
    });
    expect(result).not.toHaveProperty('searchField');
    expect(result).not.toHaveProperty('emptyString');
    expect(result).not.toHaveProperty('nullValue');
  });

  it('watch converts nullish strings and filters empty values', () => {
    // Mock watch to return form data with nullish string markers
    mockWatch.mockReturnValue({
      searchField: '__NULL__',
      activeField: '__FALSE__',
      countField: '__ZERO__',
      normalField: 'test',
    });

    const { watch } = useFormContext();
    const result = watch();

    expect(result).toEqual({
      normalField: 'test',
      countField: 0,
      activeField: false,
    });
    expect(result).not.toHaveProperty('searchField');
  });

  it('subscribe wraps callback to convert nullish strings', () => {
    const mockUnsubscribe = vi.fn();
    mockSubscribe.mockReturnValue(mockUnsubscribe);

    const { subscribe } = useFormContext();
    const originalCallback = vi.fn();

    const options = {
      formState: { values: true },
      callback: originalCallback,
    };

    const unsubscribe = subscribe(options);

    // Verify subscribe was called with wrapped options
    expect(mockSubscribe).toHaveBeenCalledWith(
      expect.objectContaining({
        formState: { values: true },
        callback: expect.any(Function),
      }),
    );

    // Get the wrapped callback that was passed to the original subscribe
    const wrappedCallback = mockSubscribe.mock.calls[0][0].callback;

    // Simulate the form state with nullish string markers
    const formState = {
      values: {
        searchField: '__NULL__',
        activeField: '__FALSE__',
        countField: '__ZERO__',
        normalField: 'test',
      },
      isDirty: true,
    };

    // Call the wrapped callback
    wrappedCallback(formState);

    // Verify the original callback received converted values
    expect(originalCallback).toHaveBeenCalledWith({
      values: {
        normalField: 'test',
        countField: 0,
        activeField: false,
      },
      isDirty: true,
    });

    expect(unsubscribe).toBe(mockUnsubscribe);
  });

  it('subscribe handles options without callback', () => {
    const mockUnsubscribe = vi.fn();
    mockSubscribe.mockReturnValue(mockUnsubscribe);

    const { subscribe } = useFormContext();
    const callback = vi.fn();

    // Call subscribe with minimal options
    const unsubscribe = subscribe({
      formState: { values: true },
      callback,
    });

    // Should pass through with wrapped callback
    expect(mockSubscribe).toHaveBeenCalledWith(
      expect.objectContaining({
        formState: { values: true },
        callback: expect.any(Function),
      }),
    );
    expect(unsubscribe).toBe(mockUnsubscribe);
  });

  it('getValues with specific field names', () => {
    mockGetValues.mockReturnValue(['__NULL__', '__FALSE__', 'test']);

    const { getValues } = useFormContext();
    const result = getValues(['field1', 'field2', 'field3']);

    expect(result).toEqual([null, false, 'test']);
  });
});
