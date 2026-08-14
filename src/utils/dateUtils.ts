/**
 * Unified Date and Time Utilities for Soka King
 * Converts UTC database & API timestamps to Kenya Local Time (EAT - East Africa Time, UTC+3)
 */

export const KENYA_TIMEZONE = 'Africa/Nairobi';

/**
 * Safely parse ISO or database date strings into a JavaScript Date object (interpreted as UTC)
 */
export function parseDateAsUTC(dateInput?: string | Date | number | null): Date | null {
  if (!dateInput) return null;
  if (dateInput instanceof Date) {
    return isNaN(dateInput.getTime()) ? null : dateInput;
  }
  if (typeof dateInput === 'number') {
    const d = new Date(dateInput);
    return isNaN(d.getTime()) ? null : d;
  }

  let str = String(dateInput).trim();
  if (!str) return null;

  // Handle standard "HH:mm" strings by assuming today's date in UTC
  if (/^\d{1,2}:\d{2}$/.test(str)) {
    const [h, m] = str.split(':').map(Number);
    const now = new Date();
    now.setUTCHours(h, m, 0, 0);
    return now;
  }

  // If string looks like "YYYY-MM-DD HH:mm:ss" or "YYYY-MM-DDTHH:mm:ss" without offset, append Z for UTC
  if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2})?$/.test(str)) {
    str = str.replace(' ', 'T') + 'Z';
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    str = str + 'T00:00:00Z';
  }

  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Get date components (Year, Month, Day, Hour, Minute) in Kenya EAT Time (Africa/Nairobi)
 */
export function getEATParts(dateInput?: string | Date | number | null) {
  const d = parseDateAsUTC(dateInput);
  if (!d) return null;

  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: KENYA_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const parts = formatter.formatToParts(d);
    const getValue = (type: string) => parts.find(p => p.type === type)?.value || '';

    const year = parseInt(getValue('year'), 10);
    const month = parseInt(getValue('month'), 10);
    const day = parseInt(getValue('day'), 10);
    let hourStr = getValue('hour');
    if (hourStr === '24') hourStr = '00';
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(getValue('minute'), 10);

    const dateString = `${getValue('year')}-${getValue('month')}-${getValue('day')}`;
    const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

    return {
      year,
      month,
      day,
      hour,
      minute,
      dateString, // YYYY-MM-DD in EAT
      timeString, // HH:mm in EAT
      dateObj: d,
    };
  } catch (e) {
    // Fallback: UTC + 3 hours
    const eatMs = d.getTime() + 3 * 60 * 60 * 1000;
    const eatDate = new Date(eatMs);
    const year = eatDate.getUTCFullYear();
    const month = eatDate.getUTCMonth() + 1;
    const day = eatDate.getUTCDate();
    const hour = eatDate.getUTCHours();
    const minute = eatDate.getUTCMinutes();
    const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

    return { year, month, day, hour, minute, dateString, timeString, dateObj: d };
  }
}

/**
 * Compare whether two dates fall on the same day in Kenya Time (EAT - Africa/Nairobi)
 */
export function isSameDay(dateInput1?: string | Date | number | null, dateInput2?: string | Date | number | null): boolean {
  const parts1 = getEATParts(dateInput1);
  const parts2 = getEATParts(dateInput2);
  if (!parts1 || !parts2) return false;
  return parts1.dateString === parts2.dateString;
}

/**
 * Format match kickoff time in Kenya Local Time (e.g. "22:00", "Tom 22:00", "15 Jul 22:00")
 */
export function formatMatchTime(dateInput?: string | Date | number | null, includeTimezoneLabel = false): string {
  const parts = getEATParts(dateInput);
  if (!parts) return '18:00';

  const tzSuffix = includeTimezoneLabel ? ' EAT' : '';
  const timeStr = `${parts.timeString}${tzSuffix}`;

  const now = new Date();
  const todayParts = getEATParts(now);
  if (todayParts && parts.dateString === todayParts.dateString) {
    return timeStr;
  }

  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayParts = getEATParts(yesterday);
  if (yesterdayParts && parts.dateString === yesterdayParts.dateString) {
    return `Yest ${timeStr}`;
  }

  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowParts = getEATParts(tomorrow);
  if (tomorrowParts && parts.dateString === tomorrowParts.dateString) {
    return `Tom ${timeStr}`;
  }

  // Format date as "15 Jul 22:00"
  try {
    const monthShort = parts.dateObj.toLocaleDateString('en-KE', { timeZone: KENYA_TIMEZONE, month: 'short' });
    return `${parts.day} ${monthShort} ${timeStr}`;
  } catch {
    return `${parts.dateString} ${timeStr}`;
  }
}

/**
 * Format full date & time for detailed match headers (e.g., "Wed, 15 Jul • 22:00")
 */
export function formatFullMatchDateTime(dateInput?: string | Date | number | null): string {
  const parts = getEATParts(dateInput);
  if (!parts) return 'Kickoff TBA';

  try {
    const formatted = new Intl.DateTimeFormat('en-KE', {
      timeZone: KENYA_TIMEZONE,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(parts.dateObj);

    return formatted;
  } catch {
    return `${parts.dateString} ${parts.timeString}`;
  }
}
