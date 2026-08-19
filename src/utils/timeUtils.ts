/**
 * Centralized Time and Date formatting utilities for Soka King
 * All match kickoff times are formatted consistently in East Africa Time (EAT / Africa/Nairobi - UTC+3)
 */

export function formatTime(timeStr?: string | Date | null): string {
  if (!timeStr) return '18:00';
  
  if (typeof timeStr === 'string') {
    const trimmed = timeStr.trim();
    // If it's already a plain HH:mm format without date or timezone
    if (/^\d{1,2}:\d{2}$/.test(trimmed)) {
      const [h, m] = trimmed.split(':');
      return `${h.padStart(2, '0')}:${m}`;
    }

    try {
      // If datetime does not specify timezone offset or Z, assume UTC from database
      let normalized = trimmed;
      if (normalized.includes(' ') && !normalized.includes('T')) {
        normalized = normalized.replace(' ', 'T');
      }
      if (!normalized.endsWith('Z') && !/[+-]\d{2}:?\d{2}$/.test(normalized)) {
        normalized += 'Z';
      }

      const d = new Date(normalized);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString('en-GB', {
          timeZone: 'Africa/Nairobi',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      }
    } catch {
      // Fallback below
    }
    return trimmed;
  }

  if (timeStr instanceof Date && !isNaN(timeStr.getTime())) {
    return timeStr.toLocaleTimeString('en-GB', {
      timeZone: 'Africa/Nairobi',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  return '18:00';
}

export function formatMatchDateTime(timeStr?: string | Date | null): string {
  if (!timeStr) return '18:00';

  if (typeof timeStr === 'string') {
    const trimmed = timeStr.trim();
    // If it's already a plain HH:mm format without date
    if (/^\d{1,2}:\d{2}$/.test(trimmed)) {
      const [h, m] = trimmed.split(':');
      return `${h.padStart(2, '0')}:${m}`;
    }

    try {
      let normalized = trimmed;
      if (normalized.includes(' ') && !normalized.includes('T')) {
        normalized = normalized.replace(' ', 'T');
      }
      if (!normalized.endsWith('Z') && !/[+-]\d{2}:?\d{2}$/.test(normalized)) {
        normalized += 'Z';
      }

      const d = new Date(normalized);
      if (!isNaN(d.getTime())) {
        const dayFormatted = d.toLocaleDateString('en-GB', {
          timeZone: 'Africa/Nairobi',
          weekday: 'short',
          day: 'numeric',
          month: 'short'
        });
        const timeFormatted = d.toLocaleTimeString('en-GB', {
          timeZone: 'Africa/Nairobi',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
        return `${dayFormatted} • ${timeFormatted}`;
      }
    } catch {
      // Fallback below
    }
    return trimmed;
  }

  if (timeStr instanceof Date && !isNaN(timeStr.getTime())) {
    const dayFormatted = timeStr.toLocaleDateString('en-GB', {
      timeZone: 'Africa/Nairobi',
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
    const timeFormatted = timeStr.toLocaleTimeString('en-GB', {
      timeZone: 'Africa/Nairobi',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    return `${dayFormatted} • ${timeFormatted}`;
  }

  return '18:00';
}

export function formatJackpotStartTimeString(earliestDate: Date | null, defaultString?: string): string {
  if (!earliestDate || isNaN(earliestDate.getTime())) {
    return defaultString || 'Starts 18:00 EAT';
  }

  const dayName = earliestDate.toLocaleDateString('en-GB', {
    timeZone: 'Africa/Nairobi',
    weekday: 'short'
  });

  const formattedTime = formatTime(earliestDate);
  return `Starts ${dayName}: ${formattedTime} EAT`;
}
