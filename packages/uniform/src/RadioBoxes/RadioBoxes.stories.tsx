import type { Meta, StoryObj } from '@storybook/react-vite';

import { FaFlask, FaPhone, FaRocket } from 'react-icons/fa';

import { action } from 'storybook/actions';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { SubmitButton } from '@fuf-stack/uniform';
import { string, veto } from '@fuf-stack/veto';

import { Form } from '../Form';
import RadioBoxes from './RadioBoxes';

const meta: Meta<typeof RadioBoxes> = {
  title: 'uniform/RadioBoxes',
  component: RadioBoxes,
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
type Story = StoryObj<typeof RadioBoxes>;

export const Default: Story = {
  args: {
    name: 'radioBoxesField',
    options: [
      {
        description: 'Perfect for lazy Sundays and binge-watching.',
        label: 'Coffee',
        value: 'coffee',
      },
      {
        description: 'Calm, zen, and definitely not boring.',
        label: 'Tea',
        value: 'tea',
      },
      {
        description: 'Because sometimes you need bubbles in your life.',
        label: 'Sparkling Water',
        value: 'sparkling',
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
        description: 'Small but mighty, like a chihuahua.',
        label: 'Small',
        value: 'small',
      },
      {
        description: 'The Goldilocks of sizes - just right.',
        label: 'Medium',
        value: 'medium',
      },
      {
        description: 'Go big or go home!',
        label: 'Large',
        value: 'large',
      },
    ],
  },
};

export const WithInitialValue: Story = {
  parameters: {
    formProps: { initialValues: { radioBoxesField: 'wizard' } },
  },
  args: {
    name: 'radioBoxesField',
    options: [
      {
        description: 'Hack and slash your way through life.',
        label: 'Warrior',
        value: 'warrior',
      },
      {
        description: 'Master of the arcane arts and fireballs.',
        label: 'Wizard',
        value: 'wizard',
      },
      {
        description: 'Sneaky backstabber with questionable morals.',
        label: 'Rogue',
        value: 'rogue',
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
        description: 'Early birds get worms, but also need alarms.',
        label: 'Morning Person',
        value: 'morning',
      },
      {
        description: 'Peak productivity at 2 AM.',
        label: 'Night Owl',
        value: 'night',
      },
      {
        description: 'Sleep? What sleep?',
        label: 'Insomniac',
        value: 'insomniac',
      },
    ],
  },
};

export const DisabledOption: Story = {
  args: {
    name: 'radioBoxesField',
    options: [
      {
        description: 'Reliable, safe, and a bit boring.',
        label: 'Browser Tabs',
        value: 'tabs',
      },
      {
        description: 'Currently out of stock (sold out!)',
        label: 'Physical Books',
        value: 'books',
        disabled: true,
      },
      {
        description: 'Your desk is now a post-it jungle.',
        label: 'Sticky Notes',
        value: 'sticky',
      },
    ],
  },
};

const requiredValidation = veto({
  radioBoxesField: string(),
});

export const Required: Story = {
  parameters: { formProps: { validation: requiredValidation } },
  args: {
    label: 'Pick Your Superpower',
    name: 'radioBoxesField',
    options: [
      {
        description: 'Never be late again (or just sleep in).',
        label: 'Time Travel',
        value: 'time',
      },
      {
        description: 'Read minds and regret it immediately.',
        label: 'Telepathy',
        value: 'telepathy',
      },
      {
        description: 'Finally reach the top shelf!',
        label: 'Flight',
        value: 'flight',
      },
    ],
  },
};

export const Invalid: Story = {
  parameters: {
    formProps: {
      validation: veto({
        radioBoxesField: string().refine((value) => {
          return value !== 'pineapple';
        }, 'No pineapple on pizza, please!'),
      }),
    },
  },
  args: {
    name: 'radioBoxesField',
    label: 'Choose Your Pizza',
    options: [
      {
        description: 'Simple, classic, and universally loved.',
        label: 'Margherita',
        value: 'margherita',
      },
      {
        description: 'Controversial and banned in this form.',
        label: 'Hawaiian',
        value: 'pineapple',
      },
      {
        description: 'For those who like it spicy.',
        label: 'Pepperoni',
        value: 'pepperoni',
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const optionOne = canvas.getByTestId('radioboxesfield_option_margherita');
    await userEvent.click(optionOne, {
      delay: 100,
    });
    const optionTwo = canvas.getByTestId('radioboxesfield_option_pineapple');
    await userEvent.click(optionTwo, {
      delay: 100,
    });

    // Wait for validation to complete and error message to appear
    await waitFor(() => {
      expect(canvas.getByTestId('radioboxesfield_error')).toBeVisible();
    });
  },
};

export const WithIcons: Story = {
  args: {
    name: 'radioBoxesField',
    options: [
      {
        description: 'Blast off to Mars and leave your problems behind!',
        icon: <FaRocket className="w-8 text-3xl" />,
        label: 'Space Explorer',
        value: 'space',
      },
      {
        description: 'Mix potions and accidentally create monsters.',
        icon: <FaFlask className="w-8 text-3xl" />,
        label: 'Mad Scientist',
        value: 'scientist',
      },
      {
        description: 'Answer support calls... forever.',
        icon: <FaPhone className="w-8 text-3xl" />,
        label: 'Customer Support',
        value: 'support',
      },
    ],
  },
};
