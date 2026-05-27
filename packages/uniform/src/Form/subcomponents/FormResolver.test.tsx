import { describe, expect, it } from 'vitest';

import { act, renderHook } from '@testing-library/react';

import { objectLoose, string, veto } from '@fuf-stack/veto';

import { useExtendedValidation, useFormResolver } from './FormResolver';

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
  it('returns undefined resolver when no validation is provided', () => {
    const { result } = renderHook(() => useFormResolver(undefined));

    expect(result.current.resolver).toBeUndefined();
    expect(result.current.validationErrors).toBeUndefined();
    expect(result.current.validationErrorsHash).toBeUndefined();
  });
});
