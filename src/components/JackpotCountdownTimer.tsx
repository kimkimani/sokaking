import React, { useState, useEffect, useMemo, memo } from 'react';
import { Fixture } from '../types';
import { getCachedLiveJackpotFixtures, fetchLiveJackpotFixtures, resolveJackpotId } from '../utils/topJackpotFixtures';
import { jackpotsData } from '../jackpotsData';

export interface JackpotCountdownTimerProps {
  earliestTime?: number | null;
  latestTime?: number | null;
  hasStarted?: boolean;
  hasEnded?: boolean;
  jackpotId?: string;
  fixtures?: Fixture[];
  className?: string;
}

/**
 * Calculates the next upcoming kickoff timestamp (in ms) for a given jackpot ID
 * if static database fixtures are absent or in the distant past.
 */
function getNextUpcomingKickoff(jackpotId: string): number {
  const resolved = resolveJackpotId(jackpotId, 'sportpesa-mega');
  const now = new Date();

  // Convert now to EAT (UTC+3)
  const eatNowTime = now.getTime() + (3 * 3600 * 1000);
  const eatNow = new Date(eatNowTime);
  const currentDay = eatNow.getUTCDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat

  let targetDay = 6; // Saturday by default for SportPesa Mega & Mozzart Grand
  let targetHour = 16; // 16:30 EAT
  let targetMinute = 30;

  if (resolved.includes('midweek') || resolved === 'betika-midweek') {
    targetDay = 3; // Wednesday
    targetHour = 17;
    targetMinute = 0;
  } else if (resolved.includes('daily')) {
    // Daily jackpot - today or tomorrow
    targetDay = currentDay;
    targetHour = 17;
    targetMinute = 0;
  }

  let daysAhead = (targetDay - currentDay + 7) % 7;
  // If it's the target day but kickoff has already passed, advance to next week/day
  const currentHour = eatNow.getUTCHours();
  const currentMinute = eatNow.getUTCMinutes();
  if (daysAhead === 0 && (currentHour > targetHour || (currentHour === targetHour && currentMinute >= targetMinute))) {
    daysAhead = resolved.includes('daily') ? 1 : 7;
  }

  const targetDate = new Date(eatNow);
  targetDate.setUTCDate(targetDate.getUTCDate() + daysAhead);
  targetDate.setUTCHours(targetHour, targetMinute, 0, 0);

  // Return UTC timestamp
  return targetDate.getTime() - (3 * 3600 * 1000);
}

/**
 * Standalone isolated countdown timer component that displays the live
 * Days : Hours : Mins : Secs UI blocks.
 */
