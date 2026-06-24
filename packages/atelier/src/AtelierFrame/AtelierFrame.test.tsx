import { describe, expect, test, vi } from 'vitest';

import storySnapshots from '@repo/storybook-config/story-snapshots';
import { fireEvent, render, screen } from '@testing-library/react';

import AtelierFrame from './AtelierFrame';
import * as stories from './AtelierFrame.stories';

describe('Story Snapshots', () => {
  storySnapshots(stories);
});

describe('AtelierFrame', () => {
  test('renders app metadata and resource title', () => {
    render(
      <AtelierFrame
        appName="fuf atelier"
        authState={{ status: 'anonymous', user: null }}
        resources={[{ id: 'projects', title: 'Projects' }]}
      />,
    );

    expect(screen.getByText('fuf atelier')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
  });

  test('shows authenticated navigation items', () => {
    render(
      <AtelierFrame
        appName="fuf atelier"
        authState={{
          status: 'authenticated',
          user: { id: 'u-1', roles: ['admin'] },
        }}
        navigation={[
          {
            id: 'workspace',
            items: [
              { id: 'dashboard', label: 'Dashboard', to: '/' },
              {
                id: 'admin',
                label: 'Admin',
                roles: ['admin'],
                to: '/admin',
              },
            ],
            label: 'Workspace',
          },
        ]}
      />,
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  test('hides role protected item for non-admin user', () => {
    render(
      <AtelierFrame
        appName="fuf atelier"
        authState={{
          status: 'authenticated',
          user: { id: 'u-2', roles: ['member'] },
        }}
        navigation={[
          {
            id: 'workspace',
            items: [
              { id: 'dashboard', label: 'Dashboard', to: '/' },
              {
                id: 'admin',
                label: 'Admin',
                roles: ['admin'],
                to: '/admin',
              },
            ],
            label: 'Workspace',
          },
        ]}
      />,
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });

  test('calls onNavigate when navigation item is clicked', () => {
    const onNavigate = vi.fn();

    render(
      <AtelierFrame
        appName="fuf atelier"
        authState={{ status: 'anonymous', user: null }}
        navigation={[
          {
            id: 'workspace',
            items: [{ id: 'dashboard', label: 'Dashboard', to: '/dashboard' }],
            label: 'Workspace',
          },
        ]}
        onNavigate={onNavigate}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Dashboard' }));
    expect(onNavigate).toHaveBeenCalledWith('/dashboard');
  });

  test('hides mobile menu trigger when drawer is disabled', () => {
    render(
      <AtelierFrame
        appName="fuf atelier"
        authState={{ status: 'anonymous', user: null }}
        withMobileDrawer={false}
      />,
    );

    expect(
      screen.queryByRole('button', { name: 'Menu' }),
    ).not.toBeInTheDocument();
  });
});
