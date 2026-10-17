import type { Meta, StoryObj } from '@storybook/react-vite';

import Accordion from '../Accordion';

export const meta: Meta<typeof Accordion> = {
  title: 'pixels/Accordion',
  component: Accordion,
  args: {
    className: 'w-96',
  },
};

export type Story = StoryObj<typeof Accordion>;

export const accordionItems = [
  { title: '1.', children: <div>First item</div> },
  { title: '2.', children: <div>Second item</div> },
  { title: '3.', children: <div>Third item</div> },
];
