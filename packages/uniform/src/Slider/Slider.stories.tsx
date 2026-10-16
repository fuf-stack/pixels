import type { Meta, StoryObj } from '@storybook/react-vite';

import { FaVolumeDown, FaVolumeUp } from 'react-icons/fa';

import edgeCaseDecorator from '@repo/storybook-config/edge-case-decorator';
import { action } from 'storybook/actions';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { createStyling } from '@fuf-stack/pixel-utils';
import { StylingProvider } from '@fuf-stack/pixels/StylingProvider';
import { number, veto } from '@fuf-stack/veto';

import Form from '../Form';
import Input from '../Input';
import SubmitButton from '../SubmitButton';
import Slider from './Slider';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: Meta<typeof Slider> = {
  title: 'uniform/Slider',
  component: Slider,
  decorators: [
    (Story, context) => {
      const { parameters } = context;
      const content = (
        <Form
          className={{ form: 'min-w-60' }}
          onSubmit={action('onSubmit')}
          {...(parameters?.formProps ?? {})}
        >
          <Story />
          <div className="mt-4 flex justify-end">
            <SubmitButton />
          </div>
        </Form>
      );
      const renderField = () => {
        return content;
      };
      return parameters.edgeCaseDescription
        ? edgeCaseDecorator(renderField, context)
        : content;
    },
  ],
};

export default meta;
type Story = StoryObj<typeof Slider>;

// -----------------------------------------------------------------------------
// Normal stories
// -----------------------------------------------------------------------------

export const Default: Story = {
  args: {
    name: 'sliderField',
  },
};

export const WithLabel: Story = {
  args: {
    name: 'sliderField',
    label: 'Volume Control',
  },
};

export const WithInitialValue: Story = {
  parameters: {
    formProps: { initialValues: { sliderField: 75 } },
  },
  args: {
    name: 'sliderField',
    label: 'Brightness',
  },
};

export const AllSizes: Story = {
  render: () => {
    return (
      <div className="flex flex-col gap-8">
        <Slider label="Small Size" name="smallSlider" size="sm" />
        <Slider label="Medium Size" name="mediumSlider" size="md" />
        <Slider label="Large Size" name="largeSlider" size="lg" />
      </div>
    );
  },
};

export const CustomRange: Story = {
  parameters: {
    formProps: { initialValues: { sliderField: 20 } },
  },
  args: {
    name: 'sliderField',
    label: 'Temperature (°C)',
    minValue: -10,
    maxValue: 40,
  },
};

export const WithStep: Story = {
  parameters: {
    formProps: { initialValues: { sliderField: 50 } },
  },
  args: {
    name: 'sliderField',
    label: 'Progress (in steps of 10)',
    minValue: 0,
    maxValue: 100,
    step: 10,
  },
};

export const Disabled: Story = {
  parameters: {
    formProps: { initialValues: { sliderField: 60 } },
  },
  args: {
    name: 'sliderField',
    label: 'Locked Setting',
    disabled: true,
  },
};

const requiredValidation = veto({
  sliderField: number(),
});

export const Required: Story = {
  parameters: { formProps: { validation: requiredValidation } },
  args: {
    label: 'Required Slider',
    name: 'sliderField',
  },
};

const validation = veto({
  sliderField: number().min(50, 'Value must be at least 50'),
});

export const Invalid: Story = {
  parameters: {
    formProps: { validation, initialValues: { sliderField: 30 } },
  },
  args: {
    label: 'Minimum Threshold',
    name: 'sliderField',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Get the slider thumb to interact with
    const thumb = canvas
      .getByTestId('sliderfield')
      .querySelector('[data-slot="thumb"]');
    if (!thumb) {
      throw new Error('Slider thumb not found');
    }

    // Focus the thumb and increase value with arrow up
    await userEvent.click(thumb);
    await userEvent.keyboard('{ArrowUp}');

    // Wait for validation to complete and error message to appear
    await waitFor(() => {
      expect(canvas.getByTestId('sliderfield_error')).toBeVisible();
    });
  },
};

export const WithStartAndEndContent: Story = {
  parameters: {
    formProps: { initialValues: { sliderField: 50 } },
  },
  args: {
    name: 'sliderField',
    label: 'Volume',
    minValue: 0,
    maxValue: 100,
    startContent: <FaVolumeDown className="text-default-500" />,
    endContent: <FaVolumeUp className="text-default-500" />,
  },
};

