import { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  TrendingUp,
  Award,
  BookOpen,
  Check,
  X,
  Calendar
} from 'lucide-react';
import { Fixture } from '../types';
import { calculateProbabilities, getRefinedConfidence } from '../utils/probability';
import VotePoll from './VotePoll';
import VoteNudgeSnippet from './VoteNudgeSnippet';
import { FlagImage } from '../utils/flagUtils';
import { formatTime } from '../utils/timeUtils';

interface PredictionsListProps {
  fixtures: Fixture[];
  title: string;
  subtitle: string;
  isLoading?: boolean;
}

export function MinimalShimmerLoader({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3 w-full p-2 md:p-3">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="p-3 md:p-4 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-3 animate-pulse"
        >
          {/* Subtle top shimmer bar */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500/20 via-sky-500/30 to-emerald-500/20" />

          {/* Left: League & teams skeleton */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-slate-200/80 dark:bg-slate-800/80 shrink-0" />
            <div className="space-y-2 flex-1 min-w-0">
              <div className="h-3.5 bg-slate-200/90 dark:bg-slate-800/90 rounded-md w-2/3 max-w-[220px]" />
              <div className="h-2.5 bg-slate-200/60 dark:bg-slate-800/60 rounded-md w-1/3 max-w-[130px]" />
            </div>
          </div>

          {/* Middle: Prediction badge & odds skeleton */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="h-7 w-28 bg-slate-200/80 dark:bg-slate-800/80 rounded-lg" />
            <div className="h-7 w-12 bg-slate-200/60 dark:bg-slate-800/60 rounded-lg" />
          </div>

          {/* Right: Button skeleton */}
          <div className="shrink-0 flex items-center justify-end">
            <div className="h-8 w-24 md:w-28 bg-slate-200/80 dark:bg-slate-800/80 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

function isSameDay(dateStr?: string, targetDate?: Date) {
  if (!dateStr || !targetDate) return false;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return true;
  return d.toDateString() === targetDate.toDateString();
}

export default function PredictionsList({
  fixtures,
  title,
  subtitle,
  isLoading = false
}: PredictionsListProps) {
  const [expandedFixture, setExpandedFixture] = useState<number | null>(null);
  const [dateFilter, setDateFilter] = useState<'all' | 'yesterday' | 'today' | 'tomorrow'>('all');

  // Deduplicate & Sort fixtures by kickoff time, starting with earliest kickoff first up to latest
  const sortedFixtures = useMemo(() => {
    const map = new Map<number, Fixture>();
    (fixtures || []).forEach(f => {
      if (f && f.id) map.set(f.id, f);
    });
    const list = Array.from(map.values());
    return list.sort((a, b) => {
      const timeA = a.kickoffTime ? new Date(a.kickoffTime).getTime() || 0 : 0;
      const timeB = b.kickoffTime ? new Date(b.kickoffTime).getTime() || 0 : 0;
      return timeA - timeB; // Earliest kickoff first
    });
  }, [fixtures]);

  const displayedFixtures = useMemo(() => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    let list = sortedFixtures;
    if (dateFilter === 'yesterday') {
      list = sortedFixtures.filter(f => isSameDay(f.kickoffTime, yesterday));
    } else if (dateFilter === 'today') {
      list = sortedFixtures.filter(f => isSameDay(f.kickoffTime, now));
    } else if (dateFilter === 'tomorrow') {
      list = sortedFixtures.filter(f => isSameDay(f.kickoffTime, tomorrow));
    }

    return list.map(fixture => {
      const isCompleted = fixture.status === 'FT';
      const isWon = fixture.result === 'won';
      const isLost = fixture.result === 'lost';
      
      const isDoubleChance = fixture.prediction.toLowerCase().includes('double chance') || 
                             fixture.prediction.toLowerCase().includes('1x') || 
                             fixture.prediction.toLowerCase().includes('x1') || 
                             fixture.prediction.toLowerCase().includes('x2') || 
                             fixture.prediction.toLowerCase().includes('2x') || 
                             fixture.prediction.toLowerCase().includes('12') ||
                             fixture.prediction.toLowerCase().includes('21');

      const displayConf = getRefinedConfidence(fixture);
      const probs = calculateProbabilities(
        fixture.prediction,
        displayConf,
        fixture.probabilities || fixture
      );

      let desktopRowStyle = "border-l-[4px] border-l-transparent";
      if (isCompleted) {
        if (isWon) {
          desktopRowStyle = "border-l-[4px] border-l-emerald-500 bg-emerald-500/[0.01] hover:bg-emerald-500/[0.025] dark:bg-emerald-500/[0.02]";
        } else if (isLost) {
          desktopRowStyle = "border-l-[4px] border-l-slate-400/30 bg-slate-500/[0.005] hover:bg-slate-500/[0.015] opacity-90";
        }
      } else if (fixture.status === 'LIVE' || fixture.status === 'HT') {
        desktopRowStyle = "border-l-[4px] border-l-red-500 bg-red-500/[0.01]";
      }

      return {
        ...fixture,
        isCompleted,
        isWon,
        isLost,
        isDoubleChance,
        displayConf,
        probs,
        desktopRowStyle
      };
    });
  }, [sortedFixtures, dateFilter]);

  const toggleExpand = (id: number) => {
    setExpandedFixture(expandedFixture === id ? null : id);
  };

  const isLiveMatch = (status?: string) => {
    if (!status) return false;
    const s = status.toUpperCase();
    return ['LIVE', '1H', '2H', 'HT', 'ET', 'P', 'PEN', 'BT', 'IN PLAY'].includes(s) || s.includes('LIVE');
  };

  const getStatusColor = (status: Fixture['status']) => {
    const s = (status || '').toUpperCase();
    if (isLiveMatch(s)) {
      if (s === 'HT') return 'bg-amber-500 text-slate-950 font-black animate-pulse';
      return 'bg-rose-600 text-white font-black animate-pulse shadow-xs';
    }
    if (s === 'FT' || s === 'AET' || s === 'AP') return 'bg-emerald-600 text-white font-bold';
    if (s === 'NS') return 'bg-slate-500/80 text-white';
    return 'bg-slate-600 text-white';
  };

  const getResultBadge = (fixture: Fixture, showScore = true) => {
    const { result, homeScore, awayScore, status } = fixture;
    const scoreText = (status === 'FT' || status === 'LIVE' || status === 'HT') ? `${homeScore} - ${awayScore}` : '—';
    
    if (result === 'won') {
      return (
        <span className="flex items-center gap-1 text-[10.5px] bg-emerald-500 bg-opacity-15 text-emerald-800 dark:text-emerald-400 font-black px-2 py-0.5 rounded border border-emerald-500 border-opacity-35 font-mono">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> {showScore ? scoreText : null}
        </span>
      );
    }
    if (result === 'lost') {
      return (
        <span className="flex items-center gap-1 text-[10.5px] bg-red-500 bg-opacity-15 text-red-800 dark:text-red-400 font-black px-2 py-0.5 rounded border border-red-500 border-opacity-35 font-mono">
          <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" /> {showScore ? scoreText : null}
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[10.5px] bg-slate-500 bg-opacity-15 text-slate-700 dark:text-slate-400 font-bold px-2 py-0.5 rounded border border-slate-500 border-opacity-30 font-mono">
        <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" /> {showScore ? 'PENDING' : null}
      </span>
    );
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

  return (
    <div className="space-y-6 text-left">
      {/* 1. SECTION HEADER CARD */}
      <div className="p-4 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow)] relative overflow-hidden">
        {/* Top visual border accent */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[var(--primary)] to-emerald-500" />
        
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[var(--primary)] bg-opacity-10 border border-[var(--primary)] border-opacity-25 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-[var(--primary)]" />
          </div>
          <div>
            <h2 className="text-sm md:text-base font-black uppercase tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              {title}
            </h2>
            <p className="text-[10px] md:text-xs text-[var(--text-muted)] font-medium">
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* 2. COMPACT AND RESPONSIVE FIXTURES CONTAINER */}
      <div className="md:rounded-[var(--radius)] md:bg-[var(--card)] md:border md:border-[var(--border)] md:shadow-[var(--shadow)] md:overflow-hidden bg-transparent border-none shadow-none">
        
        {/* Header row for desktop */}
        <div className="bg-slate-50 dark:bg-slate-900/30 border-b border-[var(--border)] p-3 text-xs font-bold text-[var(--text)] hidden md:grid grid-cols-12 gap-2 uppercase tracking-wide">
          <div className="col-span-4 text-left">Match Details & Scoreboard</div>
          <div className="col-span-3 text-center">Calculated Prediction</div>
          <div className="col-span-1 text-center font-mono">Conf %</div>
          <div className="col-span-2 text-center">Result Outcome</div>
          <div className="col-span-2 text-right pr-4">Expert Analysis</div>
        </div>

        {/* Fixtures list */}
        <div className="md:divide-y md:divide-[var(--border)] space-y-4 md:space-y-0">
          {isLoading ? (
            <MinimalShimmerLoader count={5} />
          ) : displayedFixtures.length === 0 ? (
            <div className="p-8 md:p-12 text-center flex flex-col items-center justify-center space-y-3 bg-[var(--card)]">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <Calendar className="w-6 h-6 text-slate-400 shrink-0" />
              </div>
              <div className="max-w-md space-y-1">
                <h3 className="text-xs md:text-sm font-bold text-[var(--text)] font-mono uppercase tracking-wider">
                  No Fixtures Available
                </h3>
                <p className="text-xs text-[var(--text-muted)] font-sans leading-relaxed">
                  There are currently no predictions or fixtures available for this date or category in our database. Please check back later or select a different page.
                </p>
              </div>
            </div>
          ) : (
            displayedFixtures.map((fixture) => {
            const isExpanded = expandedFixture === fixture.id;
            const { isCompleted, isWon, isLost, isDoubleChance, displayConf, probs, desktopRowStyle } = fixture;

            return (
              <div 
                key={fixture.id} 
                className={`transition-all duration-300 md:hover:bg-slate-50/50 md:dark:hover:bg-slate-900/10 cursor-pointer bg-transparent ${desktopRowStyle}`}
                onClick={() => toggleExpand(fixture.id)}
              >
                {/* Desktop View (hidden on mobile, visible on md and up) */}
                <div className="hidden md:grid p-3.5 grid-cols-12 items-center gap-2 select-none">
                  {/* Left: Kickoff time, Status & Teams with Scoreboard */}
                  <div className="flex items-center gap-3 col-span-12 md:col-span-4 min-w-0">
                    <div className="flex flex-col items-center justify-center bg-[var(--background)] px-2 py-1 rounded-[var(--radius)] border border-[var(--border)] text-center w-[65px] shrink-0">
                      <span className="text-[9px] font-mono font-bold text-slate-700 dark:text-slate-300">
                        {formatTime(fixture.kickoffTime)}
                      </span>
                      <span className={`text-[7px] font-black px-1.5 py-0.5 rounded mt-0.5 uppercase ${getStatusColor(fixture.status)}`}>
                        {fixture.status}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 text-[9px] text-[var(--text-muted)] font-bold uppercase font-mono tracking-wider leading-none">
                        <FlagImage countryFlag={fixture.countryFlag || (fixture as any).country_flag} flag={fixture.leagueFlag} countryName={fixture.countryName || fixture.leagueCountry || (fixture as any).country_name} />
                        <span className="truncate">{fixture.leagueName || (fixture as any).league_name}</span>
                        {(fixture.countryName || fixture.leagueCountry || (fixture as any).country_name) && (
                          <>
                            <span>•</span>
                            <span className="truncate">{fixture.countryName || fixture.leagueCountry || (fixture as any).country_name}</span>
                          </>
                        )}
                        {isDoubleChance && (
                          <>
                            <span>•</span>
                            <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/15 rounded-[4px] text-[7.5px] tracking-normal lowercase shrink-0 font-sans leading-none font-bold">double chance</span>
                          </>
                        )}
                      </div>
                      
                      <div className="text-xs font-bold mt-1.5 tracking-tight flex items-center gap-1.5 truncate">
                        <span className="text-[var(--text)] truncate">{fixture.homeTeam}</span>
                        <span className="text-[10px] text-slate-400 font-bold shrink-0 mx-1">vs</span>
                        <span className="text-[var(--text)] truncate">{fixture.awayTeam}</span>
                      </div>
                    </div>
                  </div>

                  {/* Prediction Pill */}
                  <div className="col-span-12 md:col-span-3 flex flex-col items-center justify-center">
                    <span className={`text-[11px] md:text-xs font-bold font-mono border px-2.5 py-1 rounded-md shadow-2xs flex items-center justify-center gap-1 transition-all ${
                      isCompleted 
                        ? isWon
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-350 border-emerald-500/40 font-bold shadow-emerald-500/10'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-750 line-through opacity-70'
                        : 'bg-sky-50 dark:bg-sky-950/30 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800/60'
                    }`}>
                      <span className="font-bold tracking-tight">{fixture.prediction}</span>
                      {(isWon || (isCompleted && fixture.result === 'won')) && (
                        <span className="inline-flex items-center justify-center bg-emerald-500 text-white font-black rounded-full w-3.5 h-3.5 text-[9px] ml-0.5 shadow-2xs">✓</span>
                      )}
                    </span>
                  </div>

                  {/* Confidence Rating */}
                  <div className="col-span-12 md:col-span-1 flex flex-col items-center justify-center">
                    <span className="text-xs font-black text-[var(--text)] font-mono">{displayConf}%</span>
                  </div>

                  {/* Results column */}
                  <div className="col-span-12 md:col-span-2 flex items-center justify-center gap-2">
                    {getResultBadge(fixture)}
                  </div>

                  {/* READ ANALYSIS ACTION BUTTON (DESKTOP) */}
                  <div className="col-span-12 md:col-span-2 flex items-center justify-end pr-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(fixture.id);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase font-mono transition-all duration-200 cursor-pointer shadow-3xs ${
                        isExpanded 
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : isCompleted
                            ? isWon
                              ? 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/35 text-emerald-850 dark:text-emerald-300 font-black'
                              : 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-black'
                            : 'bg-white dark:bg-slate-850 border-[var(--border)] hover:border-indigo-500/40 hover:bg-indigo-500/[0.06] text-slate-900 dark:text-slate-100 hover:text-indigo-800 dark:hover:text-indigo-300 font-black'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5 shrink-0" />
                      <span>Read Analysis</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* Mobile View (visible on mobile, hidden on md and up) */}
                <div className={`md:hidden p-3 rounded-xl border transition-all duration-200 space-y-2.5 select-none text-left ${
                  fixture.status === 'LIVE' 
                    ? 'border-red-500 bg-red-500/[0.01] ring-1 ring-red-500/10' 
                    : isCompleted
                      ? isWon
                        ? 'border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.03] to-transparent'
                        : 'border-slate-200 dark:border-slate-800/80 bg-slate-500/[0.005] opacity-90'
                      : 'border-slate-200/80 dark:border-slate-800/60 bg-white dark:bg-slate-900 shadow-3xs'
                }`}>
                  
                  {/* Top line: Country Flag, League, Time, Status and Outcome */}
                  <div className="flex items-center justify-between gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <FlagImage countryFlag={fixture.countryFlag || (fixture as any).country_flag} flag={fixture.leagueFlag} countryName={fixture.countryName || fixture.leagueCountry || (fixture as any).country_name} />
                      <span className="font-mono text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                        {(fixture.countryName || fixture.leagueCountry || (fixture as any).country_name) ? `${fixture.countryName || fixture.leagueCountry || (fixture as any).country_name} • ` : ''}{fixture.leagueName || (fixture as any).league_name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Time Pill */}
                      {!isCompleted && (
                        <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold text-slate-600 dark:text-slate-300">
                          <Clock className="w-2.5 h-2.5 text-slate-400" />
                          <span>{formatTime(fixture.kickoffTime)}</span>
                        </div>
                      )}

                      {/* Status Badge */}
                      <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase ${getStatusColor(fixture.status)}`}>
                        {fixture.status}
                      </span>
                    </div>
                  </div>

                  {/* Teams Section: Home Team on Top, Away Team Below */}
                  <div className="space-y-1.5">
                    {/* Home Team */}
                    <div className="flex items-center justify-between gap-2 bg-slate-50/50 dark:bg-slate-950/40 px-2 py-1 rounded-lg border border-slate-100/40 dark:border-slate-850">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`font-black text-xs truncate tracking-tight ${
                          isCompleted
                            ? isWon
                              ? 'text-slate-900 dark:text-slate-100 font-extrabold'
                              : 'text-slate-500 dark:text-slate-400 line-through opacity-80'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}>
                          {fixture.homeTeam}
                        </span>
                      </div>
                      
                      {/* Home Score or Dash */}
                      {fixture.status === 'NS' && (fixture.homeScore === undefined || fixture.homeScore === null || fixture.homeScore === '-' || fixture.homeScore === '') ? (
                        <span className="text-slate-300 dark:text-slate-700 font-mono font-bold text-xs pr-1.5">-</span>
                      ) : (
                        <div className={`w-6 h-6 flex items-center justify-center border rounded-md text-xs font-mono font-black ${
                          isCompleted
                            ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-150 dark:border-slate-700 text-slate-850 dark:text-slate-200'
                        }`}>
                          {fixture.homeScore}
                        </div>
                      )}
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center justify-between gap-2 bg-slate-50/50 dark:bg-slate-950/40 px-2 py-1 rounded-lg border border-slate-100/40 dark:border-slate-850">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`font-black text-xs truncate tracking-tight ${
                          isCompleted
                            ? isWon
                              ? 'text-slate-900 dark:text-slate-100 font-extrabold'
                              : 'text-slate-500 dark:text-slate-400 line-through opacity-80'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}>
                          {fixture.awayTeam}
                        </span>
                      </div>
                      
                      {/* Away Score or Dash */}
                      {fixture.status === 'NS' && (fixture.awayScore === undefined || fixture.awayScore === null || fixture.awayScore === '-' || fixture.awayScore === '') ? (
                        <span className="text-slate-300 dark:text-slate-700 font-mono font-bold text-xs pr-1.5">-</span>
                      ) : (
                        <div className={`w-6 h-6 flex items-center justify-center border rounded-md text-xs font-mono font-black ${
                          isCompleted
                            ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-150 dark:border-slate-700 text-slate-850 dark:text-slate-200'
                        }`}>
                          {fixture.awayScore}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Community Fan Poll Card (Mobile) */}
                  <div className="pt-0.5">
                    <VoteNudgeSnippet 
                      fixtureId={fixture.id} 
                      prediction={fixture.prediction} 
                      homeTeam={fixture.homeTeam}
                      awayTeam={fixture.awayTeam}
                      status={fixture.status} 
                      result={fixture.result} 
                      isEnded={isCompleted} 
                      onExpand={() => toggleExpand(fixture.id)}
                      variant="card"
                    />
                  </div>

                  {/* ACTION/TIP BOTTOM BAR & READ ANALYSIS TRIGGER (MOBILE) */}
                  <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                    isCompleted
                      ? 'bg-slate-100/70 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800 text-slate-400'
                      : 'bg-indigo-500/[0.06] dark:bg-indigo-500/12 border-indigo-500/20 dark:border-indigo-500/25'
                  }`}>
                    <div className="min-w-0 flex-1 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] uppercase font-mono font-black text-slate-500 dark:text-slate-400 shrink-0">TIP:</span>
                      <span className={`text-[11px] sm:text-xs font-mono font-bold tracking-tight flex items-center gap-1 px-2 py-0.5 rounded-md border ${
                        isCompleted
                          ? 'bg-slate-200/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-300/60 dark:border-slate-700'
                          : 'bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-900 dark:text-indigo-200 border-indigo-500/30'
                      }`}>
                        <span className="font-bold tracking-tight">{fixture.prediction}</span>
                        {(isWon || (isCompleted && fixture.result === 'won')) && (
                          <span className="inline-flex items-center justify-center bg-emerald-500 text-white font-black rounded-full w-3.5 h-3.5 text-[8px] ml-0.5 shrink-0">✓</span>
                        )}
                      </span>
                    </div>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(fixture.id);
                      }}
                      className={`active:scale-95 text-white font-black text-[10px] uppercase px-3.5 py-2.5 rounded-lg flex items-center gap-1.5 transition-all border-none shrink-0 cursor-pointer shadow-xs ${
                        isCompleted
                          ? 'bg-slate-700 hover:bg-slate-800'
                          : 'bg-indigo-700 hover:bg-indigo-800'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5 text-white" />
                      <span>Read Analysis</span>
                    </button>
                  </div>
                </div>

                {/* Expanding Analyst Assessment (Free Predictions) */}
                <div 
                  className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out bg-slate-50/50 dark:bg-slate-900/10 border-t border-[var(--border)] overflow-hidden ${
                    isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 border-t-0'
                  }`}
                  onClick={(e) => e.stopPropagation()} // Prevent double trigger
                >
                  <div className="overflow-hidden">
                    {isExpanded && (
                      <div className="p-4 text-xs space-y-3 leading-relaxed text-left">
                        <div className="flex items-center justify-between">
                          <span className="font-bold flex items-center gap-1 text-[var(--primary)] font-mono uppercase tracking-wider text-[10px]">
                            <Sparkles className="w-3.5 h-3.5 text-[var(--primary)] animate-pulse" /> Live Expert Evaluation
                          </span>
                          <span className="text-[10px] font-mono text-[var(--text-muted)] bg-[var(--background)] px-2 py-0.5 rounded border border-[var(--border)]">
                            Confidence factor: <strong className="text-sky-500 font-black">{displayConf}%</strong>
                          </span>
                        </div>
                        <p className="text-[var(--text-muted)] leading-relaxed font-sans">
                          {fixture.aiAnalysis || "Advanced computer equations favor selected outcomes based on high offensive conversion metrics and defensive low-block performance factors. Current dynamic odds trend heavily towards recommendations."}
                        </p>

                        {/* Probability Split bar */}
                        <div className="pt-1 pb-1">
                          <div className="flex justify-between text-[9px] font-mono font-black text-[var(--text-muted)] mb-1 uppercase">
                            <span className="text-emerald-500">Home: {probs.home}%</span>
                            <span className="text-amber-500">Draw: {probs.draw}%</span>
                            <span className="text-sky-500">Away: {probs.away}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-[var(--border)] rounded-full overflow-hidden flex">
                            <div className="h-full bg-emerald-500" style={{ width: `${probs.home}%` }} />
                            <div className="h-full bg-amber-500" style={{ width: `${probs.draw}%` }} />
                            <div className="h-full bg-sky-500" style={{ width: `${probs.away}%` }} />
                          </div>
                        </div>

                        {/* Community Verdict Poll */}
                        <div className="pt-1.5">
                          <VotePoll 
                            fixtureId={fixture.id} 
                            homeTeam={fixture.homeTeam}
                            awayTeam={fixture.awayTeam}
                            isEnded={isCompleted} 
                            status={fixture.status} 
                            result={fixture.result} 
                            prediction={fixture.prediction}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        </div>
      </div>
    </div>
  );
}
