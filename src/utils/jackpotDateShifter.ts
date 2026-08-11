export function getJackpotEarliestTime(fixtures: any[]): Date | null {
  if (!fixtures || fixtures.length === 0) return null;
  const times = fixtures
    .map(f => {
      const val = f.kickoffTime || f.date || f.kickoff_time || f.time;
      return val ? new Date(val).getTime() : null;
    })
    .filter((t): t is number => t !== null && !isNaN(t));
  if (times.length === 0) return null;
  return new Date(Math.min(...times));
}

export function getJackpotLatestTime(fixtures: any[]): Date | null {
  if (!fixtures || fixtures.length === 0) return null;
  const times = fixtures
    .map(f => {
      const val = f.kickoffTime || f.date || f.kickoff_time || f.time;
      return val ? new Date(val).getTime() : null;
    })
    .filter((t): t is number => t !== null && !isNaN(t));
  if (times.length === 0) return null;
  return new Date(Math.max(...times));
}

export function getJackpotStatus(fixtures: any[]): 'upcoming' | 'started' | 'ended' {
  const earliest = getJackpotEarliestTime(fixtures);
  const latest = getJackpotLatestTime(fixtures);
  if (!earliest || !latest) return 'upcoming';

  const now = Date.now();
  // Jackpot has ended if the last match has completed (approx 2 hours after kickoff)
  if (now >= latest.getTime() + 2 * 60 * 60 * 1000) {
    return 'ended';
  }
  // Jackpot has started if the first match has kicked off
  if (now >= earliest.getTime()) {
    return 'started';
  }
  return 'upcoming';
}

export function getTargetDateForJackpot(jackpotId: string, referenceDate?: Date): Date {
  const now = referenceDate || new Date();
  const target = new Date(now);
  target.setSeconds(0);
  target.setMilliseconds(0);

  const getUpcomingDay = (dayOfWeek: number, hour: number, minute: number) => {
    const d = new Date(now);
    const currentDay = d.getDay();
    let daysToAdd = (dayOfWeek - currentDay + 7) % 7;
    if (daysToAdd === 0) {
      const targetUtcHour = hour - 3;
      if (d.getUTCHours() >= targetUtcHour) {
        daysToAdd = 7;
      }
    }
    d.setDate(d.getDate() + daysToAdd);
    d.setUTCHours(hour - 3, minute, 0, 0);
    return d;
  };

  const getPastDay = (dayOfWeek: number, hour: number, minute: number) => {
    const d = new Date(now);
    const currentDay = d.getDay();
    let daysToSubtract = (currentDay - dayOfWeek + 7) % 7;
    if (daysToSubtract === 0) {
      const targetUtcHour = hour - 3;
      if (d.getUTCHours() < targetUtcHour) {
        daysToSubtract = 7;
      }
    }
    d.setDate(d.getDate() - daysToSubtract);
    d.setUTCHours(hour - 3, minute, 0, 0);
    return d;
  };

  switch (jackpotId) {
    case 'sportpesa-mega':
      return getUpcomingDay(6, 16, 30); // Sat 16:30 EAT
    case 'sportpesa-midweek':
      return getUpcomingDay(3, 17, 0); // Wed 17:00 EAT
    case 'betika-grand':
      return getUpcomingDay(0, 14, 0); // Sun 14:00 EAT
    case 'betika-midweek':
      return getPastDay(2, 18, 0); // Past Tue 18:00 EAT (Ended)
    case 'mozzart-super-grand': {
      // Let's make it start exactly 4 hours ago, so it has started but hasn't ended yet
      const start = new Date(now);
      start.setHours(now.getHours() - 4);
      return start;
    }
    case 'mozzart-daily':
    case 'mozzart-super-daily': {
      // Let's make it start exactly 1 hour ago
      const dailyStart = new Date(now);
      dailyStart.setHours(now.getHours() - 1);
      return dailyStart;
    }
    case 'sportybet-jackpot':
      return getUpcomingDay(6, 14, 0); // Sat 14:00 EAT
    case 'betpawa-pick-jackpot':
      return getUpcomingDay(2, 19, 0); // Tue 19:00 EAT
    case 'odibet-laki-tatu':
      return getUpcomingDay(3, 17, 0); // Wed 17:00 EAT
    default:
      return getUpcomingDay(6, 16, 30);
  }
}

export function getShiftedJackpotFixtures(jackpotId: string, originalFixtures: any[], referenceDate?: Date): any[] {
  if (!originalFixtures || originalFixtures.length === 0) return [];
  const now = referenceDate || new Date();

  // Find original earliest time
  const originalTimes = originalFixtures
    .map(f => f.kickoffTime ? new Date(f.kickoffTime).getTime() : null)
    .filter((t): t is number => t !== null && !isNaN(t));

  if (originalTimes.length === 0) return originalFixtures;

  const originalEarliest = Math.min(...originalTimes);
  const targetStart = getTargetDateForJackpot(jackpotId, now);
  const offset = targetStart.getTime() - originalEarliest;

  return originalFixtures.map(f => {
    if (!f.kickoffTime) return f;
    const originalTime = new Date(f.kickoffTime).getTime();
    if (isNaN(originalTime)) return f;
    const shiftedTime = new Date(originalTime + offset);
    return {
      ...f,
      kickoffTime: shiftedTime.toISOString()
    };
  });
}

export function sortJackpotsByStatusAndTime<T extends { fixtures?: any[]; id?: string }>(jackpotsList: T[]): T[] {
  if (!jackpotsList || jackpotsList.length === 0) return [];
  return [...jackpotsList].sort((a, b) => {
    const statusA = getJackpotStatus(a.fixtures || []);
    const statusB = getJackpotStatus(b.fixtures || []);

    const rank = (s: string) => {
      if (s === 'upcoming') return 1; // Open / Upcoming
      if (s === 'started') return 2;  // In-progress / Live
      return 3;                       // Closed / Ended
    };

    const rankA = rank(statusA);
    const rankB = rank(statusB);

    if (rankA !== rankB) {
      return rankA - rankB;
    }

    const timeA = getJackpotEarliestTime(a.fixtures || [])?.getTime() || 0;
    const timeB = getJackpotEarliestTime(b.fixtures || [])?.getTime() || 0;
    return timeA - timeB;
  });
}

export function formatJackpotStartTime(fixtures: any[], defaultVal: string): string {
  const earliest = getJackpotEarliestTime(fixtures);
  const latest = getJackpotLatestTime(fixtures);
  if (!earliest) return defaultVal;

  try {
    const fmt = (d: Date) => d.toLocaleString('en-KE', {
      timeZone: 'Africa/Nairobi',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    const startStr = fmt(earliest);
    const endStr = latest ? fmt(latest) : '';

    if (endStr && startStr !== endStr) {
      return `Start: ${startStr} • End: ${endStr}`;
    }
    return `Starts ${startStr}`;
  } catch (e) {
    return defaultVal;
  }
}
