/* eslint-disable import-x/prefer-default-export */

import type { AtelierAuthAdapter, AtelierAuthState } from './types';

/**
 * Built-in role-based access fallback.
 * - No declared roles means public access.
 * - Role checks only pass for authenticated users.
 */
const defaultCanAccess = (
  roles: string[] | undefined,
  state: AtelierAuthState,
): boolean => {
  if (roles === undefined || roles.length <= 0) {
    return true;
  }

  if (state.status !== 'authenticated' || !state.user) {
    return false;
  }

  const userRoles = state.user.roles ?? [];
  return roles.some((role) => {
    return userRoles.includes(role);
  });
};

/**
 * Builds an auth adapter with safe defaults.
 *
 * Consumers can override any adapter method; `canAccess` always has a default.
 */
export const createAuthAdapter = (
  adapter?: AtelierAuthAdapter,
): Required<Pick<AtelierAuthAdapter, 'canAccess'>> & AtelierAuthAdapter => {
  return {
    canAccess: defaultCanAccess,
    ...adapter,
  };
};
