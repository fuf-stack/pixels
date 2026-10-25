import type { VetoInstance } from '@fuf-stack/veto';

import { describe, expect, it, vi } from 'vitest';

import { useLayoutEffect } from 'react';
import { useController, useForm } from 'react-hook-form';

import { act, renderHook, waitFor } from '@testing-library/react';

import { array, objectLoose, string, veto } from '@fuf-stack/veto';

import { useExtendedValidation, useFormResolver } from './FormResolver';

// Exercise the resolver against RHF's real registration and disabled state.
const useRegisteredResolver = (
  validation: VetoInstance,
  name: string,
  disabled = true,
) => {
  const { control } = useForm();
  useController({ control, disabled, name });

  const state = useFormResolver(validation);
  const { bindControl } = state;

  useLayoutEffect(() => bindControl(control), [bindControl, control]);

  return state;
};

describe('useExtendedValidation', () => {
  it('returns undefined when no base and no client validation exists', () => {
    const { result } = renderHook(() => useExtendedValidation());

    expect(result.current.extendedValidation).toBeUndefined();
  });

  it('returns base validation unchanged when no client schema is registered', () => {
    const baseValidation = veto({
      username: string().min(5, 'Base: username is too short'),
    });

    const { result } = renderHook(() => useExtendedValidation(baseValidation));

    expect(result.current.extendedValidation).toBe(baseValidation);
  });

  it('builds client-only validation when no base validation is provided', () => {
    const { result } = renderHook(() => useExtendedValidation());

    act(() => {
      result.current.setClientValidationSchema(
        'client-username',
        objectLoose({
          username: string()
            .refine((value) => value !== 'abc', 'Client: username is reserved')
            .nullish(),
        }),
      );
    });

    const validationResult = result.current.extendedValidation?.validate({
      username: 'abc',
    });

    expect(result.current.extendedValidation).toBeDefined();
    expect(validationResult?.success).toBe(false);
    expect(validationResult?.errors?.username?.[0]?.message).toBe(
      'Client: username is reserved',
    );
  });

  it('combines multiple client schemas from different keys', () => {
    const { result } = renderHook(() => useExtendedValidation());

    act(() => {
      result.current.setClientValidationSchema(
        'client-username',
        objectLoose({
          username: string()
            .refine(() => false, 'Client: username failed')
            .nullish(),
        }),
      );
      result.current.setClientValidationSchema(
        'client-email',
        objectLoose({
          email: string()
            .refine(() => false, 'Client: email failed')
            .nullish(),
        }),
      );
    });

    const validationResult = result.current.extendedValidation?.validate({
      username: 'abc',
      email: 'a@b.c',
    });

    expect(validationResult?.success).toBe(false);
    expect(validationResult?.errors?.username?.[0]?.message).toBe(
      'Client: username failed',
    );
    expect(validationResult?.errors?.email?.[0]?.message).toBe(
      'Client: email failed',
    );
  });

  it('falls back to base validation when client schema is removed', () => {
    const baseValidation = veto({
      username: string().min(5, 'Base: username is too short'),
    });

    const { result } = renderHook(() => useExtendedValidation(baseValidation));

    act(() => {
      result.current.setClientValidationSchema(
        'client-username',
        objectLoose({
          username: string()
            .refine((value) => value !== 'abc', 'Client: username is reserved')
            .nullish(),
        }),
      );
    });
    expect(result.current.extendedValidation).not.toBe(baseValidation);

    act(() => {
      result.current.setClientValidationSchema('client-username', null);
    });
    expect(result.current.extendedValidation).toBe(baseValidation);
  });

  it('returns client validation errors before base validation errors', () => {
    const baseValidation = veto({
      username: string().min(5, 'Base: username is too short'),
    });

    const { result } = renderHook(() => useExtendedValidation(baseValidation));

    act(() => {
      result.current.setClientValidationSchema(
        'client-username',
        objectLoose({
          username: string()
            .refine((value) => value !== 'abc', 'Client: username is reserved')
            .nullish(),
        }),
      );
    });

    expect(result.current.extendedValidation).toBeDefined();
    expect(result.current.extendedValidation).not.toBe(baseValidation);

    const validationResult = result.current.extendedValidation?.validate({
      username: 'abc',
    });

    expect(validationResult?.success).toBe(false);
    expect(validationResult?.errors?.username).toBeDefined();
    expect(validationResult?.errors?.username?.[0]?.message).toBe(
      'Client: username is reserved',
    );
    expect(validationResult?.errors?.username?.[1]?.message).toBe(
      'Base: username is too short',
    );
  });

  it('passes validation when both client and base schemas are valid', () => {
    const baseValidation = veto({
      username: string().min(3),
    });

    const { result } = renderHook(() => useExtendedValidation(baseValidation));

    act(() => {
      result.current.setClientValidationSchema(
        'client-username',
        objectLoose({
          username: string()
            .refine(
              (value) => value !== 'admin',
              'Client: username is reserved',
            )
            .nullish(),
        }),
      );
    });

    const validationResult = result.current.extendedValidation?.validate({
      username: 'valid-user',
    });

    expect(validationResult?.success).toBe(true);
    expect(validationResult?.errors).toBeNull();
  });
});