const JackpotCountdownTimer = memo(function JackpotCountdownTimer({
  earliestTime: propEarliestTime,
  latestTime: propLatestTime,
  hasStarted: propHasStarted,
  hasEnded: propHasEnded,
  jackpotId = 'sportpesa-mega',
  fixtures: propFixtures,
  className = ''
}: JackpotCountdownTimerProps) {
  const resolvedJackpotId = resolveJackpotId(jackpotId, 'sportpesa-mega');
  const [liveDbFixtures, setLiveDbFixtures] = useState<Fixture[] | null>(() => propFixtures || getCachedLiveJackpotFixtures(resolvedJackpotId));

  // If fixtures weren't supplied as props and aren't cached, load from live API
  useEffect(() => {
    if (propEarliestTime != null || (propFixtures && propFixtures.length > 0)) {
      return;
    }
    fetchLiveJackpotFixtures(resolvedJackpotId).then(fetched => {
      if (fetched && fetched.length > 0) {
        setLiveDbFixtures(fetched);
      }
    }).catch(() => {});
  }, [propEarliestTime, propFixtures, resolvedJackpotId]);

  // Compute resolved earliest and latest match times
  const { earliestTime, latestTime } = useMemo(() => {
    if (propEarliestTime != null) {
      return {
        earliestTime: propEarliestTime,
        latestTime: propLatestTime ?? (propEarliestTime + 24 * 3600 * 1000)
      };
    }

    const fixturesToUse = (propFixtures && propFixtures.length > 0)
      ? propFixtures
      : (liveDbFixtures && liveDbFixtures.length > 0)
        ? liveDbFixtures
        : jackpotsData.find(j => j.id === resolvedJackpotId || j.slug === resolvedJackpotId)?.fixtures || [];

    const fixtureTimes = fixturesToUse
      .map(f => {
        const val = f.kickoffTime || f.date || f.time;
        if (!val) return null;
        const d = new Date(val.includes('T') ? val : val.replace(' ', 'T'));
        return d && !isNaN(d.getTime()) ? d.getTime() : null;
      })
      .filter((t): t is number => t !== null && !isNaN(t));

    if (fixtureTimes.length > 0) {
      const minTime = Math.min(...fixtureTimes);
      const maxTime = Math.max(...fixtureTimes);
      const now = Date.now();
      // If the fixture kickoff is in the future or within the last 48 hours, use it
      if (minTime > now - 48 * 3600 * 1000) {
        return { earliestTime: minTime, latestTime: maxTime };
      }
    }

    // Fallback to upcoming scheduled cycle date
    const fallbackKickoff = getNextUpcomingKickoff(resolvedJackpotId);
    return {
      earliestTime: fallbackKickoff,
      latestTime: fallbackKickoff + 24 * 3600 * 1000
    };
  }, [propEarliestTime, propLatestTime, propFixtures, liveDbFixtures, resolvedJackpotId]);

  const [nowTime, setNowTime] = useState(() => Date.now());

  // Check started/ended state every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setNowTime(Date.now());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const hasStarted = propHasStarted !== undefined
    ? propHasStarted
    : earliestTime ? nowTime >= earliestTime : false;

  const hasEnded = propHasEnded !== undefined
    ? propHasEnded
    : latestTime ? nowTime >= latestTime + 2 * 60 * 60 * 1000 : false;

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!earliestTime) return;
    const targetDate = new Date(earliestTime);

    const updateTimer = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [earliestTime]);

  return (
    <div className={`flex items-center justify-center gap-1.5 sm:gap-2 z-10 self-center md:self-auto font-mono shrink-0 select-none py-1 ${className}`}>
      {/* Days */}
      <div className="flex flex-col items-center">
        <div className="w-11 sm:w-12 h-11 bg-slate-900/90 border border-slate-750 rounded-xl flex items-center justify-center font-black text-base sm:text-lg text-white shadow-sm">
          {String(timeLeft.days).padStart(2, '0')}
        </div>
        <span className="text-[9px] font-bold text-slate-300 dark:text-slate-200 mt-1 uppercase tracking-wider">Days</span>
      </div>

      <span className={`${hasEnded ? 'text-rose-400' : hasStarted ? 'text-amber-400' : 'text-emerald-400'} font-black text-sm mb-4 shrink-0`}>:</span>

      {/* Hours */}
      <div className="flex flex-col items-center">
        <div className="w-11 sm:w-12 h-11 bg-slate-900/90 border border-slate-750 rounded-xl flex items-center justify-center font-black text-base sm:text-lg text-white shadow-sm">
          {String(timeLeft.hours).padStart(2, '0')}
        </div>
        <span className="text-[9px] font-bold text-slate-300 dark:text-slate-200 mt-1 uppercase tracking-wider">Hours</span>
      </div>

      <span className={`${hasEnded ? 'text-rose-400' : hasStarted ? 'text-amber-400' : 'text-emerald-400'} font-black text-sm mb-4 shrink-0`}>:</span>

      {/* Minutes */}
      <div className="flex flex-col items-center">
        <div className="w-11 sm:w-12 h-11 bg-slate-900/90 border border-slate-750 rounded-xl flex items-center justify-center font-black text-base sm:text-lg text-white shadow-sm">
          {String(timeLeft.minutes).padStart(2, '0')}
        </div>
        <span className="text-[9px] font-bold text-slate-300 dark:text-slate-200 mt-1 uppercase tracking-wider">Mins</span>
      </div>

      <span className={`${hasEnded ? 'text-rose-400' : hasStarted ? 'text-amber-400' : 'text-emerald-400'} font-black text-sm mb-4 shrink-0`}>:</span>

      {/* Seconds */}
      <div className="flex flex-col items-center">
        <div className={`w-11 sm:w-12 h-11 bg-slate-900 border rounded-xl flex items-center justify-center font-black text-base sm:text-lg ${
          hasEnded 
            ? 'border-rose-500 text-rose-300 shadow-[0_0_8px_rgba(239,68,68,0.3)]' 
            : hasStarted 
              ? 'border-amber-500 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.3)]' 
              : 'border-emerald-500 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
        }`}>
          {String(timeLeft.seconds).padStart(2, '0')}
        </div>
        <span className={`text-[9px] font-bold mt-1 uppercase tracking-wider ${
          hasEnded ? 'text-rose-300' : hasStarted ? 'text-amber-300' : 'text-emerald-300'
        }`}>Secs</span>
      </div>
    </div>
  );
});

export default JackpotCountdownTimer;
