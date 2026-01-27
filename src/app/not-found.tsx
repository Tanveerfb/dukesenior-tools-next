import Link from "next/link";
import { Box, Container, Typography, Button, Stack } from "@mui/material";
import { Home as HomeIcon, Search as SearchIcon } from "@mui/icons-material";

export default function NotFound() {
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
            background: "linear-gradient(45deg, #ab2fb1, #36453b)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          404
        </Typography>

        <Typography variant="h4" component="h2" gutterBottom>
          Page Not Found
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: 500 }}
        >
          The page you are looking for doesn't exist or has been moved. Let's
          get you back on track.
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ mt: 2 }}
        >
          <Link href="/" passHref legacyBehavior>
            <Button
              variant="contained"
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
          </Link>
          <Link href="/phasmotourney-series" passHref legacyBehavior>
            <Button
              variant="outlined"
              size="large"
              startIcon={<SearchIcon />}
              sx={{
                textTransform: "none",
                px: 4,
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "translateY(-2px)",
                },
              }}
            >
              Browse Tourneys
            </Button>
          </Link>
        </Stack>
      </Box>
    </Container>
  );
}
