/**
 * Friends & Social Features Service
 * Handles friend requests, friendships, blocking, and mutual friends
 */

import { db } from '@/lib/firebase/client';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  runTransaction,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import type { FriendRequest, Friend, BlockedUser } from '@/types/friends';
import { getUserByUID } from './users';
import { awardXP, incrementStat, getUserGamification } from './gamification';
import { XP_REWARDS } from '@/types/gamification';

// Collection names
const FRIEND_REQUESTS_COL = 'friendRequests';
const FRIENDS_COL = 'friends';
const BLOCKED_USERS_COL = 'blockedUsers';

/**
 * Generate a consistent friendship ID from two UIDs
 * Always stores UIDs in alphabetical order for consistent querying
 */
function generateFriendshipId(uid1: string, uid2: string): string {
  return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
}

/**
 * Get ordered UIDs for friendship document
 */
function getOrderedUids(uid1: string, uid2: string): [string, string] {
  return uid1 < uid2 ? [uid1, uid2] : [uid2, uid1];
}

/**
 * Send a friend request
 * @returns The request ID
 */
export async function sendFriendRequest(
  fromUID: string,
  fromUsername: string,
  fromDisplayName: string,
  fromPhotoURL: string | undefined,
  toUID: string,
  toUsername: string
): Promise<string> {
  // Validation: Can't friend yourself
  if (fromUID === toUID) {
    throw new Error("You can't send a friend request to yourself");
  }

  // Check if already friends
  const alreadyFriends = await areFriends(fromUID, toUID);
  if (alreadyFriends) {
    throw new Error("You are already friends with this user");
  }

  // Check if target user has blocked sender
  const blocked = await isBlocked(toUID, fromUID);
  if (blocked) {
    throw new Error("Unable to send friend request");
  }

  // Check for existing pending request (in either direction)
  // Query for requests from this user to target
  const outgoingQuery = query(
    collection(db, FRIEND_REQUESTS_COL),
    where('from', '==', fromUID),
    where('to', '==', toUID),
    where('status', '==', 'pending')
  );
  
  // Query for requests from target to this user
  const incomingQuery = query(
    collection(db, FRIEND_REQUESTS_COL),
    where('from', '==', toUID),
    where('to', '==', fromUID),
    where('status', '==', 'pending')
  );

  const [outgoingSnap, incomingSnap] = await Promise.all([
    getDocs(outgoingQuery),
    getDocs(incomingQuery)
  ]);

  if (!outgoingSnap.empty || !incomingSnap.empty) {
    throw new Error("A friend request already exists between you and this user");
  }

  // Create the friend request
  const requestRef = doc(collection(db, FRIEND_REQUESTS_COL));
  const now = Date.now();

  const request: FriendRequest = {
    id: requestRef.id,
    from: fromUID,
    fromUsername,
    fromDisplayName,
    fromPhotoURL,
    to: toUID,
    toUsername,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(requestRef, request);
  return requestRef.id;
}

/**
 * Accept a friend request
 * Creates friendship and updates request status atomically
 */
export async function acceptFriendRequest(requestId: string): Promise<void> {
  await runTransaction(db, async (transaction) => {
    const requestRef = doc(db, FRIEND_REQUESTS_COL, requestId);
    const requestSnap = await transaction.get(requestRef);

    if (!requestSnap.exists()) {
      throw new Error("Friend request not found");
    }

    const requestData = requestSnap.data() as FriendRequest;

    if (requestData.status !== 'pending') {
      throw new Error("This friend request is no longer pending");
    }

    // Create friendship
    const friendshipId = generateFriendshipId(requestData.from, requestData.to);
    const [uid1, uid2] = getOrderedUids(requestData.from, requestData.to);
    const friendshipRef = doc(db, FRIENDS_COL, friendshipId);
    const now = Date.now();

    transaction.set(friendshipRef, {
      id: friendshipId,
      uid1,
      uid2,
      since: now,
      createdAt: now,
    });

    // Update request status
    transaction.update(requestRef, {
      status: 'accepted',
      updatedAt: now,
    });
  }).then(async () => {
    // Award XP to both users for becoming friends (non-blocking)
    try {
      const requestRef = doc(db, FRIEND_REQUESTS_COL, requestId);
      const requestSnap = await getDoc(requestRef);
      const requestData = requestSnap.data() as FriendRequest;
      
      // Check if this is first friend for either user
      const [gamification1, gamification2] = await Promise.all([
        getUserGamification(requestData.from),
        getUserGamification(requestData.to),
      ]);
      
      const isFirstFriend1 = !gamification1 || gamification1.stats.friendsAdded === 0;
      const isFirstFriend2 = !gamification2 || gamification2.stats.friendsAdded === 0;
      
      // Award XP to both users
      await Promise.all([
        awardXP(requestData.from, XP_REWARDS.FRIEND_ADDED, 'Made a new friend', 'friend', { 
          friendUID: requestData.to 
        }),
        awardXP(requestData.to, XP_REWARDS.FRIEND_ADDED, 'Made a new friend', 'friend', { 
          friendUID: requestData.from 
        }),
        incrementStat(requestData.from, 'friendsAdded', 1),
        incrementStat(requestData.to, 'friendsAdded', 1),
      ]);
      
      // Award first friend bonus
      if (isFirstFriend1) {
        await awardXP(requestData.from, XP_REWARDS.FIRST_FRIEND, 'Made first friend', 'friend', { 
          friendUID: requestData.to,
          milestone: true 
        });
      }
      if (isFirstFriend2) {
        await awardXP(requestData.to, XP_REWARDS.FIRST_FRIEND, 'Made first friend', 'friend', { 
          friendUID: requestData.from,
          milestone: true 
        });
      }
    } catch (err) {
      console.error('Error awarding XP for friendship:', err);
    }
  });
}

/**
 * Decline a friend request
 */
export async function declineFriendRequest(requestId: string): Promise<void> {
  const requestRef = doc(db, FRIEND_REQUESTS_COL, requestId);
  const requestSnap = await getDoc(requestRef);

  if (!requestSnap.exists()) {
    throw new Error("Friend request not found");
  }

  await updateDoc(requestRef, {
    status: 'declined',
    updatedAt: Date.now(),
  });
}

/**
 * Cancel an outgoing pending request
 */
export async function cancelFriendRequest(requestId: string): Promise<void> {
  const requestRef = doc(db, FRIEND_REQUESTS_COL, requestId);
  await deleteDoc(requestRef);
}

/**
 * Get incoming pending friend requests for a user
 */
export async function getIncomingFriendRequests(uid: string): Promise<FriendRequest[]> {
  const q = query(
    collection(db, FRIEND_REQUESTS_COL),
    where('to', '==', uid),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as FriendRequest);
}

/**
 * Get outgoing pending friend requests from a user
 */
export async function getOutgoingFriendRequests(uid: string): Promise<FriendRequest[]> {
  const q = query(
    collection(db, FRIEND_REQUESTS_COL),
    where('from', '==', uid),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as FriendRequest);
}

/**
 * Check if two users are friends
 */
export async function areFriends(uid1: string, uid2: string): Promise<boolean> {
  const friendshipId = generateFriendshipId(uid1, uid2);
  const friendshipRef = doc(db, FRIENDS_COL, friendshipId);
  const friendshipSnap = await getDoc(friendshipRef);
  return friendshipSnap.exists();
}

/**
 * Get all friends for a user with their profile data
 */
export async function getFriends(uid: string): Promise<Friend[]> {
  // Query friendships where user is either uid1 or uid2
  const q1 = query(
    collection(db, FRIENDS_COL),
    where('uid1', '==', uid)
  );
  const q2 = query(
    collection(db, FRIENDS_COL),
    where('uid2', '==', uid)
  );

  const [snapshot1, snapshot2] = await Promise.all([
    getDocs(q1),
    getDocs(q2),
  ]);

  // Extract friend UIDs
  const friendUids: Set<string> = new Set();
  const friendshipData: Map<string, number> = new Map(); // uid -> since timestamp

  snapshot1.docs.forEach(doc => {
    const data = doc.data();
    friendUids.add(data.uid2);
    friendshipData.set(data.uid2, data.since);
  });

  snapshot2.docs.forEach(doc => {
    const data = doc.data();
    friendUids.add(data.uid1);
    friendshipData.set(data.uid1, data.since);
  });

  // Fetch full user profiles for all friends
  const friendProfiles = await Promise.all(
    Array.from(friendUids).map(async (friendUid) => {
      const user = await getUserByUID(friendUid);
      if (!user) return null;

      return {
        uid: user.uid,
        username: user.username || '',
        displayName: user.displayName || user.username || 'Unknown',
        photoURL: user.photoURL,
        bio: user.bio,
        accentColor: user.accentColor,
        roles: user.roles,
        since: friendshipData.get(friendUid) || Date.now(),
      } as Friend;
    })
  );

  return friendProfiles.filter((f): f is Friend => f !== null);
}

/**
 * Remove a friend (unfriend)
 */
export async function removeFriend(uid1: string, uid2: string): Promise<void> {
  const friendshipId = generateFriendshipId(uid1, uid2);
  const friendshipRef = doc(db, FRIENDS_COL, friendshipId);
  await deleteDoc(friendshipRef);
}

/**
 * Get mutual friends between two users
 */
export async function getMutualFriends(uid1: string, uid2: string): Promise<Friend[]> {
  // Get friends of both users
  const [friends1, friends2] = await Promise.all([
    getFriends(uid1),
    getFriends(uid2),
  ]);

  // Find mutual friends
  const friends1Uids = new Set(friends1.map(f => f.uid));
  const mutualFriends = friends2.filter(f => friends1Uids.has(f.uid));

  return mutualFriends;
}

/**
 * Block a user
 * Removes existing friendship and cancels/declines pending requests
 */
export async function blockUser(
  uid: string,
  blockedUID: string,
  blockedUsername: string
): Promise<void> {
  if (uid === blockedUID) {
    throw new Error("You can't block yourself");
  }

  const batch = writeBatch(db);

  // Add to blocked users subcollection
  const blockedRef = doc(db, BLOCKED_USERS_COL, uid, 'blocked', blockedUID);
  batch.set(blockedRef, {
    blockedUID,
    blockedUsername,
    blockedAt: Date.now(),
  });

  // Remove friendship if it exists
  const friendshipId = generateFriendshipId(uid, blockedUID);
  const friendshipRef = doc(db, FRIENDS_COL, friendshipId);
  batch.delete(friendshipRef);

  await batch.commit();

  // Handle pending friend requests separately (need to query first)
  // Query for requests between these two users
  const outgoingRequestsQuery = query(
    collection(db, FRIEND_REQUESTS_COL),
    where('from', '==', uid),
    where('to', '==', blockedUID),
    where('status', '==', 'pending')
  );
  
  const incomingRequestsQuery = query(
    collection(db, FRIEND_REQUESTS_COL),
    where('from', '==', blockedUID),
    where('to', '==', uid),
    where('status', '==', 'pending')
  );

  const [outgoingSnap, incomingSnap] = await Promise.all([
    getDocs(outgoingRequestsQuery),
    getDocs(incomingRequestsQuery)
  ]);

  const requestsToDelete = [
    ...outgoingSnap.docs.map(d => d.id),
    ...incomingSnap.docs.map(d => d.id)
  ];

  // Delete the requests
  await Promise.all(
    requestsToDelete.map(id => deleteDoc(doc(db, FRIEND_REQUESTS_COL, id)))
  );
}

/**
 * Unblock a user
 */
export async function unblockUser(uid: string, blockedUID: string): Promise<void> {
  const blockedRef = doc(db, BLOCKED_USERS_COL, uid, 'blocked', blockedUID);
  await deleteDoc(blockedRef);
}

/**
 * Check if a user has blocked another user
 */
export async function isBlocked(uid: string, targetUID: string): Promise<boolean> {
  const blockedRef = doc(db, BLOCKED_USERS_COL, uid, 'blocked', targetUID);
  const blockedSnap = await getDoc(blockedRef);
  return blockedSnap.exists();
}

/**
 * Get all blocked users for a user
 */
export async function getBlockedUsers(uid: string): Promise<BlockedUser[]> {
  const blockedCol = collection(db, BLOCKED_USERS_COL, uid, 'blocked');
  const snapshot = await getDocs(blockedCol);
  return snapshot.docs.map(doc => doc.data() as BlockedUser);
}

/**
 * Check relationship status between two users
 * Returns the status and any relevant request ID
 */
export async function getRelationshipStatus(
  currentUserUid: string,
  targetUserUid: string
): Promise<{
  status: 'none' | 'pending_sent' | 'pending_received' | 'friends' | 'blocked';
  requestId?: string;
}> {
  // Check if blocked
  const blocked = await isBlocked(targetUserUid, currentUserUid);
  if (blocked) {
    return { status: 'blocked' };
  }

  // Check if friends
  const friends = await areFriends(currentUserUid, targetUserUid);
  if (friends) {
    return { status: 'friends' };
  }

  // Check for pending requests
  const [outgoing, incoming] = await Promise.all([
    getOutgoingFriendRequests(currentUserUid),
    getIncomingFriendRequests(currentUserUid),
  ]);

  const sentRequest = outgoing.find(r => r.to === targetUserUid);
  if (sentRequest) {
    return { status: 'pending_sent', requestId: sentRequest.id };
  }

  const receivedRequest = incoming.find(r => r.from === targetUserUid);
  if (receivedRequest) {
    return { status: 'pending_received', requestId: receivedRequest.id };
  }

  return { status: 'none' };
}
