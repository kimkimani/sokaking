import { getUpcomingKenyanDate, getDailyKenyanDate } from './jackpotSchedule';

export function getJackpotEarliestTime(fixtures: any[]): Date | null {
  if (!fixtures || fixtures.length === 0) return null;
  const times = fixtures
    .map(f => {
      const val = f.kickoffTime || f.date || f.kickoff_time || f.time;
      const d = val ? new Date(val) : null;
      return d && !isNaN(d.getTime()) ? d.getTime() : null;
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
      const d = val ? new Date(val) : null;
      return d && !isNaN(d.getTime()) ? d.getTime() : null;
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

export function getJackpotStatusDisplay(fixtures: any[]): {
  status: 'upcoming' | 'started' | 'ended';
  label: string;
  badgeText: string;
  badgeClass: string;
} {
  const status = getJackpotStatus(fixtures);
  if (status === 'ended') {
    return {
      status: 'ended',
      label: 'Completed and closed',
      badgeText: 'Completed & Closed',
      badgeClass: 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
    };
  }
  if (status === 'started') {
    return {
      status: 'started',
      label: 'Live In Progress',
      badgeText: 'Live In Progress',
      badgeClass: 'bg-amber-500/15 text-amber-500 border border-amber-500/30 animate-pulse'
    };
  }
  return {
    status: 'upcoming',
    label: 'Open / Not started',
    badgeText: 'Open • Not started',
    badgeClass: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
  };
}

export function getTargetDateForJackpot(jackpotId: string): Date {
  switch (jackpotId) {
    case 'sportpesa-mega':
      return new Date(getUpcomingKenyanDate(6, 16, 30)); // Sat 16:30 EAT
    case 'sportpesa-midweek':
      return new Date(getUpcomingKenyanDate(3, 18, 0));  // Wed 18:00 EAT
    case 'betika-midweek':
      return new Date(getUpcomingKenyanDate(3, 17, 0));  // Wed 17:00 EAT
    case 'mozzart-grand':
    case 'mozzart-super-grand':
    case 'mozzart-super-grand-2026':
      return new Date(getUpcomingKenyanDate(6, 16, 0));  // Sat 16:00 EAT
    case 'mozzart-daily':
    case 'mozzart-super-daily':
      return new Date(getDailyKenyanDate(17, 30));       // Daily 17:30 EAT
    case 'odibet-laki-tatu':
      return new Date(getDailyKenyanDate(18, 0));        // Daily 18:00 EAT
    case 'sportybet-jackpot':
      return new Date(getUpcomingKenyanDate(6, 16, 0));  // Sat 16:00 EAT
    case 'betpawa-pick-jackpot':
      return new Date(getUpcomingKenyanDate(5, 18, 30)); // Fri 18:30 EAT
    default:
      return new Date(getUpcomingKenyanDate(6, 16, 30));
  }
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
  return defaultVal;
}

