/**
 * TypeScript types for the Friends & Social Features system
 * Phase 2: Friend Requests, Friends List, Blocking
 */

export interface FriendRequest {
  id: string;
  from: string; // sender UID
  fromUsername: string;
  fromDisplayName: string;
  fromPhotoURL?: string;
  to: string; // recipient UID
  toUsername: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: number;
  updatedAt: number;
}

export interface Friend {
  uid: string;
  username: string;
  displayName: string;
  photoURL?: string;
  since: number; // friendship timestamp
  // Include other UserDoc fields as needed
  bio?: string;
  accentColor?: string;
  roles?: string[];
}

export interface BlockedUser {
  blockedUID: string;
  blockedUsername: string;
  blockedAt: number;
  reason?: string;
}

export type FriendStatus = 
  | 'none' 
  | 'pending_sent' 
  | 'pending_received' 
  | 'friends' 
  | 'blocked';
