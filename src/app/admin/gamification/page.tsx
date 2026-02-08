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
  Button,
  TextField,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
} from '@mui/material';
import { Add, TrendingUp, EmojiEvents, People } from '@mui/icons-material';
import AdminAuthGuard from '@/components/admin/AdminAuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { ACHIEVEMENTS } from '@/data/achievements';
import type { Achievement } from '@/types/gamification';

function AdminGamificationPage() {
  const { admin } = useAuth();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [xpAmount, setXpAmount] = useState(0);
  const [xpReason, setXpReason] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalXPAwarded: 0,
    totalAchievements: 0,
  });

  const handleAwardAchievement = async () => {
    if (!selectedUser || !selectedAchievement) return;

    try {
      const response = await fetch('/api/admin/gamification/award-achievement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: selectedUser,
          achievementId: selectedAchievement.id,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Achievement awarded successfully!' });
        setOpenDialog(false);
        setSelectedUser('');
        setSelectedAchievement(null);
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Failed to award achievement' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to award achievement' });
    }
  };

  const handleAwardXP = async () => {
    if (!selectedUser || xpAmount <= 0 || !xpReason) return;

    try {
      const response = await fetch('/api/admin/gamification/award-xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: selectedUser,
          amount: xpAmount,
          reason: xpReason,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'XP awarded successfully!' });
        setSelectedUser('');
        setXpAmount(0);
        setXpReason('');
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Failed to award XP' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to award XP' });
    }
  };

  // Group achievements by category
  const achievementsByCategory = {
    social: ACHIEVEMENTS.filter(a => a.category === 'social'),
    content: ACHIEVEMENTS.filter(a => a.category === 'content'),
    tournament: ACHIEVEMENTS.filter(a => a.category === 'tournament'),
    milestone: ACHIEVEMENTS.filter(a => a.category === 'milestone'),
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
          Gamification Admin
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage achievements, award XP, and view analytics
        </Typography>
      </Box>

      {message && (
        <Alert
          severity={message.type}
          onClose={() => setMessage(null)}
          sx={{ mb: 3 }}
        >
          {message.text}
        </Alert>
      )}

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <People sx={{ color: '#4CAF50', mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Total Users
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {stats.totalUsers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp sx={{ color: '#2196F3', mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Total XP Awarded
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {stats.totalXPAwarded.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EmojiEvents sx={{ color: '#FFD700', mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Total Achievements
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {stats.totalAchievements}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Award Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Award Achievement
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenDialog(true)}
              fullWidth
            >
              Award Achievement to User
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Award Manual XP
            </Typography>
            <TextField
              label="User ID"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
              size="small"
            />
            <TextField
              label="XP Amount"
              type="number"
              value={xpAmount}
              onChange={(e) => setXpAmount(parseInt(e.target.value, 10))}
              fullWidth
              sx={{ mb: 2 }}
              size="small"
            />
            <TextField
              label="Reason"
              value={xpReason}
              onChange={(e) => setXpReason(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
              size="small"
            />
            <Button
              variant="contained"
              onClick={handleAwardXP}
              fullWidth
              disabled={!selectedUser || xpAmount <= 0 || !xpReason}
            >
              Award XP
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Achievement List */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
          All Achievements ({ACHIEVEMENTS.length})
        </Typography>
        {Object.entries(achievementsByCategory).map(([category, achievements]) => (
          <Box key={category} sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', textTransform: 'capitalize' }}>
              {category} ({achievements.length})
            </Typography>
            <Grid container spacing={2}>
              {achievements.map((achievement) => (
                <Grid item xs={12} sm={6} md={4} key={achievement.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography sx={{ fontSize: 24, mr: 1 }}>
                          {achievement.icon}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {achievement.name}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        {achievement.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip
                          label={achievement.rarity}
                          size="small"
                          sx={{ fontSize: '0.65rem' }}
                        />
                        <Chip
                          label={`${achievement.xpReward} XP`}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ fontSize: '0.65rem' }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}
      </Paper>

      {/* Award Achievement Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Award Achievement</DialogTitle>
        <DialogContent>
          <TextField
            label="User ID"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            fullWidth
            sx={{ mt: 2, mb: 2 }}
          />
          <Autocomplete
            options={ACHIEVEMENTS}
            getOptionLabel={(option) => `${option.icon} ${option.name}`}
            value={selectedAchievement}
            onChange={(e, newValue) => setSelectedAchievement(newValue)}
            renderInput={(params) => <TextField {...params} label="Select Achievement" />}
          />
          {selectedAchievement && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
              <Typography variant="body2">{selectedAchievement.description}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Reward: {selectedAchievement.xpReward} XP
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleAwardAchievement}
            variant="contained"
            disabled={!selectedUser || !selectedAchievement}
          >
            Award Achievement
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default function AdminGamificationPageWithGuard() {
  return (
    <AdminAuthGuard>
      <AdminGamificationPage />
    </AdminAuthGuard>
  );
}
