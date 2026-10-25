import type { Story } from './Slider.storySetup';

import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import Input from '../../Input';
import Slider from '../Slider';
import {
  edgecasesRequiredValidation,
  meta as sharedMeta,
} from './Slider.storySetup';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: typeof sharedMeta = {
  ...sharedMeta,
  title: 'uniform/Slider/Edge Cases',
};

export default meta;

// -----------------------------------------------------------------------------
// Edge Cases
// -----------------------------------------------------------------------------

export const EdgeCaseRequiredSubmitFocus: Story = {
  name: 'Required Submit Focus',
  parameters: {
    edgeCaseDescription:
      'Submitting an empty required slider focuses its thumb and shows a focus outline. Arrow keys then adjust the value so it can be submitted.',
    formProps: { validation: edgecasesRequiredValidation, onSubmit: fn() },
  },
  args: { label: 'Required Slider', name: 'sliderField' },
  play: async ({ canvasElement, parameters }) => {
    const canvas = within(canvasElement);
    const { onSubmit } = parameters.formProps;
    onSubmit.mockClear();
    await userEvent.click(canvas.getByRole('button', { name: /submit/i }));
    const input = canvas
      .getByTestId('sliderfield')
      .querySelector('input[name="sliderField"]');
    await waitFor(() => {
      expect(canvas.getByTestId('sliderfield_error')).toHaveTextContent(
        'Field is required',
      );
      expect(input).toHaveFocus();
      const thumb = input?.closest('[data-slot="thumb"]');
      expect(thumb).toHaveAttribute('data-focused', 'true');
      // Chromium verifies the rendered focus indicator. JSDOM has no layout or
      // Tailwind stylesheet, but still runs the focus and keyboard assertions.
      if (thumb && thumb.getBoundingClientRect().width > 0) {
        const style = window.getComputedStyle(thumb);
        expect(style.outlineWidth).toBe('2px');
        expect(style.outlineOffset).toBe('2px');
        expect(style.outlineColor).not.toBe('rgba(0, 0, 0, 0)');
      }
    });
    await expect(onSubmit).not.toHaveBeenCalled();
    await userEvent.keyboard('{ArrowUp}');
    await expect(input).toHaveValue('1');
    await userEvent.click(canvas.getByRole('button', { name: /submit/i }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0]).toEqual({ sliderField: 1 });
    });
  },
};

export const EdgeCaseFocusByTestId: Story = {
  name: 'Focus By Test Id',
  parameters: {
    edgeCaseDescription:
      'Focusing the field by its test ID reaches the slider thumb. Arrow keys adjust the value, and Tab moves to the next field without an extra stop.',
    formProps: { initialValues: { sliderField: 20 }, onSubmit: fn() },
  },
  args: { name: 'sliderField', label: 'Volume', testId: 'volume_control' },
  render: (args) => {
    return (
      <div className="flex w-80 flex-col gap-8">
        <Slider {...args} />
        <Input label="Another field" name="otherField" />
      </div>
    );
  },
  play: async ({ canvasElement, parameters }) => {
    const canvas = within(canvasElement);
    const { onSubmit } = parameters.formProps;
    onSubmit.mockClear();
    const wrapper = canvas.getByTestId('volume_control');
    wrapper.focus();
    const activeInput = wrapper.querySelector('input[name="sliderField"]');
    await expect(activeInput).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    await expect(activeInput).toHaveValue('21');

    const otherField = canvas.getByRole('textbox', { name: /Another field/ });
    await userEvent.tab();
    await expect(otherField).toHaveFocus();
    await userEvent.tab({ shift: true });
    await expect(activeInput).toHaveFocus();
    // The wrapper must not add a stop beside the single registered input.
    await expect(wrapper).toHaveAttribute('tabindex', '-1');

    // Programmatic RHF focus follows the same path as wrapper focus.
    otherField.focus();
    wrapper
      .querySelector<HTMLInputElement>('input[name="sliderField"]')
      ?.focus();
    await expect(activeInput).toHaveFocus();
    await userEvent.click(canvas.getByRole('button', { name: /submit/i }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0]).toEqual({ sliderField: 21 });
    });
  },
};

export const EdgeCaseDisabledFocusByTestId: Story = {
  ...EdgeCaseFocusByTestId,
  name: 'Disabled Focus By Test Id',
  parameters: {
    ...EdgeCaseFocusByTestId.parameters,
    edgeCaseDescription:
      'Trying to focus a disabled slider leaves focus on the other field. The disabled slider does not become a keyboard stop.',
  },
  args: { ...EdgeCaseFocusByTestId.args, disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const otherField = canvas.getByRole('textbox', { name: /Another field/ });
    otherField.focus();
    const wrapper = canvas.getByTestId('volume_control');
    wrapper.focus();
    await expect(otherField).toHaveFocus();
    await expect(wrapper).not.toHaveAttribute('tabindex');
    await expect(
      wrapper.querySelector('input[name="sliderField"]'),
    ).toBeDisabled();
  },
};

