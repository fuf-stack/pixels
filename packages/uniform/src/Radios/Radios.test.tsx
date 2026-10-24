import { describe, expect, it, vi } from 'vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from 'storybook/test';

import { number, veto } from '@fuf-stack/veto';

import Form from '../Form';
import { useFormContext } from '../hooks/useFormContext';
import Radios from './Radios';
import * as stories from './stories/Radios.stories';

describe('Story Snapshots', () => {
  storySnapshots(stories);
});

// -----------------------------------------------------------------------------
// Behavior
// -----------------------------------------------------------------------------

const options = [
  { label: 'Zero', value: 0 },
  { label: 'Disabled', value: 1, disabled: true },
  { label: 'Two', value: 2 },
];
const Reset = () => {
  const { reset } = useFormContext();
  return (
    <button onClick={() => reset({ choice: 0 })} type="button">
      Reset
    </button>
  );
};

describe('Owned radio group', () => {
  it('preserves numeric zero, changes, disabled options and resets in custom layouts', async () => {
    const submit = vi.fn();
    render(
      <Form initialValues={{ choice: 0 }} onSubmit={submit}>
        <Radios label="Choice" name="choice" options={options}>
          {(items) => (
            <section>
              {items.map(({ radio, option, state }) => (
                <div key={option.value} data-selected={state.selected}>
                  {radio}
                </div>
              ))}
            </section>
          )}
        </Radios>
        <Reset />
        <button type="submit">Save</button>
      </Form>,
    );
    expect(screen.getByRole('radio', { name: 'Zero' })).toBeChecked();
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(submit).toHaveBeenCalled());
    expect(submit.mock.calls[0][0]).toEqual({ choice: 0 });
    await userEvent.click(screen.getByRole('radio', { name: 'Two' }));
    expect(screen.getByRole('radio', { name: 'Two' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Disabled' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByRole('radio', { name: 'Zero' })).toBeChecked();
  });

  it('focuses an editable radio and associates required help and errors on invalid submit', async () => {
    render(
      <Form onSubmit={() => {}} validation={veto({ choice: number() })}>
        <Radios
          description="Pick a number."
          label="Choice"
          name="choice"
          options={options}
        />
        <button type="submit">Save</button>
      </Form>,
    );
    const group = screen.getByRole('radiogroup', { name: 'Choice' });
    expect(group).toHaveAccessibleDescription('Pick a number.');
    expect(group).toHaveAttribute('aria-required', 'true');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    const zero = screen.getByRole('radio', { name: 'Zero' });
    await waitFor(() => expect(zero).toHaveFocus());
    await waitFor(() => expect(group).toHaveAttribute('aria-invalid', 'true'));
    const error = screen.getByTestId('choice_error');
    expect(zero).toHaveAccessibleDescription(
      `Pick a number. ${error.textContent}`,
    );
    expect(zero).not.toHaveAttribute('required');
  });

  it('keeps disabled groups inert', async () => {
    render(
      <Form initialValues={{ choice: 0 }} onSubmit={() => {}}>
        <Radios disabled label="Choice" name="choice" options={options} />
      </Form>,
    );
    const zero = screen.getByRole('radio', { name: 'Zero' });
    expect(zero).toBeDisabled();
    await userEvent.click(screen.getByRole('radio', { name: 'Two' }));
    expect(zero).toBeChecked();
  });
});
