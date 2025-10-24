import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { string, veto } from '@fuf-stack/veto';

import '@testing-library/jest-dom/vitest';

import Form from './Form';

describe('Form', () => {
  describe('rendering', () => {
    it('should render children', () => {
      render(
        <Form onSubmit={() => {}}>
          <div data-testid="child">child content</div>
        </Form>,
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('should apply className', () => {
      render(
        <Form className="custom-class" onSubmit={() => {}}>
          <div>content</div>
        </Form>,
      );

      const form = screen.getByTestId('');
      expect(form).toHaveClass('custom-class', 'grow');
    });

    it('should apply multiple classNames', () => {
      render(
        <Form className={['class1', 'class2']} onSubmit={() => {}}>
          <div>content</div>
        </Form>,
      );

      const form = screen.getByTestId('');
      expect(form).toHaveClass('class1', 'class2', 'grow');
    });

    it('should set form name', () => {
      render(
        <Form name="test-form" onSubmit={() => {}}>
          <div>content</div>
        </Form>,
      );

      const form = screen.getByTestId('test_form');
      expect(form).toHaveAttribute('name', 'test-form');
    });

    it('should set testId', () => {
      render(
        <Form onSubmit={() => {}} testId="test-form-id">
          <div>content</div>
        </Form>,
      );

      expect(screen.getByTestId('test_form_id')).toBeInTheDocument();
    });

    it('should generate testId from name if testId not provided', () => {
      render(
        <Form name="Test Form Name" onSubmit={() => {}}>
          <div>content</div>
        </Form>,
      );

      expect(screen.getByTestId('test_form_name')).toBeInTheDocument();
    });

    it('should not render FormDebugViewer in test environment', () => {
      render(
        <Form onSubmit={() => {}}>
          <div>content</div>
        </Form>,
      );

      const formWrapper = screen.getByTestId('').parentElement;
      expect(formWrapper?.children).toHaveLength(1);
    });
  });

  describe('form handling', () => {
    it('should call onSubmit when form is submitted', async () => {
      const handleSubmit = vi.fn();
      const user = userEvent.setup();

      render(
        <Form onSubmit={handleSubmit}>
          <button type="submit">Submit</button>
        </Form>,
      );

      await user.click(screen.getByRole('button'));
      expect(handleSubmit).toHaveBeenCalled();
    });

    it('should handle initial values', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();
      const initialValues = { test: 'initial' };

      render(
        <Form initialValues={initialValues} onSubmit={handleSubmit}>
          <input data-testid="input" name="test" />
          <button type="submit">Submit</button>
        </Form>,
      );

      await user.click(screen.getByRole('button'));
      expect(handleSubmit).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining(initialValues),
        expect.anything(),
      );
    });

    it('should convert nullish string markers before submission', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();
      const initialValues = {
        nullValue: '__NULL__',
        falseValue: '__FALSE__',
        zeroValue: '__ZERO__',
        normalValue: 'test',
        emptyString: '',
      };

      render(
        <Form initialValues={initialValues} onSubmit={handleSubmit}>
          <button type="submit">Submit</button>
        </Form>,
      );

      await user.click(screen.getByRole('button'));

      // Verify that nullish markers are converted properly
      expect(handleSubmit).toHaveBeenCalledExactlyOnceWith(
        {
          // __NULL__ should be converted to null and then filtered out
          // __FALSE__ should be converted to false (preserved as valid data)
          falseValue: false,
          // __ZERO__ should be converted to 0 (preserved as valid data)
          zeroValue: 0,
          // empty string should be filtered out
          normalValue: 'test',
        },
        expect.anything(),
      );
    });

    it('should filter out null, undefined, and empty string values', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();
      const initialValues = {
        validString: 'keep this',
        nullValue: null,
        undefinedValue: undefined,
        emptyString: '',
        zeroNumber: 0,
        falseBoolean: false,
        emptyArray: [],
        emptyObject: {},
      };

      render(
        <Form initialValues={initialValues} onSubmit={handleSubmit}>
          <button type="submit">Submit</button>
        </Form>,
      );

      await user.click(screen.getByRole('button'));

      // Only non-null/non-empty values should be passed to onSubmit
      expect(handleSubmit).toHaveBeenCalledExactlyOnceWith(
        {
          validString: 'keep this',
          // null, undefined, empty string, and empty arrays should be filtered out
          // but false, 0, and empty objects are preserved as valid data
          zeroNumber: 0,
          falseBoolean: false,
          emptyObject: {},
        },
        expect.anything(),
      );
    });

    it('should handle nested objects with nullish markers', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();
      const initialValues = {
        user: {
          name: 'John',
          email: '__NULL__',
          age: '__ZERO__',
        },
        settings: {
          theme: 'dark',
          notifications: '__FALSE__',
        },
      };

      render(
        <Form initialValues={initialValues} onSubmit={handleSubmit}>
          <button type="submit">Submit</button>
        </Form>,
      );

      await user.click(screen.getByRole('button'));

      // Verify nested conversion and filtering
      expect(handleSubmit).toHaveBeenCalledExactlyOnceWith(
        {
          user: {
            name: 'John',
            // email (__NULL__) should be converted to null and filtered out
            // age (__ZERO__) should be converted to 0 and preserved
            age: 0,
          },
          settings: {
            theme: 'dark',
            // notifications (__FALSE__) should be converted to false and preserved
            notifications: false,
          },
        },
        expect.anything(),
      );
    });

    it('should properly filter out null and empty string values while preserving valid falsy values', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();
      const initialValues = {
        shouldKeep: 'value',
        shouldKeepFalse: false,
        shouldKeepZero: 0,
        shouldKeepEmptyArray: [],
        shouldKeepEmptyObject: {},
        shouldFilterNull: null,
        shouldFilterEmptyString: '',
        shouldFilterUndefined: undefined,
        shouldFilterNullMarker: '__NULL__',
      };

      render(
        <Form initialValues={initialValues} onSubmit={handleSubmit}>
          <button type="submit">Submit</button>
        </Form>,
      );

      await user.click(screen.getByRole('button'));

      // Verify that only null, undefined, empty strings, empty arrays, and null markers are filtered out
      expect(handleSubmit).toHaveBeenCalledExactlyOnceWith(
        {
          shouldKeep: 'value',
          shouldKeepFalse: false,
          shouldKeepZero: 0,
          shouldKeepEmptyObject: {},
          // shouldFilterNull, shouldFilterEmptyString, shouldFilterUndefined,
          // shouldFilterNullMarker, and shouldKeepEmptyArray (now filtered) should all be filtered out
        },
        expect.anything(),
      );
    });
  });

  describe('validation', () => {
    it('should validate according to validation schema', async () => {
      const handleSubmit = vi.fn();
      const user = userEvent.setup();

      render(
        <Form
          onSubmit={handleSubmit}
          validation={veto({
            test: string().min(3),
          })}
        >
          <input data-testid="input" name="test" />
          <button type="submit">Submit</button>
        </Form>,
      );

      const input = screen.getByTestId('input');
      await user.type(input, 'ab');
      await user.click(screen.getByRole('button'));

      expect(handleSubmit).not.toHaveBeenCalled();
    });

    it('should respect validation trigger setting', async () => {
      const handleSubmit = vi.fn();
      const user = userEvent.setup();

      render(
        <Form
          onSubmit={handleSubmit}
          validationTrigger="onSubmit"
          validation={veto({
            test: string().min(3),
          })}
        >
          <input data-testid="input" name="test" />
          <button type="submit">Submit</button>
        </Form>,
      );

      const input = screen.getByTestId('input');
      await user.type(input, 'ab');
      await user.tab();
      await user.click(screen.getByRole('button'));

      expect(handleSubmit).not.toHaveBeenCalled();
    });
  });

  describe('debug mode', () => {
    it('should not render debug viewer when debug.disable is true', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(
        <Form debug={{ disable: true }} onSubmit={() => {}}>
          <div>content</div>
        </Form>,
      );

      const formWrapper = screen.getByTestId('').parentElement;
      expect(formWrapper?.children).toHaveLength(1);

      process.env.NODE_ENV = originalEnv;
    });
  });
});
