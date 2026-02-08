"use client";

import { Box, LinearProgress, Typography, Tooltip } from '@mui/material';
import { getLevelTitle } from '@/types/gamification';

interface XPProgressBarProps {
  currentXP: number;
  xpInLevel: number;
  xpForNextLevel: number;
  currentLevel: number;
  variant?: 'default' | 'compact';
  showLabel?: boolean;
}

export function XPProgressBar({
  currentXP,
  xpInLevel,
  xpForNextLevel,
  currentLevel,
  variant = 'default',
  showLabel = true,
}: XPProgressBarProps) {
  const percentage = xpForNextLevel > 0 ? (xpInLevel / xpForNextLevel) * 100 : 100;
  const isMaxLevel = currentLevel >= 100;

  if (variant === 'compact') {
    return (
      <Tooltip 
        title={isMaxLevel ? 'Max Level Reached!' : `${xpInLevel.toLocaleString()} / ${xpForNextLevel.toLocaleString()} XP`}
        arrow
      >
        <Box sx={{ width: '100%' }}>
          <LinearProgress
            variant="determinate"
            value={isMaxLevel ? 100 : percentage}
            sx={{
              height: 8,
              borderRadius: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: isMaxLevel ? '#FFD700' : '#4CAF50',
                borderRadius: 1,
              },
            }}
          />
        </Box>
      </Tooltip>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {showLabel && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            {isMaxLevel ? 'Max Level' : `Level ${currentLevel} - ${getLevelTitle(currentLevel)}`}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isMaxLevel 
              ? `${currentXP.toLocaleString()} Total XP`
              : `${xpInLevel.toLocaleString()} / ${xpForNextLevel.toLocaleString()} XP`
            }
          </Typography>
        </Box>
      )}
      <LinearProgress
        variant="determinate"
        value={isMaxLevel ? 100 : percentage}
        sx={{
          height: 12,
          borderRadius: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          '& .MuiLinearProgress-bar': {
            backgroundColor: isMaxLevel ? '#FFD700' : '#4CAF50',
            borderRadius: 2,
            background: isMaxLevel 
              ? 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%)'
              : 'linear-gradient(90deg, #4CAF50 0%, #81C784 100%)',
          },
        }}
      />
      {!showLabel && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {isMaxLevel ? 'Maximum level reached!' : `${percentage.toFixed(1)}% to level ${currentLevel + 1}`}
        </Typography>
      )}
    </Box>
  );
}