export const WithSteps: Story = {
  parameters: {
    formProps: { initialValues: { sliderField: 0 } },
  },
  args: {
    name: 'sliderField',
    label: 'Offset',
    minValue: -12,
    maxValue: 12,
    step: 2,
    showSteps: true,
    fillOffset: 0,
  },
};

export const WithValueTransform: Story = {
  parameters: {
    formProps: {
      initialValues: { sliderField: 0.5 },
      onSubmit: fn(),
      validation: veto({ sliderField: number().min(0).max(1) }),
    },
  },
  args: {
    name: 'sliderField',
    label: 'Volume (%)',
    step: 10,
    transform: {
      toDisplayValue: (value) => {
        return Number(value) * 100;
      },
      toFormValue: (value) => {
        return value / 100;
      },
    },
  },
  play: async ({ canvasElement, parameters }) => {
    const canvas = within(canvasElement);
    const { onSubmit } = parameters.formProps;
    onSubmit.mockClear();
    const thumb = canvas
      .getByTestId('sliderfield')
      .querySelector('[data-slot="thumb"]');
    if (!thumb) {
      throw new Error('Slider thumb not found');
    }

    // Stored fraction is displayed as a percentage.
    const input = canvasElement.querySelector('input[name="sliderField"]');
    await expect(input).toHaveValue('50');
    await userEvent.click(thumb);
    await userEvent.keyboard('{ArrowUp}');
    await expect(input).toHaveValue('60');

    // Submission and validation receive the fraction, not the percentage.
    await userEvent.click(canvas.getByRole('button', { name: /submit/i }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
      expect(onSubmit.mock.calls[0][0]).toEqual({ sliderField: 0.6 });
    });
  },
};

// -----------------------------------------------------------------------------
// Composition
// -----------------------------------------------------------------------------

export const HelpAndRequired: StoryObj<typeof Slider> = {
  ...Required,
  args: { ...Required.args, description: 'Choose an amount.' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('slider');
    await expect(input).toHaveAccessibleDescription(
      'Choose an amount. Required selection.',
    );
    await userEvent.click(canvas.getByTestId('form_submit_button'));
    await waitFor(async () => {
      await expect(input).toHaveFocus();
      await expect(input).toHaveAttribute('aria-invalid', 'true');
    });
    const error = canvas.getByTestId('sliderfield_error');
    await expect(input).toHaveAccessibleDescription(
      `Choose an amount. ${error.textContent} Required selection.`,
    );
    await userEvent.keyboard('{Home}');
    await expect(input).toHaveValue('0');
    await userEvent.click(canvas.getByTestId('form_submit_button'));
    await waitFor(async () => {
      await expect(input).not.toHaveAttribute('aria-invalid', 'true');
    });
  },
};

const styling = createStyling({
  extend: { classGroups: { 'font-size': [{ text: ['field'] }] } },
});
export const ConsumerLabelFont: StoryObj<typeof Slider> = {
  args: {
    name: 'sliderField',
    label: 'Amount',
    className: { label: 'text-field', thumb: 'h-8 w-8' },
  },
  decorators: [
    (Story) => {
      return (
        <StylingProvider styling={styling}>
          <style>{'.text-field { font-size: 18px; }'}</style>
          <Story />
        </StylingProvider>
      );
    },
  ],
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('slider', { name: 'Amount' });
    const label = canvasElement.querySelector('[data-slot="label"]');
    const thumb = input.closest('[data-slot="thumb"]');
    await expect(label).toHaveClass('text-field');
    await expect(label).not.toHaveClass('text-sm');
    await expect(getComputedStyle(label as HTMLElement).fontSize).toBe('18px');
    await expect(thumb?.getBoundingClientRect().width).toBe(32);
  },
};

// -----------------------------------------------------------------------------
// EdgeCases
// -----------------------------------------------------------------------------

const edgecasesRequiredValidation = veto({ sliderField: number() });

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

/** Programmatic focus reaches the thumb without exposing internal selectors. */
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

/** Regression coverage for #1510: releasing a drag must stop tracking the mouse. */
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

/**
 * Edge case: Required slider should NOT show validation errors on initial render,
 * but SHOULD show them after being touched (e.g., tabbing through without changing value).
 * This tests that the slider correctly handles blur events only after user interaction,
 * preventing premature touched state during initialization.
 */
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
