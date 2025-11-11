import type { ComponentType, ErrorInfo, ReactNode } from 'react';

import React, { Component, Suspense } from 'react';

import { motion, useReducedMotion } from '@fuf-stack/pixel-motion';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: (error: Error, errorInfo: ErrorInfo) => ReactNode;
  // eslint-disable-next-line react/require-default-props
  shouldAnimate?: boolean;
  // eslint-disable-next-line react/require-default-props
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError } = this.props;
    this.setState({ errorInfo });
    onError?.(error, errorInfo);
  }

  // eslint-disable-next-line @typescript-eslint/promise-function-async
  render() {
    const { error, errorInfo } = this.state;
    const { fallback, children, shouldAnimate } = this.props;

    if (error) {
      // errorInfo might not be set yet in getDerivedStateFromError,
      // so we provide a default empty errorInfo to prevent errors from bubbling up
      const errorFallback = fallback(
        error,
        errorInfo ?? { componentStack: '' },
      );

      if (!shouldAnimate) {
        return errorFallback;
      }

      return (
        <motion.div
          animate={{ height: 'auto', opacity: 1 }}
          initial={{ height: 0, opacity: 0 }}
          style={{ overflow: 'hidden' }}
          transition={{
            height: { duration: 0.2, ease: 'easeInOut' },
            opacity: { duration: 0.2, delay: 0.2 },
          }}
        >
          {errorFallback}
        </motion.div>
      );
    }

    return children;
  }
}

export interface CreateWithSuspenseConfig {
  /**
   * Default fallback to show while suspending
   */
  defaultFallback?: ReactNode;
  /**
   * Disable height animation between loading and loaded states
   * @default false
   */
  disableAnimation?: boolean;
  /**
   * Error boundary fallback renderer
   * @param error - The error that was caught
   * @param errorInfo - Additional error information
   */
  errorFallback?: (error: Error, errorInfo: ErrorInfo) => ReactNode;
  /**
   * Callback when an error is caught
   * @param error - The error that was caught
   * @param errorInfo - Additional error information
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export interface WithSuspenseOptions {
  /**
   * Override the default fallback for this specific component
   */
  fallback?: ReactNode;
  /**
   * Override the error boundary for this specific component
   */
  errorFallback?: (error: Error, errorInfo: ErrorInfo) => ReactNode;
  /**
   * Disable height animation for this specific component
   */
  disableAnimation?: boolean;
  /**
   * Disable error boundary for this specific component
   */
  disableErrorBoundary?: boolean;
}

/**
 * Factory function to create a project-specific withSuspense HOC with default configuration.
 *
 * @example
 * ```tsx
 * // In your project setup file
 * export const withSuspense = createWithSuspense({
 *   defaultFallback: <YourSpinner />,
 *   errorFallback: (error) => <YourErrorComponent error={error} />,
 *   onError: (error, errorInfo) => {
 *     console.error('Caught error:', error, errorInfo);
 *     // Send to error tracking service
 *   },
 * });
 *
 * // Then use throughout your project
 * const MyComponent = withSuspense(({ userId }) => {
 *   const user = use(fetchUser(userId));
 *   return <div>{user.name}</div>;
 * });
 * ```
 */
export function createWithSuspense(config: CreateWithSuspenseConfig = {}) {
  const {
    defaultFallback = null,
    disableAnimation: defaultDisableAnimation = false,
    errorFallback: defaultErrorFallback,
    onError: defaultOnError,
  } = config;

  return function withSuspense<P extends object>(
    WrappedComponent: ComponentType<P>,
    options?: WithSuspenseOptions,
  ) {
    const fallback = options?.fallback ?? defaultFallback;
    const errorFallback = options?.errorFallback ?? defaultErrorFallback;
    const disableErrorBoundary = options?.disableErrorBoundary ?? false;
    const disableAnimation =
      options?.disableAnimation ?? defaultDisableAnimation;

    const WithSuspenseComponent = (props: P) => {
      const prefersReducedMotion = useReducedMotion();
      const shouldAnimate = !disableAnimation && !prefersReducedMotion;

      // Wrap content in motion wrapper if animation is enabled
      const wrapWithMotion = (children: ReactNode): ReactNode => {
        if (!shouldAnimate) {
          return children;
        }

        return (
          <motion.div
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            initial={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
            transition={{
              height: { duration: 0.2, ease: 'easeInOut' },
              opacity: { duration: 0.2, delay: 0.2 }, // Fade in after height animation
            }}
          >
            {children}
          </motion.div>
        );
      };

      const animatedFallback = shouldAnimate ? (
        <motion.div
          key="fallback"
          exit={{ height: 0, opacity: 0 }}
          initial={{ height: 'auto', opacity: 1 }}
          style={{ overflow: 'hidden' }}
          transition={{
            height: { duration: 0.3, ease: 'easeInOut' },
            opacity: { duration: 0.2 },
          }}
        >
          {fallback}
        </motion.div>
      ) : (
        fallback
      );

      const content = (
        <Suspense fallback={animatedFallback}>
          {wrapWithMotion(<WrappedComponent {...props} />)}
        </Suspense>
      );

      // If no error boundary configured or explicitly disabled, return just Suspense
      if (!errorFallback || disableErrorBoundary) {
        return content;
      }

      return (
        <ErrorBoundary
          fallback={errorFallback}
          onError={defaultOnError}
          shouldAnimate={shouldAnimate}
        >
          {content}
        </ErrorBoundary>
      );
    };

    WithSuspenseComponent.displayName = `withSuspense(${
      WrappedComponent.displayName ?? WrappedComponent.name ?? 'Component'
    })`;

    return WithSuspenseComponent;
  };
}
