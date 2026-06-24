import type { AtelierAuthState, AtelierRendererRegistry } from './types';

/**
 * Shape intended for TanStack Start root route context.
 * Consumers keep route ownership and can extend this interface.
 */
export interface AtelierRouteContext {
  authState: AtelierAuthState;
  queryClient?: unknown;
  renderers: AtelierRendererRegistry;
}

/**
 * Lightweight helper to normalize route context creation in consuming apps.
 */
export const createAtelierRouteContext = <T extends AtelierRouteContext>(
  context: T,
): T => {
  return context;
};
