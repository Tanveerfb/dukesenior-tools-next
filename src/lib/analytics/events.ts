/**
 * Analytics event tracking utilities
 * Structured event tracking for key user interactions
 */

type EventCategory =
  | "tournament"
  | "post"
  | "profile"
  | "navigation"
  | "auth"
  | "search";

interface EventData {
  category: EventCategory;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Track a custom event
 */
export function trackEvent({
  category,
  action,
  label,
  value,
  metadata,
}: EventData) {
  // Log in development
  if (process.env.NODE_ENV === "development") {
    console.log("[Analytics Event]", {
      category,
      action,
      label,
      value,
      metadata,
    });
  }

  // Send to analytics provider (Vercel Analytics, GA4, etc.)
  if (typeof window !== "undefined" && (window as any).va) {
    (window as any).va("track", action, {
      category,
      label,
      value,
      ...metadata,
    });
  }
}

/**
 * Tournament-specific events
 */
export const tournamentEvents = {
  viewBracket: (tournamentId: string) =>
    trackEvent({
      category: "tournament",
      action: "view_bracket",
      label: tournamentId,
    }),

  viewStandings: (tournamentId: string) =>
    trackEvent({
      category: "tournament",
      action: "view_standings",
      label: tournamentId,
    }),

  submitRun: (tournamentId: string, runId?: string) =>
    trackEvent({
      category: "tournament",
      action: "submit_run",
      label: tournamentId,
      metadata: { runId },
    }),

  viewStats: (tournamentId: string) =>
    trackEvent({
      category: "tournament",
      action: "view_stats",
      label: tournamentId,
    }),
};

/**
 * Post-specific events
 */
export const postEvents = {
  view: (postSlug: string) =>
    trackEvent({
      category: "post",
      action: "view_post",
      label: postSlug,
    }),

  create: (postId: string) =>
    trackEvent({
      category: "post",
      action: "create_post",
      label: postId,
    }),

  edit: (postId: string) =>
    trackEvent({
      category: "post",
      action: "edit_post",
      label: postId,
    }),

  delete: (postId: string) =>
    trackEvent({
      category: "post",
      action: "delete_post",
      label: postId,
    }),

  like: (postId: string) =>
    trackEvent({
      category: "post",
      action: "like_post",
      label: postId,
    }),

  comment: (postId: string) =>
    trackEvent({
      category: "post",
      action: "comment_post",
      label: postId,
    }),
};

/**
 * Profile-specific events
 */
export const profileEvents = {
  view: (username: string) =>
    trackEvent({
      category: "profile",
      action: "view_profile",
      label: username,
    }),

  edit: () =>
    trackEvent({
      category: "profile",
      action: "edit_profile",
    }),
};

/**
 * Navigation events
 */
export const navigationEvents = {
  search: (query: string, resultCount: number) =>
    trackEvent({
      category: "search",
      action: "perform_search",
      label: query,
      value: resultCount,
    }),

  clickSearchResult: (path: string) =>
    trackEvent({
      category: "search",
      action: "click_search_result",
      label: path,
    }),

  openKeyboardShortcuts: () =>
    trackEvent({
      category: "navigation",
      action: "open_shortcuts_modal",
    }),

  toggleTheme: (newTheme: "light" | "dark") =>
    trackEvent({
      category: "navigation",
      action: "toggle_theme",
      label: newTheme,
    }),
};

/**
 * Auth events
 */
export const authEvents = {
  login: (method: string) =>
    trackEvent({
      category: "auth",
      action: "login",
      label: method,
    }),

  logout: () =>
    trackEvent({
      category: "auth",
      action: "logout",
    }),

  signUp: (method: string) =>
    trackEvent({
      category: "auth",
      action: "signup",
      label: method,
    }),
};
