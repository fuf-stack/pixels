import type { Meta, StoryObj } from '@storybook/react-vite';

import Card from '../Card';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: Meta<typeof Card> = {
  title: 'pixels/Card',
  component: Card,
};

export default meta;

type Story = StoryObj<typeof Card>;

// -----------------------------------------------------------------------------
// Normal stories
// -----------------------------------------------------------------------------

export const Default: Story = {
  args: {
    children: (
      <p className="w-96">
        Lorem commodo nulla adipisicing cillum Lorem sunt laboris exercitation
        esse. Exercitation ut cillum cupidatat deserunt occaecat pariatur
        laborum ut reprehenderit veniam. Culpa fugiat aliqua consectetur sit
        esse.
      </p>
    ),
  },
};

export const FooterAndHeader: Story = {
  args: {
    footer: 'Footer',
    header: 'Header',
    children: (
      <p className="w-96">
        Lorem commodo nulla adipisicing cillum Lorem sunt laboris exercitation
        esse. Exercitation ut cillum cupidatat deserunt occaecat pariatur
        laborum ut reprehenderit veniam. Culpa fugiat aliqua consectetur sit
        esse.
      </p>
    ),
  },
};

export const CustomStyling: Story = {
  args: {
    footer: 'Footer',
    header: 'Header',
    children: (
      <p className="w-96">
        Lorem commodo nulla adipisicing cillum Lorem sunt laboris exercitatio
      </p>
    ),
    className: {
      base: 'text-blue-400',
      body: 'text-green-400',
      divider: 'bg-yellow-400',
    },
  },
};
