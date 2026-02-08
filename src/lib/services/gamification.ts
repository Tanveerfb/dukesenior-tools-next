/**
 * Gamification Service
 * Handles XP, levels, achievements, and user gamification data
 */

import { db } from '@/lib/firebase/client';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  runTransaction,
  increment,
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import type {
  UserGamification,
  XPEvent,
  XPCategory,
  LeaderboardEntry,
  LeaderboardFilter,
  UserAchievement,
} from '@/types/gamification';
import {
  calculateLevelFromXP,
  getLevelTitle,
  XP_REWARDS,
} from '@/types/gamification';
import { ACHIEVEMENTS, checkAchievementEligibility } from '@/data/achievements';
import { getUserByUID } from './users';

// Collection names
const GAMIFICATION_COL = 'userGamification';
const XP_EVENTS_COL = 'xpEvents';
const ACHIEVEMENTS_COL = 'userAchievements';

/**
 * Initialize gamification data for a new user
 */
export async function initializeUserGamification(uid: string): Promise<UserGamification> {
  const now = Date.now();
  const data: UserGamification = {
    uid,
    totalXP: 0,
    currentLevel: 1,
    xpInCurrentLevel: 0,
    xpForNextLevel: 100,
    achievementsUnlocked: [],
    achievementProgress: {},
    stats: {
      postsCreated: 0,
      commentsPosted: 0,
      messagesSent: 0,
      friendsAdded: 0,
      tournamentsParticipated: 0,
      tournamentsWon: 0,
      loginStreak: 0,
      totalLogins: 0,
    },
    createdAt: now,
    updatedAt: now,
  };

  const ref = doc(db, GAMIFICATION_COL, uid);
  await setDoc(ref, data);
  return data;
}

/**
 * Get user gamification data
 */
export async function getUserGamification(uid: string): Promise<UserGamification | null> {
  try {
    // Try server-side first
    if (typeof window === 'undefined') {
      try {
        const { adminDb } = await import('@/lib/firebase/admin');
        if (adminDb) {
          const snap = await adminDb.collection(GAMIFICATION_COL).doc(uid).get();
          if (snap.exists) {
            return snap.data() as UserGamification;
          }
        }
      } catch {}
    }

    // Client-side fallback
    const ref = doc(db, GAMIFICATION_COL, uid);
    const snap = await getDoc(ref);
    
    if (!snap.exists()) {
      return null;
    }
    
    return snap.data() as UserGamification;
  } catch (error) {
    console.error('Error getting user gamification:', error);
    return null;
  }
}

/**
 * Award XP to a user and handle level ups
 */
export async function awardXP(
  uid: string,
  amount: number,
  reason: string,
  category: XPCategory,
  metadata?: Record<string, any>
): Promise<{
  newXP: number;
  leveledUp: boolean;
  newLevel?: number;
  achievementsUnlocked?: string[];
}> {
  if (amount <= 0) {
    throw new Error('XP amount must be positive');
  }

  const ref = doc(db, GAMIFICATION_COL, uid);
  
  return await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(ref);
    
    let data: UserGamification;
    if (!snap.exists()) {
      // Initialize if doesn't exist
      data = {
        uid,
        totalXP: 0,
        currentLevel: 1,
        xpInCurrentLevel: 0,
        xpForNextLevel: 100,
        achievementsUnlocked: [],
        achievementProgress: {},
        stats: {
          postsCreated: 0,
          commentsPosted: 0,
          messagesSent: 0,
          friendsAdded: 0,
          tournamentsParticipated: 0,
          tournamentsWon: 0,
          loginStreak: 0,
          totalLogins: 0,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    } else {
      data = snap.data() as UserGamification;
    }

    // Calculate new XP and level
    const oldLevel = data.currentLevel;
    const newTotalXP = data.totalXP + amount;
    const levelData = calculateLevelFromXP(newTotalXP);
    
    const leveledUp = levelData.level > oldLevel;
    
    // Update data
    data.totalXP = newTotalXP;
    data.currentLevel = levelData.level;
    data.xpInCurrentLevel = levelData.xpInLevel;
    data.xpForNextLevel = levelData.xpForNextLevel;
    data.updatedAt = Date.now();
    data.lastXPEarned = Date.now();

    // Check for new achievements
    const statMapping: Record<string, keyof UserGamification['stats']> = {
      posts_created: 'postsCreated',
      comments_posted: 'commentsPosted',
      messages_sent: 'messagesSent',
      friends_added: 'friendsAdded',
      tournaments_participated: 'tournamentsParticipated',
      tournaments_won: 'tournamentsWon',
      login_streak: 'loginStreak',
      total_logins: 'totalLogins',
      level_reached: 'postsCreated', // Dummy mapping, we check level separately
      xp_earned: 'postsCreated', // Dummy mapping, we check XP separately
    };

    const stats = {
      ...data.stats,
      level_reached: data.currentLevel,
      xp_earned: data.totalXP,
    };

    const newAchievements = checkAchievementEligibility(stats, data.achievementsUnlocked);
    
    // Award achievements
    for (const achievement of newAchievements) {
      data.achievementsUnlocked.push(achievement.id);
      
      // Record achievement unlock
      const achievementRef = doc(collection(db, ACHIEVEMENTS_COL));
      const achievementData: UserAchievement = {
        achievementId: achievement.id,
        uid,
        unlockedAt: Date.now(),
        notified: false,
      };
      transaction.set(achievementRef, achievementData);
      
      // Award achievement XP (recursive but controlled)
      if (achievement.xpReward > 0) {
        data.totalXP += achievement.xpReward;
        const updatedLevelData = calculateLevelFromXP(data.totalXP);
        data.currentLevel = updatedLevelData.level;
        data.xpInCurrentLevel = updatedLevelData.xpInLevel;
        data.xpForNextLevel = updatedLevelData.xpForNextLevel;
      }
    }

    // Save updated gamification data
    transaction.set(ref, data);

    // Log XP event
    const eventRef = doc(collection(db, XP_EVENTS_COL));
    const eventData: XPEvent = {
      uid,
      amount,
      reason,
      category,
      metadata,
      timestamp: Date.now(),
    };
    transaction.set(eventRef, eventData);

    return {
      newXP: data.totalXP,
      leveledUp,
      newLevel: leveledUp ? data.currentLevel : undefined,
      achievementsUnlocked: newAchievements.length > 0 
        ? newAchievements.map(a => a.id)
        : undefined,
    };
  });
}

