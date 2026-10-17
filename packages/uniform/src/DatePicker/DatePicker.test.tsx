import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { resetLocalTimeZone, setLocalTimeZone } from '@internationalized/date';
import storySnapshots from '@repo/storybook-config/story-snapshots';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from 'storybook/test';

import { string, veto } from '@fuf-stack/veto';

import Form from '../Form';
import { useFormContext } from '../hooks/useFormContext';
import DatePicker from './DatePicker';
import * as stories from './stories/DatePicker.stories';

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

  // preserve the original snapshot scenarios, popup composition runs in Chromium
  storySnapshots({
    default: stories.default,
    Default: stories.Default,
    WithTime: stories.WithTime,
    Required: stories.Required,
    WithInitialValue: stories.WithInitialValue,
    Disabled: stories.Disabled,
    Invalid: stories.Invalid,
    MinAndMaxValueWithoutTime: stories.MinAndMaxValueWithoutTime,
    MinAndMaxValueWithTime: stories.MinAndMaxValueWithTime,
    HideTimeZone: stories.HideTimeZone,
    WithCustomTimeZone: stories.WithCustomTimeZone,
    TwelveHourCycle: stories.TwelveHourCycle,
    WithUtcTimeZone: stories.WithUtcTimeZone,
  });
});

// -----------------------------------------------------------------------------
// Behavior
// -----------------------------------------------------------------------------

const Reset = ({ empty = false }: { empty?: boolean }) => {
  const { reset } = useFormContext();
  return (
    <button
      onClick={() =>
        reset({ value: empty ? null : '2026-05-30T10:15:00.000Z' })
      }
      type="button"
    >
      Reset
    </button>
  );
};

describe('Owned date picker', () => {
  it('shares the local timezone override with React Aria native inputs', () => {
    setLocalTimeZone('UTC');

    try {
      const { container } = render(
        <Form
          initialValues={{ value: '2026-05-30T10:15:00.000Z' }}
          onSubmit={vi.fn()}
        >
          <DatePicker
            label="Appointment"
            name="value"
            timeZone="America/New_York"
            withTime
          />
        </Form>,
      );

      expect(screen.getByRole('spinbutton', { name: /hour/i })).toHaveAttribute(
        'aria-valuenow',
        '6',
      );

      const nativeInputs = container.querySelectorAll<HTMLInputElement>(
        'input[type="datetime-local"]',
      );
      expect(nativeInputs.length).toBeGreaterThan(0);
      nativeInputs.forEach((input) => {
        expect(input).toHaveAttribute('value', '2026-05-30T10:15:00');
      });
    } finally {
      resetLocalTimeZone();
    }
  });

  it('edits local time while retaining UTC serialization and reset', async () => {
    const submit = vi.fn();
    render(
      <Form
        initialValues={{ value: '2026-05-30T10:15:00.000Z' }}
        onSubmit={submit}
      >
        <DatePicker
          label="Appointment"
          name="value"
          timeZone="America/New_York"
          withTime
        />
        <Reset />
        <button type="submit">Save</button>
      </Form>,
    );
    expect(screen.getByRole('spinbutton', { name: /hour/i })).toHaveAttribute(
      'aria-valuenow',
      '6',
    );
    const minute = screen.getByRole('spinbutton', { name: /minute/i });
    minute.focus();
    await userEvent.keyboard('{ArrowUp}');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(submit).toHaveBeenCalled());
    expect(submit.mock.calls[0][0]).toEqual({
      value: '2026-05-30T10:16:00.000Z',
    });
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(minute).toHaveAttribute('aria-valuenow', '15');
  });

  it('preserves date object values and clears completed edits', async () => {
    const submit = vi.fn();
    render(
      <Form initialValues={{ value: '2026-05-30' }} onSubmit={submit}>
        <DatePicker label="Date" name="value" valueType="dateValue" />
        <Reset empty />
        <button type="submit">Save</button>
      </Form>,
    );
    const day = screen.getByRole('spinbutton', { name: /day/i });
    day.focus();
    await userEvent.keyboard('{ArrowUp}');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(submit).toHaveBeenCalled());
    expect(submit.mock.calls[0][0].value).toMatchObject({
      year: 2026,
      month: 5,
      day: 31,
    });
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(day).not.toHaveAttribute('aria-valuenow');
  });

  it('clears partial empty edits on reset', async () => {
    render(
      <Form initialValues={{ value: null }} onSubmit={vi.fn()}>
        <DatePicker label="Date" name="value" />
        <Reset empty />
      </Form>,
    );
    const month = screen.getByRole('spinbutton', { name: /month/i });
    month.focus();
    await userEvent.keyboard('5');
    expect(month).toHaveAttribute('aria-valuenow', '5');
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(month).not.toHaveAttribute('aria-valuenow');
  });

  it('associates help and errors with editable segments and focuses the first segment', async () => {
    const submit = vi.fn();
    render(
      <Form onSubmit={submit} validation={veto({ value: string() })}>
        <DatePicker description="Choose a date." label="Date" name="value" />
        <button type="submit">Save</button>
      </Form>,
    );
    const month = screen.getByRole('spinbutton', { name: /month/i });
    expect(month).toHaveAttribute('aria-required', 'true');
    expect(month).toHaveAccessibleDescription(
      expect.stringContaining('Choose a date.'),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(month).toHaveFocus());
    await waitFor(() => expect(month).toHaveAttribute('aria-invalid', 'true'));
    expect(month).toHaveAccessibleDescription(
      expect.stringContaining(screen.getByTestId('value_error').textContent),
    );
    expect(submit).not.toHaveBeenCalled();
  });

  it('enforces calendar limits, selects a date, closes the popup and returns focus', async () => {
    const submit = vi.fn();
    render(
      <Form initialValues={{ value: '2026-05-15' }} onSubmit={submit}>
        <DatePicker
          label="Date"
          maxValue="2026-05-20"
          minValue="2026-05-10"
          name="value"
        />
        <button type="submit">Save</button>
      </Form>,
    );
    const trigger = screen.getByRole('button', { name: /calendar/i });
    await userEvent.click(trigger);
    expect(
      screen.getByRole('button', { name: /May 9, 2026/i }),
    ).toHaveAttribute('aria-disabled', 'true');
    expect(
      screen
        .getAllByRole('button', { name: /^next$/i })
        .find((button) => button.getAttribute('slot') === 'next'),
    ).toBeDisabled();
    await userEvent.click(
      screen.getByRole('button', { name: /May 16, 2026/i }),
    );
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(submit).toHaveBeenCalled());
    expect(submit.mock.calls[0][0]).toEqual({
      value: '2026-05-16T00:00:00.000Z',
    });
  });

  it('retains disabled submission omission and disables the calendar trigger', async () => {
    const submit = vi.fn();
    render(
      <Form initialValues={{ value: '2026-05-30' }} onSubmit={submit}>
        <DatePicker disabled label="Date" name="value" />
        <button type="submit">Save</button>
      </Form>,
    );
    expect(screen.getByRole('button', { name: /Calendar/i })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(submit).toHaveBeenCalled());
    expect(submit.mock.calls[0][0]).toEqual({});
  });
});
