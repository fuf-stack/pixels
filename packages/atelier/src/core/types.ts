import type { ReactNode } from 'react';

/**
 * High-level auth lifecycle used by the app shell.
 */
export type AtelierAuthStatus =
  | 'loading'
  | 'anonymous'
  | 'authenticated'
  | 'error';

/**
 * Minimal user shape consumed by navigation and shell presentation.
 */
export interface AtelierUser {
  /** Stable user id from the consumer auth backend. */
  id: string;
  /** Optional email shown in user areas. */
  email?: string;
  /** Optional display name shown in user areas. */
  name?: string;
  /** Optional role list used for navigation-level authorization. */
  roles?: string[];
}

/**
 * Runtime auth snapshot passed into `AtelierFrame`.
 */
export interface AtelierAuthState {
  /** Optional error message used when `status === "error"`. */
  errorMessage?: string;
  /** Current auth lifecycle status. */
  status: AtelierAuthStatus;
  /** Current user, if authenticated. */
  user?: AtelierUser | null;
}

/**
 * Optional behavior hooks supplied by the consuming app.
 */
export interface AtelierAuthAdapter {
  /**
   * Route and navigation authorization hook.
   * Defaults to role-based allow/deny logic from `createAuthAdapter`.
   */
  canAccess?: (
    roles: string[] | undefined,
    state: AtelierAuthState,
    itemId?: string,
  ) => boolean;
  /** Trigger a background session refresh. */
  refreshSession?: () => Promise<void> | void;
  /** Start a sign-in flow. */
  signIn?: () => Promise<void> | void;
  /** Start a sign-out flow. */
  signOut?: () => Promise<void> | void;
}

/**
 * Single sidebar entry.
 */
export interface AtelierNavigationItem {
  /** Optional badge rendered on the right side of the nav item. */
  badge?: ReactNode;
  /** Optional icon rendered before the label. */
  icon?: ReactNode;
  /** Stable item id for analytics and policy checks. */
  id: string;
  /** Optional state-based visibility predicate. */
  isVisible?: (state: AtelierAuthState) => boolean;
  /** Human-readable nav label. */
  label: string;
  /** If true, item is hidden for anonymous users. */
  requiresAuth?: boolean;
  /** Optional roles required to view this item. */
  roles?: string[];
  /** Target path. Consumers can wire this into any router. */
  to: string;
}

/**
 * Sidebar section grouping multiple navigation items.
 */
export interface AtelierNavigationSection {
  /** Stable section id. */
  id: string;
  /** Section items. */
  items: AtelierNavigationItem[];
  /** Optional section heading label. */
  label?: string;
}

/**
 * Full navigation tree shown by `AtelierFrame`.
 */
export type AtelierNavigation = AtelierNavigationSection[];

/**
 * Resource rendering state used by renderer functions.
 */
export type AtelierDataState = 'loading' | 'ready' | 'empty' | 'error';

/**
 * Inputs passed to a resource renderer.
 */
export interface AtelierRendererProps<TData = unknown> {
  /** Data payload for the resource view. */
  data?: TData;
  /** Error object when state is `error`. */
  error?: unknown;
  /** Active resource id. */
  resourceId: string;
  /** Current data state for this resource. */
  state: AtelierDataState;
  /** Optional title override. */
  title?: string;
}

/**
 * Resource renderer function used by resource definitions and registries.
 */
export type AtelierRenderer<TData = unknown> = (
  props: AtelierRendererProps<TData>,
) => ReactNode;

/**
 * Named renderer map used by `rendererId`.
 */
export type AtelierRendererRegistry = Record<string, AtelierRenderer>;

/**
 * Declarative resource definition for shell rendering.
 */
export interface AtelierResourceDefinition<TData = unknown> {
  /** Optional free-form description, useful for docs. */
  description?: string;
  /** Stable resource id. */
  id: string;
  /** Inline renderer override for this resource only. */
  renderer?: AtelierRenderer<TData>;
  /** Registry key resolved from `renderers`. */
  rendererId?: string;
  /** Display title in the shell content area. */
  title: string;
}

/**
 * Slot overrides for shell chrome areas.
 */
export interface AtelierFrameSlots {
  /** Header-right action area content. */
  headerActions?: ReactNode;
  /** Optional element rendered before the resource body. */
  pageChrome?: ReactNode;
  /** Sidebar footer content. */
  sidebarFooter?: ReactNode;
  /** User menu node shown in the top bar. */
  userMenu?: ReactNode;
}

/**
 * Root configuration used by `createAtelierApp`.
 */
export interface AtelierAppConfig {
  /** Application name shown by the shell. */
  appName: string;
  /** Optional auth integration hooks. */
  auth?: AtelierAuthAdapter;
  /** Optional navigation tree. */
  navigation?: AtelierNavigation;
  /** Optional named renderer registry. */
  renderers?: AtelierRendererRegistry;
  /** Optional resource definitions. */
  resources?: AtelierResourceDefinition[];
  /** Optional shell slot defaults. */
  slots?: AtelierFrameSlots;
}