/**
 * Increment a stat counter and check for achievements
 */
export async function incrementStat(
  uid: string,
  statName: keyof UserGamification['stats'],
  amount: number = 1
): Promise<void> {
  const ref = doc(db, GAMIFICATION_COL, uid);
  
  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(ref);
    
    if (!snap.exists()) {
      // Initialize if doesn't exist
      await initializeUserGamification(uid);
      return;
    }
    
    const data = snap.data() as UserGamification;
    data.stats[statName] = (data.stats[statName] || 0) + amount;
    data.updatedAt = Date.now();
    
    // Check for achievements
    const stats = {
      ...data.stats,
      level_reached: data.currentLevel,
      xp_earned: data.totalXP,
    };
    
    const newAchievements = checkAchievementEligibility(stats, data.achievementsUnlocked);
    
    // Award achievements
    for (const achievement of newAchievements) {
      data.achievementsUnlocked.push(achievement.id);
      
      // Record achievement unlock
      const achievementRef = doc(collection(db, ACHIEVEMENTS_COL));
      const achievementData: UserAchievement = {
        achievementId: achievement.id,
        uid,
        unlockedAt: Date.now(),
        notified: false,
      };
      transaction.set(achievementRef, achievementData);
      
      // Award achievement XP
      if (achievement.xpReward > 0) {
        data.totalXP += achievement.xpReward;
        const updatedLevelData = calculateLevelFromXP(data.totalXP);
        data.currentLevel = updatedLevelData.level;
        data.xpInCurrentLevel = updatedLevelData.xpInLevel;
        data.xpForNextLevel = updatedLevelData.xpForNextLevel;
      }
    }
    
    transaction.set(ref, data);
  });
}

/**
 * Update login streak
 */
export async function updateLoginStreak(uid: string): Promise<{
  streak: number;
  isNewDay: boolean;
  xpAwarded: number;
}> {
  const ref = doc(db, GAMIFICATION_COL, uid);
  
  return await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(ref);
    
    if (!snap.exists()) {
      await initializeUserGamification(uid);
      return { streak: 1, isNewDay: true, xpAwarded: 0 };
    }
    
    const data = snap.data() as UserGamification;
    const today = new Date().toISOString().split('T')[0];
    const lastLogin = data.stats.lastLoginDate;
    
    let isNewDay = false;
    let xpAwarded = 0;
    
    if (!lastLogin || lastLogin !== today) {
      isNewDay = true;
      
      // Check if streak continues
      if (lastLogin) {
        const lastDate = new Date(lastLogin);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          // Continue streak
          data.stats.loginStreak += 1;
        } else if (diffDays > 1) {
          // Streak broken
          data.stats.loginStreak = 1;
        }
      } else {
        // First login
        data.stats.loginStreak = 1;
      }
      
      data.stats.lastLoginDate = today;
      data.stats.totalLogins += 1;
      data.updatedAt = Date.now();
      
      // Award daily login XP
      xpAwarded = XP_REWARDS.DAILY_LOGIN + (data.stats.loginStreak * XP_REWARDS.LOGIN_STREAK_BONUS);
      data.totalXP += xpAwarded;
      
      const levelData = calculateLevelFromXP(data.totalXP);
      data.currentLevel = levelData.level;
      data.xpInCurrentLevel = levelData.xpInLevel;
      data.xpForNextLevel = levelData.xpForNextLevel;
      
      // Log XP event
      const eventRef = doc(collection(db, XP_EVENTS_COL));
      const eventData: XPEvent = {
        uid,
        amount: xpAwarded,
        reason: `Daily login (${data.stats.loginStreak} day streak)`,
        category: 'login',
        timestamp: Date.now(),
      };
      transaction.set(eventRef, eventData);
      
      transaction.set(ref, data);
    }
    
    return {
      streak: data.stats.loginStreak,
      isNewDay,
      xpAwarded,
    };
  });
}

