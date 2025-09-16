import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  FaBars,
  FaGift,
  FaGlassCheers,
  FaHotjar,
  FaPizzaSlice,
  FaQuestionCircle,
  FaStop,
} from 'react-icons/fa';

import { action } from 'storybook/actions';

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
        onClick: action('menu:item:onClick'),
      },
      {
        description: 'description text',
        key: 'itemWithDescription',
        label: 'Item With Description',
        onClick: action('menu:item:onClick'),
      },
    ],
  },
  {
    key: 'itemDisabled',
    label: 'Item Disabled',
    onClick: action('menu:item:onClick'),
    disabled: true,
  },
  {
    className: 'text-red-500',
    key: 'itemCss',
    label: 'Item with CSS class',
    onClick: action('menu:item:onClick'),
    testId: 'menu-item-css',
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

export const WithTriggerButtonProps: Story = {
  args: {
    children: 'Open menu',
    items: menuItems,
    triggerButtonProps: {
      'aria-label': 'Open actions menu',
      className: 'min-w-0',
      color: 'primary',
      disableAnimation: true,
      variant: 'bordered',
    },
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

export const AllPlacements: Story = {
  render: () => {
    const placements = [
      'top',
      'top-start',
      'top-end',
      'bottom',
      'bottom-start',
      'bottom-end',
      'left',
      'left-start',
      'left-end',
      'right',
      'right-start',
      'right-end',
    ] as const;

    return (
      <div className="grid grid-cols-3 gap-4">
        {placements.map((p) => {
          return (
            <Menu
              key={p}
              className=""
              items={menuItems}
              placement={p}
              triggerButtonProps={{
                variant: 'bordered',
              }}
            >
              {p}
            </Menu>
          );
        })}
      </div>
    );
  },
};

export const WithOnAction: Story = {
  args: {
    items: menuItems,
    onAction: action('menu:onAction'),
  },
};

export const WithAriaLabelAndTestIds: Story = {
  args: {
    items: menuItems,
    ariaLabel: 'Example actions menu',
    testId: 'menu-trigger',
  },
};

export const WithSlotClassNames: Story = {
  args: {
    children: 'Styled trigger',
    items: menuItems,
    triggerButtonProps: { size: 'sm' },
    className: {
      trigger: 'bg-black text-white hover:bg-gray-900',
      item: 'text-red-600 hover:bg-gray-100',
    },
  },
};

const funItems = [
  {
    key: 'tasty-section',
    label: 'Tasty Section',
    items: [
      {
        key: 'pizza',
        label: 'Pizza',
        description: 'Cheesy goodness',
        icon: <FaPizzaSlice />,
        onClick: action('menu:item:onClick'),
      },
      {
        key: 'toast',
        label: 'Toast',
        icon: <FaGlassCheers />,
        onClick: action('menu:item:onClick'),
      },
    ],
  },
  {
    key: 'spicy',
    label: 'Spicy Noodles',
    className: 'text-red-600 font-medium',
    icon: <FaHotjar />,
    onClick: action('menu:item:onClick'),
  },
  {
    key: 'unavailable',
    label: 'Sold Out',
    disabled: true,
    icon: <FaStop />,
    onClick: action('menu:item:onClick'),
  },
  {
    key: 'surprises',
    label: 'Surprises',
    icon: <FaGift />,
    items: [
      {
        key: 'mystery',
        label: 'Mystery Box',
        icon: <FaQuestionCircle />,
        onClick: action('menu:item:onClick'),
      },
      {
        key: 'confetti',
        label: 'Confetti Bomb',
        description: 'It gets messy',
        onClick: action('menu:item:onClick'),
      },
    ],
  },
];

export const MenuParty: Story = {
  args: {
    children: 'Open fun menu 🎈',
    items: funItems,
    onAction: action('menu:onAction'),
    triggerButtonProps: {
      'aria-label': 'Open fun menu',
      color: 'secondary',
      variant: 'bordered',
    },
  },
};
