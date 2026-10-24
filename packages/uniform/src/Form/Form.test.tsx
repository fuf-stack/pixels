import { describe, expect, it, vi } from 'vitest';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { array, object, objectLoose, string, veto } from '@fuf-stack/veto';

import '@testing-library/jest-dom/vitest';

import { useClientValidation } from '../hooks/useClientValidation';
import { useFormContext } from '../hooks/useFormContext';
import Input from '../Input';
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

    it('should apply className to the base slot (form wrapper)', () => {
      render(
        <Form className="custom-class" onSubmit={() => {}} testId="test-form">
          <div>content</div>
        </Form>,
      );

      const form = screen.getByTestId('test_form');
      expect(form).toHaveClass('grow');
      expect(form.parentElement).toHaveClass('custom-class');
    });

    it('should apply multiple classNames to the base slot (form wrapper)', () => {
      render(
        <Form
          className={['class1', 'class2']}
          onSubmit={() => {}}
          testId="test-form"
        >
          <div>content</div>
        </Form>,
      );

      const form = screen.getByTestId('test_form');
      expect(form).toHaveClass('grow');
      expect(form.parentElement).toHaveClass('class1', 'class2');
    });

    it('should apply classNames of the form slot to the HTML form element', () => {
      render(
        <Form
          className={{ base: 'wrapper-class', form: 'form-class' }}
          onSubmit={() => {}}
          testId="test-form"
        >
          <div>content</div>
        </Form>,
      );

      const form = screen.getByTestId('test_form');
      expect(form).toHaveClass('form-class', 'grow');
      expect(form.parentElement).toHaveClass('wrapper-class');
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
        <Form onSubmit={() => {}} testId="test-form">
          <div>content</div>
        </Form>,
      );

      const formWrapper = screen.getByTestId('test_form').parentElement;
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
          // null, undefined, empty string, empty arrays, and empty objects should be filtered out
          // but false and 0 are preserved as valid data
          zeroNumber: 0,
          falseBoolean: false,
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

      // Verify that null, undefined, empty strings, empty arrays, empty objects, and null markers are filtered out
      expect(handleSubmit).toHaveBeenCalledExactlyOnceWith(
        {
          shouldKeep: 'value',
          shouldKeepFalse: false,
          shouldKeepZero: 0,
          // shouldFilterNull, shouldFilterEmptyString, shouldFilterUndefined,
          // shouldFilterNullMarker, shouldKeepEmptyArray, and shouldKeepEmptyObject are all filtered out
        },
        expect.anything(),
      );
    });
  });

  describe('disabled field submission', () => {
    it.each([false, true])(
      'omits populated disabled fields and preserves enabled fields (schema: %s)',
      async (withSchema) => {
        const onSubmit = vi.fn();
        const user = userEvent.setup();

        const validation = withSchema
          ? veto({
              disabledField: string().optional(),
              enabledField: string(),
            })
          : undefined;

        render(
          <Form
            initialValues={{
              disabledField: 'retained',
              enabledField: 'included',
            }}
            onSubmit={onSubmit}
            validation={validation}
          >
            <Input disabled name="disabledField" />
            <Input name="enabledField" />
            <button type="submit">Submit</button>
          </Form>,
        );

        expect(
          screen.getByRole('textbox', { name: 'disabledField' }),
        ).toBeDisabled();
        expect(
          screen.getByRole('textbox', { name: 'disabledField' }),
        ).toHaveValue('retained');
        await user.click(screen.getByRole('button', { name: 'Submit' }));

        await waitFor(() =>
          expect(onSubmit).toHaveBeenCalledExactlyOnceWith(
            { enabledField: 'included' },
            expect.anything(),
          ),
        );
      },
    );

    it('reports a missing required disabled field even when its stored value is valid', async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();
      const validation = veto({ field: string().min(3) });
      const validate = vi.spyOn(validation, 'validateAsync');
      const form = (disabled: boolean) => (
        <Form
          initialValues={{ field: 'valid' }}
          onSubmit={onSubmit}
          validation={validation}
        >
          <Input disabled={disabled} name="field" />
          <button type="submit">Submit</button>
        </Form>
      );
      const { rerender } = render(form(true));
      await user.click(screen.getByRole('button', { name: 'Submit' }));
      await waitFor(() =>
        expect(screen.getByText('Field is required')).toBeVisible(),
      );
      expect(validate).toHaveBeenLastCalledWith({});
      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.getByRole('textbox', { name: 'field' })).toHaveValue(
        'valid',
      );

      rerender(form(false));
      await user.click(screen.getByRole('button', { name: 'Submit' }));
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledExactlyOnceWith(
          { field: 'valid' },
          expect.anything(),
        ),
      );
    });

    it('submits the retained user value after a field is re-enabled', async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();
      const form = (disabled: boolean) => (
        <Form initialValues={{ field: 'initial' }} onSubmit={onSubmit}>
          <Input debounceDelay={0} disabled={disabled} name="field" />
          <button type="submit">Submit</button>
        </Form>
      );
      const { rerender } = render(form(false));
      const input = screen.getByRole('textbox', { name: 'field' });

      await user.clear(input);
      await user.type(input, 'updated');
      await user.tab();
      rerender(form(true));
      expect(input).toBeDisabled();
      expect(input).toHaveValue('updated');
      await user.click(screen.getByRole('button', { name: 'Submit' }));
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledExactlyOnceWith({}, expect.anything()),
      );

      rerender(form(false));
      expect(input).toBeEnabled();
      expect(input).toHaveValue('updated');
      await user.click(screen.getByRole('button', { name: 'Submit' }));
      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));
      expect(onSubmit).toHaveBeenNthCalledWith(
        2,
        { field: 'updated' },
        expect.anything(),
      );
    });

    it('omits an optional disabled value and validates its retained value when re-enabled', async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();
      const validation = veto({
        field: string().min(3, 'Value is too short').optional(),
      });
      const form = (disabled: boolean) => (
        <Form
          initialValues={{ field: 'ab' }}
          onSubmit={onSubmit}
          validation={validation}
          validationTrigger="onSubmit"
        >
          <Input debounceDelay={0} disabled={disabled} name="field" />
          <button type="submit">Submit</button>
        </Form>
      );
      const { rerender } = render(form(true));
      const input = screen.getByRole('textbox', { name: 'field' });

      expect(input).toBeDisabled();
      await user.click(screen.getByRole('button', { name: 'Submit' }));
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledExactlyOnceWith({}, expect.anything()),
      );
      expect(screen.queryByText('Value is too short')).not.toBeInTheDocument();

      rerender(form(false));
      expect(input).toBeEnabled();
      expect(input).toHaveValue('ab');
      await user.click(screen.getByRole('button', { name: 'Submit' }));
      await waitFor(() =>
        expect(screen.getByText('Value is too short')).toBeVisible(),
      );
      expect(onSubmit).toHaveBeenCalledTimes(1);

      rerender(form(true));
      await user.click(screen.getByRole('button', { name: 'Submit' }));
      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));
      expect(onSubmit).toHaveBeenNthCalledWith(2, {}, expect.anything());
      await waitFor(() =>
        expect(
          screen.queryByText('Value is too short'),
        ).not.toBeInTheDocument(),
      );

      rerender(form(false));
      await user.type(input, 'c');
      await user.tab();
      await user.click(screen.getByRole('button', { name: 'Submit' }));
      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(3));
      expect(onSubmit).toHaveBeenNthCalledWith(
        3,
        { field: 'abc' },
        expect.anything(),
      );
    });
  });

  describe('disabled validation paths', () => {
    it('omits a disabled sibling when only the enabled field is validated', async () => {
      const user = userEvent.setup();
      const validation = veto({
        excluded: string().min(3).optional(),
        enabled: string(),
      });
      const validate = vi.spyOn(validation, 'validateAsync');
      const triggered = vi.fn();
      const ValidateEnabled = () => {
        const { trigger } = useFormContext();
        return (
          <button
            onClick={async () => {
              const isValid = await trigger('enabled');
              triggered(isValid);
            }}
            type="button"
          >
            Validate enabled
          </button>
        );
      };

      render(
        <Form
          initialValues={{ excluded: 'x', enabled: 'valid' }}
          onSubmit={vi.fn()}
          validation={validation}
        >
          <Input disabled name="excluded" />
          <Input name="enabled" />
          <ValidateEnabled />
        </Form>,
      );

      await user.click(
        screen.getByRole('button', { name: 'Validate enabled' }),
      );

      await waitFor(() => expect(triggered).toHaveBeenCalledWith(true));
      // trigger('enabled') can succeed even if the resolver reports sibling errors;
      // inspect the actual validation input to prove the sibling was omitted.
      expect(validate).toHaveBeenLastCalledWith({ enabled: 'valid' });
      expect(screen.getByRole('textbox', { name: 'excluded' })).toHaveValue(
        'x',
      );
    });

    it.each([false, true])(
      'submits disabled flat-array entries as null placeholders (schema: %s)',
      async (withSchema) => {
        const user = userEvent.setup();
        const onSubmit = vi.fn();
        const validation = withSchema
          ? veto({ tags: array(string().min(3).optional()) })
          : undefined;

        render(
          <Form
            initialValues={{ tags: ['x', 'y', 'valid'] }}
            onSubmit={onSubmit}
            validation={validation}
          >
            <Input disabled name="tags.0.__FLAT__" />
            <Input disabled name="tags.1.__FLAT__" />
            <Input name="tags.2.__FLAT__" />
            <button type="submit">Submit</button>
          </Form>,
        );

        await user.click(screen.getByRole('button', { name: 'Submit' }));

        await waitFor(() =>
          expect(onSubmit).toHaveBeenCalledExactlyOnceWith(
            { tags: [null, null, 'valid'] },
            expect.anything(),
          ),
        );
      },
    );

    it('retains exclusion across reset and validates the reset value when re-enabled', async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();
      const Reset = () => {
        const { reset } = useFormContext();
        return (
          <button onClick={() => reset({ field: 'reset' })} type="button">
            Reset
          </button>
        );
      };
      const validation = veto({
        field: string().min(6, 'Value is too short').optional(),
      });
      const form = (disabled: boolean) => (
        <Form
          initialValues={{ field: 'initial' }}
          onSubmit={onSubmit}
          validation={validation}
        >
          <Input disabled={disabled} name="field" />
          <Reset />
          <button type="submit">Submit</button>
        </Form>
      );
      const { rerender } = render(form(true));
      await user.click(screen.getByRole('button', { name: 'Reset' }));
      expect(screen.getByRole('textbox', { name: 'field' })).toHaveValue(
        'reset',
      );
      await user.click(screen.getByRole('button', { name: 'Submit' }));
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledExactlyOnceWith({}, expect.anything()),
      );
      rerender(form(false));
      await user.click(screen.getByRole('button', { name: 'Submit' }));
      await waitFor(() =>
        expect(screen.getByText('Value is too short')).toBeVisible(),
      );
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it.each([undefined, 'invalid'])(
      'omits optional disabled values before base and client validation (disabled value: %s)',
      async (disabledValue) => {
        const clientRule = vi.fn(async () => false);
        const ClientRules = () => {
          useClientValidation(true, () =>
            objectLoose({
              excluded: string()
                .refine(clientRule, 'Client rule ran')
                .nullish(),
            }),
          );
          return null;
        };
        const onSubmit = vi.fn();
        const user = userEvent.setup();
        const validation = veto({
          excluded: string().optional(),
          enabled: string().min(3, 'Enabled value is too short'),
        });

        render(
          <Form
            initialValues={{ excluded: disabledValue }}
            onSubmit={onSubmit}
            validation={validation}
          >
            <ClientRules />
            <Input disabled name="excluded" />
            <Input debounceDelay={0} name="enabled" />
            <button type="submit">Submit</button>
          </Form>,
        );
        const enabled = screen.getByRole('textbox', { name: 'enabled' });
        await user.type(enabled, 'ab');
        await user.tab();
        await user.click(screen.getByRole('button', { name: 'Submit' }));
        await waitFor(() =>
          expect(screen.getByText('Enabled value is too short')).toBeVisible(),
        );
        expect(onSubmit).not.toHaveBeenCalled();
        expect(clientRule).not.toHaveBeenCalled();

        await user.type(enabled, 'c');
        await user.tab();
        await user.click(screen.getByRole('button', { name: 'Submit' }));
        await waitFor(() =>
          expect(onSubmit).toHaveBeenCalledExactlyOnceWith(
            { enabled: 'abc' },
            expect.anything(),
          ),
        );
        expect(clientRule).not.toHaveBeenCalled();
      },
    );

    it('excludes nested disabled fields without disabling the same field in other array rows', async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();
      const validation = veto({
        rows: array(
          object({
            name: string().min(3, 'Name is too short').optional(),
            code: string(),
          }),
        ),
      });

      render(
        <Form
          initialValues={{
            rows: [
              { name: 'x', code: 'first' },
              { name: 'x', code: 'second' },
            ],
          }}
          onSubmit={onSubmit}
          validation={validation}
        >
          <Input disabled name="rows.0.name" />
          <Input debounceDelay={0} name="rows.1.name" />
          <button type="submit">Submit</button>
        </Form>,
      );
      await user.click(screen.getByRole('button', { name: 'Submit' }));
      await waitFor(() =>
        expect(screen.getByText('Name is too short')).toBeVisible(),
      );
      expect(onSubmit).not.toHaveBeenCalled();
      await user.type(
        screen.getByRole('textbox', { name: 'rows.1.name' }),
        'yz',
      );
      await user.tab();
      await user.click(screen.getByRole('button', { name: 'Submit' }));
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledExactlyOnceWith(
          { rows: [{ code: 'first' }, { name: 'xyz', code: 'second' }] },
          expect.anything(),
        ),
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
          validation={veto({
            test: string().min(3),
          })}
          validationTrigger="onSubmit"
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
