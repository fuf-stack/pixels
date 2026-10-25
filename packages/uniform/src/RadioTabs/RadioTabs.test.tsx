import { describe, expect, it, vi } from 'vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from 'storybook/test';

import { number, veto } from '@fuf-stack/veto';

import Form from '../Form';
import { useFormContext } from '../hooks/useFormContext';
import RadioTabs from './RadioTabs';
import * as stories from './stories/RadioTabs.stories';

describe('Story Snapshots', () => {
  // keep existing unit snapshot scenarios, composition interactions also run in Chromium
  storySnapshots({
    default: stories.default,
    Default: stories.Default,
    CustomStyling: stories.CustomStyling,
    NumberValues: stories.NumberValues,
    WithContent: stories.WithContent,
    BooleanValuesWithConditionalField:
      stories.BooleanValuesWithConditionalField,
    WithInitialValue: stories.WithInitialValue,
    DisabledCompletely: stories.DisabledCompletely,
    DisabledOption: stories.DisabledOption,
    Required: stories.Required,
    Invalid: stories.Invalid,
    InvalidWithContent: stories.InvalidWithContent,
    FullWidth: stories.FullWidth,
  });
});

// -----------------------------------------------------------------------------
// Behavior
// -----------------------------------------------------------------------------

const options = [
  { label: 'Zero', value: 0, content: 'Zero panel' },
  { label: 'Disabled', value: 1, disabled: true },
  { label: 'Two', value: 2, content: 'Two panel' },
];
const Reset = () => {
  const { reset } = useFormContext();
  return (
    <button onClick={() => reset({ choice: 0 })} type="button">
      Reset
    </button>
  );
};

describe('Owned tab selection field', () => {
  it('preserves numeric zero, editable tab changes, content and reset without a ghost input', async () => {
    const submit = vi.fn();
    const { container } = render(
      <Form initialValues={{ choice: 0 }} onSubmit={submit}>
        <RadioTabs label="Choice" name="choice" options={options} />
        <Reset />
        <button type="submit">Save</button>
      </Form>,
    );
    expect(container.querySelectorAll('input')).toHaveLength(0);
    expect(screen.getByRole('tab', { name: 'Zero' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(submit).toHaveBeenCalled());
    expect(submit.mock.calls[0][0]).toEqual({ choice: 0 });
    await userEvent.click(screen.getByRole('tab', { name: 'Two' }));
    expect(screen.getByText('Two panel')).toBeVisible();
    expect(screen.getByRole('tab', { name: 'Disabled' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByRole('tab', { name: 'Zero' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('focuses the selected enabled tab and associates help and errors on invalid submit', async () => {
    render(
      <Form
        initialValues={{ choice: 2 }}
        onSubmit={() => {}}
        validation={veto({ choice: number().max(0) })}
      >
        <RadioTabs
          description="Pick zero."
          label="Choice"
          name="choice"
          options={options}
        />
        <button type="submit">Save</button>
      </Form>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    const selected = screen.getByRole('tab', { name: 'Two' });
    await waitFor(() => expect(selected).toHaveFocus());
    const group = screen.getByRole('group', { name: 'Choice' });
    await waitFor(() => expect(group).toHaveAttribute('aria-invalid', 'true'));
    const error = screen.getByTestId('choice_error');
    expect(selected).toHaveAccessibleDescription(
      `Pick zero. ${error.textContent} Required selection.`,
    );
  });

  it('keeps all disabled tabs inert and retains the boolean selection', async () => {
    render(
      <Form initialValues={{ choice: false }} onSubmit={() => {}}>
        <RadioTabs
          disabled
          label="Choice"
          name="choice"
          options={[
            { label: 'No', value: false },
            { label: 'Yes', value: true },
          ]}
        />
      </Form>,
    );
    const no = screen.getByRole('tab', { name: 'No' });
    expect(no).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(screen.getByRole('tab', { name: 'Yes' }));
    expect(no).toHaveAttribute('aria-selected', 'true');
  });
});
