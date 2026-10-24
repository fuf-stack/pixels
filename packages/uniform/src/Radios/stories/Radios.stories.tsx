import type { Meta, StoryObj } from '@storybook/react-vite';

import { action } from 'storybook/actions';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { createStyling } from '@fuf-stack/pixel-utils';
import { StylingProvider } from '@fuf-stack/pixels/StylingProvider';
import { number, string, veto } from '@fuf-stack/veto';

import Form from '../../Form';
import SubmitButton from '../../SubmitButton';
import Radios from '../Radios';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: Meta<typeof Radios> = {
  title: 'uniform/Radios',
  component: Radios,
  decorators: [
    (Story, { parameters }) => {
      return (
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
    },
  ],
};

export default meta;
type Story = StoryObj<typeof Radios>;

// -----------------------------------------------------------------------------
// Normal stories
// -----------------------------------------------------------------------------

export const Default: Story = {
  args: {
    name: 'radiosField',
    options: [
      { value: '1', label: 'option 1' },
      { value: '2', label: 'option 2' },
      { value: '3', label: 'option 3' },
    ],
  },
};

export const NumberValues: Story = {
  args: {
    name: 'radiosField',
    options: [
      { value: 1, label: 'One' },
      { value: 2, label: 'Two' },
      { value: 3, label: 'Three' },
    ],
  },
};

export const Inline: Story = {
  args: {
    inline: true,
    name: 'radiosField',
    options: [
      { value: 'option 1' },
      { value: 'option 2' },
      { value: 'option 3' },
    ],
  },
};

export const WithInitialValue: Story = {
  parameters: {
    formProps: { initialValues: { radiosField: 'option 2' } },
  },
  args: {
    name: 'radiosField',
    options: [
      { value: 'option 1' },
      { value: 'option 2' },
      { value: 'option 3' },
    ],
  },
};

export const DisabledCompletely: Story = {
  args: {
    name: 'radiosField',
    disabled: true,
    options: [
      { value: 'option 1' },
      { value: 'option 2' },
      { value: 'option 3' },
    ],
  },
};

export const DisabledOption: Story = {
  args: {
    name: 'radiosField',
    options: [
      { value: 'option 1' },
      { value: 'disabled option', disabled: true },
      { value: 'option 3' },
    ],
  },
};

const requiredValidation = veto({
  radiosField: string(),
});

export const Required: Story = {
  parameters: { formProps: { validation: requiredValidation } },
  args: {
    label: 'radiosField',
    name: 'radiosField',
    options: [
      { label: '1', value: '1' },
      { label: '2', value: '2' },
      { label: '3', value: '3' },
    ],
  },
};

export const Invalid: Story = {
  parameters: {
    formProps: {
      validation: veto({
        radiosField: string().refine((value) => {
          return value !== 'two';
        }, 'Please use another option'),
      }),
    },
  },
  args: {
    name: 'radiosField',
    label: 'radiosField',
    options: [{ value: 'one' }, { value: 'two' }, { value: 'three' }],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const optionOne = canvas.getByTestId('radiosfield_option_one');
    await userEvent.click(optionOne, {
      delay: 100,
    });
    const optionTwo = canvas.getByTestId('radiosfield_option_two');
    await userEvent.click(optionTwo, {
      delay: 100,
    });

    // Wait for validation to complete and error message to appear
    await waitFor(() => {
      expect(canvas.getByTestId('radiosfield_error')).toBeVisible();
    });
  },
};

const cardValidation = veto({
  radiosField: string().refine((value) => {
    return typeof value === 'string' && value.length > 0;
  }, 'Please pick one quest'),
});

export const CustomOptionsRendering: Story = {
  parameters: {
    formProps: { validation: cardValidation },
  },
  args: {
    label: 'Pick one side quest',
    name: 'radiosField',
    className: {
      wrapper: 'rounded-lg border border-divider bg-content1',
      itemBase: 'm-2 w-full',
    },
    options: [
      {
        label: 'Treasure Hunt 🗺️',
        value: 'treasure-hunt',
        meta: { danger: 'low' },
      },
      {
        label: 'Potion Brewing 🧪',
        value: 'potion-brewing',
        meta: { danger: 'medium' },
      },
      {
        label: 'Dragon Negotiation 🐉',
        value: 'dragon-negotiation',
        meta: { danger: 'high' },
      },
    ],
  },
  render: (renderArgs) => {
    return (
      <Radios {...renderArgs}>
        {(options) => {
          return (
            <div className="divide-y divide-default-200">
              {options.map(({ option, radio }) => {
                return <div key={option.value}>{radio}</div>;
              })}
            </div>
          );
        }}
      </Radios>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByText('Submit'));
    await waitFor(() => {
      expect(canvas.getByTestId('radiosfield_error')).toBeVisible();
    });
  },
};

// -----------------------------------------------------------------------------
// Composition
// -----------------------------------------------------------------------------

export const KeyboardAndRequired: StoryObj<typeof Radios> = {
  ...Required,
  parameters: { formProps: { validation: veto({ radiosField: number() }) } },
  args: {
    ...Required.args,
    description: 'Choose with the arrow keys.',
    options: [
      { label: 'Zero', value: 0 },
      { label: 'Disabled', value: 1, disabled: true },
      { label: 'Two', value: 2 },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('radiogroup');
    await expect(group).toHaveAccessibleDescription(
      'Choose with the arrow keys.',
    );
    await userEvent.click(canvas.getByTestId('form_submit_button'));
    const zero = canvas.getByRole('radio', { name: 'Zero' });
    await waitFor(async () => {
      await expect(zero).toHaveFocus();
    });
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('radio', { name: 'Two' })).toBeChecked();
    await expect(
      canvas.getByRole('radio', { name: 'Disabled' }),
    ).not.toBeChecked();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(zero).toBeChecked();
  },
};

const styling = createStyling({
  extend: { classGroups: { 'font-size': [{ text: ['option'] }] } },
});
export const ConsumerOptionFont: StoryObj<typeof Radios> = {
  args: {
    name: 'radiosField',
    label: 'Choice',
    options: [{ label: 'Zero', value: 0 }],
    className: { itemLabel: 'text-option' },
  },
  decorators: [
    (Story) => {
      return (
        <StylingProvider styling={styling}>
          <style>{'.text-option { font-size: 18px; }'}</style>
          <Story />
        </StylingProvider>
      );
    },
  ],
  play: async ({ canvasElement }) => {
    const radio = within(canvasElement).getByRole('radio', { name: 'Zero' });
    const label = radio.closest('label')?.querySelector('[data-slot="label"]');
    await expect(label).toHaveClass('text-option');
    await expect(label).not.toHaveClass('text-medium', 'text-sm');
    await expect(getComputedStyle(label as HTMLElement).fontSize).toBe('18px');
  },
};
