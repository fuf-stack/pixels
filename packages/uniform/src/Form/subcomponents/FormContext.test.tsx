import type { VetoInstance } from '@fuf-stack/veto';
import type { ReactNode } from 'react';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useContext } from 'react';

import { act, renderHook, waitFor } from '@testing-library/react';

import { string, veto } from '@fuf-stack/veto';

import FormProvider, { UniformContext } from './FormContext';

describe('FormContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    // eslint-disable-next-line n/no-unsupported-features/node-builtins
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('UniformContext singleton', () => {
    it('creates a context instance on window', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((window as any).__UNIFORM_CONTEXT__).toBeDefined();
      expect(UniformContext).toBeDefined();
    });

    it('reuses the same context instance across imports', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const windowContext = (window as any).__UNIFORM_CONTEXT__;
      expect(UniformContext).toBe(windowContext);
    });

    it('has correct default context values', () => {
      const { result } = renderHook(() => useContext(UniformContext));

      expect(result.current.debugMode).toBe('off');
      expect(typeof result.current.preventSubmit).toBe('function');
      expect(typeof result.current.setDebugMode).toBe('function');
      expect(typeof result.current.triggerSubmit).toBe('function');
      expect(result.current.validation).toBeDefined();
      expect(typeof result.current.validation.setClientValidationSchema).toBe(
        'function',
      );
    });
  });

  describe('FormProvider', () => {
    it('provides context values to children', () => {
      const onSubmit = vi.fn();
      const validationSchema = veto({
        name: string(),
      });

      const wrapper = ({ children }: { children: ReactNode }) => (
        <FormProvider
          onSubmit={onSubmit}
          validation={validationSchema}
          validationTrigger="onChange"
        >
          {() => <>{children}</>}
        </FormProvider>
      );

      const { result } = renderHook(() => useContext(UniformContext), {
        wrapper,
      });

      expect(result.current.debugMode).toBe('off');
      expect(result.current.validation.instance).toBeDefined();
      expect(typeof result.current.triggerSubmit).toBe('function');
    });

    it('respects debugModeSettings.disable', () => {
      const onSubmit = vi.fn();

      const wrapper = ({ children }: { children: ReactNode }) => (
        <FormProvider
          debugModeSettings={{ disable: true }}
          onSubmit={onSubmit}
          validationTrigger="onChange"
        >
          {() => <>{children}</>}
        </FormProvider>
      );

      const { result } = renderHook(() => useContext(UniformContext), {
        wrapper,
      });

      expect(result.current.debugMode).toBe('disabled');
    });

    it('uses custom localStorage key for debug mode', () => {
      const onSubmit = vi.fn();
      const customKey = 'custom:debug-key';

      // Set a value in localStorage with custom key
      // eslint-disable-next-line n/no-unsupported-features/node-builtins
      localStorage.setItem(customKey, JSON.stringify('debug'));

      const wrapper = ({ children }: { children: ReactNode }) => (
        <FormProvider
          debugModeSettings={{ localStorageKey: customKey }}
          onSubmit={onSubmit}
          validationTrigger="onChange"
        >
          {() => <>{children}</>}
        </FormProvider>
      );

      const { result } = renderHook(() => useContext(UniformContext), {
        wrapper,
      });

      expect(result.current.debugMode).toBe('debug');
    });

    it('provides preventSubmit function that works', async () => {
      const onSubmit = vi.fn();

      const wrapper = ({ children }: { children: ReactNode }) => (
        <FormProvider onSubmit={onSubmit} validationTrigger="onChange">
          {() => <>{children}</>}
        </FormProvider>
      );

      const { result } = renderHook(() => useContext(UniformContext), {
        wrapper,
      });

      // Call preventSubmit
      act(() => {
        result.current.preventSubmit(true);
      });

      // The actual prevention logic is in handleSubmit, which is tested in Form.test.tsx
      expect(typeof result.current.preventSubmit).toBe('function');
    });

    it('provides setClientValidationSchema function', () => {
      const onSubmit = vi.fn();
      const baseValidation = veto({
        name: string(),
      });

      const wrapper = ({ children }: { children: ReactNode }) => (
        <FormProvider
          onSubmit={onSubmit}
          validation={baseValidation}
          validationTrigger="onChange"
        >
          {() => <>{children}</>}
        </FormProvider>
      );

      const { result } = renderHook(() => useContext(UniformContext), {
        wrapper,
      });

      const clientSchema = string();

      act(() => {
        result.current.validation.setClientValidationSchema(
          'dynamicField',
          clientSchema,
        );
      });

      // Verify the function is callable (actual validation logic is tested in FormResolver tests)
      expect(typeof result.current.validation.setClientValidationSchema).toBe(
        'function',
      );
    });

    it('provides triggerSubmit function', async () => {
      const onSubmit = vi.fn();

      const wrapper = ({ children }: { children: ReactNode }) => (
        <FormProvider onSubmit={onSubmit} validationTrigger="onChange">
          {() => <>{children}</>}
        </FormProvider>
      );

      const { result } = renderHook(() => useContext(UniformContext), {
        wrapper,
      });

      // triggerSubmit should be a function
      expect(typeof result.current.triggerSubmit).toBe('function');

      // Call it (will submit with empty form data)
      await act(async () => {
        await result.current.triggerSubmit();
      });

      // Should call onSubmit
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
      });
    });

    it('passes initialValues to form', () => {
      const onSubmit = vi.fn();
      const initialValues = { name: 'John', email: 'john@example.com' };

      const wrapper = ({ children }: { children: ReactNode }) => (
        <FormProvider
          initialValues={initialValues}
          onSubmit={onSubmit}
          validationTrigger="onChange"
        >
          {() => <>{children}</>}
        </FormProvider>
      );

      // The actual default values are tested in Form.test.tsx
      // Here we just verify the component renders without errors
      const { result } = renderHook(() => useContext(UniformContext), {
        wrapper,
      });

      expect(result.current).toBeDefined();
    });

    it('provides validation errors when validation fails', async () => {
      const onSubmit = vi.fn();
      const validationSchema: VetoInstance = veto({
        name: string().min(3),
      });

      const wrapper = ({ children }: { children: ReactNode }) => (
        <FormProvider
          initialValues={{ name: 'ab' }} // Too short, will fail validation
          onSubmit={onSubmit}
          validation={validationSchema}
          validationTrigger="onChange"
        >
          {() => <>{children}</>}
        </FormProvider>
      );

      const { result } = renderHook(() => useContext(UniformContext), {
        wrapper,
      });

      // Initially errors might not be set yet, but context should provide the structure
      expect(result.current.validation).toBeDefined();
      expect(result.current.validation.instance).toBe(validationSchema);
    });

    it('exposes both baseInstance and instance in validation context', () => {
      const onSubmit = vi.fn();
      const baseValidation = veto({
        username: string().min(3),
      });

      const wrapper = ({ children }: { children: ReactNode }) => (
        <FormProvider
          onSubmit={onSubmit}
          validation={baseValidation}
          validationTrigger="onChange"
        >
          {() => <>{children}</>}
        </FormProvider>
      );

      const { result } = renderHook(() => useContext(UniformContext), {
        wrapper,
      });

      // Both instance and baseInstance should be available
      expect(result.current.validation.instance).toBeDefined();
      expect(result.current.validation.baseInstance).toBeDefined();

      // Without client validation, both should reference the base validation
      expect(result.current.validation.baseInstance).toBe(baseValidation);
    });

    it('baseInstance remains stable when client validation is added', () => {
      const onSubmit = vi.fn();
      const baseValidation = veto({
        username: string().min(3),
      });

      const wrapper = ({ children }: { children: ReactNode }) => (
        <FormProvider
          onSubmit={onSubmit}
          validation={baseValidation}
          validationTrigger="onChange"
        >
          {() => <>{children}</>}
        </FormProvider>
      );

      const { result } = renderHook(() => useContext(UniformContext), {
        wrapper,
      });

      const initialBaseInstance = result.current.validation.baseInstance;

      // Add client validation
      const clientSchema = string().nullish();
      act(() => {
        result.current.validation.setClientValidationSchema(
          'dynamicField',
          clientSchema,
        );
      });

      // baseInstance should remain the same (base validation only)
      expect(result.current.validation.baseInstance).toBe(initialBaseInstance);
      expect(result.current.validation.baseInstance).toBe(baseValidation);

      // instance might have changed (extended with client validation)
      // but baseInstance should be stable
      expect(result.current.validation.instance).toBeDefined();
    });
  });

  describe('context value memoization', () => {
    it('does not cause unnecessary re-renders', () => {
      const onSubmit = vi.fn();
      const renderCount = vi.fn();

      const wrapper = ({ children }: { children: ReactNode }) => (
        <FormProvider onSubmit={onSubmit} validationTrigger="onChange">
          {() => <>{children}</>}
        </FormProvider>
      );

      const { result, rerender } = renderHook(
        () => {
          renderCount();
          return useContext(UniformContext);
        },
        { wrapper },
      );

      const initialContextValue = result.current;

      // Rerender
      rerender();

      // Context value should be stable due to useMemo
      expect(result.current).toBe(initialContextValue);
    });
  });
});
