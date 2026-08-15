/**
 * Match time formatting utilities for Soka King
 * Displays match times directly in EAT (East Africa Time, UTC+3)
 */

export function parseKickoffDateToUTC(rawInput?: string | number | Date | null): Date | null {
  if (!rawInput) return null;
  if (rawInput instanceof Date) {
    return isNaN(rawInput.getTime()) ? null : rawInput;
  }
  if (typeof rawInput === 'number') {
    const ms = rawInput < 1e11 ? rawInput * 1000 : rawInput;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }

  const str = String(rawInput).trim();
  if (!str) return null;

  // Case A: Just time like "19:30" or "19:30:00"
  const timeOnlyMatch = str.match(/^(\d{1,2})[:.](\d{2})(?:[:.](\d{2}))?$/);
  if (timeOnlyMatch) {
    const hours = parseInt(timeOnlyMatch[1], 10);
    const minutes = parseInt(timeOnlyMatch[2], 10);
    const seconds = timeOnlyMatch[3] ? parseInt(timeOnlyMatch[3], 10) : 0;
    
    const now = new Date();
    return new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      hours,
      minutes,
      seconds
    ));
  }

  // Case B: Standard ISO timestamp with timezone
  if (/[zZ]$|[+-]\d{2}:?\d{2}$/.test(str)) {
    const d = new Date(str);
    if (!isNaN(d.getTime())) return d;
  }

  // Case C: Standard SQL timestamp
  const sqlMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);
  if (sqlMatch) {
    const year = parseInt(sqlMatch[1], 10);
    const month = parseInt(sqlMatch[2], 10) - 1;
    const day = parseInt(sqlMatch[3], 10);
    const hours = parseInt(sqlMatch[4], 10);
    const minutes = parseInt(sqlMatch[5], 10);
    const seconds = sqlMatch[6] ? parseInt(sqlMatch[6], 10) : 0;

    return new Date(Date.UTC(year, month, day, hours, minutes, seconds));
  }

  const fallback = new Date(str);
  return isNaN(fallback.getTime()) ? null : fallback;
}

/**
 * Returns formatted 24h kickoff time in East Africa Time
 * E.g. "22:30 EAT" or "Tom 19:30 EAT"
 */
export function formatKickoffTimeEAT(rawInput?: string | number | Date | null): string {
  const d = parseKickoffDateToUTC(rawInput);
  if (!d) return '18:00 EAT';

  try {
    const now = new Date();
    const timeZone = 'Africa/Nairobi';

    const getDayString = (dateObj: Date) => dateObj.toLocaleDateString('en-GB', { timeZone });
    const targetDay = getDayString(d);
    const todayDay = getDayString(now);

    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const timeStr = d.toLocaleTimeString('en-GB', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    if (targetDay === todayDay) {
      return `${timeStr} EAT`;
    }
    if (targetDay === getDayString(yesterday)) {
      return `Yest ${timeStr} EAT`;
    }
    if (targetDay === getDayString(tomorrow)) {
      return `Tom ${timeStr} EAT`;
    }

    const dateStr = d.toLocaleDateString('en-GB', {
      timeZone,
      month: 'short',
      day: 'numeric'
    });

    return `${dateStr} ${timeStr} EAT`;
  } catch {
    return '18:00 EAT';
  }
}

/**
 * Formats full match date & time e.g. "Sat, Sep 20 • 22:30 EAT"
 */
export function formatMatchFullDateTimeEAT(rawInput?: string | number | Date | null): string {
  const d = parseKickoffDateToUTC(rawInput);
  if (!d) return 'Kickoff TBA';

  try {
    const formattedStr = d.toLocaleString('en-GB', {
      timeZone: 'Africa/Nairobi',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    return `${formattedStr} EAT`;
  } catch {
    return String(rawInput);
  }
}

/**
 * Checks if a fixture's UTC kickoff time matches a target calendar day in Kenya
 */
export function isSameDayInTargetTimezone(
  rawInput?: string | number | Date | null,
  targetDate?: Date
): boolean {
  const d = parseKickoffDateToUTC(rawInput);
  if (!d || !targetDate) return false;

  try {
    const timeZone = 'Africa/Nairobi';
    const formatToDay = (dateObj: Date) => dateObj.toLocaleDateString('en-GB', { timeZone });
    return formatToDay(d) === formatToDay(targetDate);
  } catch {
    return false;
  }
}
