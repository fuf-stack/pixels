import type { Story } from './Slider.storySetup';

import { FaVolumeDown, FaVolumeUp } from 'react-icons/fa';

import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { StylingProvider } from '@fuf-stack/pixels/StylingProvider';
import { number, veto } from '@fuf-stack/veto';

import Slider from '../Slider';
import {
  requiredValidation,
  meta as sharedMeta,
  styling,
  validation,
} from './Slider.storySetup';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: typeof sharedMeta = { ...sharedMeta, title: 'uniform/Slider' };

export default meta;

// -----------------------------------------------------------------------------
// Normal and composition stories
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

export const Required: Story = {
  parameters: { formProps: { validation: requiredValidation } },
  args: {
    label: 'Required Slider',
    name: 'sliderField',
  },
};

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

export const HelpAndRequired: Story = {
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

export const ConsumerLabelFont: Story = {
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
