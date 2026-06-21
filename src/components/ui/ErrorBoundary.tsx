"use client";
import React, { Component, ReactNode } from "react";
import { FiAlertTriangle, FiRefreshCw } from "react-icons/fi";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="my-8 rounded-xl border border-danger/30 bg-card dark:bg-card-dark overflow-hidden">
          <div className="text-center py-12 px-6">
            <FiAlertTriangle
              className="mx-auto text-danger mb-4"
              size={48}
              aria-hidden="true"
            />
            <h3 className="text-xl font-semibold text-foreground dark:text-foreground-dark mb-2">
              Something went wrong
            </h3>
            <p className="text-sm text-foreground-muted dark:text-foreground-dark-muted mb-6">
              An error occurred while rendering this component.
            </p>
            {this.state.error && process.env.NODE_ENV === "development" && (
              <div className="bg-danger-50 dark:bg-danger/10 border border-danger/20 rounded-lg p-4 text-left mb-6 mx-auto max-w-2xl">
                <p className="text-sm text-danger-600 dark:text-danger">
                  <strong>Error:</strong> {this.state.error.message}
                </p>
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-danger-600 dark:text-danger font-medium">
                    Stack trace
                  </summary>
                  <pre className="mt-2 text-xs overflow-auto whitespace-pre-wrap text-foreground-muted dark:text-foreground-dark-muted">
                    {this.state.error.stack}
                  </pre>
                </details>
              </div>
            )}
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
            >
              <FiRefreshCw size={16} />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
