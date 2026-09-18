import React, { useState, useEffect, useMemo, memo } from 'react';
import { Clock, Sparkles, Users } from 'lucide-react';
import { Fixture } from '../types';
import { getCachedLiveJackpotFixtures, fetchLiveJackpotFixtures, resolveJackpotId } from '../utils/topJackpotFixtures';
import { jackpotsData } from '../jackpotsData';
import { formatTime, formatMatchDateTime, formatJackpotStartTimeString } from '../utils/timeUtils';

export interface JackpotCountdownTimerProps {
  earliestTime?: number | null;
  latestTime?: number | null;
  hasStarted?: boolean;
  hasEnded?: boolean;
  jackpotId?: string;
  fixtures?: Fixture[];
  nextGameStartTime?: string;
  submissionsFill?: string;
  premiumCount?: string;
  className?: string;
  digitsOnly?: boolean;
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
 * Standalone isolated countdown timer component that displays the complete,
 * authentic live timer bar matching every jackpot page: status badge with sparkles,
 * clock icon, kickoff schedule, live Days : Hours : Mins : Secs counters, and submissions meter.
 */
const JackpotCountdownTimer = memo(function JackpotCountdownTimer({
  earliestTime: propEarliestTime,
  latestTime: propLatestTime,
  hasStarted: propHasStarted,
  hasEnded: propHasEnded,
  jackpotId = 'sportpesa-mega',
  fixtures: propFixtures,
  nextGameStartTime: propNextGameStartTime,
  submissionsFill: propSubmissionsFill,
  premiumCount: propPremiumCount,
  className = '',
  digitsOnly = false
}: JackpotCountdownTimerProps) {
  const resolvedJackpotId = resolveJackpotId(jackpotId, 'sportpesa-mega');
  const [liveDbFixtures, setLiveDbFixtures] = useState<Fixture[] | null>(() => propFixtures || getCachedLiveJackpotFixtures(resolvedJackpotId));

  const jackpotConfig = useMemo(() => {
    return jackpotsData.find(j => j.id === resolvedJackpotId || j.slug === resolvedJackpotId) || jackpotsData[0];
  }, [resolvedJackpotId]);

  const effectiveNextGameStartTime = propNextGameStartTime || jackpotConfig?.nextGameStartTime || 'Starts Saturday: 16:30 EAT (Nairobi)';
  const effectiveSubmissionsFill = propSubmissionsFill || jackpotConfig?.submissionsFill || '84%';
  const effectivePremiumCount = propPremiumCount || jackpotConfig?.premiumCount || '3';

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

  const startsText = useMemo(() => {
    if (hasEnded) {
      return `Completed & closed: ${latestTime ? formatMatchDateTime(new Date(latestTime)) : 'Recently'}`;
    }
    if (hasStarted) {
      return `Live Matches (${earliestTime ? formatTime(new Date(earliestTime)) : ''})`;
    }
    return `Starts: ${earliestTime ? formatJackpotStartTimeString(new Date(earliestTime), effectiveNextGameStartTime) : effectiveNextGameStartTime}`;
  }, [hasEnded, hasStarted, earliestTime, latestTime, effectiveNextGameStartTime]);

  // Digits only mode (minimal inline counter)
  if (digitsOnly) {
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
  }

  // Full Live Jackpot Timer Bar matching every jackpot page exactly
  return (
    <div className={`p-2.5 sm:p-3.5 rounded-[var(--radius)] bg-slate-950 text-white flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5 relative overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.06)] border ${
      hasEnded 
        ? 'border-rose-500/20 shadow-[0_0_15px_rgba(239,68,68,0.06)]' 
        : hasStarted 
          ? 'border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.06)]' 
          : 'border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.06)]'
    } ${className}`}>
      <div className={`absolute -top-16 -left-16 w-24 h-24 rounded-full blur-2xl pointer-events-none ${
        hasEnded ? 'bg-rose-500/5' : hasStarted ? 'bg-amber-500/5' : 'bg-emerald-500/5'
      }`} />
      <div className={`absolute -bottom-16 -right-16 w-24 h-24 rounded-full blur-2xl pointer-events-none ${
        hasEnded ? 'bg-rose-500/5' : hasStarted ? 'bg-amber-500/5' : 'bg-emerald-500/5'
      }`} />

      {/* Left Column */}
      <div className="flex items-center gap-3 z-10 flex-1">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
          hasEnded 
            ? 'bg-rose-500/10 border-rose-500/30' 
            : hasStarted 
              ? 'bg-amber-500/10 border-amber-500/30' 
              : 'bg-emerald-500/10 border-emerald-500/30'
        }`}>
          <Clock className={`w-5 h-5 ${
            hasEnded ? 'text-rose-400' : hasStarted ? 'text-amber-400' : 'text-emerald-400'
          }`} />
        </div>
        <div className="space-y-1 min-w-0 text-left">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1 text-[9.5px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider font-mono ${
              hasEnded 
                ? 'bg-rose-600 text-white' 
                : hasStarted 
                  ? 'bg-amber-400 text-slate-950 font-black' 
                  : 'bg-emerald-400 text-slate-950 font-black'
            }`}>
              <Sparkles className="w-2.5 h-2.5" /> {hasEnded ? 'COMPLETED & CLOSED' : hasStarted ? 'LIVE IN PROGRESS' : 'OPEN • NOT STARTED'}
            </span>
            <span className="text-xs font-black font-mono text-slate-100">
              {hasEnded ? 'Completed and closed' : hasStarted ? 'Jackpot In Progress' : 'Open / Not started'}
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] font-mono font-bold text-slate-200 tracking-tight leading-none truncate">
            {startsText}
          </p>
        </div>
      </div>

      {/* Middle Column: Countdown Timer */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 z-10 self-center md:self-auto font-mono shrink-0 select-none py-1">
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

      {/* Right Column: Submissions Progress Meter */}
      <div className="w-full md:w-52 flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-4 z-10 shrink-0">
        <div className="flex items-center justify-between text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider">
          <div className="flex items-center gap-1 text-slate-100">
            <Users className={`w-3.5 h-3.5 ${hasEnded ? 'text-rose-400' : hasStarted ? 'text-amber-400' : 'text-emerald-400'}`} />
            <span>Submissions</span>
          </div>
          <span className={`${hasEnded ? 'text-rose-300' : hasStarted ? 'text-amber-300' : 'text-emerald-300'} font-black font-mono`}>{effectiveSubmissionsFill} Fill</span>
        </div>
        <div className="w-full h-1.5 bg-slate-900 border border-slate-800 rounded-full overflow-hidden mt-1">
          <div className={`h-full rounded-full transition-all duration-1000 ${
            hasEnded 
              ? 'bg-rose-500 shadow-[0_0_4px_rgba(239,68,68,0.5)]' 
              : hasStarted 
                ? 'bg-amber-500 shadow-[0_0_4px_rgba(245,158,11,0.5)]' 
                : 'bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]'
          }`} style={{ width: effectiveSubmissionsFill }} />
        </div>
        <p className="text-[10.5px] font-bold text-slate-100 tracking-wide uppercase mt-1.5 text-left font-sans leading-tight">
          {effectivePremiumCount} active premium slates locked.
        </p>
      </div>
    </div>
  );
});

export default JackpotCountdownTimer;
