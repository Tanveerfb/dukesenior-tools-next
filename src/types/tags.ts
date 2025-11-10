// Shared tag-related types used across navigation, search, and admin pages

export type TagName = string;

// Union type for override modes used in Firestore override docs
export type TagOverrideMode = "merge" | "replace";

// Static manifest entry (route metadata declared in code)
export interface TaggedRouteMeta {
  path: string;
  title: string;
  tags: TagName[];
  description?: string;
}

// Effective meta returned by tag services/API after applying overrides
export interface EffectiveMeta {
  path: string;
  staticTags?: TagName[];
  effective: TagName[];
  title: string;
  description?: string;
  // Optional override payload passthrough from API
  override?: {
    tags: TagName[];
    mode?: TagOverrideMode;
    title?: string;
    description?: string;
    updatedAt?: number;
    updatedBy?: string;
  } | null;
}
