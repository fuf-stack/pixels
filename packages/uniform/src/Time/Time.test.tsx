import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { resetLocalTimeZone, setLocalTimeZone } from '@internationalized/date';
import storySnapshots from '@repo/storybook-config/story-snapshots';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from 'storybook/test';

import { string, veto } from '@fuf-stack/veto';

import Form from '../Form';
import { useFormContext } from '../hooks/useFormContext';
import * as stories from './stories/Time.stories';
import Time from './Time';

describe('Story Snapshots', () => {
  // Force a deterministic local timezone so snapshot output is stable
  // across machines/CI runners.
  beforeAll(() => {
    setLocalTimeZone('UTC');
  });

  // Reset global timezone override to avoid leaking test state.
  afterAll(() => {
    resetLocalTimeZone();
  });

  storySnapshots(stories);
});

// -----------------------------------------------------------------------------
// Behavior
// -----------------------------------------------------------------------------

const Reset = ({ empty = false }: { empty?: boolean }) => {
  const { reset } = useFormContext();
  return (
    <button
      onClick={() => reset(empty ? { value: null } : { value: '10:15Z' })}
      type="button"
    >
      Reset
    </button>
  );
};

describe('Owned time field', () => {
  it('registers UTC minutes, updates via keyboard and restores the initial value on reset', async () => {
    const submit = vi.fn();
    render(
      <Form initialValues={{ value: '10:15Z' }} onSubmit={submit}>
        <Time hourCycle={24} label="Appointment" name="value" timeZone="UTC" />
        <Reset />
        <button type="submit">Save</button>
      </Form>,
    );
    const minute = screen.getByRole('spinbutton', { name: /minute/i });
    expect(minute).toHaveAttribute('aria-valuenow', '15');
    minute.focus();
    await userEvent.keyboard('{ArrowUp}');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(submit).toHaveBeenCalled());
    expect(submit.mock.calls[0][0]).toEqual({ value: '10:16Z' });
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(minute).toHaveAttribute('aria-valuenow', '15');
  });

  it('preserves numeric midnight and time value objects', async () => {
    const submit = vi.fn();
    render(
      <Form initialValues={{ value: 0 }} onSubmit={submit}>
        <Time
          hourAsNumber
          hourCycle={24}
          label="Hour"
          name="value"
          timeZone="UTC"
        />
        <Time
          hourCycle={24}
          label="Object"
          name="object"
          timeZone="UTC"
          valueType="timeValue"
        />
        <button type="submit">Save</button>
      </Form>,
    );
    const hour = screen.getByRole('spinbutton', { name: /hour, Hour/i });
    expect(hour).toHaveAttribute('aria-valuenow', '0');
    expect(hour).toHaveTextContent('00');
    const objectHour = screen.getByRole('spinbutton', {
      name: /hour, Object/i,
    });
    objectHour.focus();
    await userEvent.keyboard('9');
    const objectMinute = screen.getByRole('spinbutton', {
      name: /minute, Object/i,
    });
    objectMinute.focus();
    await userEvent.keyboard('30');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(submit).toHaveBeenCalled());
    expect(submit.mock.calls[0][0].value).toBe(0);
    expect(submit.mock.calls[0][0].object).toMatchObject({
      hour: 9,
      minute: 30,
    });
  });

  it('associates help and validation with editable segments and focuses the first segment on error', async () => {
    const submit = vi.fn();
    render(
      <Form onSubmit={submit} validation={veto({ value: string() })}>
        <Time
          description="Use UTC."
          hourCycle={24}
          label="Appointment"
          name="value"
          timeZone="UTC"
        />
        <button type="submit">Save</button>
      </Form>,
    );
    const hour = screen.getByRole('spinbutton', { name: /hour, Appointment/i });
    expect(hour).toHaveAttribute('aria-required', 'true');
    expect(hour).toHaveAccessibleDescription(
      expect.stringContaining('Use UTC.'),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(hour).toHaveFocus());
    await waitFor(() => expect(hour).toHaveAttribute('aria-invalid', 'true'));
    expect(hour).toHaveAccessibleDescription(
      expect.stringContaining(screen.getByTestId('value_error').textContent),
    );
    expect(submit).not.toHaveBeenCalled();
  });

  it('discards partial segments when an empty field is reset', async () => {
    render(
      <Form initialValues={{ value: null }} onSubmit={vi.fn()}>
        <Time hourCycle={24} label="Appointment" name="value" timeZone="UTC" />
        <Reset empty />
      </Form>,
    );
    const hour = screen.getByRole('spinbutton', { name: /hour, Appointment/i });
    hour.focus();
    await userEvent.keyboard('9');
    expect(hour).toHaveAttribute('aria-valuenow', '9');
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(
      screen.getByRole('spinbutton', { name: /hour, Appointment/i }),
    ).not.toHaveAttribute('aria-valuenow');
  });

  it('clears a completed time on reset and omits disabled fields on submission', async () => {
    const submit = vi.fn();
    render(
      <Form
        initialValues={{ value: '10:15Z', disabled: '09:30Z' }}
        onSubmit={submit}
      >
        <Time hourCycle={24} label="Appointment" name="value" timeZone="UTC" />
        <Time disabled label="Disabled" name="disabled" timeZone="UTC" />
        <Reset empty />
        <button type="submit">Save</button>
      </Form>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(submit).toHaveBeenCalled());
    expect(submit.mock.calls[0][0]).toEqual({ value: '10:15Z' });
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(
      screen.getByRole('spinbutton', { name: /hour, Appointment/i }),
    ).not.toHaveAttribute('aria-valuenow');
  });
});