/**
 * Get user achievements
 */
export async function getUserAchievements(uid: string): Promise<UserAchievement[]> {
  try {
    const q = query(
      collection(db, ACHIEVEMENTS_COL),
      where('uid', '==', uid),
      orderBy('unlockedAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as UserAchievement);
  } catch (error) {
    console.error('Error getting user achievements:', error);
    return [];
  }
}

/**
 * Manually award an achievement (admin only)
 */
export async function awardAchievement(
  uid: string,
  achievementId: string,
  awardedBy: string
): Promise<boolean> {
  const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
  if (!achievement) {
    throw new Error('Achievement not found');
  }

  const ref = doc(db, GAMIFICATION_COL, uid);
  
  return await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(ref);
    
    if (!snap.exists()) {
      await initializeUserGamification(uid);
      return false;
    }
    
    const data = snap.data() as UserGamification;
    
    // Check if already unlocked
    if (data.achievementsUnlocked.includes(achievementId)) {
      return false;
    }
    
    // Award achievement
    data.achievementsUnlocked.push(achievementId);
    data.updatedAt = Date.now();
    
    // Award XP
    if (achievement.xpReward > 0) {
      data.totalXP += achievement.xpReward;
      const levelData = calculateLevelFromXP(data.totalXP);
      data.currentLevel = levelData.level;
      data.xpInCurrentLevel = levelData.xpInLevel;
      data.xpForNextLevel = levelData.xpForNextLevel;
    }
    
    transaction.set(ref, data);
    
    // Record achievement unlock
    const achievementRef = doc(collection(db, ACHIEVEMENTS_COL));
    const achievementData: UserAchievement = {
      achievementId,
      uid,
      unlockedAt: Date.now(),
      notified: false,
    };
    transaction.set(achievementRef, achievementData);
    
    // Log XP event
    const eventRef = doc(collection(db, XP_EVENTS_COL));
    const eventData: XPEvent = {
      uid,
      amount: achievement.xpReward,
      reason: `Achievement unlocked: ${achievement.name}`,
      category: 'achievement',
      metadata: { achievementId, awardedBy, manual: true },
      timestamp: Date.now(),
    };
    transaction.set(eventRef, eventData);
    
    return true;
  });
}

/**
 * Get leaderboard
 */
export async function getLeaderboard(
  filter: LeaderboardFilter
): Promise<LeaderboardEntry[]> {
  try {
    let q = query(collection(db, GAMIFICATION_COL));
    
    // Apply sorting
    switch (filter.sort) {
      case 'xp':
        q = query(q, orderBy('totalXP', 'desc'));
        break;
      case 'level':
        q = query(q, orderBy('currentLevel', 'desc'), orderBy('totalXP', 'desc'));
        break;
      case 'achievements':
        q = query(q, orderBy('achievementsUnlocked', 'desc'));
        break;
    }
    
    // Apply limit
    if (filter.limit) {
      q = query(q, limit(filter.limit));
    } else {
      q = query(q, limit(100));
    }
    
    const snapshot = await getDocs(q);
    const entries: LeaderboardEntry[] = [];
    
    for (let i = 0; i < snapshot.docs.length; i++) {
      const doc = snapshot.docs[i];
      const data = doc.data() as UserGamification;
      
      // Fetch user profile data
      const user = await getUserByUID(data.uid);
      
      entries.push({
        uid: data.uid,
        displayName: user?.displayName,
        photoURL: user?.photoURL,
        username: user?.username,
        rank: i + 1,
        totalXP: data.totalXP,
        currentLevel: data.currentLevel,
        achievementCount: data.achievementsUnlocked.length,
        lastActive: data.updatedAt,
      });
    }
    
    return entries;
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return [];
  }
}

/**
 * Get user's rank
 */
export async function getUserRank(uid: string): Promise<number> {
  try {
    const userGamification = await getUserGamification(uid);
    if (!userGamification) return 0;
    
    // Count users with more XP
    const q = query(
      collection(db, GAMIFICATION_COL),
      where('totalXP', '>', userGamification.totalXP)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.size + 1;
  } catch (error) {
    console.error('Error getting user rank:', error);
    return 0;
  }
}

/**
 * Get recent XP events for a user
 */
export async function getRecentXPEvents(
  uid: string,
  limitCount: number = 20
): Promise<XPEvent[]> {
  try {
    const q = query(
      collection(db, XP_EVENTS_COL),
      where('uid', '==', uid),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as XPEvent);
  } catch (error) {
    console.error('Error getting recent XP events:', error);
    return [];
  }
}
