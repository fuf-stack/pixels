import { describe, expect, test } from 'vitest';

import { createAtelierApp } from './createAtelierApp';
import { createAuthAdapter } from './createAuthAdapter';
import { filterNavigationForState } from './navigation';
import { getResourceRenderer } from './renderers';
import { createAtelierRouteContext } from './tanstack';

describe('createAtelierApp', () => {
  test('normalizes optional collections', () => {
    const app = createAtelierApp({
      appName: 'atelier',
    });

    expect(app.navigation).toEqual([]);
    expect(app.renderers).toEqual({});
    expect(app.resources).toEqual([]);
  });

  test('normalizes navigation by dropping empty sections', () => {
    const app = createAtelierApp({
      appName: 'atelier',
      navigation: [
        {
          id: 'empty',
          items: [],
          label: 'Empty',
        },
        {
          id: 'main',
          items: [{ id: 'home', label: 'Home', to: '/' }],
          label: 'Main',
        },
      ],
    });

    expect(app.navigation).toEqual([
      {
        id: 'main',
        items: [{ id: 'home', label: 'Home', to: '/' }],
        label: 'Main',
      },
    ]);
  });
});

describe('createAuthAdapter', () => {
  test('denies protected role access for anonymous user', () => {
    const adapter = createAuthAdapter();

    expect(
      adapter.canAccess(['admin'], {
        status: 'anonymous',
        user: null,
      }),
    ).toBe(false);
  });

  test('uses provided canAccess override when given', () => {
    const adapter = createAuthAdapter({
      canAccess: (_roles, _state, itemId) => itemId === 'visible',
    });

    expect(
      adapter.canAccess(
        ['admin'],
        { status: 'anonymous', user: null },
        'visible',
      ),
    ).toBe(true);
    expect(
      adapter.canAccess(
        ['admin'],
        { status: 'anonymous', user: null },
        'hidden',
      ),
    ).toBe(false);
  });
});

describe('filterNavigationForState', () => {
  const navigation = [
    {
      id: 'main',
      items: [
        { id: 'home', label: 'Home', to: '/' },
        { id: 'secure', label: 'Secure', requiresAuth: true, to: '/secure' },
        { id: 'admin', label: 'Admin', roles: ['admin'], to: '/admin' },
      ],
      label: 'Main',
    },
  ];

  test('filters auth-only and role-only items for anonymous user', () => {
    const auth = createAuthAdapter();

    const result = filterNavigationForState(
      navigation,
      { status: 'anonymous', user: null },
      auth,
    );

    expect(result[0]?.items.map((item) => item.id)).toEqual(['home']);
  });

  test('keeps role item for matching authenticated user', () => {
    const auth = createAuthAdapter();

    const result = filterNavigationForState(
      navigation,
      {
        status: 'authenticated',
        user: { id: 'u-1', roles: ['admin'] },
      },
      auth,
    );

    expect(result[0]?.items.map((item) => item.id)).toEqual([
      'home',
      'secure',
      'admin',
    ]);
  });
});

describe('getResourceRenderer', () => {
  test('resolves renderer from registry by renderer id', () => {
    const renderer = getResourceRenderer(
      { id: 'projects', rendererId: 'table', title: 'Projects' },
      {
        table: ({ title }) => `table:${title}`,
      },
    );

    expect(
      renderer({
        resourceId: 'projects',
        state: 'ready',
        title: 'Projects',
      }),
    ).toBe('table:Projects');
  });

  test('uses fallback renderer when no renderer is configured', () => {
    const renderer = getResourceRenderer({
      id: 'projects',
      title: 'Projects',
    });

    expect(
      renderer({
        resourceId: 'projects',
        state: 'empty',
      }),
    ).toBe('Projects has no data');
  });

  test('uses inline renderer over registry renderer', () => {
    const renderer = getResourceRenderer(
      {
        id: 'projects',
        renderer: ({ state }) => `inline:${state}`,
        rendererId: 'table',
        title: 'Projects',
      },
      {
        table: () => 'registry',
      },
    );

    expect(
      renderer({
        resourceId: 'projects',
        state: 'ready',
      }),
    ).toBe('inline:ready');
  });

  test('returns fallback error text with message when available', () => {
    const renderer = getResourceRenderer({
      id: 'projects',
      title: 'Projects',
    });

    expect(
      renderer({
        error: new Error('network down'),
        resourceId: 'projects',
        state: 'error',
      }),
    ).toBe('Projects failed (network down)');
  });
});

describe('createAtelierRouteContext', () => {
  test('returns typed context unchanged', () => {
    const context = createAtelierRouteContext({
      authState: { status: 'anonymous', user: null },
      queryClient: { id: 'query-client' },
      renderers: {
        table: () => 'ok',
      },
    });

    expect(context.queryClient).toEqual({ id: 'query-client' });
    expect(Object.keys(context.renderers)).toEqual(['table']);
  });
});
