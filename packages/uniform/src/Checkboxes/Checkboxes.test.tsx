import { describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import '@testing-library/jest-dom/vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';
import { userEvent } from 'storybook/test';

import { array, object, refineObject, string, veto } from '@fuf-stack/veto';

import Form from '../Form';
import { useFormContext } from '../hooks/useFormContext';
import Checkboxes from './Checkboxes';
import * as stories from './stories/Checkboxes.stories';

describe('Story Snapshots', () => {
  storySnapshots(stories);
});

describe('Checkboxes array error rendering', () => {
  it('renders nested index errors for checkbox groups', async () => {
    const validation = veto(
      refineObject(
        object({
          flavors: array(string()),
        }),
      )({
        custom: (_, ctx) => {
          ctx.addIssue({
            code: 'custom',
            message: 'Select at least one flavor',
            path: ['flavors', '0'],
          });
        },
      }),
    );

    render(
      <Form
        initialValues={{ flavors: ['vanilla'] }}
        onSubmit={() => {}}
        testId="form"
        validation={validation}
      >
        <Checkboxes
          label="Flavors"
          name="flavors"
          options={[{ label: 'Vanilla', value: 'vanilla' }]}
        />
        <button data-testid="submit" type="submit">
          Submit
        </button>
      </Form>,
    );

    fireEvent.click(screen.getByTestId('submit'));

    await waitFor(() => {
      expect(screen.getByTestId('flavors_error')).toContainHTML(
        'Select at least one flavor',
      );
    });
  });
});

// -----------------------------------------------------------------------------
// Behavior
// -----------------------------------------------------------------------------

const options = [
  { label: 'First', value: 'first', meta: { order: 1 } },
  { label: 'Disabled', value: 'disabled', disabled: true },
  { label: 'Second', value: 'second' },
];
const Reset = () => {
  const { reset } = useFormContext();
  return (
    <button onClick={() => reset({ choice: ['first'] })} type="button">
      Reset
    </button>
  );
};

describe('Owned checkbox selection group', () => {
  it('keeps label clicks, keyboard focus and styling on the checkbox button', async () => {
    render(
      <Form onSubmit={vi.fn()}>
        <Checkboxes
          name="choice"
          options={[
            { label: 'First', labelSubline: 'Supporting text', value: 'first' },
          ]}
        />
      </Form>,
    );

    const input = screen.getByRole('checkbox', {
      name: 'First Supporting text',
    });
    const button = screen.getByTestId('choice_option_first');
    expect(button.tagName).toBe('LABEL');
    expect(button).toHaveAttribute('for', input.id);
    expect(button.parentElement).toHaveClass('contents');

    await userEvent.click(screen.getByText('Supporting text'));
    expect(input).toBeChecked();
    expect(input).toHaveFocus();
    expect(button).toHaveAttribute('data-selected', 'true');

    await userEvent.keyboard(' ');
    expect(input).not.toBeChecked();
    expect(button).not.toHaveAttribute('data-selected');
  });

  it('preserves array values, custom descriptors, option changes and resets', async () => {
    const submit = vi.fn();
    const { container } = render(
      <Form initialValues={{ choice: ['first'] }} onSubmit={submit}>
        <Checkboxes label="Choice" name="choice" options={options}>
          {(items) => (
            <section>
              {items.map(({ checkbox, option, state }) => (
                <article key={option.value} data-selected={state.checked}>
                  {checkbox}
                </article>
              ))}
            </section>
          )}
        </Checkboxes>
        <Reset />
        <button type="submit">Save</button>
      </Form>,
    );
    expect(container.querySelectorAll('input')).toHaveLength(3);
    expect(screen.getByRole('checkbox', { name: 'First' })).toHaveAttribute(
      'name',
      'choice',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(submit).toHaveBeenCalled());
    expect(submit.mock.calls[0][0]).toEqual({ choice: ['first'] });
    await userEvent.click(screen.getByRole('checkbox', { name: 'Second' }));
    await userEvent.click(screen.getByRole('checkbox', { name: 'First' }));
    expect(screen.getByRole('checkbox', { name: 'Second' })).toBeChecked();
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByRole('checkbox', { name: 'First' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Second' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Disabled' })).toBeDisabled();
  });

  it('focuses an enabled input and associates required help and array errors', async () => {
    render(
      <Form
        onSubmit={() => {}}
        validation={veto({ choice: array(string()).min(1) })}
      >
        <Checkboxes
          description="Pick at least one."
          label="Choice"
          name="choice"
          options={[
            { label: 'Disabled', value: 'disabled', disabled: true },
            { label: 'First', value: 'first' },
          ]}
        />
        <button type="submit">Save</button>
      </Form>,
    );
    const input = screen.getByRole('checkbox', { name: 'First' });
    expect(input).not.toHaveAttribute('required');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(input).toHaveFocus());
    const group = screen.getByRole('group', { name: 'Choice' });
    await waitFor(() => expect(group).toHaveAttribute('aria-invalid', 'true'));
    const error = screen.getByTestId('choice_error');
    expect(input).toHaveAccessibleDescription(
      `Pick at least one. ${error.textContent} Required selection.`,
    );
    await userEvent.keyboard(' ');
    expect(input).toBeChecked();
  });

  it('preserves transformed scalar values and keeps clearing optional selections empty', async () => {
    const submit = vi.fn();
    render(
      <Form initialValues={{ choice: 'first' }} onSubmit={submit}>
        <Checkboxes
          label="Choice"
          name="choice"
          options={options}
          transform={{
            toDisplayValue: (value) =>
              typeof value === 'string' ? [value] : [],
            toFormValue: (values) => values[values.length - 1] ?? null,
          }}
        />
        <button type="submit">Save</button>
      </Form>,
    );
    await userEvent.click(screen.getByRole('checkbox', { name: 'Second' }));
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(submit).toHaveBeenCalled());
    expect(submit.mock.calls[0][0]).toEqual({ choice: 'second' });
    await userEvent.click(screen.getByRole('checkbox', { name: 'Second' }));
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(submit).toHaveBeenCalledTimes(2));
    expect(submit.mock.calls[1][0]).toEqual({});
  });

  it('keeps disabled groups inert and preserves RHF submission omission', async () => {
    const submit = vi.fn();
    render(
      <Form initialValues={{ choice: ['first'] }} onSubmit={submit}>
        <Checkboxes disabled label="Choice" name="choice" options={options} />
        <button type="submit">Save</button>
      </Form>,
    );
    expect(screen.getByRole('checkbox', { name: 'First' })).toBeDisabled();
    await userEvent.click(screen.getByRole('checkbox', { name: 'Second' }));
    expect(screen.getByRole('checkbox', { name: 'First' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Second' })).not.toBeChecked();
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(submit).toHaveBeenCalled());
    expect(submit.mock.calls[0][0]).toEqual({});
  });

  it('retains accessible names from ReactNode labels and option sublines', () => {
    render(
      <Form onSubmit={() => {}}>
        <Checkboxes
          name="choice"
          options={[
            {
              value: 'status_delivered',
              label: <span>Delivered</span>,
              labelSubline: 'Already shipped',
            },
          ]}
        />
      </Form>,
    );
    expect(
      screen.getByRole('checkbox', { name: 'Delivered Already shipped' }),
    ).toHaveAttribute('value', 'status_delivered');
  });
});
