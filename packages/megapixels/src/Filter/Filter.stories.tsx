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
    config: { text: 'Magical', textPrefix: 'is', textNoWord: 'not' },
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
    config: { text: 'Haunted', textPrefix: 'is', textNoWord: 'not' },
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

export const WithCustomStyles: Story = {
  args: {
    config: {
      filters,
      search: { placeholder: 'Search with party vibes…' },
    },
    values: {
      search: 'party',
      filter: {
        magical: true,
        mood: ['🤖'],
        snacks: ['🍕', '🍿'],
      },
    },
  },
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [{ values }, updateArgs] = useArgs();
    return (
      <Filter
        {...args}
        values={values ?? {}}
        className={{
          // outer gradient border wrapper
          base: [
            'rounded-2xl',
            // gradient frame + subtle shadow
            'bg-gradient-to-r from-fuchsia-400 via-rose-300 to-amber-300 p-[2px] shadow-[0_8px_30px_rgb(0,0,0,0.05)]',
            // dark variant
            'dark:bg-gradient-to-br dark:from-fuchsia-500 dark:via-purple-500 dark:to-amber-400/70 dark:shadow-[0_0_40px_2px_rgba(217,70,239,0.15)]',
          ],
          // inner container (layout area)
          form: [
            'items-center rounded-2xl p-4',
            // light background gradient + subtle ring
            'bg-gradient-to-r from-rose-100 via-fuchsia-100 to-amber-100 ring-1 ring-rose-300/40',
            // dark variant
            'dark:bg-gradient-to-br dark:from-[#2a0a4a] dark:via-[#12183e] dark:to-[#0a1024] dark:ring-fuchsia-400/30',
          ],
          // search button
          searchShowButton: [
            'rounded-full text-white shadow-lg transition-transform',
            'bg-gradient-to-br from-fuchsia-500 to-indigo-500 hover:scale-105 active:scale-95',
            'dark:from-fuchsia-500 dark:to-purple-600',
            // focus ring
            'data-[focus-visible=true]:outline-amber-400',
          ],
          searchInputWrapper: [
            // rounded corners and inner spacing
            'rounded-2xl px-4',
            // animate color changes
            'transition-colors duration-500',
            // stronger light gradient / dark gradient
            'bg-gradient-to-r from-fuchsia-100 via-rose-100 to-amber-100 dark:from-fuchsia-900 dark:via-rose-900 dark:to-amber-900',
            // border colors: base → hover (amber) → focus (amber)
            'border-2 border-fuchsia-400 group-data-[focus=true]:border-amber-400 data-[hover=true]:border-amber-400',
            // input text color
            'text-fuchsia-700 dark:text-fuchsia-300',
          ],
          // input placeholder color only
          searchInput: [
            'placeholder:text-fuchsia-400/70',
            'dark:placeholder:text-fuchsia-500/60',
          ],
          // submit button next to input
          searchSubmitButton: [
            'rounded-full text-white shadow-lg transition-transform',
            'bg-gradient-to-br from-fuchsia-500 to-indigo-500 hover:scale-105 active:scale-95',
            'dark:from-fuchsia-500 dark:to-purple-600',
            // focus ring
            'data-[focus-visible=true]:outline-amber-400',
          ],
          // add filter menu trigger
          addFilterMenuButton: [
            'rounded-full leading-none',
            'border-2 border-rose-300/60 bg-rose-50/60 text-rose-700 hover:bg-rose-100/70',
            'dark:border-fuchsia-500/40 dark:bg-fuchsia-500/10 dark:text-fuchsia-200 dark:hover:bg-fuchsia-500/20',
            // focus ring
            'data-[focus-visible=true]:outline-amber-400',
          ],
          // add filter menu items
          addFilterMenuItem: [
            'text-rose-700 hover:bg-rose-100/60',
            'dark:text-fuchsia-200 dark:hover:bg-fuchsia-500/10',
          ],
          // active filter chips
          activeFilterLabel: [
            'rounded-full border text-amber-900 shadow transition hover:shadow-md',
            'border-amber-400/30 bg-amber-200/85',
            'dark:bg-amber-400/20 dark:text-amber-200',
          ],
          // modal header/footer/body
          filterModalHeader: [
            'rounded-t-xl text-fuchsia-700',
            'bg-gradient-to-r from-fuchsia-50 to-purple-50',
            'dark:from-fuchsia-500/10 dark:to-purple-500/10 dark:text-fuchsia-300',
          ],
          filterModalFooter: [
            'rounded-b-xl',
            'bg-gradient-to-r from-rose-50 to-amber-50',
            'dark:from-fuchsia-500/10 dark:to-amber-500/10',
          ],
          filterModalBody: [
            'bg-white/70 backdrop-blur-xl',
            'dark:bg-slate-900/50',
          ],
        }}
        onChange={(next) => {
          action('onChange')(next);
          updateArgs({ values: next });
        }}
      />
    );
  },
};
