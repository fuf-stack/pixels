import type { Meta, StoryObj } from '@storybook/react-vite';

import Modal, { modalVariants } from '../Modal';

export const meta: Meta<typeof Modal> = {
  title: 'pixels/Modal',
  component: Modal,
  argTypes: {
    size: {
      control: { type: 'radio' },
      options: Object.keys(modalVariants.variants.size),
    },
  },
};

export type Story = StoryObj<typeof Modal>;
