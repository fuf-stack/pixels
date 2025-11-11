import type { Meta, StoryObj } from '@storybook/react-vite';

import { use } from 'react';

import { expect, userEvent, within } from 'storybook/test';

import { Button } from '../../Button';
import { createWithSuspense } from './createWithSuspense';

// Helper: Create a promise that resolves after delay
// Note: Not marked as async to avoid double-wrapping the promise
// eslint-disable-next-line @typescript-eslint/promise-function-async
const createDelayedPromise = <T,>(value: T, delay: number) => {
  return new Promise<T>((resolve) => {
    setTimeout(() => {
      resolve(value);
    }, delay);
  });
};

// Helper: Create a promise that rejects after delay
// Note: Not marked as async to avoid double-wrapping the promise
// eslint-disable-next-line @typescript-eslint/promise-function-async
const createFailedPromise = (message: string, delay: number) => {
  return new Promise<string>((_, reject) => {
    setTimeout(() => {
      reject(new Error(message));
    }, delay);
  });
};

// Simple cache to avoid re-fetching in stories
const promiseCache = new Map<string, Promise<string>>();

// Note: Not marked as async to return the promise directly without wrapping
// eslint-disable-next-line @typescript-eslint/promise-function-async
const fetchUser = (userId: string, delay = 1000): Promise<string> => {
  const cacheKey = `${userId}-${delay}`;
  if (!promiseCache.has(cacheKey)) {
    promiseCache.set(cacheKey, createDelayedPromise(`User ${userId}`, delay));
  }
  const promise = promiseCache.get(cacheKey);
  if (!promise) {
    throw new Error('Promise not found in cache');
  }
  return promise;
};

// Note: Not marked as async to return the promise directly without wrapping
// eslint-disable-next-line @typescript-eslint/promise-function-async
const fetchUserWithError = (userId: string, delay = 1000): Promise<string> => {
  const cacheKey = `error-${userId}-${delay}`;
  if (!promiseCache.has(cacheKey)) {
    promiseCache.set(
      cacheKey,
      createFailedPromise(`Failed to fetch user ${userId}`, delay),
    );
  }
  const promise = promiseCache.get(cacheKey);
  if (!promise) {
    throw new Error('Promise not found in cache');
  }
  return promise;
};

// Create a custom withSuspense with project defaults
const projectWithSuspense = createWithSuspense({
  defaultFallback: (
    <div className="flex items-center gap-2 rounded-md border border-primary-200 bg-primary-50 p-4">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      <span className="text-sm text-primary-700">Loading...</span>
    </div>
  ),
  errorFallback: (error) => {
    return (
      <div className="rounded-md border border-danger-200 bg-danger-50 p-4">
        <h3 className="mb-2 font-semibold text-danger-700">Error occurred</h3>
        <p className="text-sm text-danger-600">{error.message}</p>
      </div>
    );
  },
  onError: (error, errorInfo) => {
    // In a real app, you'd send this to your error tracking service
    if (process.env.NODE_ENV !== 'test') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  },
});

// Component that uses a suspending hook
const UserProfile = ({ userId }: { userId: string }) => {
  const userName = use(fetchUser(userId));
  return (
    <div className="rounded-md border border-default-200 bg-default-50 p-4">
      <h3 className="text-lg font-semibold">{userName}</h3>
      <p className="text-sm text-default-500">ID: {userId}</p>
    </div>
  );
};

// Component that throws an error
const UserProfileWithError = ({ userId }: { userId: string }) => {
  const userName = use(fetchUserWithError(userId));
  return (
    <div className="rounded-md border border-default-200 bg-default-50 p-4">
      <h3 className="text-lg font-semibold">{userName}</h3>
      <p className="text-sm text-default-500">ID: {userId}</p>
    </div>
  );
};

// Wrapped with project defaults
const UserProfileWithDefaults = projectWithSuspense(UserProfile);

// Dummy component for meta
const DummyComponent = () => {
  return <div>createWithSuspense Factory</div>;
};

