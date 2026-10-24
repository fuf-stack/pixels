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

import Menu from '../Menu';

// -----------------------------------------------------------------------------
// Shared metadata and fixtures
// -----------------------------------------------------------------------------

export const meta: Meta<typeof Menu> = {
  title: 'pixels/Menu',
  component: Menu,
};

export type Story = StoryObj<typeof Menu>;

export const menuItems = [
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

export const funItems = [
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
