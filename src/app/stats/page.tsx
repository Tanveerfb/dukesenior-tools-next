"use client";

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  Tab,
  Tabs,
  CircularProgress,
} from '@mui/material';
import { 
  TrendingUp, 
  EmojiEvents, 
  People, 
  Message,
  Create,
  Comment as CommentIcon,
} from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import { XPProgressBar, LevelBadge, AchievementList } from '@/components/gamification';
import type { UserGamification } from '@/types/gamification';

export default function StatsPage() {
  const { user } = useAuth();
  const [gamification, setGamification] = useState<UserGamification | null>(null);
  const [rank, setRank] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (user?.uid) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/gamification/stats/${user.uid}`);
      if (response.ok) {
        const data = await response.json();
        setGamification(data.gamification);
        setRank(data.rank);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!gamification) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6">No stats available yet</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Start earning XP to see your stats!
          </Typography>
        </Paper>
      </Container>
    );
  }

  const statCards = [
    {
      title: 'Total XP',
      value: gamification.totalXP.toLocaleString(),
      icon: <TrendingUp />,
      color: '#4CAF50',
    },
    {
      title: 'Global Rank',
      value: `#${rank}`,
      icon: <EmojiEvents />,
      color: '#FFD700',
    },
    {
      title: 'Achievements',
      value: gamification.achievementsUnlocked.length,
      icon: <EmojiEvents />,
      color: '#9C27B0',
    },
    {
      title: 'Login Streak',
      value: `${gamification.stats.loginStreak} days`,
      icon: <TrendingUp />,
      color: '#FF9800',
    },
  ];

  const activityStats = [
    {
      label: 'Posts Created',
      value: gamification.stats.postsCreated,
      icon: <Create />,
      color: '#E91E63',
    },
    {
      label: 'Comments Posted',
      value: gamification.stats.commentsPosted,
      icon: <CommentIcon />,
      color: '#03A9F4',
    },
    {
      label: 'Messages Sent',
      value: gamification.stats.messagesSent,
      icon: <Message />,
      color: '#2196F3',
    },
    {
      label: 'Friends Added',
      value: gamification.stats.friendsAdded,
      icon: <People />,
      color: '#4CAF50',
    },
    {
      label: 'Tournaments Participated',
      value: gamification.stats.tournamentsParticipated,
      icon: <EmojiEvents />,
      color: '#FF5722',
    },
    {
      label: 'Tournaments Won',
      value: gamification.stats.tournamentsWon,
      icon: <EmojiEvents />,
      color: '#FFD700',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
          📊 My Stats
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your progress and achievements
        </Typography>
      </Box>

      {/* Level & XP Overview */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={3} sx={{ textAlign: 'center' }}>
            <LevelBadge
              level={gamification.currentLevel}
              totalXP={gamification.totalXP}
              size="large"
              showTitle={true}
            />
          </Grid>
          <Grid item xs={12} md={9}>
            <XPProgressBar
              currentXP={gamification.totalXP}
              xpInLevel={gamification.xpInCurrentLevel}
              xpForNextLevel={gamification.xpForNextLevel}
              currentLevel={gamification.currentLevel}
              variant="default"
              showLabel={true}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((stat, index) => (
          <Grid item xs={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ color: stat.color, mr: 1 }}>{stat.icon}</Box>
                  <Typography variant="body2" color="text.secondary">
                    {stat.title}
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="fullWidth"
        >
          <Tab label="Activity Stats" />
          <Tab label="Achievements" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Paper sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
            Activity Overview
          </Typography>
          <Grid container spacing={3}>
            {activityStats.map((stat, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: 'action.hover',
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: stat.color,
                      color: '#FFF',
                      mr: 2,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {stat.value.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {tabValue === 1 && (
        <Paper sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
            Achievements ({gamification.achievementsUnlocked.length} Unlocked)
          </Typography>
          <AchievementList
            userAchievements={gamification.achievementsUnlocked}
            userStats={{
              posts_created: gamification.stats.postsCreated,
              comments_posted: gamification.stats.commentsPosted,
              messages_sent: gamification.stats.messagesSent,
              friends_added: gamification.stats.friendsAdded,
              tournaments_participated: gamification.stats.tournamentsParticipated,
              tournaments_won: gamification.stats.tournamentsWon,
              login_streak: gamification.stats.loginStreak,
              total_logins: gamification.stats.totalLogins,
              level_reached: gamification.currentLevel,
              xp_earned: gamification.totalXP,
            }}
          />
        </Paper>
      )}
    </Container>
  );
}
