import type { Meta, StoryObj } from '@storybook/react-vite';
import type { AtelierNavigation, AtelierRendererRegistry } from '../core';

import { useArgs } from 'storybook/preview-api';

import AtelierFrame from './AtelierFrame';

const navigation: AtelierNavigation = [
  {
    id: 'workspace',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        to: '/',
      },
      {
        id: 'projects',
        label: 'Projects',
        requiresAuth: true,
        to: '/projects',
      },
      {
        id: 'admin',
        label: 'Admin',
        roles: ['admin'],
        to: '/admin',
      },
    ],
    label: 'Workspace',
  },
  {
    id: 'settings',
    items: [
      {
        id: 'profile',
        label: 'Profile',
        requiresAuth: true,
        to: '/profile',
      },
      {
        id: 'help',
        label: 'Help',
        to: '/help',
      },
    ],
    label: 'Settings',
  },
];

const rendererRegistry: AtelierRendererRegistry = {
  cards: ({ data, state }) => {
    if (state !== 'ready') {
      return null;
    }

    const count = Array.isArray(data) ? data.length : 0;
    return (
      <div className="text-sm text-default-700">
        Card grid with {count} cards
      </div>
    );
  },
  table: ({ data, state }) => {
    if (state !== 'ready') {
      return null;
    }

    const count = Array.isArray(data) ? data.length : 0;
    return (
      <div className="text-sm text-default-700">
        Table renderer showing {count} rows
      </div>
    );
  },
};

const meta: Meta<typeof AtelierFrame> = {
  title: 'atelier/AtelierFrame',
  component: AtelierFrame,
  args: {
    appName: 'fuf atelier',
    authState: {
      status: 'authenticated',
      user: {
        id: '1',
        name: 'Ada Lovelace',
        roles: ['member'],
      },
    },
    currentPath: '/',
    dataState: 'ready',
    navigation,
    rendererRegistry,
    resourceData: [
      { id: 'p-1', name: 'Pixel Builder' },
      { id: 'p-2', name: 'Uniform Admin' },
      { id: 'p-3', name: 'Veto Studio' },
    ],
    resourceId: 'projects',
    resources: [
      { id: 'projects', rendererId: 'table', title: 'Projects' },
      { id: 'activity', rendererId: 'cards', title: 'Activity' },
    ],
  },
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [{ currentPath }, updateArgs] = useArgs();
    return (
      <AtelierFrame
        {...args}
        currentPath={currentPath}
        onNavigate={(to) => {
          updateArgs({ currentPath: to });
        }}
      />
    );
  },
};

export default meta;
type Story = StoryObj<typeof AtelierFrame>;

export const Default: Story = {};

export const LoggedOut: Story = {
  args: {
    authState: {
      status: 'anonymous',
      user: null,
    },
  },
};

export const SessionLoading: Story = {
  args: {
    authState: {
      status: 'loading',
      user: null,
    },
    dataState: 'loading',
  },
};

export const ResourceEmpty: Story = {
  args: {
    dataState: 'empty',
    resourceData: [],
  },
};

export const ResourceError: Story = {
  args: {
    dataState: 'error',
    resourceError: new Error('backend temporarily unavailable'),
  },
};

export const AdminView: Story = {
  args: {
    authState: {
      status: 'authenticated',
      user: {
        id: '2',
        name: 'Grace Hopper',
        roles: ['admin'],
      },
    },
    currentPath: '/admin',
  },
};

export const CustomSlotsAndStyles: Story = {
  args: {
    className: {
      base: 'border-primary-300/60 bg-gradient-to-br from-content1 to-primary-50/30',
      resourceArea: 'border-primary-200 bg-content1',
      sidebar: 'border-primary-200 bg-primary-50/30',
    },
    slots: {
      headerActions: (
        <span className="text-xs text-default-600">Preview mode</span>
      ),
      pageChrome: (
        <div className="mb-2 rounded-md bg-default-100 p-2 text-xs text-default-600">
          Custom page chrome slot
        </div>
      ),
      sidebarFooter: (
        <div>
          Tenant: <strong>fuf-stack</strong>
        </div>
      ),
      userMenu: <button className="text-xs underline">Sign out</button>,
    },
  },
};
