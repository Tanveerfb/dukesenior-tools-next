/**
 * Gamification System Types
 * XP, Levels, Achievements, and Leaderboards
 */

// ============================================================================
// XP & Levels
// ============================================================================

export interface UserGamification {
  uid: string;
  totalXP: number;
  currentLevel: number;
  xpInCurrentLevel: number; // XP progress within current level
  xpForNextLevel: number; // XP needed to reach next level
  
  // Achievements
  achievementsUnlocked: string[]; // Array of achievement IDs
  achievementCount: number; // Count for efficient querying
  achievementProgress: Record<string, number>; // Progress tracking for multi-step achievements
  
  // Stats tracking
  stats: {
    postsCreated: number;
    postsPublished: number; // Posts approved by admin
    postsDrafted: number; // Draft posts saved
    commentsPosted: number;
    messagesSent: number;
    friendsAdded: number;
    usersFollowed: number; // Users this person follows
    tournamentsParticipated: number;
    tournamentsWon: number;
    loginStreak: number;
    lastLoginDate?: string; // ISO date string for streak tracking
    totalLogins: number;
  };
  
  // Metadata
  createdAt: number;
  updatedAt: number;
  lastXPEarned?: number; // Timestamp of last XP gain
}

export interface LevelConfig {
  level: number;
  xpRequired: number; // Total XP required to reach this level
  title: string; // e.g., "Novice", "Expert", "Master"
  rewards?: {
    badge?: string;
    title?: string;
    unlocks?: string[]; // Features unlocked at this level
  };
}

export interface XPEvent {
  uid: string;
  amount: number;
  reason: string;
  category: XPCategory;
  metadata?: Record<string, any>;
  timestamp: number;
}

export type XPCategory = 
  | 'post'
  | 'comment'
  | 'message'
  | 'friend'
  | 'tournament'
  | 'achievement'
  | 'login'
  | 'manual'; // For admin awards

// ============================================================================
// Achievements
// ============================================================================

export type AchievementCategory = 
  | 'social'
  | 'content'
  | 'tournament'
  | 'milestone';

export type AchievementTrigger =
  | 'posts_created'
  | 'comments_posted'
  | 'messages_sent'
  | 'friends_added'
  | 'tournaments_participated'
  | 'tournaments_won'
  | 'login_streak'
  | 'total_logins'
  | 'level_reached'
  | 'xp_earned'
  | 'manual'; // For manually awarded achievements

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  icon?: string; // Emoji or icon name
  color?: string; // Badge color
  
  // Unlock criteria
  trigger: AchievementTrigger;
  requirement: number; // e.g., 10 posts, 50 friends, level 25
  
  // Rewards
  xpReward: number;
  
  // Metadata
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  isHidden?: boolean; // Hidden until unlocked
  isSecret?: boolean; // Criteria hidden
  order: number; // Display order
}

export interface UserAchievement {
  achievementId: string;
  uid: string;
  unlockedAt: number;
  notified?: boolean; // Whether user has been notified
}

// ============================================================================
// Leaderboards
// ============================================================================

export interface LeaderboardEntry {
  uid: string;
  displayName?: string;
  photoURL?: string;
  username?: string;
  
  // Rank data
  rank: number;
  totalXP: number;
  currentLevel: number;
  
  // Additional stats
  achievementCount: number;
  
  // Metadata
  lastActive?: number;
}

export type LeaderboardPeriod = 'all-time' | 'monthly' | 'weekly';
export type LeaderboardSort = 'xp' | 'level' | 'achievements';

export interface LeaderboardFilter {
  period: LeaderboardPeriod;
  sort: LeaderboardSort;
  limit?: number;
}

// ============================================================================
// Level Progression Configuration
// ============================================================================

/**
 * Calculate XP required for a specific level
 * Formula: XP = baseXP * (level ^ exponent) + (level * linear)
 * This creates a smooth exponential curve
 */
export function calculateXPForLevel(level: number): number {
  if (level <= 1) return 0;
  
  const baseXP = 100;
  const exponent = 1.5;
  const linear = 50;
  
  return Math.floor(baseXP * Math.pow(level, exponent) + (level * linear));
}

/**
 * Calculate total XP required to reach a level
 */
export function calculateTotalXPForLevel(level: number): number {
  let totalXP = 0;
  for (let i = 2; i <= level; i++) {
    totalXP += calculateXPForLevel(i);
  }
  return totalXP;
}

/**
 * Calculate level from total XP
 */
export function calculateLevelFromXP(totalXP: number): {
  level: number;
  xpInLevel: number;
  xpForNextLevel: number;
} {
  let level = 1;
  let xpSoFar = 0;
  
  while (level < 100) {
    const xpForNext = calculateXPForLevel(level + 1);
    if (xpSoFar + xpForNext > totalXP) {
      break;
    }
    xpSoFar += xpForNext;
    level++;
  }
  
  const xpInLevel = totalXP - xpSoFar;
  const xpForNextLevel = level < 100 ? calculateXPForLevel(level + 1) : 0;
  
  return { level, xpInLevel, xpForNextLevel };
}

/**
 * Get level title based on level number
 */
export function getLevelTitle(level: number): string {
  if (level >= 90) return 'Legendary';
  if (level >= 75) return 'Master';
  if (level >= 60) return 'Expert';
  if (level >= 45) return 'Veteran';
  if (level >= 30) return 'Skilled';
  if (level >= 20) return 'Proficient';
  if (level >= 10) return 'Intermediate';
  if (level >= 5) return 'Apprentice';
  return 'Novice';
}

// ============================================================================
// XP Rewards Configuration
// ============================================================================

export const XP_REWARDS = {
  // Content creation
  POST_CREATED: 50,
  POST_DRAFT_SAVED: 5,
  POST_SUBMITTED_FOR_REVIEW: 25,
  POST_APPROVED_BONUS: 100, // on top of POST_CREATED (50)
  COMMENT_POSTED: 10,
  POST_LIKED: 2,
  COMMENT_LIKED: 1,
  
  // Enhanced reactions
  REACTION_LOVE_RECEIVED: 5,
  REACTION_INSIGHTFUL_RECEIVED: 10,
  REACTION_FIRE_RECEIVED: 2,
  REACTION_LAUGH_RECEIVED: 2,
  REACTION_LIKE_RECEIVED: 2,
  
  // Social
  FRIEND_ADDED: 25,
  USER_FOLLOWED: 10,
  MESSAGE_SENT: 5,
  PROFILE_UPDATED: 15,
  
  // Tournaments
  TOURNAMENT_PARTICIPATED: 100,
  TOURNAMENT_WON: 500,
  TOURNAMENT_MATCH_WON: 50,
  
  // Engagement
  DAILY_LOGIN: 20,
  LOGIN_STREAK_BONUS: 10, // Per day of streak
  
  // Milestones (bonus XP)
  FIRST_POST: 100,
  FIRST_FRIEND: 50,
  FIRST_TOURNAMENT: 150,
} as const;
