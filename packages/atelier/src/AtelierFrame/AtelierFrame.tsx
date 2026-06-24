import type { TVClassName } from '@fuf-stack/pixel-utils';
import type { ReactNode } from 'react';
import type {
  AtelierAuthState,
  AtelierDataState,
  AtelierFrameSlots,
  AtelierNavigation,
  AtelierRendererRegistry,
  AtelierResourceDefinition,
} from '../core';

import { useMemo, useState } from 'react';

import { tv, variantsToClassNames } from '@fuf-stack/pixel-utils';
import Button from '@fuf-stack/pixels/Button';
import Drawer from '@fuf-stack/pixels/Drawer';

import { createAuthAdapter } from '../core/createAuthAdapter';
import { filterNavigationForState } from '../core/navigation';
import { getResourceRenderer } from '../core/renderers';

/**
 * Slot-based class recipe for `AtelierFrame`.
 */
export const atelierFrameVariants = tv({
  slots: {
    appName: 'text-base font-semibold tracking-tight',
    base: 'flex min-h-[32rem] flex-col rounded-xl border border-default-200 bg-content1',
    content: 'grid gap-4 p-4 md:grid-cols-[16rem_1fr]',
    header:
      'flex min-h-14 items-center justify-between border-b border-default-200 px-4',
    navButton:
      'w-full justify-start rounded-md px-2 py-1 text-sm text-default-700 hover:bg-default-100',
    resourceArea: 'rounded-lg border border-default-200 bg-content2 p-4',
    resourceTitle: 'mb-2 text-sm font-medium text-default-700',
    shellMeta: 'flex items-center gap-2 text-xs text-default-500',
    sidebar:
      'hidden rounded-lg border border-default-200 bg-content2 p-3 md:block',
    sidebarFooter:
      'mt-3 border-t border-default-200 pt-3 text-xs text-default-600',
    sidebarSection: 'mb-3',
    sidebarSectionLabel:
      'mb-1 text-xs font-semibold uppercase text-default-500',
    topBarActions: 'ml-auto flex items-center gap-2',
  },
});

type ClassName = TVClassName<typeof atelierFrameVariants>;

/**
 * Props for the core frame component.
 */
export interface AtelierFrameProps {
  /** App name shown in the top bar and mobile drawer header. */
  appName: string;
  /** Current auth state used for status and navigation filtering. */
  authState: AtelierAuthState;
  /** Optional slot-based className overrides. */
  className?: ClassName;
  /** Current pathname used to mark active navigation items. */
  currentPath?: string;
  /** Current resource data state passed to renderers. */
  dataState?: AtelierDataState;
  /** Navigation callback triggered when an item is clicked. */
  onNavigate?: (to: string) => void;
  /** Sidebar navigation tree. */
  navigation?: AtelierNavigation;
  /** Resource payload forwarded to the active renderer. */
  resourceData?: unknown;
  /** Resource error forwarded to the active renderer. */
  resourceError?: unknown;
  /** Active resource id. */
  resourceId?: string;
  /** Available resource definitions. */
  resources?: AtelierResourceDefinition[];
  /** Optional slot content overrides. */
  slots?: AtelierFrameSlots;
  /** Prefix for test ids. */
  testId?: string;
  /** Header actions override. */
  topBarActions?: ReactNode;
  /** User menu override. */
  userMenu?: ReactNode;
  /** Enables drawer-based navigation on small screens. */
  withMobileDrawer?: boolean;
  /** Named renderer registry resolved by `rendererId`. */
  rendererRegistry?: AtelierRendererRegistry;
}

const defaultResourceId = 'default';

const getResourceById = (
  resources: AtelierResourceDefinition[],
  resourceId: string,
): AtelierResourceDefinition | undefined => {
  return resources.find((resource) => {
    return resource.id === resourceId;
  });
};

const defaultResource: AtelierResourceDefinition = {
  id: defaultResourceId,
  title: 'Workspace',
};

/**
 * Reusable frame component for app chrome, navigation, and pluggable
 * resource rendering.
 */
