import type { InputValueTransform } from '../hooks/useInputValueTransform';

import { describe, expect, it, vi } from 'vitest';

import { StrictMode, useLayoutEffect } from 'react';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { number, object, refineObject, string, veto } from '@fuf-stack/veto';

import Form from '../Form';
import { useController } from '../hooks/useController';
import { useFormContext } from '../hooks/useFormContext';
import Input from '../Input';
import SubmitButton from '../SubmitButton';
import FieldReset from './FieldReset';

const Field = ({
  name,
  disabled = false,
  transform = undefined,
}: {
  name: string;
  disabled?: boolean;
  transform?: InputValueTransform<string>;
}) => {
  const { field } = useController({ name, disabled });
  return (
    <input
      aria-label={name}
      {...field}
      onChange={(event) =>
        field.onChange(
          transform
            ? transform.toFormValue(event.target.value)
            : event.target.value,
        )
      }
      value={
        (transform ? transform.toDisplayValue(field.value) : field.value) ?? ''
      }
    />
  );
};
const ResetAll = () => {
  const { reset } = useFormContext();
  return (
    <button
      onClick={() => {
        reset();
      }}
      type="button"
    >
      Reset all
    </button>
  );
};
const submit = () => {
  fireEvent.submit(screen.getByTestId('settings'));
};
const change = (name: string, value: string) => {
  fireEvent.change(screen.getByLabelText(name), { target: { value } });
};