const meta: Meta<typeof DummyComponent> = {
  title: 'pixels/utils/createWithSuspense',
  component: DummyComponent,
  parameters: {
    docs: {
      description: {
        component:
          'Factory function to create a project-specific withSuspense HOC with default configuration including fallback and error boundary.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof DummyComponent>;

export const WithProjectDefaults: Story = {
  render: () => {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">Using Project Defaults</h2>
        <p className="text-sm text-default-600">
          This component uses the default fallback configured in
          createWithSuspense
        </p>
        <UserProfileWithDefaults userId="default-user" />
      </div>
    );
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    // Wait for user to load
    const userName = await canvas.findByText(
      'User default-user',
      {},
      { timeout: 2000 },
    );
    expect(userName).toBeInTheDocument();
  },
};

export const WithCustomOverride: Story = {
  render: () => {
    // Override the default fallback for this specific component
    const UserProfileCustom = projectWithSuspense(UserProfile, {
      fallback: (
        <div className="rounded-md border border-success-200 bg-success-50 p-4">
          <span className="text-sm text-success-700">
            Custom loading state...
          </span>
        </div>
      ),
    });

    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">Override Default Fallback</h2>
        <p className="text-sm text-default-600">
          This component overrides the project default with a custom fallback
        </p>
        <UserProfileCustom userId="custom-user" />
      </div>
    );
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    // Wait for user to load
    const userName = await canvas.findByText(
      'User custom-user',
      {},
      { timeout: 2000 },
    );
    expect(userName).toBeInTheDocument();
  },
};

export const WithErrorBoundary: Story = {
  render: () => {
    const UserProfileWithErrorBoundary =
      projectWithSuspense(UserProfileWithError);

    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">With Error Boundary</h2>
        <p className="text-sm text-default-600">
          This component will throw an error and be caught by the error boundary
        </p>
        <UserProfileWithErrorBoundary userId="error-user" />
      </div>
    );
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    // Wait for error boundary to show
    const errorHeading = await canvas.findByText(
      'Error occurred',
      {},
      { timeout: 2000 },
    );
    expect(errorHeading).toBeInTheDocument();
    const errorMessage = canvas.getByText('Failed to fetch user error-user');
    expect(errorMessage).toBeInTheDocument();
  },
};

export const WithCustomErrorFallback: Story = {
  render: () => {
    const UserProfileCustomError = projectWithSuspense(UserProfileWithError, {
      errorFallback: (error) => {
        return (
          <div className="rounded-md border border-warning-200 bg-warning-50 p-4">
            <h3 className="mb-2 font-semibold text-warning-700">
              Custom Error UI
            </h3>
            <p className="text-sm text-warning-600">{error.message}</p>
            <Button
              className="mt-2"
              color="warning"
              size="sm"
              type="button"
              onClick={() => {
                window.location.reload();
              }}
            >
              Retry
            </Button>
          </div>
        );
      },
    });

    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">Custom Error Fallback</h2>
        <p className="text-sm text-default-600">
          This component uses a custom error fallback with a retry button
        </p>
        <UserProfileCustomError userId="custom-error-user" />
      </div>
    );
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    // Wait for custom error UI to show
    const errorHeading = await canvas.findByText(
      'Custom Error UI',
      {},
      { timeout: 2000 },
    );
    expect(errorHeading).toBeInTheDocument();
    const retryButton = canvas.getByText('Retry');
    expect(retryButton).toBeInTheDocument();
  },
};

export const WithoutErrorBoundary: Story = {
  render: () => {
    const UserProfileNoError = projectWithSuspense(UserProfile, {
      disableErrorBoundary: true,
    });

    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">Without Error Boundary</h2>
        <p className="text-sm text-default-600">
          This component has error boundary disabled (will use Suspense only)
        </p>
        <UserProfileNoError userId="no-error-boundary-user" />
      </div>
    );
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    // Wait for user to load
    const userName = await canvas.findByText(
      'User no-error-boundary-user',
      {},
      { timeout: 2000 },
    );
    expect(userName).toBeInTheDocument();
  },
};

