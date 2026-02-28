"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiAward } from "react-icons/fi";
import confetti from "canvas-confetti";
import { getLevelTitle } from "@/types/gamification";

interface LevelUpAnimationProps {
  newLevel: number;
  onComplete?: () => void;
  duration?: number;
}

export function LevelUpAnimation({
  newLevel,
  onComplete,
  duration = 3000,
}: LevelUpAnimationProps) {
  useEffect(() => {
    const confettiConfig = {
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: [
        "#FFD700",
        "#FFA500",
        "#FF6B6B",
        "#4CAF50",
        "#2196F3",
        "#9C27B0",
      ],
    };

    const fireConfetti = () => {
      confetti(confettiConfig);
      confetti({ ...confettiConfig, origin: { x: 0.3, y: 0.6 } });
      confetti({ ...confettiConfig, origin: { x: 0.7, y: 0.6 } });
    };

    fireConfetti();
    const interval = setInterval(fireConfetti, 500);

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 pointer-events-none"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: [1, 1.05, 1], opacity: 1 }}
        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        className="max-w-md rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-700 p-12 text-center text-white shadow-2xl"
      >
        <FiAward
          className="mx-auto mb-4 h-20 w-20 animate-spin"
          style={{ animationDuration: "2s" }}
        />
        <h2 className="mb-3 text-4xl font-bold">LEVEL UP!</h2>
        <p className="mb-2 text-5xl font-bold">Level {newLevel}</p>
        <p className="text-xl opacity-90">{getLevelTitle(newLevel)}</p>
      </motion.div>
    </motion.div>
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
    LevelUpComponent: (
      <AnimatePresence>
        {showAnimation && (
          <LevelUpAnimation
            newLevel={levelToShow}
            onComplete={handleComplete}
          />
        )}
      </AnimatePresence>
    ),
  };
}
