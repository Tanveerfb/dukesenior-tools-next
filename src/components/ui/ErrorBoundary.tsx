"use client";
import React, { Component, ReactNode } from "react";
import { Card, CardContent, Button, Alert, Box, Typography } from "@mui/material";
import { Warning as WarningIcon, Refresh as RefreshIcon } from "@mui/icons-material";

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
        <Card sx={{ borderColor: "error.main", my: 4 }}>
          <CardContent sx={{ textAlign: "center", py: 5 }}>
            <WarningIcon
              color="error"
              sx={{ fontSize: 48, mb: 3 }}
              aria-hidden="true"
            />
            <Typography variant="h5" component="h3" fontWeight={600} gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              An error occurred while rendering this component.
            </Typography>
            {this.state.error && process.env.NODE_ENV === "development" && (
              <Alert severity="error" sx={{ textAlign: "left", mb: 4 }}>
                <strong>Error:</strong> {this.state.error.message}
                <Box component="details" sx={{ mt: 2 }}>
                  <summary style={{ cursor: "pointer" }}>Stack trace</summary>
                  <Box
                    component="pre"
                    sx={{
                      mt: 2,
                      mb: 0,
                      fontSize: "0.875rem",
                      overflow: "auto",
                    }}
                  >
                    {this.state.error.stack}
                  </Box>
                </Box>
              </Alert>
            )}
            <Button
              variant="contained"
              onClick={this.handleReset}
              startIcon={<RefreshIcon />}
              sx={{ textTransform: "none" }}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
