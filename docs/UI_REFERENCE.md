# Friends System UI Reference

## 🎨 Visual Component Guide

This document provides a textual representation of the UI components implemented in Phase 2.

---

## 1. ProfileHeader Component States

### State: Not Friends (none)
```
┌────────────────────────────────────────────────┐
│ [Profile Header with Banner & Avatar]         │
│                                                │
│ John Doe (@johndoe)                           │
│ [🔗 Social Links]                             │
│                                                │
│ [Add Friend]  [Message (disabled)]    ←──── Buttons
│                                                │
│ Bio: This is my bio...                        │
└────────────────────────────────────────────────┘
```

### State: Friend Request Sent (pending_sent)
```
┌────────────────────────────────────────────────┐
│ John Doe (@johndoe)                           │
│                                                │
│ [Request Sent]  [Message (disabled)]  ←──── Click to cancel
│                                                │
│ Bio: This is my bio...                        │
└────────────────────────────────────────────────┘
```

### State: Friend Request Received (pending_received)
```
┌────────────────────────────────────────────────┐
│ John Doe (@johndoe)                           │
│                                                │
│ [Accept Friend]  [Decline]            ←──── Incoming request
│                                                │
│ Bio: This is my bio...                        │
└────────────────────────────────────────────────┘
```

### State: Friends (friends)
```
┌────────────────────────────────────────────────┐
│ John Doe (@johndoe)                           │
│                                                │
│ [Message]  [••• ▼]                    ←──── Dropdown menu
│            └─ Remove Friend                    │
│            └─ Block                            │
│                                                │
│ Bio: This is my bio...                        │
│ 3 mutual friends                      ←──── Mutual friends
└────────────────────────────────────────────────┘
```

### State: Blocked (blocked)
```
┌────────────────────────────────────────────────┐
│ [Profile Header with Banner & Avatar]         │
│                                                │
│ Profile unavailable                   ←──── Blocked state
│                                                │
└────────────────────────────────────────────────┘
```

---

## 2. Friends Page Layout

### Page Structure
```
┌─────────────────────────────────────────────────────────────┐
│ FRIENDS PAGE                                                │
│                                                             │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ [All Friends (3)] [Incoming (2)] [Outgoing (1)] [Blocked (0)] │
│ └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Active Tab Content Below                                  │
└─────────────────────────────────────────────────────────────┘
```

### All Friends Tab
```
┌─────────────────────────────────────────────────────────────┐
│ All Friends (3)                                             │
│                                                             │
│ [Search friends...]                               ←──── Search
│                                                             │
│ ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│ │ [👤 Avatar] │  │ [👤 Avatar] │  │ [👤 Avatar] │        │
│ │             │  │             │  │             │        │
│ │ John Doe    │  │ Jane Smith  │  │ Bob Wilson  │        │
│ │ @johndoe    │  │ @janesmith  │  │ @bobwilson  │        │
│ │             │  │             │  │             │        │
│ │ Bio preview │  │ Bio preview │  │ Bio preview │        │
│ │ text here.. │  │ text here.. │  │ text here.. │        │
│ │             │  │             │  │             │        │
│ │ [Message]   │  │ [Message]   │  │ [Message]   │        │
│ │ [Remove]    │  │ [Remove]    │  │ [Remove]    │        │
│ │             │  │             │  │             │        │
│ │ Friends     │  │ Friends     │  │ Friends     │        │
│ │ since 1/1   │  │ since 2/1   │  │ since 3/1   │        │
│ └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### Incoming Requests Tab
```
┌─────────────────────────────────────────────────────────────┐
│ Incoming (2)                                     [Badge: 2] │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ [👤 Avatar] Sarah Johnson                            │  │
│ │             @sarahjohnson                             │  │
│ │             Sent 2 hours ago                          │  │
│ │                              [Accept] [Decline]       │  │
│ └───────────────────────────────────────────────────────┘  │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ [👤 Avatar] Mike Davis                               │  │
│ │             @mikedavis                                │  │
│ │             Sent 1 day ago                            │  │
│ │                              [Accept] [Decline]       │  │
│ └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Outgoing Requests Tab
```
┌─────────────────────────────────────────────────────────────┐
│ Outgoing (1)                                                │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ @tomharris                                            │  │
│ │ Request pending                                       │  │
│ │ Sent 3 hours ago                         [Cancel]    │  │
│ └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Blocked Users Tab
```
┌─────────────────────────────────────────────────────────────┐
│ Blocked (1)                                                 │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ @spamuser                                             │  │
│ │ Blocked 2 weeks ago                     [Unblock]     │  │
│ └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Empty State Examples
```
┌─────────────────────────────────────────────────────────────┐
│ All Friends (0)                                             │
│                                                             │
│              [Search friends...]                            │
│                                                             │
│              You haven't added any friends yet.             │
│              Find people to connect with!                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Incoming (0)                                                │
│                                                             │
│              No pending friend requests                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Navigation Bar

### Desktop Navigation
```
┌─────────────────────────────────────────────────────────────┐
│ ✨ The Lair of Evil    [Events▾] [Tools▾] [Community]      │
│                         [Friends (2)] 🔍 🌙 [👤▾]   ←─ Badge
│                                  ↑                           │
│                           Badge shows count                 │
└─────────────────────────────────────────────────────────────┘
```

### Friends Link States
```
Normal:    [👥 Friends]
With Badge: [👥 Friends 🔴2]  ← Red badge with count
Hover:     [👥 Friends] (highlighted)
```

---

## 4. User Interactions Flow

### Sending a Friend Request
```
Profile View (Not Friends)
    ↓
