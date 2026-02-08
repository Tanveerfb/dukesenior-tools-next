# Direct Messaging System - Phase 3

## Overview

This document provides technical details about the Direct Messaging (DM) system implementation.

## Architecture

### Data Model

#### DMThread
Represents a conversation between two users.

```typescript
interface DMThread {
  id: string; // format: "uid1_uid2" (alphabetically sorted)
  participants: [string, string]; // [uid1, uid2]
  lastMessage?: string;
  lastMessageAt?: number;
  lastMessageFrom?: string;
  createdAt: number;
  unreadCount?: {
    [uid: string]: number;
  };
  participantDetails?: {
    [uid: string]: {
      displayName: string;
      username: string;
      photoURL?: string;
      accentColor?: string;
    };
  };
}
```

#### DMMessage
Represents an individual message in a thread.

```typescript
interface DMMessage {
  id: string;
  threadId: string;
  from: string;
  to: string;
  content: string;
  createdAt: number;
  read: boolean;
  type: 'text' | 'image' | 'system';
  editedAt?: number;
  deleted?: boolean;
}
```

### Firestore Structure

```
directMessages/
  ├── threads/{threadId}
  │   ├── id: string (e.g., "alice_bob")
  │   ├── participants: [uid1, uid2]
  │   ├── lastMessage: string
  │   ├── lastMessageAt: timestamp
  │   ├── lastMessageFrom: uid
  │   ├── createdAt: timestamp
  │   ├── unreadCount: { uid1: number, uid2: number }
  │   └── messages/{messageId}
  │       ├── id: string
  │       ├── from: uid
  │       ├── to: uid
  │       ├── content: string
  │       ├── createdAt: timestamp
  │       ├── read: boolean
  │       ├── type: 'text' | 'image' | 'system'
  │       ├── editedAt?: timestamp
  │       └── deleted?: boolean
  └── typing/{threadId}
      └── {uid}: { timestamp: number }
```

## Features

### Real-time Messaging
- Messages appear instantly using Firestore `onSnapshot` listeners
- Auto-scroll to bottom on new messages
- Message delivery without page refresh

### Typing Indicators
- Show when other user is typing
- Automatically clear after 3 seconds of inactivity
- Uses ephemeral Firestore documents that auto-expire

### Read Receipts
- Messages marked as read when thread is opened
- Unread count displayed in thread list
- Badge in navbar shows total unread messages

### Friends-Only Messaging
- Only friends can message each other
- Blocked users cannot send or receive messages
- Friendship status checked before allowing message send
- Warning shown if friendship is broken while chatting

### UI/UX Features
- Discord/Teams-style two-column layout
- Thread list with search/filter
- Message bubbles with timestamps
- Date separators (Today, Yesterday, etc.)
- Character limit (2000 chars)
- Enter to send, Shift+Enter for new line
- Double-click to copy message text
- Responsive mobile design

## API Reference

### Messages Service (`src/lib/services/messages.ts`)

#### `createOrGetThread(uid1: string, uid2: string): Promise<DMThread>`
Creates a new thread or retrieves existing one between two users.
- Validates friendship before creating
- Checks block status
- Generates consistent thread ID (alphabetically sorted)

#### `sendMessage(threadId: string, from: string, to: string, content: string): Promise<string>`
Sends a message in a thread.
- Validates content (max 2000 chars)
- Checks friendship status
- Updates thread metadata atomically
- Returns message ID

#### `markThreadAsRead(threadId: string, uid: string): Promise<void>`
Marks all messages in a thread as read for a user.

#### `listenToThread(threadId: string, callback: (messages: DMMessage[]) => void): () => void`
Real-time listener for messages in a thread.
- Returns unsubscribe function
- Supports pagination (50 messages per page)

#### `listenToThreads(uid: string, callback: (threads: DMThread[]) => void): () => void`
Real-time listener for user's thread list.
- Sorted by `lastMessageAt` (most recent first)

#### `setTyping(threadId: string, uid: string, isTyping: boolean): Promise<void>`
Sets or clears typing indicator.
- Auto-expires after 5 seconds

#### `listenToTyping(threadId: string, currentUid: string, callback: (typingUsers: TypingIndicator[]) => void): () => void`
Listens for typing indicators in a thread.
- Filters out current user and expired indicators

#### `getUnreadCount(uid: string): Promise<number>`
Gets total unread message count across all threads.

#### `listenToUnreadCount(uid: string, callback: (count: number) => void): () => void`
Real-time listener for unread count (used in navbar badge).

## Components

