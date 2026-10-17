import type { Meta, StoryObj } from '@storybook/react-vite';

import Tabs from '../Tabs';

export const meta: Meta<typeof Tabs> = {
  component: Tabs,
  decorators: [
    (Story) => {
      return (
        <div className="w-[600px]">
          <Story />
        </div>
      );
    },
  ],
};

export type Story = StoryObj<typeof Tabs>;
