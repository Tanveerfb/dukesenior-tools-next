/**
 * TypeScript types for the Direct Messaging System
 * Phase 3: Real-time Direct Messages
 */

export interface DMThread {
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

export interface DMMessage {
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

export interface TypingIndicator {
  uid: string;
  threadId: string;
  timestamp: number;
}
