import type { Meta, StoryObj } from '@storybook/react-vite';

import { action } from 'storybook/actions';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { string, veto } from '@fuf-stack/veto';

import Form from '../Form';
import SubmitButton from '../SubmitButton';
import Radios from './Radios';

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

const iceCreamOptions = [
  { value: 'vanilla', label: '🍦 Vanilla' },
  { value: 'chocolate', label: '🍫 Chocolate' },
  { value: 'strawberry', label: '🍓 Strawberry' },
];

export const Default: Story = {
  args: {
    label: 'Favorite ice cream',
    name: 'radiosField',
    options: iceCreamOptions,
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
    label: 'Favorite ice cream',
    name: 'radiosField',
    options: iceCreamOptions,
  },
};

export const WithInitialValue: Story = {
  parameters: {
    formProps: { initialValues: { radiosField: 'chocolate' } },
  },
  args: {
    label: 'Favorite ice cream',
    name: 'radiosField',
    options: iceCreamOptions,
  },
};

export const DisabledCompletely: Story = {
  parameters: {
    formProps: { initialValues: { radiosField: 'vanilla' } },
  },
  args: {
    disabled: true,
    label: 'Favorite ice cream',
    name: 'radiosField',
    options: iceCreamOptions,
  },
};

export const ReadOnly: Story = {
  parameters: {
    formProps: { initialValues: { radiosField: 'chocolate' } },
  },
  args: {
    label: 'Favorite ice cream',
    name: 'radiosField',
    options: iceCreamOptions,
    readOnly: true,
  },
};

export const DisabledOption: Story = {
  args: {
    label: 'Favorite ice cream',
    name: 'radiosField',
    options: [
      { value: 'vanilla', label: '🍦 Vanilla' },
      { value: 'chocolate', label: '🍫 Chocolate (sold out)', disabled: true },
      { value: 'strawberry', label: '🍓 Strawberry' },
    ],
  },
};

const requiredValidation = veto({
  radiosField: string(),
});

export const Required: Story = {
  parameters: { formProps: { validation: requiredValidation } },
  args: {
    label: 'Favorite ice cream',
    name: 'radiosField',
    options: iceCreamOptions,
  },
};

export const Invalid: Story = {
  parameters: {
    formProps: {
      validation: veto({
        radiosField: string().refine((value) => {
          return value !== 'pineapple';
        }, 'Pineapple on pizza? Please pick another topping'),
      }),
    },
  },
  args: {
    name: 'radiosField',
    label: 'Pizza topping',
    options: [
      { value: 'cheese', label: '🧀 Extra cheese' },
      { value: 'pineapple', label: '🍍 Pineapple' },
      { value: 'mushrooms', label: '🍄 Mushrooms' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const cheese = canvas.getByTestId('radiosfield_option_cheese');
    await userEvent.click(cheese, {
      delay: 100,
    });
    const pineapple = canvas.getByTestId('radiosfield_option_pineapple');
    await userEvent.click(pineapple, {
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
