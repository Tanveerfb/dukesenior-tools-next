/**
 * Direct Messaging Service
 * Handles DM threads, messages, typing indicators, and real-time updates
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
  limit,
  onSnapshot,
  runTransaction,
  writeBatch,
  Timestamp,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import type { DMThread, DMMessage, TypingIndicator } from '@/types/messages';
import { getUserByUID } from './users';
import { areFriends, isBlocked } from './friends';

// Collection names
const THREADS_COL = 'directMessages/threads';
const TYPING_COL = 'directMessages/typing';

/**
 * Generate a consistent thread ID from two UIDs
 * Always stores UIDs in alphabetical order for consistent querying
 */
export function generateThreadId(uid1: string, uid2: string): string {
  return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
}

/**
 * Get ordered UIDs for thread document
 */
function getOrderedUids(uid1: string, uid2: string): [string, string] {
  return uid1 < uid2 ? [uid1, uid2] : [uid2, uid1];
}

/**
 * Create or get an existing thread between two users
 * Validates friendship before creating
 */
export async function createOrGetThread(
  uid1: string,
  uid2: string
): Promise<DMThread> {
  if (uid1 === uid2) {
    throw new Error("Cannot create thread with yourself");
  }

  // Check if users are friends
  const friends = await areFriends(uid1, uid2);
  if (!friends) {
    throw new Error("You must be friends to message this user");
  }

  // Check if either user has blocked the other
  const [blocked1, blocked2] = await Promise.all([
    isBlocked(uid1, uid2),
    isBlocked(uid2, uid1),
  ]);

  if (blocked1 || blocked2) {
    throw new Error("Cannot message this user");
  }

  const threadId = generateThreadId(uid1, uid2);
  const threadRef = doc(db, THREADS_COL, threadId);
  const threadSnap = await getDoc(threadRef);

  if (threadSnap.exists()) {
    return threadSnap.data() as DMThread;
  }

  // Create new thread with participant details
  const [user1, user2] = await Promise.all([
    getUserByUID(uid1),
    getUserByUID(uid2),
  ]);

  const [orderedUid1, orderedUid2] = getOrderedUids(uid1, uid2);
  const now = Date.now();

  const thread: DMThread = {
    id: threadId,
    participants: [orderedUid1, orderedUid2],
    createdAt: now,
    unreadCount: {
      [uid1]: 0,
      [uid2]: 0,
    },
    participantDetails: {
      [uid1]: {
        displayName: user1?.displayName || user1?.username || 'Unknown',
        username: user1?.username || '',
        photoURL: user1?.photoURL,
        accentColor: user1?.accentColor,
      },
      [uid2]: {
        displayName: user2?.displayName || user2?.username || 'Unknown',
        username: user2?.username || '',
        photoURL: user2?.photoURL,
        accentColor: user2?.accentColor,
      },
    },
  };

  await setDoc(threadRef, thread);
  return thread;
}

/**
 * Send a message in a thread
 * Validates friendship and updates thread metadata
 */
export async function sendMessage(
  threadId: string,
  from: string,
  to: string,
  content: string,
  type: 'text' | 'image' = 'text'
): Promise<string> {
  // Validate content
  if (!content || content.trim().length === 0) {
    throw new Error("Message cannot be empty");
  }

  if (content.length > 2000) {
    throw new Error("Message too long (max 2000 characters)");
  }

  // Validate friendship
  const friends = await areFriends(from, to);
  if (!friends) {
    throw new Error("You must be friends to message this user");
  }

  // Check blocks
  const blocked = await isBlocked(to, from);
  if (blocked) {
    throw new Error("Cannot send message to this user");
  }

  return await runTransaction(db, async (transaction) => {
    const threadRef = doc(db, THREADS_COL, threadId);
    const threadSnap = await transaction.get(threadRef);

    if (!threadSnap.exists()) {
      throw new Error("Thread not found");
    }

    const threadData = threadSnap.data() as DMThread;

    // Verify user is participant
    if (!threadData.participants.includes(from) || !threadData.participants.includes(to)) {
      throw new Error("Invalid participants");
    }

    // Create message
    const messagesCol = collection(db, THREADS_COL, threadId, 'messages');
    const messageRef = doc(messagesCol);
    const now = Date.now();

    const message: DMMessage = {
      id: messageRef.id,
      threadId,
      from,
      to,
      content: content.trim(),
      createdAt: now,
      read: false,
      type,
    };

    transaction.set(messageRef, message);

    // Update thread metadata
    const currentUnreadCount = threadData.unreadCount || { [from]: 0, [to]: 0 };
    transaction.update(threadRef, {
      lastMessage: type === 'text' ? content.substring(0, 100) : '[Image]',
      lastMessageAt: now,
      lastMessageFrom: from,
      unreadCount: {
        ...currentUnreadCount,
        [to]: (currentUnreadCount[to] || 0) + 1,
      },
    });

    return messageRef.id;
  });
}

/**
 * Mark all messages in a thread as read for a user
 */
