"use client";

import { Box, Card, CardContent, Typography, Tooltip, Chip, Grid } from '@mui/material';
import { Lock } from '@mui/icons-material';
import type { Achievement } from '@/types/gamification';
import { ACHIEVEMENTS } from '@/data/achievements';

interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked: boolean;
  unlockedAt?: number;
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
  progress?: number;
}

export function AchievementBadge({
  achievement,
  unlocked,
  unlockedAt,
  size = 'medium',
  showProgress = false,
  progress = 0,
}: AchievementBadgeProps) {
  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'legendary': return '#FFD700';
      case 'epic': return '#9C27B0';
      case 'rare': return '#2196F3';
      case 'uncommon': return '#4CAF50';
      case 'common': return '#9E9E9E';
      default: return '#9E9E9E';
    }
  };

  const sizeConfig = {
    small: { iconSize: 32, fontSize: '0.75rem' },
    medium: { iconSize: 48, fontSize: '1rem' },
    large: { iconSize: 64, fontSize: '1.25rem' },
  };

  const config = sizeConfig[size];
  const rarityColor = getRarityColor(achievement.rarity);

  return (
    <Tooltip
      title={
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            {achievement.name}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {achievement.description}
          </Typography>
          <Typography variant="caption">
            Rarity: {achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1)}
          </Typography>
          <br />
          <Typography variant="caption">
            Reward: {achievement.xpReward} XP
          </Typography>
          {unlocked && unlockedAt && (
            <>
              <br />
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                Unlocked: {new Date(unlockedAt).toLocaleDateString()}
              </Typography>
            </>
          )}
          {showProgress && !unlocked && (
            <>
              <br />
              <Typography variant="caption">
                Progress: {progress}/{achievement.requirement}
              </Typography>
            </>
          )}
        </Box>
      }
      arrow
    >
      <Card
        sx={{
          position: 'relative',
          cursor: 'pointer',
          transition: 'all 0.3s',
          backgroundColor: unlocked ? 'background.paper' : 'rgba(0, 0, 0, 0.2)',
          opacity: unlocked ? 1 : 0.5,
          border: unlocked ? `2px solid ${rarityColor}` : '2px solid transparent',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: unlocked ? `0 8px 16px ${rarityColor}40` : 'none',
          },
        }}
      >
        <CardContent sx={{ textAlign: 'center', p: 2 }}>
          {/* Icon/Emoji */}
          <Box
            sx={{
              fontSize: config.iconSize,
              mb: 1,
              filter: unlocked ? 'none' : 'grayscale(100%)',
              position: 'relative',
            }}
          >
            {unlocked ? (
              achievement.icon || '🏆'
            ) : achievement.isSecret ? (
              '❓'
            ) : (
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                {achievement.icon || '🏆'}
                <Lock
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: config.iconSize / 2,
                    color: 'text.secondary',
                  }}
                />
              </Box>
            )}
          </Box>

          {/* Name */}
          <Typography
            variant={size === 'small' ? 'caption' : 'body2'}
            sx={{
              fontWeight: 'bold',
              mb: 0.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {unlocked ? achievement.name : achievement.isSecret ? 'Secret Achievement' : achievement.name}
          </Typography>

          {/* Rarity Badge */}
          {unlocked && (
            <Chip
              label={achievement.rarity}
              size="small"
              sx={{
                backgroundColor: rarityColor,
                color: achievement.rarity === 'legendary' ? '#000' : '#FFF',
                fontSize: '0.65rem',
                height: 20,
              }}
            />
          )}

          {/* Progress Bar */}
          {showProgress && !unlocked && (
            <Box sx={{ mt: 1, width: '100%' }}>
              <Box
                sx={{
                  height: 4,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    height: '100%',
                    width: `${(progress / achievement.requirement) * 100}%`,
                    backgroundColor: rarityColor,
                    transition: 'width 0.3s',
                  }}
                />
              </Box>
              <Typography variant="caption" sx={{ fontSize: '0.65rem', opacity: 0.7, mt: 0.5 }}>
                {progress}/{achievement.requirement}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Tooltip>
  );
}

interface AchievementListProps {
  userAchievements: string[]; // Array of unlocked achievement IDs
  userStats?: Record<string, number>; // For showing progress
  filter?: 'all' | 'unlocked' | 'locked' | Achievement['category'];
}

export function AchievementList({
  userAchievements,
  userStats = {},
  filter = 'all',
}: AchievementListProps) {
  const filteredAchievements = ACHIEVEMENTS.filter((achievement) => {
    const isUnlocked = userAchievements.includes(achievement.id);
    
    if (filter === 'unlocked') return isUnlocked;
    if (filter === 'locked') return !isUnlocked;
    if (filter !== 'all' && filter !== achievement.category) return false;
    
    return true;
  });

  return (
    <Grid container spacing={2}>
      {filteredAchievements.map((achievement) => {
        const isUnlocked = userAchievements.includes(achievement.id);
        const statKey = achievement.trigger;
        const progress = userStats[statKey] || 0;

        return (
          <Grid item xs={6} sm={4} md={3} lg={2} key={achievement.id}>
            <AchievementBadge
              achievement={achievement}
              unlocked={isUnlocked}
              showProgress={!isUnlocked}
              progress={progress}
            />
          </Grid>
        );
      })}
    </Grid>
  );
}
