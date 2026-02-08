"use client";

import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Fade } from '@mui/material';
import { Celebration } from '@mui/icons-material';
import confetti from 'canvas-confetti';
import { getLevelTitle } from '@/types/gamification';

interface LevelUpAnimationProps {
  newLevel: number;
  onComplete?: () => void;
  duration?: number; // in milliseconds
}

export function LevelUpAnimation({
  newLevel,
  onComplete,
  duration = 3000,
}: LevelUpAnimationProps) {
  useEffect(() => {
    // Trigger confetti
    const confettiConfig = {
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FFA500', '#FF6B6B', '#4CAF50', '#2196F3', '#9C27B0'],
    };

    // Fire confetti multiple times
    const fireConfetti = () => {
      confetti(confettiConfig);
      confetti({
        ...confettiConfig,
        origin: { x: 0.3, y: 0.6 },
      });
      confetti({
        ...confettiConfig,
        origin: { x: 0.7, y: 0.6 },
      });
    };

    fireConfetti();
    const interval = setInterval(fireConfetti, 500);

    // Cleanup and callback
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (onComplete) onComplete();
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [newLevel, onComplete, duration]);

  return (
    <Fade in timeout={500}>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          zIndex: 9999,
          pointerEvents: 'none',
        }}
      >
        <Paper
          elevation={24}
          sx={{
            p: 6,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 4,
            maxWidth: 500,
            animation: 'pulse 1s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': {
                transform: 'scale(1)',
              },
              '50%': {
                transform: 'scale(1.05)',
              },
            },
          }}
        >
          <Celebration
            sx={{
              fontSize: 80,
              mb: 2,
              animation: 'rotate 2s linear infinite',
              '@keyframes rotate': {
                '0%': {
                  transform: 'rotate(0deg)',
                },
                '100%': {
                  transform: 'rotate(360deg)',
                },
              },
            }}
          />
          <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
            LEVEL UP!
          </Typography>
          <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Level {newLevel}
          </Typography>
          <Typography variant="h5" sx={{ opacity: 0.9 }}>
            {getLevelTitle(newLevel)}
          </Typography>
        </Paper>
      </Box>
    </Fade>
  );
}

/**
 * Hook to manage level up animations
 */
export function useLevelUpAnimation() {
  const [showAnimation, setShowAnimation] = useState(false);
  const [levelToShow, setLevelToShow] = useState(0);

  const triggerLevelUp = (newLevel: number) => {
    setLevelToShow(newLevel);
    setShowAnimation(true);
  };

  const handleComplete = () => {
    setShowAnimation(false);
  };

  return {
    showAnimation,
    levelToShow,
    triggerLevelUp,
    handleComplete,
    LevelUpComponent: showAnimation ? (
      <LevelUpAnimation newLevel={levelToShow} onComplete={handleComplete} />
    ) : null,
  };
}
