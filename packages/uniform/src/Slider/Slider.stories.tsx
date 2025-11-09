import type { Meta, StoryObj } from '@storybook/react-vite';

import { FaVolumeDown, FaVolumeUp } from 'react-icons/fa';

import { action } from 'storybook/actions';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { SubmitButton } from '@fuf-stack/uniform';
import { number, veto } from '@fuf-stack/veto';

import { Form } from '../Form';
import Slider from './Slider';

const meta: Meta<typeof Slider> = {
  title: 'uniform/Slider',
  component: Slider,
  decorators: [
    (Story, { parameters }) => {
      return (
        <Form
          className="min-w-60"
          onSubmit={action('onSubmit')}
          {...(parameters?.formProps ?? {})}
        >
          <Story />
          <div className="mt-4 flex justify-end">
            <SubmitButton />
          </div>
        </Form>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof Slider>;

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
  sliderField: number().refine((value: number) => {
    return value >= 50;
  }, 'Value must be at least 50'),
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
    const slider = canvas.getByTestId('sliderfield');

    // Trigger validation by interacting with slider
    await userEvent.click(slider);

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