describe('FieldReset', () => {
  it('never mounts the reset action while applying the original value', () => {
    const actionsSeenAtCommit: boolean[] = [];
    const ObserveCommit = () => {
      useLayoutEffect(() => {
        actionsSeenAtCommit.push(
          !!document.querySelector('[aria-label="Reset to original: cpu"]'),
        );
      });
      return null;
    };
    render(
      <StrictMode>
        <Form initialValues={{ cpu: 99 }} onSubmit={vi.fn()}>
          <FieldReset name="cpu" resetValue={4}>
            {({ transform, resetAction }) => (
              <>
                <Field name="cpu" transform={transform} />
                {resetAction}
              </>
            )}
          </FieldReset>
          <ObserveCommit />
        </Form>
      </StrictMode>,
    );
    expect(actionsSeenAtCommit.length).toBeGreaterThan(0);
    expect(actionsSeenAtCommit).not.toContain(true);
    expect(
      screen.queryByRole('button', { name: 'Reset to original: cpu' }),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText('cpu')).toHaveValue('4');
    change('cpu', '8');
    expect(
      screen.getByRole('button', { name: 'Reset to original: cpu' }),
    ).toBeInTheDocument();
  });

  it('initializes independent originals, omits unchanged values, resets, and allows ordinary changes', async () => {
    const save = vi.fn();
    render(
      <StrictMode>
        <Form
          initialValues={{ note: 'before', cpu: 99 }}
          name="settings"
          onSubmit={save}
        >
          <FieldReset name="cpu" resetValue={4}>
            {({ transform, resetAction }) => (
              <>
                <Field name="cpu" transform={transform} />
                {resetAction}
              </>
            )}
          </FieldReset>
          <FieldReset name="memory" resetValue={16}>
            {({ transform, resetAction }) => (
              <>
                <Field name="memory" transform={transform} />
                {resetAction}
              </>
            )}
          </FieldReset>
          <Field name="note" />
          <SubmitButton />
          <ResetAll />
        </Form>
      </StrictMode>,
    );
    expect(screen.getByLabelText('cpu')).toHaveValue('4');
    expect(screen.queryByText('Changed')).not.toBeInTheDocument();
    submit();
    await waitFor(() => {
      expect(save).toHaveBeenCalledWith({ note: 'before' }, expect.anything());
    });
    change('cpu', '8');
    expect(screen.getByText('Changed')).toBeInTheDocument();
    submit();
    await waitFor(() => {
      expect(save).toHaveBeenLastCalledWith(
        { cpu: 8, note: 'before' },
        expect.anything(),
      );
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Reset to original: cpu' }),
    );
    expect(screen.getByLabelText('cpu')).toHaveValue('4');
    expect(screen.queryByText('Changed')).not.toBeInTheDocument();
    change('cpu', '8');
    change('cpu', '4');
    expect(screen.queryByText('Changed')).not.toBeInTheDocument();
    change('note', 'after');
    expect(screen.getByRole('button', { name: 'Submit form' })).toBeEnabled();
    submit();
    await waitFor(() => {
      expect(save).toHaveBeenLastCalledWith(
        { note: 'after' },
        expect.anything(),
      );
    });
    change('memory', '32');
    fireEvent.click(screen.getByText('Reset all'));
    expect(screen.getByLabelText('memory')).toHaveValue('16');
    expect(screen.queryByText('Changed')).not.toBeInTheDocument();
  });

  it('submits every unchanged always field without Form initialValues', async () => {
    const save = vi.fn();
    render(
      <Form
        name="settings"
        onSubmit={save}
        validation={veto({ cpu: number(), memory: number(), note: string() })}
      >
        <FieldReset include="always" name="cpu" resetValue={4}>
          {({ transform, resetAction }) => (
            <>
              <Field name="cpu" transform={transform} />
              {resetAction}
            </>
          )}
        </FieldReset>
        <FieldReset include="always" name="memory" resetValue={16}>
          {({ transform, resetAction }) => (
            <>
              <Field name="memory" transform={transform} />
              {resetAction}
            </>
          )}
        </FieldReset>
        <FieldReset include="always" name="note" resetValue="Current settings">
          {({ transform, resetAction }) => (
            <>
              <Field name="note" transform={transform} />
              {resetAction}
            </>
          )}
        </FieldReset>
      </Form>,
    );
    submit();
    await waitFor(() => {
      expect(save).toHaveBeenCalledWith(
        { cpu: 4, memory: 16, note: 'Current settings' },
        expect.anything(),
      );
    });
  });

  it('includes always fields and omits clears using normal form serialization', async () => {
    const save = vi.fn();
    render(
      <Form
        name="settings"
        onSubmit={save}
        validation={veto({
          cpu: number().optional(),
          note: string().nullable().optional(),
        })}
      >
        <FieldReset include="always" name="cpu" resetValue={4}>
          {({ transform, resetAction }) => (
            <>
              <Field name="cpu" transform={transform} />
              {resetAction}
            </>
          )}
        </FieldReset>
        <FieldReset name="note" resetValue="hello">
          {({ transform, resetAction }) => (
            <>
              <Field name="note" transform={transform} />
              {resetAction}
            </>
          )}
        </FieldReset>
      </Form>,
    );
    change('note', '');
    submit();
    await waitFor(() => {
      expect(save).toHaveBeenCalledWith({ cpu: 4 }, expect.anything());
    });
  });

  it('keeps an Input clear distinct from reset when using an external action', async () => {
    const save = vi.fn();
    render(
      <Form name="settings" onSubmit={save}>
        <FieldReset name="note" resetValue="hello">
          {({ transform, resetAction }) => (
            <>
              <Input
                clearable
                debounceDelay={0}
                label="Note"
                name="note"
                transform={transform}
              />
              {resetAction}
            </>
          )}
        </FieldReset>
      </Form>,
    );
    const input = screen.getByRole('textbox', { name: /Note/ });
    expect(input).toHaveValue('hello');
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(input).toHaveValue('');
    expect(screen.getByText('Changed')).toBeInTheDocument();
    submit();
    await waitFor(() =>
      expect(save).toHaveBeenCalledWith({}, expect.anything()),
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Reset to original: note' }),
    );
    expect(input).toHaveValue('hello');
    expect(screen.queryByText('Changed')).not.toBeInTheDocument();
  });

  it('validates the update and never submits invalid edits', async () => {
    const save = vi.fn();
    render(
      <Form
        name="settings"
        onSubmit={save}
        validation={veto({ note: string({ min: 3 }) })}
      >
        <FieldReset name="note" resetValue="hello">
          {({ transform, resetAction }) => (
            <>
              <Field name="note" transform={transform} />
              {resetAction}
            </>
          )}
        </FieldReset>
      </Form>,
    );
    change('note', 'x');
    submit();
    await waitFor(() => {
      expect(screen.getByTestId('settings')).toHaveAttribute(
        'data-form-is-valid',
        'false',
      );
    });
    expect(save).not.toHaveBeenCalled();
    change('note', 'valid');
    submit();
    await waitFor(() => {
      expect(save).toHaveBeenCalledWith({ note: 'valid' }, expect.anything());
    });
  });

  it('follows new originals while pristine and preserves edits until the server catches up', () => {
    const save = vi.fn();
    const Example = ({ resetValue }: { resetValue: number }) => (
      <Form name="settings" onSubmit={save}>
        <FieldReset name="cpu" resetValue={resetValue}>
          {({ transform, resetAction }) => (
            <>
              <Field name="cpu" transform={transform} />
              {resetAction}
            </>
          )}
        </FieldReset>
        <SubmitButton />
      </Form>
    );
    const { rerender } = render(<Example resetValue={4} />);
    rerender(<Example resetValue={6} />);
    expect(screen.getByLabelText('cpu')).toHaveValue('6');
    change('cpu', '8');
    rerender(<Example resetValue={7} />);
    expect(screen.getByLabelText('cpu')).toHaveValue('8');
    expect(screen.getByText('Changed')).toBeInTheDocument();
    rerender(<Example resetValue={8} />);
    expect(screen.queryByText('Changed')).not.toBeInTheDocument();
    expect(screen.queryByText('Changed')).not.toBeInTheDocument();
  });

  it('excludes disabled fields even with include always and releases the binding on unmount', async () => {
    const save = vi.fn();
    const Example = ({ wrapped = true, disabled = false }) => (
      <Form name="settings" onSubmit={save}>
        {wrapped ? (
          <FieldReset include="always" name="cpu" resetValue={4}>
            {({ transform, resetAction }) => (
              <>
                <Field disabled={disabled} name="cpu" transform={transform} />
                {resetAction}
              </>
            )}
          </FieldReset>
        ) : (
          <Field name="cpu" />
        )}
      </Form>
    );
    const { rerender } = render(<Example disabled />);
    submit();
    await waitFor(() => {
      expect(save).toHaveBeenLastCalledWith({}, expect.anything());
    });
    rerender(<Example />);
    submit();
    await waitFor(() => {
      expect(save).toHaveBeenLastCalledWith({ cpu: 4 }, expect.anything());
    });
    rerender(<Example wrapped={false} />);
    submit();
    await waitFor(() => {
      expect(save).toHaveBeenLastCalledWith({ cpu: 4 }, expect.anything());
    });
  });

  it('lets the schema reject an empty patch and accept one changed optional field', async () => {
    const save = vi.fn();
    const validation = veto(
      refineObject(
        object({ cpu: number().optional(), memory: number().optional() }),
      )({
        custom: (data, ctx) => {
          if (Object.keys(data).length === 0) {
            ctx.addIssue({
              code: 'custom',
              message: 'Change at least one value',
            });
          }
        },
      }),
    );
    expect(validation.validate({}).errors).toEqual({
      _errors: [{ code: 'custom', message: 'Change at least one value' }],
    });
    render(
      <Form name="settings" onSubmit={save} validation={validation}>
        <FieldReset name="cpu" resetValue={4}>
          {({ transform, resetAction }) => (
            <>
              <Field name="cpu" transform={transform} />
              {resetAction}
            </>
          )}
        </FieldReset>
        <FieldReset name="memory" resetValue={16}>
          {({ transform, resetAction }) => (
            <>
              <Field name="memory" transform={transform} />
              {resetAction}
            </>
          )}
        </FieldReset>
      </Form>,
    );
    submit();
    await waitFor(() => {
      expect(screen.getByTestId('settings')).toHaveAttribute(
        'data-form-is-valid',
        'false',
      );
    });
    expect(save).not.toHaveBeenCalled();
    change('cpu', '8');
    submit();
    await waitFor(() => {
      expect(save).toHaveBeenCalledWith({ cpu: 8 }, expect.anything());
    });
  });

  it.each([0, false])(
    'keeps a falsy original %s visible and omits it until edited',
    async (original) => {
      const save = vi.fn();
      render(
        <Form name="settings" onSubmit={save}>
          <FieldReset name="settings.value" resetValue={original}>
            {({ transform, resetAction }) => (
              <>
                <Field name="settings.value" transform={transform} />
                {resetAction}
              </>
            )}
          </FieldReset>
        </Form>,
      );
      expect(screen.getByLabelText('settings.value')).toHaveValue(
        String(original),
      );
      submit();
      await waitFor(() =>
        expect(save).toHaveBeenLastCalledWith({}, expect.anything()),
      );
      change('settings.value', 'other');
      submit();
      await waitFor(() =>
        expect(save).toHaveBeenLastCalledWith(
          { settings: { value: 'other' } },
          expect.anything(),
        ),
      );
      change('settings.value', String(original));
      submit();
      await waitFor(() =>
        expect(save).toHaveBeenLastCalledWith({}, expect.anything()),
      );
    },
  );

  it('updates inclusion when the mode changes without losing edits', async () => {
    const save = vi.fn();
    const Example = ({ always = false }) => (
      <Form name="settings" onSubmit={save}>
        <FieldReset
          include={always ? 'always' : 'changed'}
          name="cpu"
          resetValue={4}
        >
          {({ transform, resetAction }) => (
            <>
              <Field name="cpu" transform={transform} />
              {resetAction}
            </>
          )}
        </FieldReset>
      </Form>
    );
    const { rerender } = render(<Example />);
    rerender(<Example always />);
    submit();
    await waitFor(() =>
      expect(save).toHaveBeenLastCalledWith({ cpu: 4 }, expect.anything()),
    );
    rerender(<Example />);
    submit();
    await waitFor(() =>
      expect(save).toHaveBeenLastCalledWith({}, expect.anything()),
    );
    change('cpu', '8');
    rerender(<Example always />);
    expect(screen.getByLabelText('cpu')).toHaveValue('8');
    submit();
    await waitFor(() =>
      expect(save).toHaveBeenLastCalledWith({ cpu: 8 }, expect.anything()),
    );
  });

  it('uses the submitted snapshot while async validation is pending', async () => {
    const save = vi.fn();
    const validation = veto({ note: string() });
    const validate = validation.validateAsync.bind(validation);
    let release: () => void = () => undefined;
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    let pause = false;
    vi.spyOn(validation, 'validateAsync').mockImplementation(
      async (...args) => {
        if (pause) {
          await pending;
        }
        return validate(...args);
      },
    );
    render(
      <Form
        name="settings"
        onSubmit={save}
        validation={validation}
        validationTrigger="onSubmit"
      >
        <FieldReset name="note" resetValue="original">
          {({ transform, resetAction }) => (
            <>
              <Field name="note" transform={transform} />
              {resetAction}
            </>
          )}
        </FieldReset>
      </Form>,
    );
    change('note', 'edited');
    pause = true;
    submit();
    change('note', 'original');
    pause = false;
    release();
    await waitFor(() => {
      expect(save).toHaveBeenCalledWith({ note: 'edited' }, expect.anything());
    });
  });

  it.each([4, '4.0', '04'])(
    'omits a programmatic baseline %s before an immediate submit',
    async (value) => {
      const save = vi.fn();
      const UpdateAndSubmit = () => {
        const { setValue, triggerSubmit } = useFormContext();
        return (
          <button
            onClick={() => {
              setValue('cpu', value, {
                shouldDirty: true,
                shouldValidate: true,
              });
              triggerSubmit();
            }}
            type="button"
          >
            Update and submit
          </button>
        );
      };
      render(
        <Form
          name="settings"
          onSubmit={save}
          validation={veto({ cpu: number().optional() })}
        >
          <FieldReset name="cpu" resetValue={4}>
            {({ transform, resetAction }) => (
              <>
                <Field name="cpu" transform={transform} />
                {resetAction}
              </>
            )}
          </FieldReset>
          <UpdateAndSubmit />
        </Form>,
      );
      change('cpu', '8');
      fireEvent.click(screen.getByText('Update and submit'));
      await waitFor(() => expect(save).toHaveBeenCalled());
      expect(save.mock.calls[0][0]).toEqual({});
      expect(screen.getByLabelText('cpu')).toHaveValue('4');
      expect(screen.queryByText('Changed')).not.toBeInTheDocument();
    },
  );

  it('respects explicit form reset values and reinstalls programmatic omission', async () => {
    const save = vi.fn();
    const Controls = () => {
      const { reset, setValue, triggerSubmit } = useFormContext();
      return (
        <>
          <button onClick={() => reset({ cpu: 99 })} type="button">
            Reset with values
          </button>
          <button
            onClick={() => {
              reset({ cpu: 99 });
              setValue('cpu', 4);
              triggerSubmit();
            }}
            type="button"
          >
            Reset, update and submit
          </button>
        </>
      );
    };
    render(
      <Form name="settings" onSubmit={save}>
        <FieldReset name="cpu" resetValue={4}>
          {({ transform, resetAction }) => (
            <>
              <Field name="cpu" transform={transform} />
              {resetAction}
            </>
          )}
        </FieldReset>
        <Controls />
      </Form>,
    );
    fireEvent.click(screen.getByText('Reset with values'));
    expect(screen.getByLabelText('cpu')).toHaveValue('99');
    expect(screen.getByText('Changed')).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: 'Reset to original: cpu' }),
    );
    expect(screen.getByLabelText('cpu')).toHaveValue('4');
    fireEvent.click(screen.getByText('Reset, update and submit'));
    await waitFor(() => expect(save).toHaveBeenCalled());
    expect(save.mock.calls[0][0]).toEqual({});
  });

  it('does not omit imperative values in always mode or after the wrapper unmounts', async () => {
    const save = vi.fn();
    const UpdateAndSubmit = () => {
      const { setValue, triggerSubmit } = useFormContext();
      return (
        <button
          onClick={() => {
            setValue('cpu', 4);
            triggerSubmit();
          }}
          type="button"
        >
          Set baseline and submit
        </button>
      );
    };
    const Example = ({ wrapped = true, always = false }) => (
      <Form name="settings" onSubmit={save}>
        {wrapped ? (
          <FieldReset
            include={always ? 'always' : 'changed'}
            name="cpu"
            resetValue={4}
          >
            {({ transform, resetAction }) => (
              <>
                <Field name="cpu" transform={transform} />
                {resetAction}
              </>
            )}
          </FieldReset>
        ) : (
          <Field name="cpu" />
        )}
        <UpdateAndSubmit />
      </Form>
    );
    const { rerender } = render(<Example always />);
    fireEvent.click(screen.getByText('Set baseline and submit'));
    await waitFor(() => expect(save).toHaveBeenCalledTimes(1));
    expect(save.mock.calls[0][0]).toEqual({ cpu: 4 });
    rerender(<Example />);
    fireEvent.click(screen.getByText('Set baseline and submit'));
    await waitFor(() => expect(save).toHaveBeenCalledTimes(2));
    expect(save.mock.calls[1][0]).toEqual({});
    rerender(<Example wrapped={false} />);
    fireEvent.click(screen.getByText('Set baseline and submit'));
    await waitFor(() => expect(save).toHaveBeenCalledTimes(3));
    expect(save.mock.calls[2][0]).toEqual({ cpu: 4 });
  });

  it('removes conversion when an undefined-valued field loses its wrapper', async () => {
    const save = vi.fn();
    const Controls = () => {
      const { setValue, triggerSubmit } = useFormContext();
      return (
        <>
          <button onClick={() => setValue('cpu', undefined)} type="button">
            Clear raw value
          </button>
          <button
            onClick={() => {
              setValue('cpu', 4);
              triggerSubmit();
            }}
            type="button"
          >
            Submit ordinary field
          </button>
        </>
      );
    };
    const Example = ({ wrapped = true }) => (
      <Form name="settings" onSubmit={save}>
        {wrapped ? (
          <FieldReset name="cpu" resetValue={4}>
            {({ transform }) => <Field name="cpu" transform={transform} />}
          </FieldReset>
        ) : (
          <Field name="cpu" />
        )}
        <Controls />
      </Form>
    );
    const { rerender } = render(<Example />);
    fireEvent.click(screen.getByText('Clear raw value'));
    rerender(<Example wrapped={false} />);
    fireEvent.click(screen.getByText('Submit ordinary field'));
    await waitFor(() => expect(save).toHaveBeenCalled());
    expect(save.mock.calls[0][0]).toEqual({ cpu: 4 });
  });

  it('does not retain a field after its controller unregisters on unmount', async () => {
    const save = vi.fn();
    const UnregisteredField = () => {
      const { field } = useController({ name: 'cpu', shouldUnregister: true });
      return <input aria-label="cpu" {...field} />;
    };
    const Example = ({ visible = true }) => (
      <Form name="settings" onSubmit={save}>
        {visible ? (
          <FieldReset include="always" name="cpu" resetValue={4}>
            {() => <UnregisteredField />}
          </FieldReset>
        ) : null}
      </Form>
    );
    const { rerender } = render(<Example />);
    rerender(<Example visible={false} />);
    submit();
    await waitFor(() =>
      expect(save).toHaveBeenCalledWith({}, expect.anything()),
    );
  });
});
