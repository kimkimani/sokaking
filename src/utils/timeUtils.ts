/**
 * Utility functions for formatting kickoff times in East Africa Time (EAT - UTC+3, Kenya)
 * and supporting user timezone customization.
 */

// Default timezone for Kenya / East Africa
export const DEFAULT_TIMEZONE = 'Africa/Nairobi';

/**
 * Formats an ISO date string or Date object into East Africa Time (EAT)
 * Converts UTC 19:30 -> 22:30 EAT
 */
export function formatKickoffTimeEAT(
  isoString?: string | Date, 
  timeZone: string = DEFAULT_TIMEZONE
): string {
  if (!isoString) return '18:00';
  
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return String(isoString);

    const now = new Date();
    
    // Check if same day in target timezone
    const getDayString = (dateObj: Date, tz: string) => {
      return dateObj.toLocaleDateString('en-KE', { timeZone: tz });
    };

    const targetDay = getDayString(d, timeZone);
    const todayDay = getDayString(now, timeZone);

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayDay = getDayString(yesterday, timeZone);

    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowDay = getDayString(tomorrow, timeZone);

    // Format time portion in 24h EAT
    const timeStr = d.toLocaleTimeString('en-KE', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    if (targetDay === todayDay) {
      return `${timeStr} EAT`;
    }
    if (targetDay === yesterdayDay) {
      return `Yest ${timeStr} EAT`;
    }
    if (targetDay === tomorrowDay) {
      return `Tom ${timeStr} EAT`;
    }

    const dateStr = d.toLocaleDateString('en-KE', {
      timeZone,
      month: 'short',
      day: 'numeric'
    });
    return `${dateStr} ${timeStr} EAT`;
  } catch (e) {
    return '18:00 EAT';
  }
}

/**
 * Formats full match date & time in EAT (e.g., "Sat, Sep 20 • 22:30 EAT")
 */
export function formatMatchFullDateTimeEAT(
  rawDate?: string | Date,
  timeZone: string = DEFAULT_TIMEZONE
): string {
  if (!rawDate) return 'Kickoff TBA';
  try {
    const d = new Date(rawDate);
    if (isNaN(d.getTime())) return String(rawDate);

    const formattedStr = d.toLocaleString('en-KE', {
      timeZone,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    return `${formattedStr} EAT`;
  } catch {
    return String(rawDate);
  }
}
