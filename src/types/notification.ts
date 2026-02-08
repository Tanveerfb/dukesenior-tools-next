/**
 * Notification type definitions
 */

export type NotificationType = 
  | 'message'
  | 'friend-request'
  | 'mention'
  | 'system'
  | 'tournament'
  | 'general'
  | 'post-approved'
  | 'post-rejected'
  | 'post-milestone'
  | 'new-follower'
  | 'followed-user-post';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: number;
  updatedAt?: number;
}

export type NotificationDoc = Notification;

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
}

export interface UpdateNotificationInput {
  read?: boolean;
}
