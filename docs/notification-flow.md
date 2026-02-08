# Notification System Flow

## User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Experience                           │
└─────────────────────────────────────────────────────────────────┘

1. User logs in
   └─> NotificationProvider subscribes to real-time updates
       └─> listenToNotifications(userId)
       └─> listenToUnreadCount(userId)

2. Notification is created (by admin or system)
   └─> createNotification({ userId, type, title, body, link })
       └─> Stored in Firestore: notifications/{notificationId}

3. Real-time update triggers
   └─> useNotifications hook receives new notification
       └─> Updates notifications array
       └─> Updates unreadCount
       └─> Badge in navbar shows count

4. User sees bell icon with badge
   └─> Clicks bell icon
       └─> Navigates to /notifications

5. Notifications page displays list
   ┌─────────────────────────────────────┐
   │ 🔔 Notifications              [✓]   │
   │ You have 3 unread notifications     │
   │                                     │
   │ ┌─────────────────────────────┐    │
   │ │ ✨ Tournament Update    [✓][🗑] │
   │ │ Tourney 5 starts today!      │    │
   │ │ 2 hours ago                  │    │
   │ └─────────────────────────────┘    │
   │                                     │
   │ ┌─────────────────────────────┐    │
   │ │ 💬 New Message          [✓][🗑] │
   │ │ You have a new message       │    │
   │ │ 5 hours ago                  │    │
   │ └─────────────────────────────┘    │
   └─────────────────────────────────────┘

6. User interacts with notification
   ├─> Clicks notification → Navigates to link + marks as read
   ├─> Clicks checkmark → markAsRead(notificationId)
   ├─> Clicks delete → deleteNotification(notificationId)
   └─> Clicks "Mark all as read" → markAllAsRead()
```

## Admin Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                      Admin Experience                            │
└─────────────────────────────────────────────────────────────────┘

1. Admin navigates to /admin/notifications
   
2. Fills in notification form
   ┌─────────────────────────────────────┐
   │ Send Notification                    │
   │                                      │
   │ User ID: [abc123...] [Use My ID]    │
   │ Type: [Tournament ▼]                │
   │ Title: [Tournament Update]          │
   │ Body: [Your match starts soon...]   │
   │ Link: [/tournaments/match/123]      │
   │                                      │
   │ [Send Notification]                 │
   └─────────────────────────────────────┘

3. Clicks "Send Notification"
   └─> createNotification(formData)
       └─> Notification created in Firestore
           └─> Target user receives notification immediately

4. Quick templates available
   ├─> System Template
   ├─> Tournament Template
   └─> Message Template
```

## Technical Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     Component Hierarchy                          │
└─────────────────────────────────────────────────────────────────┘

QueryClientProvider
└─> ThemeProvider
    └─> MuiThemeWrapper
        └─> AuthProvider (provides user, admin, etc.)
            └─> NotificationProvider (NEW)
                ├─> Real-time Firestore listeners
                ├─> State management (notifications, unreadCount)
                └─> Actions (markAsRead, delete, etc.)
                    └─> ToastProvider
                        └─> App content
                            ├─> AppNavbar (shows bell icon + badge)
                            ├─> NotificationsPage
                            └─> AdminNotificationsPage

┌─────────────────────────────────────────────────────────────────┐
│                        Data Flow                                 │
└─────────────────────────────────────────────────────────────────┘

Firebase Auth         Firestore               React Context
    (User)     →    (Notifications)    →    (useNotifications)
                          ↓                          ↓
                    Real-time              State + Actions
                    Listeners              ↓
                          ↓                UI Components
                    onSnapshot           (Navbar, Pages)

┌─────────────────────────────────────────────────────────────────┐
│                    Security Model                                │
└─────────────────────────────────────────────────────────────────┘

Firestore Rules:
- Users can READ only their own notifications
- Authenticated users can CREATE (for admin/system)
- Users can UPDATE/DELETE only their own notifications

Client-side:
- NotificationProvider only subscribes to current user's notifications
- Badge only shows when user is logged in
- Notifications page requires authentication
```

## Integration Examples

### Example 1: Tournament Match Notification

```typescript
// In tournament matching service
async function notifyMatchStart(playerId: string, matchId: string) {
  await createNotification({
    userId: playerId,
    type: 'tournament',
    title: 'Match Starting Soon',
    body: 'Your tournament match starts in 5 minutes!',
    link: `/tournaments/match/${matchId}`
  });
}
```

### Example 2: Friend Request Notification

```typescript
// In friend request service
async function notifyFriendRequest(toUserId: string, fromUsername: string) {
  await createNotification({
    userId: toUserId,
    type: 'friend-request',
    title: 'New Friend Request',
    body: `${fromUsername} sent you a friend request`,
    link: '/friends'
  });
}
```

### Example 3: System Announcement

```typescript
// Broadcast to multiple users
async function broadcastAnnouncement(userIds: string[], message: string) {
  const promises = userIds.map(userId =>
    createNotification({
      userId,
      type: 'system',
      title: 'System Announcement',
      body: message,
      link: '/announcements'
    })
  );
  await Promise.all(promises);
}
```
