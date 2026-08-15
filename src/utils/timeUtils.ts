/**
 * Time and Timezone formatting utilities for Soka King
 * Defaults to Kenya East Africa Time (EAT, UTC+3)
 */

export const SUPPORTED_TIMEZONES = [
  { id: 'Africa/Nairobi', label: 'EAT (Kenya / UTC+3)', shortLabel: 'EAT', flag: '🇰🇪', offset: '+3' },
  { id: 'auto', label: 'Device Local Time', shortLabel: 'LOCAL', flag: '📱', offset: 'Auto' },
  { id: 'UTC', label: 'UTC / GMT (+0)', shortLabel: 'UTC', flag: '🌐', offset: '+0' },
  { id: 'Africa/Lagos', label: 'WAT (Nigeria / UTC+1)', shortLabel: 'WAT', flag: '🇳🇬', offset: '+1' },
  { id: 'Africa/Johannesburg', label: 'CAT (South Africa / UTC+2)', shortLabel: 'CAT', flag: '🇿🇦', offset: '+2' },
  { id: 'Europe/London', label: 'UK (GMT / BST)', shortLabel: 'UK', flag: '🇬🇧', offset: '+0/+1' }
];

export const DEFAULT_TIMEZONE = 'Africa/Nairobi';

/**
 * Gets the current active timezone from localStorage or defaults to Africa/Nairobi
 */
export function getActiveTimezone(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('soka_user_timezone');
    if (saved) {
      if (saved === 'auto') {
        try {
          return Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TIMEZONE;
        } catch {
          return DEFAULT_TIMEZONE;
        }
      }
      return saved;
    }
  }
  return DEFAULT_TIMEZONE;
}

/**
 * Sets the active timezone in localStorage and dispatches an event for UI sync
 */
export function setActiveTimezone(tz: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('soka_user_timezone', tz);
    window.dispatchEvent(new Event('timezone-changed'));
  }
}

/**
 * Normalizes any kickoff date or time input into a guaranteed UTC Date object.
 * 
 * Why this is necessary:
 * Football fixture kickoff times from APIs and databases represent UTC/GMT times.
 * Strings like "2026-07-15 19:30:00", "2026-07-15T19:30:00", or "19:30" do NOT contain
 * a timezone specifier. When passed to `new Date()`, JavaScript parses them as the user's
 * local browser timezone. For a user in Kenya (UTC+3), "19:30" was being treated as 19:30 Kenya time,
 * instead of 19:30 UTC (which is 22:30 Kenya time!).
 */
export function parseKickoffDateToUTC(rawInput?: string | number | Date | null): Date | null {
  if (!rawInput) return null;
  if (rawInput instanceof Date) {
    return isNaN(rawInput.getTime()) ? null : rawInput;
  }
  if (typeof rawInput === 'number') {
    // Check if unix timestamp in seconds (10 digits) vs ms (13 digits)
    const ms = rawInput < 1e11 ? rawInput * 1000 : rawInput;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }

  const str = String(rawInput).trim();
  if (!str) return null;

  // Case A: Just time like "19:30", "19.30", "19:30:00", "19.30.00"
  const timeOnlyMatch = str.match(/^(\d{1,2})[:.](\d{2})(?:[:.](\d{2}))?$/);
  if (timeOnlyMatch) {
    const hours = parseInt(timeOnlyMatch[1], 10);
    const minutes = parseInt(timeOnlyMatch[2], 10);
    const seconds = timeOnlyMatch[3] ? parseInt(timeOnlyMatch[3], 10) : 0;
    
    const now = new Date();
    // Build a UTC date for today at specified UTC time
    const utcDate = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      hours,
      minutes,
      seconds
    ));
    return utcDate;
  }

  // Case B: Has standard ISO with 'Z' or timezone offset (+03:00, -05:00)
  if (/[zZ]$|[+-]\d{2}:?\d{2}$/.test(str)) {
    const d = new Date(str);
    if (!isNaN(d.getTime())) return d;
  }

  // Case C: Standard SQL timestamp "2026-07-15 19:30:00" or "2026-07-15 19:30"
  // or "2026-07-15T19:30:00" WITHOUT timezone.
  // Explicitly treat the time as UTC.
  const sqlMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);
  if (sqlMatch) {
    const year = parseInt(sqlMatch[1], 10);
    const month = parseInt(sqlMatch[2], 10) - 1;
    const day = parseInt(sqlMatch[3], 10);
    const hours = parseInt(sqlMatch[4], 10);
    const minutes = parseInt(sqlMatch[5], 10);
    const seconds = sqlMatch[6] ? parseInt(sqlMatch[6], 10) : 0;

    const utcDate = new Date(Date.UTC(year, month, day, hours, minutes, seconds));
    return utcDate;
  }

  // Fallback to standard Date parsing
  const fallback = new Date(str);
  if (!isNaN(fallback.getTime())) {
    return fallback;
  }

  return null;
}