export const EdgeCaseDragThenSubmit: Story = {
  name: 'Drag Then Submit',
  parameters: {
    edgeCaseDescription:
      'After dragging and releasing the thumb, moving to another field and clicking Submit must preserve the selected value. Step dots are hidden.',
    formProps: {
      initialValues: { sliderField: 20 },
      onSubmit: fn(),
    },
  },
  args: {
    name: 'sliderField',
    label: 'Volume',
    showSteps: false,
  },
  render: (args) => {
    return (
      <div className="flex w-80 flex-col gap-8">
        <Slider {...args} />
        <Input label="Another field" name="otherField" />
      </div>
    );
  },
  play: async ({ canvasElement, parameters }) => {
    const canvas = within(canvasElement);
    const { onSubmit } = parameters.formProps;
    onSubmit.mockClear();
    const slider = canvas.getByTestId('sliderfield');
    const thumb = slider.querySelector('[data-slot="thumb"]');
    const track = slider.querySelector('[data-slot="track"]');
    const input = slider.querySelector<HTMLInputElement>(
      'input[name="sliderField"]',
    );
    if (!thumb || !track || !input) {
      throw new Error('Slider thumb, track, or input not found');
    }
    const thumbRect = thumb.getBoundingClientRect();
    const trackRect = track.getBoundingClientRect();
    // This play function runs in Chromium: drag distances require real layout.
    await expect(trackRect.width).toBeGreaterThan(0);
    await expect(input).toHaveValue('20');
    // user-event does not derive page coordinates from client coordinates.
    // React Aria uses pageX/pageY to calculate drag deltas.
    const coords = (clientX: number, clientY: number) => {
      return {
        clientX,
        clientY,
        pageX: clientX + window.scrollX,
        pageY: clientY + window.scrollY,
      };
    };
    const start = coords(
      thumbRect.x + thumbRect.width / 2,
      thumbRect.y + thumbRect.height / 2,
    );
    const end = coords(start.clientX + trackRect.width * 0.4, start.clientY);
    await userEvent.pointer([
      { target: thumb, coords: start, keys: '[MouseLeft>]' },
      { target: thumb, coords: end },
      { target: thumb, coords: end, keys: '[/MouseLeft]' },
    ]);
    await waitFor(() => {
      expect(Number(input.value)).toBeCloseTo(60, 0);
    });
    const draggedValue = input.value;

    const otherField = canvas.getByRole('textbox', { name: /Another field/ });
    const submit = canvas.getByRole('button', { name: /submit/i });
    // Explicit movement after release catches stale document-level drag listeners.
    const moveAndClick = async (target: HTMLElement) => {
      const rect = target.getBoundingClientRect();
      await userEvent.pointer({
        target,
        coords: coords(rect.right - 2, rect.y + rect.height / 2),
      });
      await userEvent.click(target);
      await expect(input).toHaveValue(draggedValue);
    };
    await moveAndClick(otherField);
    await expect(otherField).toHaveFocus();
    await moveAndClick(submit);
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0]).toEqual({
        sliderField: Number(draggedValue),
      });
    });
  },
};

export const EdgeCaseRequiredTouchedViaTab: Story = {
  name: 'Required Touched Via Tab',
  parameters: {
    edgeCaseDescription:
      'An empty required slider shows its validation error after you Tab into it and then Tab away without changing its value.',
    formProps: { validation: edgecasesRequiredValidation },
  },
  args: {
    label: 'Required Slider (Tab Test)',
    name: 'sliderField',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // // Initially, no error should be visible (field not touched yet)
    // const errorElement = canvas.getByTestId('sliderfield_error');
    // expect(errorElement).not.toBeVisible();

    // Simulate tabbing to the slider
    await userEvent.tab();

    // Wait for the 100ms delay that prevents premature blur during initialization
    await new Promise((resolve) => {
      setTimeout(resolve, 150);
    });

    // Tab away from the slider
    await userEvent.tab();

    // After tabbing away, validation error should appear
    await waitFor(() => {
      const errorElement = canvas.getByTestId('sliderfield_error');
      expect(errorElement).not.toBeEmptyDOMElement();
      expect(errorElement).toHaveTextContent('Field is required');
    });
  },
};
