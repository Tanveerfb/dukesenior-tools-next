import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes with proper conflict resolution
 * @param inputs - Class names to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a round ID to a human-readable label
 * @param roundId - Round identifier (e.g., "round1", "round2")
 * @returns Formatted label (e.g., "Round 1", "Round 2") or "General" if no roundId
 */
export function formatRoundLabel(roundId?: string): string {
  if (!roundId) return "General";
  return roundId.replace(/round(\d+)/i, "Round $1");
}
