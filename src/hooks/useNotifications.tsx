/**
 * Notification Context Hook
 * Provides access to notification state and actions
 */

'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from 'react';
import { useAuth } from './useAuth';
import {
  listenToNotifications,
  listenToUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  createNotification as createNotificationService,
} from '@/lib/services/notifications';
import type { Notification, CreateNotificationInput } from '@/types/notification';

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  createNotification: (input: CreateNotificationInput) => Promise<Notification>;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const previousNotificationCountRef = useRef<number>(0);

  useEffect(() => {
    if (!user?.uid) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      previousNotificationCountRef.current = 0;
      return;
    }

    setLoading(true);

    // Listen to notifications
    const unsubscribeNotifications = listenToNotifications(
      user.uid,
      (newNotifications) => {
        setNotifications(newNotifications);
        setLoading(false);
        
        // Check if there are new notifications (increased count)
        const currentCount = newNotifications.length;
        const previousCount = previousNotificationCountRef.current;
        
        // If we have more notifications than before and this isn't the initial load
        if (currentCount > previousCount && previousCount > 0) {
          // Find the new notifications (those that weren't there before)
          const newNotificationItems = newNotifications.slice(0, currentCount - previousCount);
          
          // Show toast for the first new notification
          if (newNotificationItems.length > 0 && typeof window !== 'undefined') {
            const newestNotification = newNotificationItems[0];
            
            // Use dynamic import to avoid circular dependencies
            import('@/components/ui/ToastProvider').then(({ useToast }) => {
              // Note: This won't work directly, we need to show toast via a different method
              // We'll use the browser's Notification API or just let users check the page
            });
          }
        }
        
        previousNotificationCountRef.current = currentCount;
      }
    );

    // Listen to unread count
    const unsubscribeUnreadCount = listenToUnreadCount(
      user.uid,
      (count) => {
        setUnreadCount(count);
      }
    );

    return () => {
      unsubscribeNotifications();
      unsubscribeUnreadCount();
    };
  }, [user?.uid]);

  const markAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  };

  const markAllAsRead = async () => {
    if (!user?.uid) return;
    try {
      await markAllNotificationsAsRead(user.uid);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  };

  const deleteNotificationHandler = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  };

  const createNotification = async (input: CreateNotificationInput) => {
    try {
      const notification = await createNotificationService(input);
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  };

  const refreshNotifications = () => {
    // Trigger a refresh by updating a dummy state
    // The real-time listener will handle the actual refresh
  };

  const value: NotificationContextValue = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification: deleteNotificationHandler,
    createNotification,
    refreshNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