Click [Add Friend]
    ↓
[🔄 Loading spinner]
    ↓
[Request Sent] button appears
    ↓
Alert: "Friend request sent to @username"
```

### Accepting a Friend Request
```
Friends Page → Incoming Tab
    ↓
Click [Accept] on a request
    ↓
[🔄 Processing...]
    ↓
Request moves to All Friends tab
    ↓
Alert: "You are now friends with @username"
```

### Removing a Friend
```
Profile View (Friends) or Friends Page
    ↓
Click [•••] → [Remove Friend]
    ↓
Confirmation: "Remove @username from friends?"
    ↓
Click OK
    ↓
[🔄 Processing...]
    ↓
Alert: "Removed @username from friends"
    ↓
Button changes to [Add Friend]
```

### Blocking a User
```
Profile View (Friends)
    ↓
Click [•••] → [Block]
    ↓
Confirmation: "Block @username? This will remove them..."
    ↓
Click OK
    ↓
[🔄 Processing...]
    ↓
Alert: "Blocked @username"
    ↓
Profile shows "Profile unavailable"
```

---

## 5. Responsive Behavior

### Desktop (≥992px)
```
Friends Grid: 3 columns
Navigation: Full navbar with icons
Buttons: Side by side
```

### Tablet (≥768px)
```
Friends Grid: 2 columns
Navigation: Collapsed with toggle
Buttons: Side by side
```

### Mobile (<768px)
```
Friends Grid: 1 column (stacked)
Navigation: Hamburger menu
Buttons: Stacked vertically
Cards: Full width
```

---

## 6. Loading States

### Button Loading
```
Normal:   [Add Friend]
Loading:  [🔄] (spinner only, no text)
Success:  [Request Sent]
```

### Page Loading
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    [🔄 Loading friends...]                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Color Coding

### Buttons
- **Primary**: Blue - Accept, Message, Add Friend
- **Success**: Green - Accept Friend
- **Danger**: Red - Decline, Remove, Block
- **Secondary**: Gray - Request Sent, Cancel
- **Outline**: Border-only variants for less emphasis

### Badges
- **Red (danger)**: Incoming request count
- **Blue (primary)**: Tournament tags
- **Gray (secondary)**: General info

### Status Indicators
- **Online**: Green ring around avatar (future)
- **Offline**: Gray (future)
- **Blocked**: Grayed out content

---

## 8. Accessibility Features

### Keyboard Navigation
- Tab through all interactive elements
- Enter/Space to activate buttons
- Dropdown menus accessible via keyboard

### Screen Reader Support
- Descriptive button labels
- ARIA labels on icons
- Proper heading hierarchy

### Visual Feedback
- Loading spinners during operations
- Disabled state styling
- Hover effects on interactive elements

---

## 9. Error States

### Network Error
```
Alert: "Failed to send friend request"
Button reverts to previous state
User can retry
```

### Validation Error
```
Alert: "You can't send a friend request to yourself"
Alert: "A friend request already exists..."
Alert: "Unable to send friend request" (blocked)
```

---

## 10. Success Feedback

### Friend Request Sent
```
✅ Alert: "Friend request sent to @username"
```

### Friend Request Accepted
```
✅ Alert: "You are now friends with @username!"
```

### Friend Removed
```
✅ Alert: "Removed @username from friends"
```

### User Blocked
```
✅ Alert: "Blocked @username"
```

### User Unblocked
```
✅ Alert: "Unblocked @username"
```

---

## Summary

The UI provides a comprehensive, user-friendly interface for managing social connections with:
- ✅ Clear visual states for all relationship types
- ✅ Intuitive button placement and labeling
- ✅ Responsive design for all screen sizes
- ✅ Consistent color coding and styling
- ✅ Loading states and user feedback
- ✅ Accessibility support
- ✅ Error handling with helpful messages

All components follow Bootstrap conventions and match the existing design system of the application.
