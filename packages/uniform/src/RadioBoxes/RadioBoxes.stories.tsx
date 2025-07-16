import type { Meta, StoryObj } from '@storybook/react-vite';

import { FaFlask, FaPhone, FaRocket } from 'react-icons/fa';

import { action } from 'storybook/actions';
import { userEvent, within } from 'storybook/test';

import { SubmitButton } from '@fuf-stack/uniform';
import { veto } from '@fuf-stack/veto';
import * as vt from '@fuf-stack/veto';

import { Form } from '../Form';
import RadioBoxes from './RadioBoxes';

const meta: Meta<typeof RadioBoxes> = {
  title: 'uniform/RadioBoxes',
  component: RadioBoxes,
  decorators: [
    (Story, { parameters }) => (
      <Form
        className="min-w-60"
        onSubmit={action('onSubmit')}
        {...(parameters?.formProps || {})}
      >
        <Story />
        <div className="mt-4 flex justify-end">
          <SubmitButton />
        </div>
      </Form>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof RadioBoxes>;

export const Default: Story = {
  args: {
    name: 'radioBoxesField',
    options: [
      {
        description: 'Neutral element for multiplication.',
        icon: <FaRocket className="w-8 text-3xl" />,
        label: 'option 1',
        value: '1',
      },
      {
        description: 'The number for Nerds.',
        icon: <FaFlask className="w-8 text-3xl" />,
        label: 'option 2',
        value: '2',
      },
      {
        description:
          'first prime number to be devisable by something other than 1.',
        icon: <FaPhone className="w-8 text-3xl" />,
        label: 'option 3',
        value: '3',
      },
    ],
  },
};

export const Inline: Story = {
  args: {
    inline: true,
    name: 'radioBoxesField',
    options: [
      {
        description: 'Neutral element for multiplication.',
        icon: <FaRocket className="w-8 text-3xl" />,
        label: 'option 1',
        value: '1',
      },
      {
        description: 'The number for Nerds.',
        icon: <FaFlask className="w-8 text-3xl" />,
        label: 'option 2',
        value: '2',
      },
      {
        description:
          'first prime number to be devisable by something other than 1.',
        icon: <FaPhone className="w-8 text-3xl" />,
        label: 'option 3',
        value: '3',
      },
    ],
  },
};

export const WithInitialValue: Story = {
  parameters: {
    formProps: { initialValues: { radioBoxesField: '3' } },
  },
  args: {
    name: 'radioBoxesField',
    options: [
      {
        description: 'Neutral element for multiplication.',
        icon: <FaRocket className="w-8 text-3xl" />,
        label: 'option 1',
        value: '1',
      },
      {
        description: 'The number for Nerds.',
        icon: <FaFlask className="w-8 text-3xl" />,
        label: 'option 2',
        value: '2',
      },
      {
        description:
          'first prime number to be devisable by something other than 1.',
        icon: <FaPhone className="w-8 text-3xl" />,
        label: 'option 3',
        value: '3',
      },
    ],
  },
};

export const DisabledCompletely: Story = {
  args: {
    name: 'radioBoxesField',
    disabled: true,
    options: [
      {
        description: 'Neutral element for multiplication.',
        icon: <FaRocket className="w-8 text-3xl" />,
        label: 'option 1',
        value: '1',
      },
      {
        description: 'The number for Nerds.',
        icon: <FaFlask className="w-8 text-3xl" />,
        label: 'option 2',
        value: '2',
      },
      {
        description:
          'first prime number to be devisable by something other than 1.',
        icon: <FaPhone className="w-8 text-3xl" />,
        label: 'option 3',
        value: '3',
      },
    ],
  },
};

export const DisabledOption: Story = {
  args: {
    name: 'radioBoxesField',
    options: [
      {
        description: 'Neutral element for multiplication.',
        icon: <FaRocket className="w-8 text-3xl" />,
        label: 'option 1',
        value: '1',
      },
      {
        description: 'The number for Nerds.',
        icon: <FaFlask className="w-8 text-3xl" />,
        label: 'option 2',
        value: '2',
        disabled: true,
      },
      {
        description:
          'first prime number to be devisable by something other than 1.',
        icon: <FaPhone className="w-8 text-3xl" />,
        label: 'option 3',
        value: '3',
      },
    ],
  },
};

const requiredValidation = veto({
  radioBoxesField: vt.string(),
});

export const Required: Story = {
  parameters: { formProps: { validation: requiredValidation } },
  args: {
    label: 'radioBoxesField',
    name: 'radioBoxesField',
    options: [
      {
        description: 'Neutral element for multiplication.',
        icon: <FaRocket className="w-8 text-3xl" />,
        label: 'option 1',
        value: '1',
      },
      {
        description: 'The number for Nerds.',
        icon: <FaFlask className="w-8 text-3xl" />,
        label: 'option 2',
        value: '2',
      },
      {
        description:
          'first prime number to be devisable by something other than 1.',
        icon: <FaPhone className="w-8 text-3xl" />,
        label: 'option 3',
        value: '3',
      },
    ],
  },
};

export const Invalid: Story = {
  parameters: {
    formProps: {
      validation: veto({
        radioBoxesField: vt
          .string()
          .refine((value) => value !== 'two', 'Please use another option'),
      }),
    },
  },
  args: {
    name: 'radioBoxesField',
    label: 'radioBoxesField',
    options: [
      {
        description: 'Neutral element for multiplication.',
        icon: <FaRocket className="w-8 text-3xl" />,
        label: 'option 1',
        value: 'one',
      },
      {
        description: 'The number for Nerds.',
        icon: <FaFlask className="w-8 text-3xl" />,
        label: 'option 2',
        value: 'two',
      },
      {
        description:
          'first prime number to be devisable by something other than 1.',
        icon: <FaPhone className="w-8 text-3xl" />,
        label: 'option 3',
        value: 'three',
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const optionOne = canvas.getByTestId('radioboxesfield_option_one');
    await userEvent.click(optionOne, {
      delay: 100,
    });
    const optionTwo = canvas.getByTestId('radioboxesfield_option_two');
    await userEvent.click(optionTwo, {
      delay: 100,
    });
  },
};
