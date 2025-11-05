import type { Meta, StoryObj } from '@storybook/react-vite';

import { action } from 'storybook/actions';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { SubmitButton } from '@fuf-stack/uniform';
import { array, literal, string, veto } from '@fuf-stack/veto';

import { Form } from '../Form';
import Checkboxes from './Checkboxes';

const meta: Meta<typeof Checkboxes> = {
  title: 'uniform/Checkboxes',
  component: Checkboxes,
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
type Story = StoryObj<typeof Checkboxes>;

export const Default: Story = {
  args: {
    name: 'checkboxField',
    options: [
      { label: '🍕 Pizza for breakfast', value: 'pizza-breakfast' },
      { label: '🦄 Unicorns are real', value: 'unicorns-real' },
      { label: '🧦 Socks with sandals', value: 'socks-sandals' },
    ],
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Checkbox Field',
    name: 'checkboxField',
    options: [
      { label: '🍕 Pizza for breakfast', value: 'pizza-breakfast' },
      { label: '🦄 Unicorns are real', value: 'unicorns-real' },
      { label: '🧦 Socks with sandals', value: 'socks-sandals' },
    ],
  },
};

export const Inline: Story = {
  args: {
    name: 'checkboxField',
    inline: true,
    options: [
      {
        label: '🎯 Procrastinate productively',
        value: 'productive-procrastination',
      },
      { label: '☕ Coffee is a vegetable', value: 'coffee-vegetable' },
      { label: '🐱 Cats rule the internet', value: 'cats-rule-internet' },
    ],
  },
};

export const OnlyOneCheckbox: Story = {
  args: {
    name: 'checkboxField',
    options: [
      {
        label: '🤖 I am definitely not a robot',
        value: 'definitely-not-robot',
      },
    ],
  },
};

export const DangerColor: Story = {
  argTypes: {
    color: {
      control: { type: 'radio' },
      options: [
        'danger',
        'default',
        'info',
        'primary',
        'secondary',
        'success',
        'warning',
      ],
    },
  },
  parameters: {
    formProps: {
      initialValues: { checkboxField: ['volcano-life', 'mars-one-way'] },
    },
  },
  args: {
    label: 'Danger Color',
    name: 'checkboxField',
    color: 'danger',
    options: [
      { label: '🌋 Live in a volcano', value: 'volcano-life' },
      { label: '🦈 Swim with sharks', value: 'shark-swimming' },
      { label: '🚀 One-way trip to Mars', value: 'mars-one-way' },
    ],
  },
};

export const WithLineThrough: Story = {
  parameters: {
    formProps: {
      initialValues: { checkboxField: ['wash-dishes', 'walk-dog'] },
    },
  },
  args: {
    label: 'Todo List',
    name: 'checkboxField',
    lineThrough: true,
    options: [
      {
        label: '🧽 Wash the dishes',
        value: 'wash-dishes',
        labelSubline: 'Kitchen sink and countertop',
      },
      { label: '🐕 Walk the dog', value: 'walk-dog' },
      { label: '📧 Reply to emails', value: 'reply-emails' },
      { label: '🛒 Buy groceries', value: 'buy-groceries' },
    ],
  },
};

export const WithOptionLabelSubline: Story = {
  args: {
    name: 'checkboxField',
    options: [
      {
        label: 'Pizza for breakfast 🍕',
        labelSubline: 'The most important meal of the day',
        value: 'pizza-breakfast',
      },
      {
        label: 'Unicorns are real 🦄',
        labelSubline: 'They just live in a different dimension',
        value: 'unicorns-real',
      },
      {
        label: 'Socks with sandals 🧦',
        labelSubline: 'Peak fashion statement',
        value: 'socks-sandals',
      },
    ],
  },
};

export const WithInitialValue: Story = {
  parameters: {
    formProps: { initialValues: { checkboxField: ['sing-shower'] } },
  },
  args: {
    name: 'checkboxField',
    options: [
      { label: '🌮 Tacos solve everything', value: 'tacos-solve-all' },
      { label: '🎵 Sing in the shower', value: 'sing-shower' },
      { label: '🚀 Mars vacation planner', value: 'mars-vacation' },
    ],
  },
};

export const DisabledCompletely: Story = {
  args: {
    name: 'checkboxField',
    disabled: true,
    options: [
      { label: '💤 Sleep 8 hours nightly', value: 'sleep-8-hours' },
      { label: '🏃 Exercise daily', value: 'exercise-daily' },
      { label: '🥗 Eat vegetables', value: 'eat-vegetables' },
    ],
  },
};

export const DisabledOption: Story = {
  args: {
    name: 'checkboxField',
    options: [
      { label: '🎮 Play games all day', value: 'play-games' },
      { label: '📚 Read documentation', value: 'read-docs', disabled: true },
      { label: '🍰 Cake for dinner', value: 'cake-dinner' },
    ],
  },
};

const requiredValidation = veto({
  checkboxField: array(string()).min(1),
});

export const Required: Story = {
  parameters: { formProps: { validation: requiredValidation } },
  args: {
    label: 'Checkbox Field',
    name: 'checkboxField',
    options: [
      { label: '🎪 Join the circus', value: 'join-circus' },
      { label: '🧙 Learn magic tricks', value: 'learn-magic' },
      { label: '🐉 Befriend a dragon', value: 'befriend-dragon' },
    ],
  },
};

const validation = veto({
  checkboxField: array(literal('join-circus')).min(2),
});

export const Invalid: Story = {
  parameters: { formProps: { validation } },
  args: {
    label: 'Checkbox Field',
    name: 'checkboxField',
    options: [
      { label: '🎭 Become a mime', value: 'become-mime' },
      { label: '🌙 Howl at the moon', value: 'howl-moon' },
      { label: '🦸 Save the world', value: 'save-world' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const optionTwo = canvas.getByTestId('checkboxfield_option_howl_moon');
    await userEvent.click(optionTwo, {
      delay: 500,
    });
    const inputInvalid = optionTwo.getAttribute('data-invalid');
    await expect(inputInvalid).toBe('true');

    // Wait for validation to complete and error message to appear
    await waitFor(() => {
      expect(canvas.getByTestId('checkboxfield_error')).toBeVisible();
    });
  },
};

export const WithTransformSingleValue: Story = {
  parameters: {
    formProps: {
      initialValues: { acceptTerms: false },
    },
  },
  args: {
    label: 'Terms & Conditions',
    name: 'acceptTerms',
    options: [
      { label: 'I accept the terms and conditions', value: 'accepted' },
    ],
    transform: {
      // Form stores boolean, display as array (string[])
      toDisplayValue: (val) => {
        return val ? ['accepted'] : [];
      },
      // Display is array (string[]), convert back to boolean
      toFormValue: (val: string[]) => {
        return val.length > 0;
      },
    },
  },
};

interface FoodData {
  id: string;
  name: string;
  score: number;
  calories: number;
}

const foodData: Record<string, FoodData> = {
  pizza: { id: 'pizza', name: 'Pizza', score: 5, calories: 285 },
  burger: { id: 'burger', name: 'Burger', score: 4, calories: 354 },
  sushi: { id: 'sushi', name: 'Sushi', score: 4, calories: 145 },
  taco: { id: 'taco', name: 'Taco', score: 3, calories: 226 },
};

export const WithTransformComplexObjects: Story = {
  parameters: {
    formProps: {
      initialValues: {
        selectedFoods: [
          { id: 'pizza', name: 'Pizza', score: 5, calories: 285 },
          { id: 'sushi', name: 'Sushi', score: 4, calories: 145 },
        ],
      },
    },
  },
  args: {
    label: 'Select your favorite foods (stored as objects with metadata)',
    name: 'selectedFoods',
    options: [
      { label: '🍕 Pizza', value: 'pizza' },
      { label: '🍔 Burger', value: 'burger' },
      { label: '🍣 Sushi', value: 'sushi' },
      { label: '🌮 Taco', value: 'taco' },
    ],
    transform: {
      // Form stores array of objects with metadata, display as simple string array
      toDisplayValue: (val) => {
        const foods = val as { id: string; name: string; score: number }[];
        return foods
          ? foods.map((f) => {
              return f.id;
            })
          : [];
      },
      // Display is string array, convert to array of objects with metadata
      toFormValue: (val: string[]) => {
        return val.map((id) => {
          return foodData[id] || null;
        });
      },
    },
  },
};
