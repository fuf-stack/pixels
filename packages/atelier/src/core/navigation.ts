/* eslint-disable import-x/prefer-default-export */

import type { AtelierAuthState, AtelierNavigation } from './types';

import { createAuthAdapter } from './createAuthAdapter';

/**
 * Filters a navigation tree according to auth state, item visibility rules,
 * and adapter-level access checks.
 */
export const filterNavigationForState = (
  navigation: AtelierNavigation,
  state: AtelierAuthState,
  auth = createAuthAdapter(),
): AtelierNavigation => {
  return navigation
    .map((section) => {
      const items = section.items.filter((item) => {
        if (item.requiresAuth && state.status !== 'authenticated') {
          return false;
        }

        if (item.isVisible && !item.isVisible(state)) {
          return false;
        }

        if (!auth.canAccess(item.roles, state, item.id)) {
          return false;
        }

        return true;
      });

      return {
        ...section,
        items,
      };
    })
    .filter((section) => {
      return section.items.length > 0;
    });
};
