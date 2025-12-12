/**
 * Format current time in a specific timezone.
 * @param timezone IANA timezone identifier (e.g., "America/New_York")
 * @returns Formatted time string
 */
export function formatNowInTimezone(timezone: string): string {
  const now = new Date();
  try {
    const formatter = new Intl.DateTimeFormat(undefined, {
      timeZone: timezone,
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    return formatter.format(now);
  } catch (e) {
    // Invalid timezone fallback
    return "N/A";
  }
}

/**
 * Format current time in a specific timezone with full date.
 * @param timezone IANA timezone identifier
 * @returns Formatted date-time string
 */
export function formatNowInTimezoneWithDate(timezone: string): string {
  const now = new Date();
  try {
    const formatter = new Intl.DateTimeFormat(undefined, {
      timeZone: timezone,
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    return formatter.format(now);
  } catch (e) {
    return "N/A";
  }
}
