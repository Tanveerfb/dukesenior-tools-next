"use client";

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Stack,
} from '@mui/material';
import { EmojiEvents, TrendingUp, WorkspacePremium } from '@mui/icons-material';
import { LevelBadge } from '@/components/gamification';
import type { LeaderboardEntry, LeaderboardSort } from '@/types/gamification';

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<LeaderboardSort>('xp');

  useEffect(() => {
    fetchLeaderboard();
  }, [sort]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/gamification/leaderboard?sort=${sort}&limit=100`);
      if (response.ok) {
        const data = await response.json();
        setEntries(data.leaderboard);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <EmojiEvents sx={{ color: '#FFD700' }} />;
    if (rank === 2) return <EmojiEvents sx={{ color: '#C0C0C0' }} />;
    if (rank === 3) return <EmojiEvents sx={{ color: '#CD7F32' }} />;
    return <Typography variant="body2" sx={{ fontWeight: 'bold' }}>#{rank}</Typography>;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography
          variant="h3"
          sx={{
            fontFamily:
              "var(--font-permanent-marker, 'Permanent Marker', cursive)",
            fontWeight: 400,
            mb: 2,
          }}
        >
          🏆 Leaderboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Compete with other members and climb to the top!
        </Typography>
      </Box>

      {/* Sort Controls */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
        <ToggleButtonGroup
          value={sort}
          exclusive
          onChange={(e, value) => value && setSort(value)}
          aria-label="sort leaderboard"
        >
          <ToggleButton value="xp" aria-label="sort by xp">
            <TrendingUp sx={{ mr: 1 }} />
            Total XP
          </ToggleButton>
          <ToggleButton value="level" aria-label="sort by level">
            <WorkspacePremium sx={{ mr: 1 }} />
            Level
          </ToggleButton>
          <ToggleButton value="achievements" aria-label="sort by achievements">
            <EmojiEvents sx={{ mr: 1 }} />
            Achievements
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Leaderboard Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Rank</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Level</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total XP</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Achievements</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.map((entry) => (
                <TableRow
                  key={entry.uid}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                    ...(entry.rank <= 3 && {
                      backgroundColor: 'rgba(255, 215, 0, 0.05)',
                    }),
                  }}
                >
                  {/* Rank */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getRankIcon(entry.rank)}
                    </Box>
                  </TableCell>

                  {/* User */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        src={entry.photoURL}
                        alt={entry.displayName || entry.username}
                        sx={{ width: 40, height: 40 }}
                      />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {entry.displayName || entry.username || 'Anonymous'}
                        </Typography>
                        {entry.username && (
                          <Typography variant="caption" color="text.secondary">
                            @{entry.username}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>

                  {/* Level */}
                  <TableCell align="center">
                    <LevelBadge
                      level={entry.currentLevel}
                      size="small"
                      variant="icon-only"
                      totalXP={entry.totalXP}
                    />
                  </TableCell>

                  {/* Total XP */}
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {entry.totalXP.toLocaleString()}
                    </Typography>
                  </TableCell>

                  {/* Achievements */}
                  <TableCell align="right">
                    <Chip
                      label={entry.achievementCount}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Empty State */}
      {!loading && entries.length === 0 && (
        <Paper sx={{ p: 8, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No leaderboard data available yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Be the first to earn XP and climb the leaderboard!
          </Typography>
        </Paper>
      )}
    </Container>
  );
}
