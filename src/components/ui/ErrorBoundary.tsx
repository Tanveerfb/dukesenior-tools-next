"use client";
import React, { Component, ReactNode } from "react";
import { Card, Button, Alert } from "react-bootstrap";
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
    // Log error to console in development
    console.error("Error caught by boundary:", error, errorInfo);
    
    // In production, you could send this to an error tracking service
    // Example: logErrorToService(error, errorInfo);
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
        <Card className="border-danger my-4">
          <Card.Body className="text-center py-5">
            <FiAlertTriangle
              className="text-danger mb-3"
              size={48}
              aria-hidden="true"
            />
            <h3 className="h5 fw-semibold mb-2">Something went wrong</h3>
            <p className="text-muted mb-4">
              An error occurred while rendering this component.
            </p>
            {this.state.error && process.env.NODE_ENV === "development" && (
              <Alert variant="danger" className="text-start mb-4">
                <strong>Error:</strong> {this.state.error.message}
                <details className="mt-2">
                  <summary className="cursor-pointer">Stack trace</summary>
                  <pre className="mt-2 mb-0 small">
                    {this.state.error.stack}
                  </pre>
                </details>
              </Alert>
            )}
            <Button
              variant="primary"
              onClick={this.handleReset}
              className="d-inline-flex align-items-center gap-2"
            >
              <FiRefreshCw size={16} />
              Try Again
            </Button>
          </Card.Body>
        </Card>
      );
    }

    return this.props.children;
  }
}
