/**
 * Personalized Feed Service
 * Generates and manages user content feeds
 */

import { db } from "@/lib/firebase/client";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import type { CMSPost } from "@/types/cms";
import { getFollowingUIDs } from "./following";
import { getFriends } from "./friends";

export interface FeedPost extends CMSPost {
  score: number;
  reason: string; // "From friend", "From followed user", "Trending"
}

export type FeedMode = "algorithmic" | "chronological";

/**
 * Get personalized feed for a user
 */
export async function getPersonalizedFeed(
  uid: string,
  mode: FeedMode = "algorithmic",
  limitCount: number = 20
): Promise<FeedPost[]> {
  // Get user's social connections
  const [friends, followingUIDs] = await Promise.all([
    getFriends(uid).catch(() => []),
    getFollowingUIDs(uid).catch(() => []),
  ]);

  const friendUIDSet = new Set(friends.map((f) => f.uid));
  const followingUIDSet = new Set(followingUIDs);

  // Combine all UIDs we want to see posts from
  const relevantUIDs = Array.from(
    new Set([...friendUIDSet, ...followingUIDSet, uid])
  );

  if (relevantUIDs.length === 0) {
    // If user has no connections, show recent public posts
    return getPublicFeed(limitCount);
  }

  // Query posts from relevant users
  const postsCol = collection(db, "cms_posts_v1");
  const q = query(
    postsCol,
    where("status", "==", "published"),
    where("authorUID", "in", relevantUIDs.slice(0, 10)), // Firestore 'in' limit is 10
    orderBy("createdAt", "desc"),
    limit(limitCount * 3) // Get more than needed for filtering
  );

  const snap = await getDocs(q);
  const posts: CMSPost[] = [];
  snap.forEach((doc) => posts.push(doc.data() as CMSPost));

  if (mode === "chronological") {
    // Simple chronological sorting
    return posts
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limitCount)
      .map((post) => ({
        ...post,
        score: 0,
        reason: getPostReason(post.authorUID, friendUIDSet, followingUIDSet),
      }));
  }

  // Algorithmic mode: calculate scores and sort
  const scoredPosts = posts.map((post) => {
    const score = calculateScore(post, uid, friendUIDSet, followingUIDSet);
    const reason = getPostReason(post.authorUID, friendUIDSet, followingUIDSet);
    return {
      ...post,
      score,
      reason,
    } as FeedPost;
  });

  return scoredPosts.sort((a, b) => b.score - a.score).slice(0, limitCount);
}

/**
 * Get public feed (for users with no connections)
 */
async function getPublicFeed(limitCount: number = 20): Promise<FeedPost[]> {
  const postsCol = collection(db, "cms_posts_v1");
  const q = query(
    postsCol,
    where("status", "==", "published"),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );

  const snap = await getDocs(q);
  const posts: CMSPost[] = [];
  snap.forEach((doc) => posts.push(doc.data() as CMSPost));

  return posts.map((post) => ({
    ...post,
    score: 0,
    reason: "Trending",
  }));
}

/**
 * Calculate feed score for a post
 */
function calculateScore(
  post: CMSPost,
  userUID: string,
  friends: Set<string>,
  following: Set<string>
): number {
  const now = Date.now();
  const ageInHours = (now - post.createdAt) / (1000 * 60 * 60);

  // Engagement score: likes + comments * 3
  const engagement =
    (post.likeCount || 0) +
    (post.commentCount || 0) * 3 +
    ((post.reactionCounts?.love || 0) +
      (post.reactionCounts?.insightful || 0) +
      (post.reactionCounts?.fire || 0) +
      (post.reactionCounts?.laugh || 0)) *
      2;

  // Base score: engagement divided by age (with minimum age to avoid division by zero)
  let score = engagement / Math.max(ageInHours, 0.1);

  // Boost posts from friends (highest priority)
  if (friends.has(post.authorUID)) {
    score += 100;
  }

  // Boost posts from followed users
  if (following.has(post.authorUID)) {
    score += 50;
  }

  // Boost recent posts (within last 24 hours)
  if (ageInHours < 24) {
    score *= 1.5;
  }

  // Boost posts with high engagement
  if (engagement > 50) {
    score *= 1.3;
  }

  // Slight penalty for very old posts (older than 7 days)
  if (ageInHours > 168) {
    score *= 0.5;
  }

  return score;
}

/**
 * Get reason string for why this post is in the feed
 */
function getPostReason(
  authorUID: string,
  friends: Set<string>,
  following: Set<string>
): string {
  if (friends.has(authorUID)) {
    return "From friend";
  }
  if (following.has(authorUID)) {
    return "From followed user";
  }
  return "Trending";
}

/**
 * Get trending posts (high engagement recently)
 */
export async function getTrendingPosts(
  limitCount: number = 10
): Promise<CMSPost[]> {
  const postsCol = collection(db, "cms_posts_v1");

  // Get recent posts (last 7 days)
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const q = query(
    postsCol,
    where("status", "==", "published"),
    where("createdAt", ">=", sevenDaysAgo),
    orderBy("createdAt", "desc"),
    limit(100) // Get more to sort by engagement
  );

  const snap = await getDocs(q);
  const posts: CMSPost[] = [];
  snap.forEach((doc) => posts.push(doc.data() as CMSPost));

  // Sort by engagement score
  return posts
    .sort((a, b) => {
      const engagementA = (a.likeCount || 0) + (a.commentCount || 0) * 3;
      const engagementB = (b.likeCount || 0) + (b.commentCount || 0) * 3;
      return engagementB - engagementA;
    })
    .slice(0, limitCount);
}
