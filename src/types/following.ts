/**
 * Following System Types
 */

export interface Following {
  followerUID: string;
  followingUID: string;
  followedAt: number;
}

export interface FollowCounts {
  following: number;
  followers: number;
}