### `MessagesPage` (`src/app/messages/page.tsx`)
Main messages page with two-column layout.
- Thread list on left (300px wide on desktop)
- Chat window on right
- Supports `?username=` param to open specific thread
- Responsive: thread list collapses on mobile

### `ThreadList` (`src/components/messages/ThreadList.tsx`)
Displays list of conversation threads.
- Search/filter by username
- Unread badges
- Last message preview
- Active thread highlighting

### `ChatWindow` (`src/components/messages/ChatWindow.tsx`)
Conversation view with message history.
- Message list with auto-scroll
- Typing indicator
- Message input with character counter
- Header with user info and actions

### `MessageBubble` (`src/components/messages/MessageBubble.tsx`)
Individual message display.
- Sent messages: right-aligned, accent color background
- Received messages: left-aligned, gray background
- Timestamps on hover
- Support for deleted messages

### `TypingIndicator` (`src/components/messages/TypingIndicator.tsx`)
Animated "User is typing..." indicator.

## Navigation Integration

### MainNavbar
- Messages link with 💬 icon
- Unread badge (red #ED4245)
- Real-time unread count via `listenToUnreadCount`

### ProfileHeader
- "Message" button enabled for friends
- Routes to `/messages?username=${username}`
- Disabled with tooltip for non-friends

## Security

### Firestore Rules
- Users can only read/write threads they're participants in
- Message creation requires sender to be authenticated
- Typing indicators restricted to thread participants
- Block and friendship status enforced server-side

### Client-side Validation
- Friendship check before sending messages
- Block status validation
- Character limit enforcement
- Rate limiting (recommended: max 10 messages/minute)

## Performance Considerations

### Pagination
- Messages loaded 50 at a time
- Load more on scroll to top
- Reduces initial page load

### Real-time Listeners
- Auto-cleanup on unmount
- Debounced typing indicators (3-second timeout)
- Efficient query indexes

### Optimization Tips
- Thread list shows only 100 threads initially
- Message content truncated in previews
- Avatar images cached by browser
- Firestore offline persistence enabled

## Testing Checklist

- [x] TypeScript compilation passes
- [ ] Thread creation works between friends
- [ ] Messages send and receive in real-time
- [ ] Typing indicator shows when other user is typing
- [ ] Typing indicator clears after 3 seconds
- [ ] Read receipts mark messages as read
- [ ] Unread count updates in navbar badge
- [ ] Thread list shows unread badges
- [ ] Message timestamps format correctly
- [ ] Cannot message non-friends (button disabled)
- [ ] Cannot message blocked users
- [ ] Messages scroll to bottom on new message
- [ ] Character limit enforced (2000 chars)
- [ ] Enter sends message, Shift+Enter adds new line
- [ ] Profile "Message" button opens correct thread
- [ ] Empty state shows when no messages
- [ ] Mobile responsive
- [ ] Firestore security rules prevent unauthorized access

## Future Enhancements

### Potential Features
- Message reactions (👍, ❤️, 😂)
- Image uploads (currently has type support)
- Voice messages
- Message search/filtering
- Message editing
- Message deletion (currently soft delete only)
- Group chats
- Online status indicators
- Notification sounds
- Emoji picker
- Link previews
- File attachments
- Video calls
- Screen sharing

### Technical Improvements
- Rate limiting implementation
- Message content sanitization (XSS prevention)
- Spam detection
- Better error handling
- Loading states
- Optimistic UI updates
- Message retry on failure
- Network status indicator

## Troubleshooting

### Common Issues

**Messages not appearing in real-time:**
- Check Firestore security rules
- Verify user is authenticated
- Check browser console for errors
- Ensure indexes are deployed

**Typing indicator not showing:**
- Check 5-second expiration logic
- Verify typing collection rules
- Ensure cleanup on unmount

**Unread count incorrect:**
- Check `markThreadAsRead` is called when thread opens
- Verify `unreadCount` field in thread document
- Check listener setup in navbar

**Cannot send messages:**
- Verify users are friends
- Check block status
- Ensure message doesn't exceed 2000 chars
- Check Firestore security rules

## Deployment

### Required Steps

1. **Deploy Firestore Rules:**
   ```bash
   firebase deploy --only firestore:rules
   ```

2. **Deploy Firestore Indexes:**
   ```bash
   firebase deploy --only firestore:indexes
   ```

3. **Build and Deploy:**
   ```bash
   npm run build
   vercel deploy --prod
   ```

### Environment Variables
No additional environment variables required (uses existing Firebase config).

## Support

For questions or issues:
- Check Firestore console for rule/index errors
- Review browser console for client errors
- Verify user permissions and friendship status
- Test with two different user accounts
