import { describe, expect, it, vi } from 'vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from 'storybook/test';

import { number, veto } from '@fuf-stack/veto';

import Form from '../Form';
import { useFormContext } from '../hooks/useFormContext';
import Slider from './Slider';
import * as edgeCaseStories from './stories/Slider.edge-cases.stories';
import * as stories from './stories/Slider.stories';

describe('Story Snapshots', () => {
  // keep existing unit snapshot scenarios, composition interactions also run in Chromium
  storySnapshots({
    default: stories.default,
    Default: stories.Default,
    WithLabel: stories.WithLabel,
    WithInitialValue: stories.WithInitialValue,
    AllSizes: stories.AllSizes,
    CustomRange: stories.CustomRange,
    WithStep: stories.WithStep,
    Disabled: stories.Disabled,
    Required: stories.Required,
    Invalid: stories.Invalid,
    WithStartAndEndContent: stories.WithStartAndEndContent,
    WithSteps: stories.WithSteps,
    WithValueTransform: stories.WithValueTransform,
  });
  storySnapshots({
    ...edgeCaseStories,

    // This play function derives pointer coordinates from getBoundingClientRect()
    // and drags by 40% of the track width. JSDOM does not calculate layout, so
    // those rectangles have zero dimensions: the width assertion would fail,
    // and the simulated drag would move zero pixels.
    // Mocking the rectangles could test event handling, but would not verify
    // dragging against the rendered slider's actual geometry. Snapshot only the
    // fixture here; the separate Storybook Chromium suite runs the original play
    // function with real layout and all drag/release/submission assertions.
    EdgeCaseDragThenSubmit: {
      ...edgeCaseStories.EdgeCaseDragThenSubmit,
      play: undefined,
    },
  });
});

// -----------------------------------------------------------------------------
// Behavior
// -----------------------------------------------------------------------------

const Reset = () => {
  const { reset } = useFormContext();
  return (
    <button onClick={() => reset({ value: 0 })} type="button">
      Reset
    </button>
  );
};

describe('Owned slider control', () => {
  it('registers one range input and preserves numeric zero, fractional steps and reset', async () => {
    const submit = vi.fn();
    const { container } = render(
      <Form initialValues={{ value: 0 }} onSubmit={submit}>
        <Slider
          label="Amount"
          maxValue={10}
          minValue={-10}
          name="value"
          step={0.5}
        />
        <Reset />
        <button type="submit">Save</button>
      </Form>,
    );
    const input = screen.getByRole('slider', { name: 'Amount' });
    expect(container.querySelectorAll('input[type="range"]')).toHaveLength(1);
    expect(input).toHaveAttribute('name', 'value');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(submit).toHaveBeenCalled());
    expect(submit.mock.calls[0][0]).toEqual({ value: 0 });
    input.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(input).toHaveValue('0.5');
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(input).toHaveValue('0');
  });

  it('focuses the editable input, associates help/errors and commits an explicit zero selection', async () => {
    const submit = vi.fn();
    render(
      <Form onSubmit={submit} validation={veto({ value: number() })}>
        <Slider description="Choose an amount." label="Amount" name="value" />
        <button type="submit">Save</button>
      </Form>,
    );
    const input = screen.getByRole('slider', { name: 'Amount' });
    expect(input).not.toHaveAttribute('required');
    expect(input).toHaveAccessibleDescription(
      'Choose an amount. Required selection.',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(input).toHaveFocus());
    await waitFor(() => expect(input).toHaveAttribute('aria-invalid', 'true'));
    expect(submit).not.toHaveBeenCalled();
    const error = screen.getByTestId('value_error');
    expect(input).toHaveAccessibleDescription(
      `Choose an amount. ${error.textContent} Required selection.`,
    );
    await userEvent.keyboard('{Home}');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
    expect(submit.mock.calls[0][0]).toEqual({ value: 0 });
  });

  it('keeps disabled inputs inert and retains disabled submission omission', async () => {
    const submit = vi.fn();
    render(
      <Form initialValues={{ value: 25 }} onSubmit={submit}>
        <Slider disabled label="Amount" name="value" />
        <button type="submit">Save</button>
      </Form>,
    );
    const input = screen.getByRole('slider', { name: 'Amount' });
    expect(input).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(submit).toHaveBeenCalled());
    expect(submit.mock.calls[0][0]).toEqual({});
  });
});
