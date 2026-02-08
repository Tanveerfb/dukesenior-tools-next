/**
 * Bookmark/Favorites System Types
 */

export interface Bookmark {
  id: string;
  uid: string;
  postId: string;
  savedAt: number;
  folder?: string; // 'read-later' | 'favorites' | custom
  notes?: string; // personal notes
}

export interface BookmarkFolder {
  name: string;
  count: number;
}