/**
 * Returns formatted 24h kickoff time in East Africa Time (or user's chosen timezone)
 * E.g. UTC 19:30 -> "22:30 EAT"
 */
export function formatKickoffTimeEAT(
  rawInput?: string | number | Date | null,
  timeZone?: string
): string {
  const d = parseKickoffDateToUTC(rawInput);
  if (!d) return '18:00 EAT';

  const tz = timeZone || getActiveTimezone();

  try {
    const now = new Date();

    const getDayString = (dateObj: Date, zone: string) => {
      return dateObj.toLocaleDateString('en-GB', { timeZone: zone });
    };

    const targetDay = getDayString(d, tz);
    const todayDay = getDayString(now, tz);

    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayDay = getDayString(yesterday, tz);

    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowDay = getDayString(tomorrow, tz);

    // Format 24-hour time e.g. 22:30
    const timeStr = d.toLocaleTimeString('en-GB', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    const isEAT = tz === 'Africa/Nairobi' || tz === 'DEFAULT';
    const tzSuffix = isEAT ? 'EAT' : '';

    if (targetDay === todayDay) {
      return tzSuffix ? `${timeStr} ${tzSuffix}` : timeStr;
    }
    if (targetDay === yesterdayDay) {
      return tzSuffix ? `Yest ${timeStr} ${tzSuffix}` : `Yest ${timeStr}`;
    }
    if (targetDay === tomorrowDay) {
      return tzSuffix ? `Tom ${timeStr} ${tzSuffix}` : `Tom ${timeStr}`;
    }

    const dateStr = d.toLocaleDateString('en-GB', {
      timeZone: tz,
      month: 'short',
      day: 'numeric'
    });

    return tzSuffix ? `${dateStr} ${timeStr} ${tzSuffix}` : `${dateStr} ${timeStr}`;
  } catch (e) {
    return '18:00 EAT';
  }
}

/**
 * Formats full match date & time e.g. "Sat, Sep 20 • 22:30 EAT"
 */
export function formatMatchFullDateTimeEAT(
  rawInput?: string | number | Date | null,
  timeZone?: string
): string {
  const d = parseKickoffDateToUTC(rawInput);
  if (!d) return 'Kickoff TBA';

  const tz = timeZone || getActiveTimezone();

  try {
    const formattedStr = d.toLocaleString('en-GB', {
      timeZone: tz,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    const isEAT = tz === 'Africa/Nairobi';
    return isEAT ? `${formattedStr} EAT` : formattedStr;
  } catch {
    return String(rawInput);
  }
}

/**
 * Checks if a fixture's UTC kickoff time matches a target calendar day in Kenya / user timezone
 */
export function isSameDayInTargetTimezone(
  rawInput?: string | number | Date | null,
  targetDate?: Date,
  timeZone?: string
): boolean {
  const d = parseKickoffDateToUTC(rawInput);
  if (!d || !targetDate) return false;

  const tz = timeZone || getActiveTimezone();

  try {
    const formatToDay = (dateObj: Date) => {
      return dateObj.toLocaleDateString('en-GB', { timeZone: tz });
    };
    return formatToDay(d) === formatToDay(targetDate);
  } catch {
    return false;
  }
}
