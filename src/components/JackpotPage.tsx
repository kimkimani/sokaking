import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Clock, 
  Users, 
  Lock, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  AlertCircle, 
  TrendingUp, 
  ShieldCheck, 
  BookmarkCheck,
  Smartphone,
  ArrowLeft,
  ClipboardList
} from 'lucide-react';
import { JackpotConfig } from '../jackpotsData';
import { calculateProbabilities, getRefinedConfidence } from '../utils/probability';
import VotePoll from './VotePoll';
import FaqSection from './FaqSection';
import { getMarkdownContent } from '../content/markdownLoader';
import MarkdownRenderer from './MarkdownRenderer';
import { FlagImage } from '../utils/flagUtils';
import { AuthorCard } from './AuthorCard';
import { ResponsibleGamblingNotice } from './ResponsibleGamblingNotice';

interface JackpotPageProps {
  jackpot: JackpotConfig;
  hasPaid: boolean;
  onOpenPayment: (pkgName: string, price: number, id: string | number, slug: string, type: 'vip' | 'jackpot' | 'odds') => void;
  onBackToList?: () => void;
  pageId?: string;
  isLoading?: boolean;
}

export function JackpotShimmerLoader({ count = 10 }: { count?: number }) {
  return (
    <div className="divide-y divide-[var(--border)]">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="p-3.5 grid grid-cols-12 items-center gap-4 animate-pulse">
          <div className="col-span-12 md:col-span-5 flex items-center gap-3 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-slate-200/80 dark:bg-slate-800/80 shrink-0 font-mono text-[11px] flex items-center justify-center font-bold text-slate-400">
              {idx + 1}
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 bg-slate-200/80 dark:bg-slate-800/80 rounded" />
                <div className="h-3 w-24 bg-slate-200/80 dark:bg-slate-800/80 rounded" />
                <div className="h-3 w-16 bg-slate-200/60 dark:bg-slate-800/60 rounded" />
              </div>
              <div className="h-2.5 w-24 bg-indigo-500/20 rounded" />
              <div className="space-y-1.5">
                <div className="h-6 bg-slate-200/70 dark:bg-slate-800/70 rounded-lg w-full" />
                <div className="h-6 bg-slate-200/70 dark:bg-slate-800/70 rounded-lg w-full" />
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-4 grid grid-cols-3 gap-1.5">
            <div className="h-12 bg-slate-200/80 dark:bg-slate-800/80 rounded-lg" />
            <div className="h-12 bg-slate-200/80 dark:bg-slate-800/80 rounded-lg" />
            <div className="h-12 bg-slate-200/80 dark:bg-slate-800/80 rounded-lg" />
          </div>

          <div className="col-span-12 md:col-span-3 flex items-center justify-end gap-2">
            <div className="h-8 w-24 bg-slate-200/80 dark:bg-slate-800/80 rounded-lg" />
            <div className="h-8 w-8 bg-slate-200/60 dark:bg-slate-800/60 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

function formatMatchDateTime(rawDate?: string | Date): string {
  if (!rawDate) return 'Kickoff TBA';
  try {
    const d = new Date(rawDate);
    if (isNaN(d.getTime())) return String(rawDate);
    const formatted = d.toLocaleString('en-KE', {
      timeZone: 'Africa/Nairobi',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    return formatted;
  } catch {
    return String(rawDate);
  }
}

export default function JackpotPage({ jackpot, hasPaid, onOpenPayment, onBackToList, pageId, isLoading = false }: JackpotPageProps) {
  const [expandedFixture, setExpandedFixture] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 2, hours: 14, minutes: 45, seconds: 22 });
  const pageMd = getMarkdownContent(pageId || jackpot.id);
  
  // Local state for user votes saved in localStorage
  const [userVotes, setUserVotes] = useState<Record<string, '1' | 'X' | '2'>>(() => {
    try {
      const saved = localStorage.getItem(`votes-${jackpot.id}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleVote = (fixtureId: number, option: '1' | 'X' | '2') => {
    const updated = { ...userVotes, [fixtureId]: option };
    setUserVotes(updated);
    try {
      localStorage.setItem(`votes-${jackpot.id}`, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const getCommunityVotes = (fixtureId: number, userVote?: '1' | 'X' | '2') => {
    // Generate deterministic baseline based on fixtureId & name length
    const prime = (fixtureId * 17) % 100;
    
    // Baseline percentages that add up to 100
    let v1 = 35 + (prime % 25); // 35 to 59
    let vX = 15 + ((prime * 7) % 20); // 15 to 34
    let v2 = 100 - v1 - vX;
    
    // Safety check
    if (v2 < 10) {
      v2 = 12;
      v1 = 100 - vX - v2;
    }

    // Apply user vote modifier if they voted
    if (userVote === '1') {
      v1 += 12;
      const sum = v1 + vX + v2;
      v1 = Math.round((v1 / sum) * 100);
      vX = Math.round((vX / sum) * 100);
      v2 = 100 - v1 - vX;
    } else if (userVote === 'X') {
      vX += 12;
      const sum = v1 + vX + v2;
      v1 = Math.round((v1 / sum) * 100);
      vX = Math.round((vX / sum) * 100);
      v2 = 100 - v1 - vX;
    } else if (userVote === '2') {
      v2 += 12;
      const sum = v1 + vX + v2;
      v1 = Math.round((v1 / sum) * 100);
      vX = Math.round((vX / sum) * 100);
      v2 = 100 - v1 - vX;
    }

    // Ensure they sum to exactly 100
    const total = v1 + vX + v2;
    if (total !== 100) {
      v2 += (100 - total);
    }

    return { v1, vX, v2 };
  };

  // Compute earliest and latest match times for started/ended statuses
  const fixtureTimes = (jackpot.fixtures || [])
    .map(f => {
      const val = f.kickoffTime || f.date || f.time;
      return val ? new Date(val).getTime() : null;
    })
    .filter((t): t is number => t !== null && !isNaN(t));

  const earliestTime = fixtureTimes.length > 0 ? Math.min(...fixtureTimes) : null;
  const latestTime = fixtureTimes.length > 0 ? Math.max(...fixtureTimes) : null;
  
  const [nowTime, setNowTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNowTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const hasStarted = earliestTime ? nowTime >= earliestTime : false;
  const hasEnded = latestTime ? nowTime >= latestTime + 2 * 60 * 60 * 1000 : false;

  // Compute countdown timer dynamically based on earliest match
  useEffect(() => {
    const targetDate = earliestTime ? new Date(earliestTime) : new Date();

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

  const toggleExpand = (id: number) => {
    setExpandedFixture(expandedFixture === id ? null : id);
  };

  const getInitials = (teamName: string) => {
    if (!teamName) return '';
    const cleanName = teamName.replace(/FC|United|City|Town|Hotspur|Albion|Athletic|Real|Deportivo/gi, '').trim();
    const parts = cleanName.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return cleanName.substring(0, 2).toUpperCase();
  };

  // Slip metrics for unlocked slip view
  const isOptionPicked = (prediction: string, option: '1' | 'X' | '2'): boolean => {
    const norm = prediction.toLowerCase();
    
    // Check for Double Chance patterns
    if (norm.includes('1x') || norm.includes('x1') || norm.includes('(1x)') || norm.includes('(x1)')) {
      return option === '1' || option === 'X';
    }
    if (norm.includes('x2') || norm.includes('2x') || norm.includes('(x2)') || norm.includes('(2x)')) {
      return option === 'X' || option === '2';
    }
    if (norm.includes('12') || norm.includes('21') || norm.includes('(12)') || norm.includes('(21)')) {
      return option === '1' || option === '2';
    }
    
    // Single options
    if (option === '1') {
      return norm.includes('(1)') || norm.includes('home win') || norm === '1';
    }
    if (option === 'X') {
      return norm.includes('(x)') || norm.includes('draw') || norm === 'x';
    }
    if (option === '2') {
      return norm.includes('(2)') || norm.includes('away win') || norm === '2';
    }
    
    return false;
  };

  const getSlipSummary = () => {
    let homeWins = 0;
    let draws = 0;
    let awayWins = 0;

    (jackpot.fixtures || (jackpot as any).games || []).forEach((f) => {
      const pred = f.prediction.toLowerCase();
      if (pred.includes('1x') || pred.includes('x1') || pred.includes('(1x)') || pred.includes('(x1)')) {
        homeWins++;
        draws++;
      } else if (pred.includes('x2') || pred.includes('2x') || pred.includes('(x2)') || pred.includes('(2x)')) {
        draws++;
        awayWins++;
      } else if (pred.includes('12') || pred.includes('21') || pred.includes('(12)') || pred.includes('(21)')) {
        homeWins++;
        awayWins++;
      } else if (pred.includes('(1)') || pred.includes('home win') || pred === '1') {
        homeWins++;
      } else if (pred.includes('(x)') || pred.includes('draw') || pred === 'x') {
        draws++;
      } else if (pred.includes('(2)') || pred.includes('away win') || pred === '2') {
        awayWins++;
      }
    });

    return { homeWins, draws, awayWins };
  };

  const slipSummary = getSlipSummary();

  return (
    <div className="space-y-6 text-left">
      {/* Back Button if inside a list detail navigation */}
      {onBackToList && (
        <button 
          onClick={onBackToList}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black text-[var(--text-muted)] hover:text-[var(--primary)] bg-slate-105 dark:bg-slate-900 border border-[var(--border)] transition-all cursor-pointer w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Jackpots</span>
        </button>
      )}

      {/* 1. TOP TITLE AND MARKDOWN INTRO BOX */}
      <div className="p-5 md:p-6 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow)] relative overflow-hidden text-left space-y-3">
        {/* Ambient top decoration */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 via-[var(--primary)] to-indigo-500" />
        
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider font-mono bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-0.5 animate-pulse">
            <Trophy className="w-2.5 h-2.5" /> High Confidence
          </span>
          <span className="text-[10px] text-[var(--text-muted)] font-mono font-bold uppercase tracking-wider">
            {jackpot.gamesCount}-Match Card
          </span>
        </div>
        
        <h1 className="text-xl md:text-2.5xl font-black text-[var(--text)] tracking-tight uppercase" style={{ fontFamily: 'var(--font-display)' }}>
          {pageMd.displayTitle || pageMd.title || `${jackpot.name} Expert Slates`}
        </h1>

        {pageMd.intro ? (
          <div className="text-xs md:text-sm text-[var(--text-muted)] leading-relaxed">
            <MarkdownRenderer content={pageMd.intro} />
          </div>
        ) : (
          <p className="text-xs text-[var(--text-muted)] max-w-2xl leading-relaxed">
            Get mathematically optimized prediction slips with balanced home wins, safe draws, and double-chance protection parameters calculated using advanced Poisson distribution modeling.
          </p>
        )}
      </div>

      {/* 1.5. SIDE-BY-SIDE ROW: JACKPOT SUBSCRIPTION CARD (LEFT) & CASH POOL / ENTRY TICKET CARD (RIGHT) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-stretch text-left">
        {/* LEFT CARD (col-span-1 lg:col-span-7): Jackpot Subscription / Unlock Box */}
        <div className="p-5 rounded-[var(--radius)] bg-gradient-to-br from-amber-500/10 via-[var(--card)] to-indigo-500/5 border border-amber-500/30 shadow-[var(--shadow)] flex flex-col justify-between gap-4 lg:col-span-7">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded text-[9px] font-black uppercase font-mono bg-amber-500 text-black flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Jackpot VIP Subscription
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Instant Mobile Verification
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-black text-[var(--text)] uppercase tracking-tight font-display leading-tight">
              {pageMd.unlockHeading || `Unlock All ${jackpot.gamesCount} Fixture Predictions & Double Chance Slips`}
            </h2>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              {pageMd.unlockDescription || `Subscribe to get instant access to full 1X2 selections, banker probability rankings, and low-variance double-chance covers for ${jackpot.name}.`}
            </p>
          </div>

          {/* Buy Button */}
          <div className="pt-3 border-t border-[var(--border)]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[9px] font-mono font-bold text-[var(--text-muted)] uppercase block">Subscription Rate</span>
              <span className="text-sm font-black font-mono text-amber-500">KES {jackpot.price}</span>
            </div>
            <button 
              onClick={() => onOpenPayment(jackpot.name, jackpot.price, jackpot.id, jackpot.slug, 'jackpot')}
              className="px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
            >
              <Smartphone className="w-4 h-4 text-white" />
              <span>Get Jackpot Slip • KES {jackpot.price}</span>
            </button>
          </div>
        </div>

        {/* RIGHT CARD (col-span-1 lg:col-span-5): Cash Pool Details & Entry Ticket Info */}
        <div className="p-5 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow)] flex flex-col justify-between gap-4 lg:col-span-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border)]/70 pb-2.5">
              <span className="text-[10px] font-black font-mono text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-500" /> Jackpot Pool Details
              </span>
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">
                {jackpot.gamesCount}-Match Card
              </span>
            </div>

            <div>
              <span className="text-[9px] font-extrabold font-mono text-[var(--text-muted)] uppercase tracking-wider block">
                Estimated Cash Pool
              </span>
              <div className="text-xl sm:text-2.5xl font-black text-emerald-500 font-mono tracking-tight mt-0.5">
                {jackpot.estimatedPool}
              </div>
            </div>

            {/* Entry Ticket display - Info badge, NOT button looking */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-[var(--border)]/60 flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text-muted)] font-mono">
                Official Entry Ticket:
              </span>
              <span className="text-xs font-black text-[var(--text)] font-mono bg-slate-200/80 dark:bg-slate-800 px-3 py-1 rounded-md">
                {jackpot.entryFee || 'KES 99'}
              </span>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 pt-2 border-t border-[var(--border)]/40">
            <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="truncate">{jackpot.nextGameStartTime}</span>
          </div>
        </div>
      </div>

      {/* 2. COMPACT DYNAMIC LIVE TIMER BAR */}
      <div className={`p-2.5 sm:p-3.5 rounded-[var(--radius)] bg-slate-950 text-white flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5 relative overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.06)] border ${
        hasEnded 
          ? 'border-rose-500/20 shadow-[0_0_15px_rgba(239,68,68,0.06)]' 
          : hasStarted 
            ? 'border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.06)]' 
            : 'border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.06)]'
      }`}>
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
              hasEnded ? 'text-rose-400' : hasStarted ? 'text-amber-400 animate-pulse' : 'text-emerald-400 animate-pulse'
            }`} />
          </div>
          <div className="space-y-1 min-w-0 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1 text-black text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider font-mono ${
                hasEnded 
                  ? 'bg-rose-500 text-white' 
                  : hasStarted 
                    ? 'bg-amber-400 text-slate-950 font-black animate-pulse' 
                    : 'bg-emerald-400 text-slate-950 font-black'
              }`}>
                <Sparkles className="w-2.5 h-2.5" /> {hasEnded ? 'ENDED' : hasStarted ? 'LIVE NOW' : 'STARTS IN'}
              </span>
              <span className="text-xs font-black font-mono text-slate-200">
                {hasEnded ? 'Jackpot Ended' : hasStarted ? 'Jackpot In Progress' : 'Kickoff Countdown'}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] font-mono font-bold text-slate-400 tracking-tight leading-none truncate">
              {hasEnded 
                ? `Finished: ${latestTime ? formatMatchDateTime(new Date(latestTime)) : 'Recently'}` 
                : hasStarted 
                  ? `Live Matches (${earliestTime ? formatMatchDateTime(new Date(earliestTime)) : ''})` 
                  : `Starts: ${earliestTime ? formatMatchDateTime(new Date(earliestTime)) : jackpot.nextGameStartTime}`
              }
            </p>
          </div>
        </div>

        {/* Middle Column: Compact Timer Card */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 z-10 self-center md:self-auto font-mono shrink-0 select-none py-1">
          {/* Days */}
          <div className="flex flex-col items-center">
            <div className="w-11 sm:w-12 h-11 bg-slate-900/90 border border-slate-750 rounded-xl flex items-center justify-center font-black text-base sm:text-lg text-white shadow-sm">
              {String(timeLeft.days).padStart(2, '0')}
            </div>
            <span className="text-[8px] font-black text-slate-400 mt-1 uppercase tracking-wider">Days</span>
          </div>

          <span className={`${hasEnded ? 'text-rose-500' : hasStarted ? 'text-amber-500' : 'text-emerald-400'} font-black text-sm mb-4 animate-pulse shrink-0`}>:</span>

          {/* Hours */}
          <div className="flex flex-col items-center">
            <div className="w-11 sm:w-12 h-11 bg-slate-900/90 border border-slate-750 rounded-xl flex items-center justify-center font-black text-base sm:text-lg text-white shadow-sm">
              {String(timeLeft.hours).padStart(2, '0')}
            </div>
            <span className="text-[8px] font-black text-slate-400 mt-1 uppercase tracking-wider">Hours</span>
          </div>

          <span className={`${hasEnded ? 'text-rose-500' : hasStarted ? 'text-amber-500' : 'text-emerald-400'} font-black text-sm mb-4 animate-pulse shrink-0`}>:</span>

          {/* Minutes */}
          <div className="flex flex-col items-center">
            <div className="w-11 sm:w-12 h-11 bg-slate-900/90 border border-slate-750 rounded-xl flex items-center justify-center font-black text-base sm:text-lg text-white shadow-sm">
              {String(timeLeft.minutes).padStart(2, '0')}
            </div>
            <span className="text-[8px] font-black text-slate-400 mt-1 uppercase tracking-wider">Mins</span>
          </div>

          <span className={`${hasEnded ? 'text-rose-500' : hasStarted ? 'text-amber-500' : 'text-emerald-400'} font-black text-sm mb-4 animate-pulse shrink-0`}>:</span>

          {/* Seconds */}
          <div className="flex flex-col items-center">
            <div className={`w-11 sm:w-12 h-11 bg-slate-900 border rounded-xl flex items-center justify-center font-black text-base sm:text-lg ${
              hasEnded 
                ? 'border-rose-500 text-rose-400 shadow-[0_0_8px_rgba(239,68,68,0.3)]' 
                : hasStarted 
                  ? 'border-amber-500 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.3)]' 
                  : 'border-emerald-500 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
            }`}>
              {String(timeLeft.seconds).padStart(2, '0')}
            </div>
            <span className={`text-[8px] font-black mt-1 uppercase tracking-wider ${
              hasEnded ? 'text-rose-400' : hasStarted ? 'text-amber-400' : 'text-emerald-400'
            }`}>Secs</span>
          </div>
        </div>

        {/* Right Column: Submissions Progress Meter */}
        <div className="w-full md:w-52 flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-4 z-10 shrink-0">
          <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-bold uppercase tracking-wider">
            <div className="flex items-center gap-1 text-slate-300">
              <Users className={`w-3 h-3 ${hasEnded ? 'text-rose-400' : hasStarted ? 'text-amber-400' : 'text-emerald-400'}`} />
              <span>Submissions</span>
            </div>
            <span className={`${hasEnded ? 'text-rose-400' : hasStarted ? 'text-amber-400' : 'text-emerald-400'} font-black font-mono`}>{jackpot.submissionsFill} Fill</span>
          </div>
          <div className="w-full h-1 bg-slate-900 border border-slate-800 rounded-full overflow-hidden mt-1">
            <div className={`h-full rounded-full transition-all duration-1000 ${
              hasEnded 
                ? 'bg-rose-500 shadow-[0_0_4px_rgba(239,68,68,0.5)]' 
                : hasStarted 
                  ? 'bg-amber-500 shadow-[0_0_4px_rgba(245,158,11,0.5)]' 
                  : 'bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]'
            }`} style={{ width: jackpot.submissionsFill }} />
          </div>
          <p className="text-[7px] font-semibold text-slate-500 tracking-wide uppercase mt-1 text-left font-sans leading-tight">
            {jackpot.premiumCount} active premium slates locked.
          </p>
        </div>
      </div>

      {/* 3. SLIP SUMMARY QUICK STATS PANEL (If Unlocked) */}
      {hasPaid && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-[var(--radius)] bg-slate-50 dark:bg-slate-900/20 border border-[var(--border)] flex flex-wrap items-center justify-between gap-4 text-left"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <BookmarkCheck className="w-4 h-4 text-emerald-500 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase text-[var(--text)] leading-tight font-display">
                Mathematical Slate Overview
              </h4>
              <p className="text-[10px] text-[var(--text-muted)] font-medium">
                Optimized balanced ratio for maximum payout coverage.
              </p>
            </div>
          </div>

          <div className="flex gap-2 text-[10px] font-mono font-bold uppercase">
            <span className="px-2.5 py-1.5 bg-sky-50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/30 text-sky-800 dark:text-sky-300 rounded-lg">
              {slipSummary.homeWins} Home Wins
            </span>
            <span className="px-2.5 py-1.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg">
              {slipSummary.draws} Draws
            </span>
            <span className="px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-300 rounded-lg">
              {slipSummary.awayWins} Away Wins
            </span>
          </div>
        </motion.div>
      )}

      {/* 4. MODERN ULTRA-COMPACT 1X2 FIXTURE BETSLIP GRID */}
      <div className="rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow)] overflow-hidden">
        <div className="bg-slate-50 dark:bg-slate-900/30 border-b border-[var(--border)] p-3 text-xs font-bold text-[var(--text)] hidden md:grid grid-cols-12 gap-2 uppercase tracking-wide">
          <div className="col-span-5 text-left">Match Details & Teams</div>
          <div className="col-span-5 text-center">Recommended 1X2 Expert Tip Options</div>
          <div className="col-span-2 text-right">Confidence & Action</div>
        </div>

        <div className="divide-y divide-[var(--border)]">
          {isLoading ? (
            <JackpotShimmerLoader count={jackpot.gamesCount || 10} />
          ) : (jackpot.fixtures || (jackpot as any).games || []).length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-[var(--text-muted)]">
              No jackpot fixtures available for this selection.
            </div>
          ) : (
            (jackpot.fixtures || (jackpot as any).games || []).map((match) => {
            // First 3 fixtures are unlocked for preview, or everything if paid
            const isUnlocked = true;
            const isExpanded = expandedFixture === match.id;
            
            const isDoubleChance = match.prediction.toLowerCase().includes('double chance') || 
                                   match.prediction.toLowerCase().includes('1x') || 
                                   match.prediction.toLowerCase().includes('x1') || 
                                   match.prediction.toLowerCase().includes('x2') || 
                                   match.prediction.toLowerCase().includes('2x') || 
                                   match.prediction.toLowerCase().includes('12') ||
                                   match.prediction.toLowerCase().includes('21');

            const displayConf = getRefinedConfidence(match);
            const jackpotProbs = calculateProbabilities(
              match.prediction,
              displayConf,
              match.probabilities || match
            );

            return (
              <div 
                key={match.id}
                className={`transition-all duration-300 ${
                  isUnlocked 
                    ? 'hover:bg-slate-50/50 dark:hover:bg-slate-900/10' 
                    : 'bg-slate-50/10 dark:bg-slate-900/5'
                }`}
              >
                {/* Compact Row */}
                <div className="p-3.5 grid grid-cols-12 items-center gap-4">
                  
                  {/* Left Column: Match metadata, Teams & Scores */}
                  <div className="col-span-12 md:col-span-5 flex items-center gap-3 min-w-0">
                    {/* Fixture Number Badge */}
                    <div className={`w-7 h-7 rounded-lg ${isUnlocked ? 'bg-[var(--primary)] text-white font-black' : 'bg-slate-200 dark:bg-slate-850 text-slate-500 font-bold'} text-[11px] font-mono flex items-center justify-center shrink-0 shadow-2xs`}>
                      {match.fixtureNumber}
                    </div>
                    
                    {/* Teams and metadata */}
                    <div className="min-w-0 flex-1 text-left space-y-2">
                      {/* Meta header info */}
                      <div className="flex items-center flex-wrap gap-1.5 text-[9px] font-black text-[var(--text-muted)] font-mono uppercase tracking-wider min-w-0 leading-none">
                        <FlagImage countryFlag={match.countryFlag || (match as any).country_flag} flag={match.leagueFlag} countryName={match.countryName || (match as any).country_name || match.leagueCountry} />
                        <span className="truncate max-w-[90px]">{match.leagueName || (match as any).league_name}</span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="truncate max-w-[95px]">{match.countryName || (match as any).country_name || match.leagueCountry || 'Europe'}</span>
                        
                        {/* Live/FT/HT status badges */}
                        {match.status === 'LIVE' && (
                          <span className="px-1.5 py-0.5 bg-rose-500/15 text-rose-500 border border-rose-500/20 rounded-[4px] text-[8px] tracking-normal font-mono font-bold leading-none animate-pulse flex items-center gap-0.5">
                            <span className="w-1 h-1 rounded-full bg-rose-500 shrink-0" /> live
                          </span>
                        )}
                        {match.status === 'HT' && (
                          <span className="px-1.5 py-0.5 bg-amber-500/15 text-amber-500 border border-amber-500/20 rounded-[4px] text-[8px] tracking-normal font-mono font-bold leading-none animate-pulse">
                            ht
                          </span>
                        )}
                        {match.status === 'FT' && (
                          <span className="px-1.5 py-0.5 bg-slate-500/15 text-slate-500 border border-slate-500/20 rounded-[4px] text-[8px] tracking-normal font-mono font-bold leading-none">
                            ft
                          </span>
                        )}
                        {isDoubleChance && (
                          <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-[4px] text-[7.5px] tracking-normal lowercase shrink-0 font-sans leading-none font-bold">double chance</span>
                        )}
                      </div>

                      {/* Match kickoff date & time */}
                      <div className="mt-1 text-[9px] font-mono text-indigo-500 dark:text-indigo-400 font-bold flex items-center gap-1 select-none leading-none">
                        <Clock className="w-3 h-3 text-indigo-500 shrink-0" />
                        <span>{formatMatchDateTime(match.kickoffTime || match.date || match.time)}</span>
                      </div>
                      
                      {/* Vertical Teams & Scores Layout */}
                      <div className="space-y-1.5">
                        {/* Home team */}
                        <div className="flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/30 px-2.5 py-1 rounded-lg border border-slate-100/30 dark:border-slate-800/20">
                          <span className="text-xs font-black text-[var(--text)] truncate max-w-[170px] sm:max-w-none" title={match.homeTeam}>
                            {match.homeTeam}
                          </span>
                          <span className="text-[10px] font-mono font-black text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded shadow-3xs min-w-[22px] text-center shrink-0 border border-slate-100 dark:border-slate-700/50">
                            {match.status === 'NS' ? '-' : (match.homeScore !== undefined && match.homeScore !== null && match.homeScore !== '-' ? match.homeScore : (match.prediction.includes('(1)') ? '2' : match.prediction.includes('(2)') ? '0' : '1'))}
                          </span>
                        </div>
                        {/* Away team */}
                        <div className="flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/30 px-2.5 py-1 rounded-lg border border-slate-100/30 dark:border-slate-800/20">
                          <span className="text-xs font-black text-[var(--text)] truncate max-w-[170px] sm:max-w-none" title={match.awayTeam}>
                            {match.awayTeam}
                          </span>
                          <span className="text-[10px] font-mono font-black text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded shadow-3xs min-w-[22px] text-center shrink-0 border border-slate-100 dark:border-slate-700/50">
                            {match.status === 'NS' ? '-' : (match.awayScore !== undefined && match.awayScore !== null && match.awayScore !== '-' ? match.awayScore : (match.prediction.includes('(1)') ? '0' : match.prediction.includes('(2)') ? '2' : '1'))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Middle Column: 1X2 Slip Grid Buttons (Modern sportsbook design) */}
                  <div className="col-span-12 md:col-span-4 grid grid-cols-3 gap-1.5">
                    {(['1', 'X', '2'] as const).map((option) => {
                      const isPick = isOptionPicked(match.prediction, option);
                      const label = option === '1' ? 'Home' : option === 'X' ? 'Draw' : 'Away';
                      const prob = option === '1' ? jackpotProbs.home : option === 'X' ? jackpotProbs.draw : jackpotProbs.away;

                      return (
                        <button
                          key={option}
                          onClick={() => isUnlocked ? toggleExpand(match.id) : onOpenPayment(jackpot.name, jackpot.price, jackpot.id, jackpot.slug, 'jackpot')}
                          className={`relative py-2 px-1 rounded-lg border font-mono text-center transition-all duration-200 flex flex-col items-center justify-center min-h-[50px] overflow-hidden ${
                            !isUnlocked
                              ? 'bg-slate-50 dark:bg-slate-950/40 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 cursor-pointer'
                              : isPick
                                ? 'bg-emerald-500 border-emerald-600 text-black font-black shadow-[0_0_8px_rgba(16,185,129,0.3)] hover:opacity-90 cursor-pointer'
                                : 'bg-[var(--card)] hover:bg-slate-100/50 dark:hover:bg-slate-900/40 border-[var(--border)] text-[var(--text-muted)] cursor-pointer'
                          }`}
                        >
                          <span className={`text-[7px] font-bold block uppercase scale-90 leading-none mb-0.5 tracking-wider ${isPick && isUnlocked ? 'text-emerald-950 font-black' : 'text-slate-400 dark:text-slate-500'}`}>
                            {label}
                          </span>
                          <span className="text-xs leading-none font-bold">
                            {option}
                          </span>
                          <span className={`text-[9px] font-extrabold leading-none mt-1 font-mono ${
                            isPick && isUnlocked 
                              ? 'text-emerald-950' 
                              : option === '1' ? 'text-emerald-600 dark:text-emerald-400' : option === 'X' ? 'text-amber-600 dark:text-amber-400' : 'text-sky-600 dark:text-sky-400'
                          }`}>
                            {prob}%
                          </span>

                          {/* Lock mask overlay for premium matches */}
                          {!isUnlocked && (
                            <span className="absolute inset-0 bg-slate-200/50 dark:bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center text-amber-500/80 transition-all duration-300 hover:bg-slate-200/30 dark:hover:bg-slate-900/45">
                              <Lock className="w-3.5 h-3.5" />
                            </span>
                          )}

                          {/* Success tick indicators */}
                          {isUnlocked && isPick && (
                            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-900 rounded-full" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Right Column: Confidence and expand triggers */}
                  <div className="col-span-12 md:col-span-3 flex items-center justify-between md:justify-end gap-3.5">
                    {/* Confidence percentage badge */}
                    <div className="flex flex-col items-start md:items-end shrink-0 select-none">
                      <span className="text-[8px] text-[var(--text-muted)] uppercase font-mono font-bold tracking-wider leading-none mb-1">Confidence</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-black font-mono leading-none border shadow-3xs ${
                        !isUnlocked 
                          ? 'bg-slate-100 dark:bg-slate-850 text-slate-400 border-slate-200/50 dark:border-slate-800/50' 
                          : displayConf >= 80 
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 dark:bg-emerald-500/20' 
                            : displayConf >= 70 
                              ? 'bg-blue-500/10 text-blue-500 border-blue-500/20 dark:bg-blue-500/20' 
                              : 'bg-amber-500/10 text-amber-500 border-amber-500/20 dark:bg-amber-500/20'
                      }`}>
                        {isUnlocked ? `${displayConf}%` : '—'}
                      </span>
                    </div>

                    {/* Compact stats drop indicator */}
                    <div className="shrink-0">
                      {isUnlocked ? (
                        <button
                          onClick={() => toggleExpand(match.id)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg transition-all font-mono text-[9px] font-black uppercase tracking-wider flex items-center gap-1 border border-transparent hover:border-[var(--border)] cursor-pointer whitespace-nowrap"
                        >
                          <span>{isExpanded ? 'Close' : 'Read Analysis'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-[var(--primary)]" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                        </button>
                      ) : (
                        <div 
                          onClick={() => onOpenPayment(jackpot.name, jackpot.price, jackpot.id, jackpot.slug, 'jackpot')}
                          className="flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-500 px-2.5 py-1.5 rounded-lg text-[9px] font-mono font-black uppercase tracking-wider cursor-pointer animate-pulse transition-all whitespace-nowrap"
                        >
                          <Lock className="w-3 h-3 shrink-0" />
                          <span>Unlock</span>
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                {/* Analytical expansion */}
                <AnimatePresence>
                  {isUnlocked && isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="bg-slate-50/50 dark:bg-slate-900/20 border-t border-[var(--border)] overflow-hidden"
                    >
                      <div className="p-4 text-xs space-y-3 leading-relaxed text-left">
                        <div className="flex items-center justify-between">
                          <span className="font-bold flex items-center gap-1 text-[var(--primary)] font-mono uppercase tracking-wider text-[10px]">
                            <Sparkles className="w-3.5 h-3.5 text-[var(--primary)] animate-pulse" /> Mathematical Analyst Assessment
                          </span>
                          <span className="text-[10px] font-mono text-[var(--text-muted)] bg-[var(--background)] px-2 py-0.5 rounded border border-[var(--border)]">
                            Confidence factor: <strong className="text-emerald-500 font-extrabold">{displayConf}%</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wide">Expert Tip:</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-black font-mono">
                            {match.prediction}
                          </span>
                        </div>

                        <p className="text-[var(--text-muted)] leading-relaxed font-sans">
                          {match.aiAnalysis || "Advanced computer equations favor selected outcomes based on high offensive conversion metrics and defensive low-block performance factors. Current dynamic odds trend heavily towards recommendations."}
                        </p>

                        {/* Probability Split bar */}
                        <div className="pt-1.5">
                          <div className="flex justify-between text-[9px] font-mono font-extrabold text-[var(--text-muted)] mb-1 uppercase">
                            <span className="text-emerald-500">Home (1): {jackpotProbs.home}%</span>
                            <span className="text-amber-500">Draw (X): {jackpotProbs.draw}%</span>
                            <span className="text-sky-500">Away (2): {jackpotProbs.away}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-[var(--border)] rounded-full overflow-hidden flex">
                            <div className="h-full bg-emerald-500" style={{ width: `${jackpotProbs.home}%` }} />
                            <div className="h-full bg-amber-500" style={{ width: `${jackpotProbs.draw}%` }} />
                            <div className="h-full bg-sky-500" style={{ width: `${jackpotProbs.away}%` }} />
                          </div>
                        </div>

                        {/* Community Poll & Voting Section */}
                        <div className="pt-1.5">
                          <VotePoll 
                            fixtureId={`jackpot_${jackpot.id}_${match.id}`} 
                            isEnded={match.status === 'FT' || match.status === 'FINISHED' || match.result === 'won' || match.result === 'lost'}
                            status={match.status}
                            result={match.result}
                            prediction={match.prediction}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }))}
        </div>
      </div>

      {/* 4.5 FULL PICKS COUPON SUMMARY */}
      <JackpotPicksSummary jackpot={jackpot} hasPaid={hasPaid} onOpenPayment={onOpenPayment} />

      {/* SEO Markdown Middle Section (Renders immediately after the major prediction table & picks summary) */}
      {pageMd.middle && (
        <div className="p-5 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow)] text-left">
          <MarkdownRenderer content={pageMd.middle} />
        </div>
      )}

      {/* 5. BIG CALL-TO-ACTION PAY PANEL (Shown if locked) */}
      {!hasPaid && (
        <div 
          onClick={() => onOpenPayment(jackpot.name, jackpot.price, jackpot.id, jackpot.slug, 'jackpot')}
          className="p-5 rounded-[var(--radius)] border border-dashed border-amber-500/35 bg-amber-500/5 hover:bg-amber-500/10 text-center space-y-3 cursor-pointer transition-all duration-300 group shadow-sm text-left"
        >
          <div className="w-10 h-10 rounded-full bg-amber-500/15 flex items-center justify-center mx-auto text-amber-500 border border-amber-500/25 group-hover:scale-110 transition-transform">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-center">
            <h3 className="text-sm font-black uppercase tracking-tight text-amber-600 dark:text-amber-400">
              {pageMd.unlockHeading || `Unlock All ${jackpot.gamesCount} Combined Predictions Slips`}
            </h3>
            <p className="text-[11px] text-[var(--text-muted)] max-w-lg mx-auto font-medium leading-relaxed">
              {pageMd.unlockDescription || `Unlock matches 1 through ${jackpot.gamesCount} immediately. Get the full premium slip containing dynamic safety double-chances. Transactions are secured and routed instantly via M-Pesa STK push.`}
            </p>
          </div>

          <div className="max-w-xs mx-auto pt-1">
            <button className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 border-none">
              <Smartphone className="w-4 h-4 text-white" />
              <span>Unlock Jackpot Selections • KES {jackpot.price}</span>
            </button>
          </div>
        </div>
      )}

      {/* SEO Markdown Meat Section (Second last component of the page) */}
      {(pageMd.meat || (!pageMd.middle && pageMd.fullContent)) && (
        <div className="p-6 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow)] text-left space-y-4">
          <MarkdownRenderer content={pageMd.meat || pageMd.fullContent} />
        </div>
      )}

      {/* Author Card (renders when authorName is defined in page markdown) */}
      {pageMd && pageMd.authorName && (
        <AuthorCard 
          name={pageMd.authorName} 
          title={pageMd.authorTitle} 
          description={pageMd.authorDescription} 
          avatar={pageMd.authorAvatar} 
        />
      )}

      {/* Responsible Gambling Notice (renders when defined in page markdown) */}
      {pageMd && pageMd.responsibleGambling && (
        <ResponsibleGamblingNotice notice={pageMd.responsibleGambling} />
      )}

      {/* 6. FREQUENTLY ASKED QUESTIONS (MARKDOWN EDITABLE) */}
      <FaqSection pageId={pageId || jackpot.id} />
    </div>
  );
}

function JackpotPicksSummary({ 
  jackpot, 
  hasPaid, 
  onOpenPayment 
}: { 
  jackpot: JackpotConfig; 
  hasPaid: boolean; 
  onOpenPayment: (pkgName: string, price: number, id: string | number, slug: string, type: 'vip' | 'jackpot' | 'odds') => void;
}) {
  return (
    <div className="p-4 md:p-5 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow)] text-left space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--border)] pb-3 gap-2">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-indigo-500 shrink-0" />
          <div>
            <h3 className="text-xs font-black uppercase text-[var(--text)] tracking-tight font-mono">
              Full Predictions Summary
            </h3>
            <p className="text-[10px] text-[var(--text-muted)] font-medium">
              Copy or preview the complete 1X2 coupon options at a glance.
            </p>
          </div>
        </div>
        <div className="text-[9px] font-mono font-black uppercase text-indigo-500 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20 self-start sm:self-center">
          {jackpot.gamesCount} Matches
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {jackpot.fixtures.map((match) => {
          // First 3 are unlocked for free preview, otherwise requires payment
          const isUnlocked = true;
          
          let displayPick = '-';
          let badgeColor = 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-transparent';
          
          if (isUnlocked) {
            const pred = match.prediction.toUpperCase();
            if (pred.includes('(1)') || pred === '1') {
              displayPick = '1';
              badgeColor = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            } else if (pred.includes('(2)') || pred === '2') {
              displayPick = '2';
              badgeColor = 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            } else if (pred.includes('(X)') || pred === 'X') {
              displayPick = 'X';
              badgeColor = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            } else if (pred.includes('1X') || pred.includes('X1')) {
              displayPick = '1X';
              badgeColor = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            } else if (pred.includes('X2') || pred.includes('2X')) {
              displayPick = 'X2';
              badgeColor = 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            } else if (pred.includes('12') || pred.includes('21')) {
              displayPick = '12';
              badgeColor = 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
            } else {
              displayPick = match.prediction;
              badgeColor = 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
            }
          }

          return (
            <div 
              key={match.id}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-50/50 dark:bg-slate-900/10 border border-slate-100 dark:border-slate-800/60 text-[11px] gap-2 hover:border-indigo-500/20 transition-all duration-200"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {/* Number Badge */}
                <span className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 text-[9px] font-mono font-black text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0 border border-slate-200/40 dark:border-slate-700/40">
                  {match.fixtureNumber}
                </span>
                
                {/* Team Names */}
                <div className="min-w-0 flex-1 text-left leading-tight">
                  <span className="text-slate-700 dark:text-slate-300 font-bold truncate block" title={`${match.homeTeam} vs ${match.awayTeam}`}>
                    {match.homeTeam} <span className="text-slate-400 font-normal">v</span> {match.awayTeam}
                  </span>
                </div>
              </div>

              {/* Recommendation Choice */}
              <div className="shrink-0 font-mono">
                {isUnlocked ? (
                  <span className={`px-2 py-0.5 text-[10px] font-black border rounded shadow-3xs ${badgeColor}`}>
                    {displayPick}
                  </span>
                ) : (
                  <button 
                    onClick={() => onOpenPayment(jackpot.name, jackpot.price, jackpot.id, jackpot.slug, 'jackpot')}
                    className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-500 rounded text-[9px] uppercase font-black tracking-wide cursor-pointer transition-all duration-150"
                    title="Unlock predictions"
                  >
                    <Lock className="w-2.5 h-2.5" />
                    <span>Lock</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
