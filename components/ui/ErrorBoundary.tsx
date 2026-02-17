'use client';

import { Component, type ReactNode } from 'react';
import Button from './Button';
import logger from '@/lib/logger';

interface ErrorBoundaryProps {
  /** Child components to render */
  children: ReactNode;
  /** Fallback UI to show on error (optional) */
  fallback?: ReactNode;
  /** Callback when error occurs */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** Custom error message */
  errorMessage?: string;
  /** Show retry button */
  showRetry?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary - Catches JavaScript errors in child component tree
 *
 * Use this to wrap components that might fail (e.g., PDF generation)
 * to prevent the entire app from crashing.
 *
 * @example
 * <ErrorBoundary
 *   errorMessage="Failed to generate PDF"
 *   showRetry
 *   onError={(error) => logError(error, 'pdf_generation')}
 * >
 *   <PDFDownloadButton />
 * </ErrorBoundary>
 */
export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error via centralized logger
    logger.error('ErrorBoundary caught an error', error, {
      componentStack: errorInfo.componentStack,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="p-6 rounded-xl border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            Something went wrong
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300 mb-4">
            {this.props.errorMessage || 'An unexpected error occurred. Please try again.'}
          </p>
          {this.props.showRetry && (
            <Button variant="ghost" size="sm" onClick={this.handleRetry}>
              Try Again
            </Button>
          )}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-4 text-left text-xs text-red-600 dark:text-red-400">
              <summary className="cursor-pointer">Error details</summary>
              <pre className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded overflow-auto">
                {this.state.error.message}
                {'\n'}
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * PDF-specific error boundary with appropriate messaging
 */
export function PDFErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      errorMessage="Failed to generate PDF. Please check all fields are filled correctly and try again."
      showRetry
      onError={(error) => {
        logger.error('PDF generation error', error, { type: 'pdf_error' });
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
