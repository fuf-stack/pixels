import type { Meta, StoryObj } from '@storybook/react-vite';

import { FaBars } from 'react-icons/fa';

import Menu from './Menu';

const meta: Meta<typeof Menu> = {
  title: 'pixels/Menu',
  component: Menu,
};

export default meta;
type Story = StoryObj<typeof Menu>;

const menuItems = [
  {
    key: 'section',
    label: 'Section',
    items: [
      {
        icon: <FaBars />,
        key: 'itemWithIcon',
        label: 'Item with icon',
        onClick: () => {}, // TODO: add action to the items
      },
      {
        description: 'description text',
        key: 'itemWithDescription',
        label: 'Item With Description',
        onClick: () => {},
      },
    ],
  },
  {
    key: 'itemDisabled',
    label: 'Item Disabled',
    onClick: () => {},
    disabled: true,
  },
  {
    className: 'text-red-500',
    key: 'itemCss',
    label: 'Item with CSS class',
    onClick: () => {},
  },
];

export const Default: Story = {
  args: {
    items: [],
  },
};

export const WithoutTrigger: Story = {
  args: {
    items: menuItems,
  },
};

export const WithTrigger: Story = {
  args: {
    children: 'trigger',
    items: menuItems,
  },
};

export const SubMenu: Story = {
  args: {
    items: [
      { key: 'first', label: 'firstItem' },
      { key: 'subMenu', label: 'Sub Menu', items: menuItems },
    ],
  },
};

export const Disabled: Story = {
  args: {
    items: menuItems,
    isDisabled: true,
  },
};