export const WithDisabledAnimation: Story = {
  render: () => {
    const UserProfileNoAnimation = projectWithSuspense(UserProfile, {
      disableAnimation: true,
    });

    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">With Disabled Animation</h2>
        <p className="text-sm text-default-600">
          This component has animations disabled and will render instantly
          without height transitions
        </p>
        <UserProfileNoAnimation userId="no-animation-user" />
      </div>
    );
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    // Wait for user to load
    const userName = await canvas.findByText(
      'User no-animation-user',
      {},
      { timeout: 2000 },
    );
    expect(userName).toBeInTheDocument();
  },
};

export const MultipleComponentsWithFactory: Story = {
  render: () => {
    const UserProfile1 = projectWithSuspense(UserProfile);
    const UserProfile2 = projectWithSuspense(UserProfile);
    const UserProfile3 = projectWithSuspense(UserProfileWithError);

    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">Multiple Components with Factory</h2>
        <p className="text-sm text-default-600">
          All components share the same default configuration
        </p>
        <UserProfile1 userId="multi-1" />
        <UserProfile2 userId="multi-2" />
        <UserProfile3 userId="multi-error" />
      </div>
    );
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    // Wait for all users to load
    const user1 = await canvas.findByText(
      'User multi-1',
      {},
      { timeout: 3000 },
    );
    expect(user1).toBeInTheDocument();
    const user2 = await canvas.findByText(
      'User multi-2',
      {},
      { timeout: 3000 },
    );
    expect(user2).toBeInTheDocument();
    // Wait for error to show
    const errorHeading = await canvas.findByText(
      'Error occurred',
      {},
      { timeout: 3000 },
    );
    expect(errorHeading).toBeInTheDocument();
  },
};

export const RealWorldExample: Story = {
  render: () => {
    // Real-world usage: Create a project-specific withSuspense
    const myAppWithSuspense = createWithSuspense({
      defaultFallback: (
        <div className="flex h-32 items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
            <span className="text-sm text-default-500">Loading data...</span>
          </div>
        </div>
      ),
      errorFallback: (error, errorInfo) => {
        return (
          <div className="rounded-lg border-2 border-danger-300 bg-danger-50 p-6">
            <h3 className="mb-3 text-lg font-bold text-danger-700">
              Something went wrong
            </h3>
            <details className="mb-4">
              <summary className="cursor-pointer text-sm font-semibold text-danger-600">
                Error Details
              </summary>
              <div className="mt-2 rounded bg-danger-100 p-2 font-mono text-xs text-danger-700">
                <p>
                  <strong>Error:</strong> {error.message}
                </p>
                <p>
                  <strong>Component:</strong>{' '}
                  {
                    errorInfo.componentStack
                      ?.split('\n')[1]
                      ?.trim()
                      ?.split(' ')[1]
                      ?.split('(')[0]
                  }
                </p>
              </div>
            </details>
            <Button
              color="danger"
              testId="error-retry-button"
              type="button"
              onClick={() => {
                window.location.reload();
              }}
            >
              Reload Page
            </Button>
          </div>
        );
      },
      onError: (error, errorInfo) => {
        // Send to your error tracking service
        // Example: trackError({ message: error.message, stack: error.stack, componentStack: errorInfo.componentStack })
        if (process.env.NODE_ENV !== 'test') {
          console.error('🔴 Error tracked:', {
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
          });
        }
      },
    });

    const MyUserProfile = myAppWithSuspense(UserProfile);
    const MyErrorProfile = myAppWithSuspense(UserProfileWithError);

    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="mb-2 text-xl font-bold">Real-World Usage Example</h2>
          <p className="text-sm text-default-600">
            Complete setup with custom loading, error handling, and error
            tracking
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="mb-2 font-semibold">Success Case:</h3>
            <MyUserProfile userId="real-world-user" />
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Error Case:</h3>
            <MyErrorProfile userId="real-world-error" />
          </div>
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);

    // Wait for success case to load
    await canvas.findByText('User real-world-user', {}, { timeout: 2000 });

    // Wait for error case to show error boundary
    const errorRetryButton = await canvas.findByTestId(
      'error-retry-button',
      {},
      { timeout: 2000 },
    );
    expect(errorRetryButton).toBeInTheDocument();

    // Verify error details can be expanded
    const errorDetails = canvas.getByText('Error Details');
    expect(errorDetails).toBeInTheDocument();
    await userEvent.click(errorDetails);
  },
};