describe('useFormResolver', () => {
  it('omits disabled input and schema defaults from output without changing stored values', async () => {
    const validation = veto({
      disabledField: string().default('schema default'),
      enabledField: string().trim(),
    });
    const validate = vi.spyOn(validation, 'validateAsync');
    const values = { disabledField: 'stored', enabledField: ' Ada ' };
    const { result } = renderHook(() =>
      useRegisteredResolver(validation, 'disabledField'),
    );
    await act(async () => {
      const resolved = await result.current.resolver?.(values);

      expect(resolved).toEqual({
        errors: {},
        values: { enabledField: 'Ada' },
      });
    });
    expect(validate).toHaveBeenLastCalledWith({ enabledField: ' Ada ' });
    expect(values).toEqual({ disabledField: 'stored', enabledField: ' Ada ' });
    const directValidation = validation.validate({ enabledField: 'Ada' });

    expect(directValidation.data).toEqual({
      disabledField: 'schema default',
      enabledField: 'Ada',
    });
  });

  it('maps disabled flat-array field names to normalized validation paths', async () => {
    const validation = veto({ tags: array(string().min(3).optional()) });
    const { result, rerender } = renderHook(
      ({ disabled }) =>
        useRegisteredResolver(validation, 'tags.0.__FLAT__', disabled),
      { initialProps: { disabled: true } },
    );
    await act(async () => {
      const resolved = await result.current.resolver?.({
        tags: [{ __FLAT__: 'x' }, { __FLAT__: 'valid' }],
      });
      expect(resolved).toEqual({
        errors: {},
        values: { tags: [undefined, 'valid'] },
      });
    });
    rerender({ disabled: false });
    await act(async () => {
      await result.current.resolver?.({
        tags: [{ __FLAT__: 'x' }, { __FLAT__: 'valid' }],
      });
    });
    expect(result.current.validationErrors).toBeDefined();
  });

  it('returns undefined resolver when no validation is provided', () => {
    const { result } = renderHook(() => useFormResolver());

    expect(result.current.resolver).toBeUndefined();
    expect(result.current.validationErrors).toBeUndefined();
    expect(result.current.validationErrorsHash).toBeUndefined();
  });

  it('stores resolver validation errors in state and clears them when valid', async () => {
    const validation = veto({
      name: string().min(3, 'Name is too short'),
    });

    const { result } = renderHook(() => useFormResolver(validation));

    await act(async () => {
      await result.current.resolver?.({ name: 'ab' });
    });

    await waitFor(() => {
      expect(result.current.validationErrors?.name?.[0]?.message).toBe(
        'Name is too short',
      );
      expect(result.current.validationErrorsHash).toBeDefined();
    });

    const invalidHash = result.current.validationErrorsHash;

    await act(async () => {
      await result.current.resolver?.({ name: 'ab' });
    });

    expect(result.current.validationErrorsHash).toBe(invalidHash);

    await act(async () => {
      await result.current.resolver?.({ name: 'abc' });
    });

    await waitFor(() => {
      expect(result.current.validationErrors).toBeUndefined();
      expect(result.current.validationErrorsHash).toBeUndefined();
    });
  });
});
