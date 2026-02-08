# Notification System

This document describes the notification system implementation for The Lair of Evil.

## Overview

The notification system provides real-time notifications to users with the following features:
- Bell icon in the navbar with unread count badge
- Toast notifications for system messages
- Dedicated notifications page to view and manage all notifications
- Admin interface to send test notifications

## Architecture

### Components

1. **Types** (`src/types/notification.ts`)
   - `Notification` - Main notification interface
   - `NotificationType` - Supported notification types: message, friend-request, mention, system, tournament, general

2. **Service Layer** (`src/lib/services/notifications.ts`)
   - `createNotification()` - Create a new notification
   - `getUserNotifications()` - Fetch user's notifications
   - `getUnreadCount()` - Get count of unread notifications
   - `markNotificationAsRead()` - Mark single notification as read
   - `markAllNotificationsAsRead()` - Mark all notifications as read
   - `deleteNotification()` - Delete a notification
   - `listenToNotifications()` - Real-time listener for notifications
   - `listenToUnreadCount()` - Real-time listener for unread count

3. **Context Hook** (`src/hooks/useNotifications.tsx`)
   - `NotificationProvider` - Context provider component
   - `useNotifications()` - Hook to access notification state and actions

4. **UI Components**
   - **Bell Icon** - In navbar with badge showing unread count
   - **Notifications Page** (`src/app/notifications/page.tsx`) - List and manage notifications
   - **Admin Page** (`src/app/admin/notifications/page.tsx`) - Send test notifications

### Data Flow

1. User receives a notification (created via admin page or programmatically)
2. Notification is stored in Firestore `notifications` collection
3. Real-time listener in `useNotifications` hook detects new notification
4. Badge count updates automatically in navbar
5. User clicks bell icon to navigate to notifications page
6. User can read, mark as read, or delete notifications

## Usage

### For Users

1. **View Notifications**
   - Click the bell icon in the navbar
   - Navigate to `/notifications`

2. **Manage Notifications**
   - Click a notification to navigate to its link (if available)
   - Click the checkmark to mark as read
   - Click the delete icon to remove a notification
   - Click "Mark all as read" to mark all notifications as read

### For Admins

1. **Send Test Notifications**
   - Navigate to Admin > Send Notifications
   - Enter the recipient's User ID (or use "Use My ID" button)
   - Select notification type
   - Enter title and body
   - Optionally add a link
   - Click "Send Notification"

2. **Use Templates**
   - Click on quick action buttons to fill in common notification templates

### For Developers

#### Creating Notifications Programmatically

```typescript
import { useNotifications } from '@/hooks/useNotifications';

function MyComponent() {
  const { createNotification } = useNotifications();
  
  const sendNotification = async () => {
    await createNotification({
      userId: 'target-user-id',
      type: 'tournament',
      title: 'Tournament Starting',
      body: 'Your tournament match starts in 5 minutes!',
      link: '/tournaments/match/123',
    });
  };
  
  return <button onClick={sendNotification}>Send</button>;
}
```

#### Accessing Notification State

```typescript
import { useNotifications } from '@/hooks/useNotifications';

function NotificationBadge() {
  const { notifications, unreadCount, loading } = useNotifications();
  
  return (
    <div>
      <span>Unread: {unreadCount}</span>
      <span>Total: {notifications.length}</span>
    </div>
  );
}
```

## Firestore Structure

```
notifications/
  {notificationId}/
    id: string
    userId: string
    type: 'message' | 'friend-request' | 'mention' | 'system' | 'tournament' | 'general'
    title: string
    body: string
    link?: string
    read: boolean
    createdAt: number
    updatedAt?: number
```

## Security Rules

The Firestore security rules ensure:
- Users can only read their own notifications
- Any authenticated user can create notifications (for admin/system use)
- Users can only update/delete their own notifications

```javascript
match /notifications/{notificationId} {
  allow read: if isSignedIn() && resource.data.userId == request.auth.uid;
  allow create: if isSignedIn();
  allow update: if isSignedIn() && resource.data.userId == request.auth.uid;
  allow delete: if isSignedIn() && resource.data.userId == request.auth.uid;
}
```

## Integration Points

The notification system can be integrated with other features:

1. **Direct Messaging** - Send notification when a new message arrives
2. **Friend Requests** - Notify users of new friend requests
3. **Tournament Events** - Alert users about tournament updates
4. **System Announcements** - Broadcast important updates to all users

## Future Enhancements

Potential improvements:
- Push notifications via service workers
- Email notifications for important events
- Notification preferences/settings
- Notification grouping by type
- Sound effects for new notifications
- Browser Notification API integration
