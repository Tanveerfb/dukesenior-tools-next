/**
 * CMS Permission System
 * Controls who can create, edit, and publish posts
 */

import type { UserDoc } from "@/types/users";
import type { UserGamification } from "@/types/gamification";

/**
 * Check if user can create posts
 * Admins can always create, level 5+ users can submit for review
 */
export function canCreatePost(
  user: UserDoc,
  gamification?: UserGamification | null
): boolean {
  // Admins can always create
  if (user.roles?.includes("admin")) return true;

  // Level 5+ users can submit posts for review
  const level = gamification?.currentLevel || 0;
  return level >= 5;
}

/**
 * Check if user can publish posts directly without approval
 * Only admins and contributors can publish directly
 */
export function canPublishDirectly(user: UserDoc): boolean {
  return (
    (user.roles?.includes("admin") || user.roles?.includes("contributor")) ?? false
  );
}

/**
 * Check if user can edit a specific post
 */
export function canEditPost(user: UserDoc, postAuthorUID: string): boolean {
  // Admins can edit any post
  if (user.roles?.includes("admin")) return true;

  // Users can edit their own posts
  return user.uid === postAuthorUID;
}

/**
 * Check if user can delete a specific post
 */
export function canDeletePost(user: UserDoc, postAuthorUID: string): boolean {
  // Admins can delete any post
  if (user.roles?.includes("admin")) return true;

  // Users can delete their own posts
  return user.uid === postAuthorUID;
}

/**
 * Check if user can approve/reject posts
 * Only admins can approve or reject posts
 */
export function canApprovePost(user: UserDoc): boolean {
  return user.roles?.includes("admin") ?? false;
}