const AtelierFrame = ({
  appName,
  authState,
  className = undefined,
  currentPath = '/',
  dataState = 'ready',
  navigation = [],
  onNavigate = undefined,
  rendererRegistry = {},
  resourceData = undefined,
  resourceError = undefined,
  resourceId = defaultResourceId,
  resources = [],
  slots = undefined,
  testId = 'atelier-frame',
  topBarActions = undefined,
  userMenu = undefined,
  withMobileDrawer = true,
}: AtelierFrameProps) => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const variants = atelierFrameVariants();
  const classNames = variantsToClassNames(variants, className, 'base');

  const auth = createAuthAdapter();
  const visibleNavigation = useMemo(() => {
    return filterNavigationForState(navigation, authState, auth);
  }, [navigation, authState, auth]);

  const resolvedResource = getResourceById(resources, resourceId) ??
    resources[0] ?? { ...defaultResource, id: resourceId };

  const renderResource = getResourceRenderer(
    resolvedResource,
    rendererRegistry,
  );
  const sharedSlots = slots ?? {};
  const resolvedUserMenu = userMenu ?? sharedSlots.userMenu;

  /**
   * Renders the same navigation structure for desktop and mobile contexts.
   */
  const renderSidebar = ({ mobile }: { mobile: boolean }) => {
    return (
      <aside
        className={
          mobile
            ? 'rounded-lg border border-default-200 bg-content2 p-3'
            : classNames.sidebar
        }
        data-testid={`${testId}__sidebar`}
      >
        {visibleNavigation.map((section) => {
          return (
            <div
              key={section.id}
              className={classNames.sidebarSection}
              data-testid={`${testId}__section-${section.id}`}
            >
              {section.label ? (
                <div className={classNames.sidebarSectionLabel}>
                  {section.label}
                </div>
              ) : null}
              <nav className="grid gap-1">
                {section.items.map((item) => {
                  return (
                    <Button
                      key={item.id}
                      className={classNames.navButton}
                      color={item.to === currentPath ? 'primary' : 'default'}
                      onClick={() => {
                        onNavigate?.(item.to);
                        setIsMobileNavOpen(false);
                      }}
                      variant={item.to === currentPath ? 'solid' : 'light'}
                    >
                      <span className="mr-2 inline-flex">{item.icon}</span>
                      <span>{item.label}</span>
                      {item.badge ? (
                        <span className="ml-auto">{item.badge}</span>
                      ) : null}
                    </Button>
                  );
                })}
              </nav>
            </div>
          );
        })}
        {sharedSlots.sidebarFooter ? (
          <div className={classNames.sidebarFooter}>
            {sharedSlots.sidebarFooter}
          </div>
        ) : null}
      </aside>
    );
  };

  return (
    <section className={classNames.base} data-testid={testId}>
      <header className={classNames.header}>
        <div className={classNames.shellMeta}>
          {withMobileDrawer ? (
            <Button
              className="md:hidden"
              onClick={() => {
                setIsMobileNavOpen(true);
              }}
              size="sm"
              variant="flat"
            >
              Menu
            </Button>
          ) : null}
          <span className={classNames.appName}>{appName}</span>
          <span>status: {authState.status}</span>
        </div>
        <div className={classNames.topBarActions}>
          {topBarActions ?? sharedSlots.headerActions}
          {resolvedUserMenu}
        </div>
      </header>
      <div className={classNames.content}>
        {renderSidebar({ mobile: false })}
        <main className={classNames.resourceArea}>
          <div className={classNames.resourceTitle}>
            {resolvedResource.title}
          </div>
          {sharedSlots.pageChrome}
          {renderResource({
            data: resourceData,
            error: resourceError,
            resourceId: resolvedResource.id,
            state: dataState,
            title: resolvedResource.title,
          })}
        </main>
      </div>
      {withMobileDrawer ? (
        <Drawer
          header={appName}
          isOpen={isMobileNavOpen}
          onClose={() => {
            setIsMobileNavOpen(false);
          }}
          placement="left"
        >
          {renderSidebar({ mobile: true })}
        </Drawer>
      ) : null}
    </section>
  );
};

export default AtelierFrame;
