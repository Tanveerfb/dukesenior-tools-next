/**
 * Following System Service
 * Handles user following/followers relationships
 */

import { db } from "@/lib/firebase/client";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  runTransaction,
  writeBatch,
} from "firebase/firestore";
import type { Following, FollowCounts } from "@/types/following";
import type { UserDoc } from "@/lib/services/users";
import { getUserByUID } from "./users";
import { createNotification } from "./notifications";
import { awardXP } from "./gamification";
import { XP_REWARDS } from "@/types/gamification";

/**
 * Follow a user
 */
export async function followUser(
  fromUID: string,
  toUID: string
): Promise<void> {
  if (fromUID === toUID) {
    throw new Error("Cannot follow yourself");
  }

  await runTransaction(db, async (tx) => {
    // Create following record
    const followingRef = doc(db, `userFollows/${fromUID}/following`, toUID);
    const followerRef = doc(db, `userFollowers/${toUID}/followers`, fromUID);

    const following: Following = {
      followerUID: fromUID,
      followingUID: toUID,
      followedAt: Date.now(),
    };

    tx.set(followingRef, following);
    tx.set(followerRef, following);
  });

  // Award XP for following (non-blocking)
  try {
    await awardXP(
      fromUID,
      XP_REWARDS.USER_FOLLOWED,
      `Followed a user`,
      "social",
      { followedUID: toUID }
    );
  } catch (err) {
    console.error("Error awarding XP for follow:", err);
  }

  // Send notification to the followed user (non-blocking)
  try {
    const follower = await getUserByUID(fromUID);
    if (follower) {
      await createNotification({
        userId: toUID,
        type: "general",
        title: "New Follower",
        body: `${follower.displayName || follower.username || "Someone"} started following you`,
        link: `/profile/${follower.username || follower.uid}`,
      });
    }
  } catch (err) {
    console.error("Error sending follow notification:", err);
  }
}

/**
 * Unfollow a user
 */
export async function unfollowUser(
  fromUID: string,
  toUID: string
): Promise<void> {
  await runTransaction(db, async (tx) => {
    const followingRef = doc(db, `userFollows/${fromUID}/following`, toUID);
    const followerRef = doc(db, `userFollowers/${toUID}/followers`, fromUID);

    tx.delete(followingRef);
    tx.delete(followerRef);
  });
}

/**
 * Check if user is following another user
 */
export async function isFollowing(
  fromUID: string,
  toUID: string
): Promise<boolean> {
  const followingRef = doc(db, `userFollows/${fromUID}/following`, toUID);
  const snap = await getDoc(followingRef);
  return snap.exists();
}

/**
 * Get list of users that this user is following
 */
export async function getFollowing(uid: string): Promise<UserDoc[]> {
  const followingCol = collection(db, `userFollows/${uid}/following`);
  const q = query(followingCol, orderBy("followedAt", "desc"));
  const snap = await getDocs(q);

  const followingUIDs: string[] = [];
  snap.forEach((doc) => {
    const data = doc.data() as Following;
    followingUIDs.push(data.followingUID);
  });

  // Fetch user data for each followed user
  const users = await Promise.all(
    followingUIDs.map(async (uid) => await getUserByUID(uid))
  );

  // Filter out null values
  return users.filter((u) => u !== null) as UserDoc[];
}

/**
 * Get list of followers for this user
 */
export async function getFollowers(uid: string): Promise<UserDoc[]> {
  const followersCol = collection(db, `userFollowers/${uid}/followers`);
  const q = query(followersCol, orderBy("followedAt", "desc"));
  const snap = await getDocs(q);

  const followerUIDs: string[] = [];
  snap.forEach((doc) => {
    const data = doc.data() as Following;
    followerUIDs.push(data.followerUID);
  });

  // Fetch user data for each follower
  const users = await Promise.all(
    followerUIDs.map(async (uid) => await getUserByUID(uid))
  );

  // Filter out null values
  return users.filter((u) => u !== null) as UserDoc[];
}

/**
 * Get follow counts for a user
 */
export async function getFollowCounts(uid: string): Promise<FollowCounts> {
  const [followingSnap, followersSnap] = await Promise.all([
    getDocs(collection(db, `userFollows/${uid}/following`)),
    getDocs(collection(db, `userFollowers/${uid}/followers`)),
  ]);

  return {
    following: followingSnap.size,
    followers: followersSnap.size,
  };
}

/**
 * Get UIDs of users this user is following (lightweight)
 */
export async function getFollowingUIDs(uid: string): Promise<string[]> {
  const followingCol = collection(db, `userFollows/${uid}/following`);
  const snap = await getDocs(followingCol);

  const uids: string[] = [];
  snap.forEach((doc) => {
    const data = doc.data() as Following;
    uids.push(data.followingUID);
  });

  return uids;
}

/**
 * Get UIDs of followers (lightweight)
 */
export async function getFollowerUIDs(uid: string): Promise<string[]> {
  const followersCol = collection(db, `userFollowers/${uid}/followers`);
  const snap = await getDocs(followersCol);

  const uids: string[] = [];
  snap.forEach((doc) => {
    const data = doc.data() as Following;
    uids.push(data.followerUID);
  });

  return uids;
}
