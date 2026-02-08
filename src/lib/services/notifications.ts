/**
 * Notification Service
 * Handles creating, reading, updating, and listening to user notifications
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
  writeBatch,
  Timestamp,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import type {
  Notification,
  NotificationDoc,
  CreateNotificationInput,
  UpdateNotificationInput,
} from '@/types/notification';

// Collection name
const NOTIFICATIONS_COL = 'notifications';

/**
 * Create a new notification
 */
export async function createNotification(
  input: CreateNotificationInput
): Promise<Notification> {
  const notificationRef = doc(collection(db, NOTIFICATIONS_COL));
  const now = Date.now();

  const notification: Notification = {
    id: notificationRef.id,
    userId: input.userId,
    type: input.type,
    title: input.title,
    body: input.body,
    link: input.link,
    read: false,
    createdAt: now,
  };

  await setDoc(notificationRef, notification);
  return notification;
}

/**
 * Get a single notification by ID
 */
export async function getNotificationById(
  notificationId: string
): Promise<Notification | null> {
  const notificationRef = doc(db, NOTIFICATIONS_COL, notificationId);
  const notificationSnap = await getDoc(notificationRef);

  if (!notificationSnap.exists()) {
    return null;
  }

  return notificationSnap.data() as Notification;
}

/**
 * Get all notifications for a user
 */
export async function getUserNotifications(
  userId: string,
  limitCount: number = 50,
  lastDoc?: QueryDocumentSnapshot<DocumentData>
): Promise<{
  notifications: Notification[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
}> {
  const notificationsRef = collection(db, NOTIFICATIONS_COL);
  let q = query(
    notificationsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  const snapshot = await getDocs(q);
  const notifications = snapshot.docs.map((doc) => doc.data() as Notification);
  const newLastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

  return { notifications, lastDoc: newLastDoc };
}

/**
 * Get unread notifications count for a user
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const notificationsRef = collection(db, NOTIFICATIONS_COL);
  const q = query(
    notificationsRef,
    where('userId', '==', userId),
    where('read', '==', false)
  );

  const snapshot = await getDocs(q);
  return snapshot.size;
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<void> {
  const notificationRef = doc(db, NOTIFICATIONS_COL, notificationId);
  await updateDoc(notificationRef, {
    read: true,
    updatedAt: Date.now(),
  });
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const notificationsRef = collection(db, NOTIFICATIONS_COL);
  const q = query(
    notificationsRef,
    where('userId', '==', userId),
    where('read', '==', false)
  );

  const snapshot = await getDocs(q);
  const batch = writeBatch(db);

  snapshot.docs.forEach((doc) => {
    batch.update(doc.ref, {
      read: true,
      updatedAt: Date.now(),
    });
  });

  await batch.commit();
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  const notificationRef = doc(db, NOTIFICATIONS_COL, notificationId);
  await deleteDoc(notificationRef);
}

/**
 * Delete all notifications for a user
 */
export async function deleteAllNotifications(userId: string): Promise<void> {
  const notificationsRef = collection(db, NOTIFICATIONS_COL);
  const q = query(notificationsRef, where('userId', '==', userId));

  const snapshot = await getDocs(q);
  const batch = writeBatch(db);

  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
}

/**
 * Listen to unread notification count in real-time
 */
export function listenToUnreadCount(
  userId: string,
  callback: (count: number) => void
): () => void {
  const notificationsRef = collection(db, NOTIFICATIONS_COL);
  const q = query(
    notificationsRef,
    where('userId', '==', userId),
    where('read', '==', false)
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.size);
    },
    (error) => {
      console.error('Error listening to unread count:', error);
      callback(0);
    }
  );

  return unsubscribe;
}

/**
 * Listen to user notifications in real-time
 */
export function listenToNotifications(
  userId: string,
  callback: (notifications: Notification[]) => void,
  limitCount: number = 50
): () => void {
  const notificationsRef = collection(db, NOTIFICATIONS_COL);
  const q = query(
    notificationsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const notifications = snapshot.docs.map((doc) => doc.data() as Notification);
      callback(notifications);
    },
    (error) => {
      console.error('Error listening to notifications:', error);
      callback([]);
    }
  );

  return unsubscribe;
}
