import type { Meta, StoryObj } from '@storybook/react-vite';
import type { FiltersConfiguration } from './filters/types';

import { FaGhost, FaMagic, FaPizzaSlice, FaSmile } from 'react-icons/fa';

import { action } from 'storybook/actions';
import { useArgs } from 'storybook/preview-api';
import { expect, within } from 'storybook/test';

import Filter, { filters as f } from '.';

const meta: Meta<typeof Filter> = {
  title: 'Common/Filter',
  component: Filter,
  args: {
    className: 'w-full',
  },
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [{ values }, updateArgs] = useArgs();
    return (
      <Filter
        {...args}
        values={values ?? {}}
        onChange={(next) => {
          action('onChange')(next);
          updateArgs({ values: next });
        }}
      />
    );
  },
};

export default meta;
type Story = StoryObj<typeof Filter>;

const filters: FiltersConfiguration = [
  f.boolean({
    name: 'magical',
    icon: <FaMagic />,
    config: { text: 'Magical', textPrefix: 'is' },
  }),
  f.checkboxgroup({
    name: 'mood',
    icon: <FaSmile />,
    config: {
      text: 'Mood',
      options: ['😊', '😴', '🤓', '🤖'].map((mood) => {
        return { label: mood, value: mood };
      }),
    },
  }),
  f.checkboxgroup({
    name: 'snacks',
    icon: <FaPizzaSlice />,
    config: {
      text: 'Snacks',
      options: ['🍕', '🍪', '🍫', '🍿'].map((snack) => {
        return { label: snack, value: snack };
      }),
    },
  }),
  f.boolean({
    name: 'haunted',
    icon: <FaGhost />,
    config: { text: 'Haunted', textPrefix: 'is' },
  }),
];

export const FiltersOnly: Story = {
  args: {
    config: { filters },
  },
};

export const WithSearch: Story = {
  args: {
    config: { filters, search: { placeholder: 'Search something fun…' } },
  },
};

export const WithInitialValue: Story = {
  args: {
    config: { filters, search: { placeholder: 'Search something fun…' } },
    values: {
      search: 'tonight',
      filter: {
        magical: true,
        mood: ['😊'],
        snacks: ['🍪', '🍫'],
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByTestId('search');
    await expect(input).toContainHTML('tonight');
    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        setTimeout(resolve, 0);
      });
    });
  },
};
