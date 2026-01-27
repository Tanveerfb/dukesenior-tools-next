"use client";

import { useEffect } from "react";
import { Box, Container, Typography, Button, Stack } from "@mui/material";
import { Home as HomeIcon, Refresh as RefreshIcon } from "@mui/icons-material";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          py: 8,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
        }}
      >
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontSize: { xs: "4rem", md: "6rem" },
            fontWeight: 700,
            background: "linear-gradient(45deg, #a63a50, #ab2fb1)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Oops!
        </Typography>
        
        <Typography variant="h4" component="h2" gutterBottom>
          Something went wrong
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500 }}>
          We encountered an unexpected error. Don't worry, our team has been notified
          and is working on it.
        </Typography>
        
        {error.digest && (
          <Typography variant="caption" color="text.disabled" sx={{ fontFamily: "monospace" }}>
            Error ID: {error.digest}
          </Typography>
        )}
        
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 2 }}>
          <Button
            onClick={reset}
            variant="contained"
            size="large"
            startIcon={<RefreshIcon />}
            sx={{
              textTransform: "none",
              px: 4,
              transition: "transform 0.2s",
              "&:hover": {
                transform: "translateY(-2px)",
              },
            }}
          >
            Try Again
          </Button>
          <Button
            href="/"
            variant="outlined"
            size="large"
            startIcon={<HomeIcon />}
            sx={{
              textTransform: "none",
              px: 4,
              transition: "transform 0.2s",
              "&:hover": {
                transform: "translateY(-2px)",
              },
            }}
          >
            Return Home
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}