export async function markThreadAsRead(threadId: string, uid: string): Promise<void> {
  const threadRef = doc(db, THREADS_COL, threadId);
  const threadSnap = await getDoc(threadRef);

  if (!threadSnap.exists()) {
    return;
  }

  const threadData = threadSnap.data() as DMThread;

  // Verify user is participant
  if (!threadData.participants.includes(uid)) {
    return;
  }

  // Update thread unread count
  const currentUnreadCount = threadData.unreadCount || {};
  await updateDoc(threadRef, {
    [`unreadCount.${uid}`]: 0,
  });

  // Mark all unread messages as read
  const messagesCol = collection(db, THREADS_COL, threadId, 'messages');
  const unreadQuery = query(
    messagesCol,
    where('to', '==', uid),
    where('read', '==', false)
  );

  const unreadSnap = await getDocs(unreadQuery);
  
  if (unreadSnap.empty) {
    return;
  }

  const batch = writeBatch(db);
  unreadSnap.docs.forEach((doc) => {
    batch.update(doc.ref, { read: true });
  });

  await batch.commit();
}

/**
 * Listen to messages in a thread in real-time
 * Returns unsubscribe function
 */
export function listenToThread(
  threadId: string,
  callback: (messages: DMMessage[]) => void,
  messagesLimit: number = 50,
  lastDoc?: QueryDocumentSnapshot<DocumentData>
): () => void {
  const messagesCol = collection(db, THREADS_COL, threadId, 'messages');
  
  let q = query(
    messagesCol,
    orderBy('createdAt', 'desc'),
    limit(messagesLimit)
  );

  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs
      .map((doc) => doc.data() as DMMessage)
      .reverse(); // Show oldest first
    callback(messages);
  });
}

/**
 * Listen to all threads for a user in real-time
 * Returns unsubscribe function
 */
export function listenToThreads(
  uid: string,
  callback: (threads: DMThread[]) => void
): () => void {
  const threadsCol = collection(db, THREADS_COL);
  
  // Query threads where user is in participants array
  const q = query(
    threadsCol,
    where('participants', 'array-contains', uid),
    orderBy('lastMessageAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const threads = snapshot.docs.map((doc) => doc.data() as DMThread);
    callback(threads);
  });
}

/**
 * Get threads for a user (one-time fetch)
 */
export async function getThreads(uid: string): Promise<DMThread[]> {
  const threadsCol = collection(db, THREADS_COL);
  
  const q = query(
    threadsCol,
    where('participants', 'array-contains', uid),
    orderBy('lastMessageAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as DMThread);
}

/**
 * Get a single thread by ID
 */
export async function getThread(threadId: string): Promise<DMThread | null> {
  const threadRef = doc(db, THREADS_COL, threadId);
  const threadSnap = await getDoc(threadRef);

  if (!threadSnap.exists()) {
    return null;
  }

  return threadSnap.data() as DMThread;
}

/**
 * Soft delete a message
 */
export async function deleteMessage(messageId: string, threadId: string): Promise<void> {
  const messageRef = doc(db, THREADS_COL, threadId, 'messages', messageId);
  await updateDoc(messageRef, {
    deleted: true,
    content: '[Message deleted]',
  });
}

/**
 * Set typing indicator for a user in a thread
 * Automatically expires after 5 seconds
 */
export async function setTyping(
  threadId: string,
  uid: string,
  isTyping: boolean
): Promise<void> {
  const typingRef = doc(db, TYPING_COL, threadId, 'users', uid);

  if (isTyping) {
    await setDoc(typingRef, {
      uid,
      threadId,
      timestamp: Date.now(),
    });
  } else {
    await deleteDoc(typingRef);
  }
}

/**
 * Listen to typing indicators in a thread
 * Returns unsubscribe function
 */
export function listenToTyping(
  threadId: string,
  currentUid: string,
  callback: (typingUsers: TypingIndicator[]) => void
): () => void {
  const typingCol = collection(db, TYPING_COL, threadId, 'users');

  return onSnapshot(typingCol, (snapshot) => {
    const now = Date.now();
    const typingUsers = snapshot.docs
      .map((doc) => doc.data() as TypingIndicator)
      .filter((indicator) => {
        // Filter out current user and expired indicators (older than 5 seconds)
        return indicator.uid !== currentUid && (now - indicator.timestamp) < 5000;
      });
    callback(typingUsers);
  });
}

/**
 * Get total unread message count for a user across all threads
 */
export async function getUnreadCount(uid: string): Promise<number> {
  const threads = await getThreads(uid);
  
  return threads.reduce((total, thread) => {
    const unreadCount = thread.unreadCount?.[uid] || 0;
    return total + unreadCount;
  }, 0);
}

/**
 * Listen to unread count in real-time
 */
export function listenToUnreadCount(
  uid: string,
  callback: (count: number) => void
): () => void {
  return listenToThreads(uid, (threads) => {
    const count = threads.reduce((total, thread) => {
      const unreadCount = thread.unreadCount?.[uid] || 0;
      return total + unreadCount;
    }, 0);
    callback(count);
  });
}

/**
 * Get messages for a thread (one-time fetch with pagination)
 */
export async function getMessages(
  threadId: string,
  messagesLimit: number = 50,
  lastDoc?: QueryDocumentSnapshot<DocumentData>
): Promise<{
  messages: DMMessage[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
}> {
  const messagesCol = collection(db, THREADS_COL, threadId, 'messages');
  
  let q = query(
    messagesCol,
    orderBy('createdAt', 'desc'),
    limit(messagesLimit)
  );

  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  const snapshot = await getDocs(q);
  const messages = snapshot.docs
    .map((doc) => doc.data() as DMMessage)
    .reverse(); // Show oldest first

  const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;

  return {
    messages,
    lastDoc: lastVisible,
  };
}
