import { Box, Container, Grid, Paper, Skeleton, Stack } from "@mui/material";

export default function Loading() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Profile header skeleton */}
      <Paper
        variant="outlined"
        sx={{ borderRadius: 2, overflow: "hidden", mb: 3 }}
      >
        <Skeleton variant="rectangular" height={180} />
        <Box sx={{ px: 3, pb: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: "-48px", mb: 2 }}>
            <Skeleton variant="circular" width={96} height={96} sx={{ border: "4px solid white" }} />
            <Skeleton variant="rounded" width={120} height={36} sx={{ mt: "52px" }} />
          </Box>
          <Skeleton width={200} height={32} sx={{ mb: 0.5 }} />
          <Skeleton width={140} height={20} sx={{ mb: 1.5 }} />
          <Skeleton width="60%" height={16} />
        </Box>
      </Paper>

      {/* Body skeleton */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            {[140, 100].map((h, i) => (
              <Paper key={i} variant="outlined" sx={{ p: 3 }}>
                <Skeleton width={160} height={28} sx={{ mb: 2 }} />
                <Skeleton height={h} variant="rectangular" sx={{ borderRadius: 1 }} />
              </Paper>
            ))}
          </Stack>
        </Grid>
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {[160, 120, 80].map((h, i) => (
              <Paper key={i} variant="outlined" sx={{ p: 3 }}>
                <Skeleton width={100} height={28} sx={{ mb: 2 }} />
                <Skeleton height={h} variant="rectangular" sx={{ borderRadius: 1 }} />
              </Paper>
            ))}
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}
