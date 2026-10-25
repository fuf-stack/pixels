import type * as PixelUtils from '@fuf-stack/pixel-utils';
import type { VetoInstance } from '@fuf-stack/veto';
import type * as FormContext from '../../hooks/useFormContext';
import type { UniformField } from '../../hooks/useUniformField/types';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { act, renderHook } from '@testing-library/react';

import { object, string, veto } from '@fuf-stack/veto';

import { useFormContext } from '../../hooks/useFormContext';
import useFieldCardValidation from './useFieldCardValidation';

vi.mock('../../hooks/useFormContext', async (importOriginal) => ({
  ...(await importOriginal<typeof FormContext>()),
  useFormContext: vi.fn(),
}));

// exercise the real debounce instead of the snapshot shortcut
vi.mock('@fuf-stack/pixel-utils', async (importOriginal) => ({
  ...(await importOriginal<typeof PixelUtils>()),
  isTestEnvironment: () => false,
}));

const schema = veto({
  profile: object({
    email: string(),
    nickname: string().optional(),
  }),
  profileExtra: object({ email: string() }),
});

let context: {
  control: { _names: { mount: Set<string> } };
  formState: { submitCount: number; touchedFields: Record<string, unknown> };
  validation?: { baseInstance?: VetoInstance; instance?: VetoInstance };
};

// group errors retain their nested runtime shape in the field contract
const fieldWithError = (error: unknown, name = 'profile') => ({
  error: error as UniformField['error'],
  name,
});

describe('useFieldCardValidation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    context = {
      control: { _names: { mount: new Set() } },
      formState: { submitCount: 0, touchedFields: {} },
      validation: { instance: schema },
    };
    vi.mocked(useFormContext).mockImplementation(
      () => context as unknown as ReturnType<typeof useFormContext>,
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('derives required state only from registered children and updates after unregistration', () => {
    context.control._names.mount = new Set([
      'profile.nickname',
      'profileExtra.email',
    ]);
    const { result, rerender } = renderHook(() =>
      useFieldCardValidation(fieldWithError(undefined)),
    );
    expect(result.current.required).toBe(false);

    context.control._names.mount.add('profile.email');
    rerender();
    expect(result.current.required).toBe(true);

    context.control._names.mount.delete('profile.email');
    rerender();
    expect(result.current.required).toBe(false);
  });

  it('prefers the base schema when the active schema makes children optional', () => {
    context.control._names.mount.add('profile.email');
    context.validation = {
      baseInstance: schema,
      instance: veto({ profile: object({ email: string().optional() }) }),
    };
    const { result } = renderHook(() =>
      useFieldCardValidation(fieldWithError(undefined)),
    );
    expect(result.current.required).toBe(true);
  });

  it('is optional without a validation schema', () => {
    context.control._names.mount.add('profile.email');
    context.validation = undefined;
    const { result } = renderHook(() =>
      useFieldCardValidation(fieldWithError(undefined)),
    );
    expect(result.current).toEqual({ invalid: false, required: false });
  });

  it.each([
    {
      label: 'untouched child',
      error: { email: ['Required'] },
      touched: {},
      submitted: 0,
      invalid: false,
    },
    {
      label: 'touched invalid child',
      error: { email: ['Required'] },
      touched: { email: true },
      submitted: 0,
      invalid: true,
    },
    {
      label: 'touched valid sibling',
      error: { email: ['Required'] },
      touched: { nickname: true },
      submitted: 0,
      invalid: false,
    },
    {
      label: 'submitted child',
      error: { email: ['Required'] },
      touched: {},
      submitted: 1,
      invalid: true,
    },
    {
      label: 'untouched object error',
      error: { _errors: ['Incomplete'] },
      touched: {},
      submitted: 0,
      invalid: false,
    },
    {
      label: 'touched object error',
      error: { _errors: ['Incomplete'] },
      touched: { nickname: true },
      submitted: 0,
      invalid: true,
    },
    {
      label: 'submitted object error',
      error: { _errors: ['Incomplete'] },
      touched: {},
      submitted: 1,
      invalid: true,
    },
    {
      label: 'object error with an untouched invalid child',
      error: { _errors: ['Incomplete'], email: ['Required'] },
      touched: { nickname: true },
      submitted: 0,
      invalid: false,
    },
    {
      label: 'no errors after submission',
      error: undefined,
      touched: { email: true },
      submitted: 1,
      invalid: false,
    },
  ])('handles $label', ({ error, touched, submitted, invalid }) => {
    context.formState = {
      submitCount: submitted,
      touchedFields: { profile: touched },
    };
    const { result } = renderHook(() =>
      useFieldCardValidation(fieldWithError(error)),
    );
    expect(result.current.invalid).toBe(invalid);
  });

  it('resolves touched children under a dotted array path', () => {
    context.formState.touchedFields = {
      people: [{ contact: { email: true } }],
    };
    const { result } = renderHook(() =>
      useFieldCardValidation(
        fieldWithError({ email: ['Required'] }, 'people.0.contact'),
      ),
    );
    expect(result.current.invalid).toBe(true);
  });

  it('debounces visibility changes and cancels stale validation updates', () => {
    const { result, rerender } = renderHook(() =>
      useFieldCardValidation(fieldWithError({ email: ['Required'] })),
    );
    context.formState.touchedFields = { profile: { email: true } };
    rerender();
    act(() => {
      vi.advanceTimersByTime(199);
    });
    expect(result.current.invalid).toBe(false);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.invalid).toBe(true);

    context.formState.touchedFields = {};
    rerender();
    act(() => {
      vi.advanceTimersByTime(100);
    });
    context.formState.touchedFields = { profile: { email: true } };
    rerender();
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current.invalid).toBe(true);

    context.formState.touchedFields = {};
    rerender();
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current.invalid).toBe(false);
  });
});
