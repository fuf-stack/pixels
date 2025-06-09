import type { Meta, StoryObj } from '@storybook/react';

import { action } from '@storybook/addon-actions';
import { expect, userEvent, within } from '@storybook/test';

import { SubmitButton } from '@fuf-stack/uniform';
import { veto } from '@fuf-stack/veto';
import * as vt from '@fuf-stack/veto';

import { Form } from '../Form';
import CheckboxGroup from './CheckboxGroup';

const meta: Meta<typeof CheckboxGroup> = {
  title: 'uniform/CheckboxGroup',
  component: CheckboxGroup,
  decorators: [
    (Story, { parameters }) => (
      <Form
        onSubmit={action('onSubmit')}
        className="min-w-60"
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
type Story = StoryObj<typeof CheckboxGroup>;

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
  checkboxField: vt.array(vt.string()).min(1),
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
  checkboxField: vt.array(vt.literal('join-circus')).min(2),
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
  },
};

const validationOneCheckbox = veto({
  checkboxField: vt
    .string()
    .refine((value: string) => value !== 'ghost-peppers', 'This is too hot!')
    .optional(),
});

export const InvalidOneCheckbox: Story = {
  parameters: {
    formProps: {
      validation: validationOneCheckbox,
    },
  },
  args: {
    label: 'Checkbox Field',
    name: 'checkboxField',
    options: [{ label: '🌶️ Eat ghost peppers daily', value: 'ghost-peppers' }],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const optionOne = canvas.getByTestId('checkboxfield_option_ghost_peppers');
    await userEvent.click(optionOne, {
      delay: 500,
    });
  },
};
