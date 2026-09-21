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
import { getFixtureDateKey } from '../utils/predictionGenerator';
import FixtureRow from './FixtureRow';

interface PredictionsListProps {
  fixtures: Fixture[];
  title: string;
  subtitle: string;
  isLoading?: boolean;
  showTodayTags?: boolean;
  groupByDate?: boolean;
  pageType?: string;
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
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-emerald-600/30" />

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
  const d = new Date(dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T'));
  if (isNaN(d.getTime())) return true;
  return d.toDateString() === targetDate.toDateString();
}

export function getDateGroupInfo(dateKey: string, refDate: Date = new Date()): {
  label: string;
  subLabel: string;
  badgeText: string;
  badgeStyle: string;
} {
  if (!dateKey || dateKey === 'unknown') {
    return {
      label: 'Scheduled Matches',
      subLabel: 'Upcoming tips',
      badgeText: 'Fixtures',
      badgeStyle: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
    };
  }

  const [yStr, mStr, dStr] = dateKey.split('-');
  const year = parseInt(yStr, 10);
  const month = parseInt(mStr, 10) - 1;
  const day = parseInt(dStr, 10);
  const d = new Date(year, month, day);

  if (isNaN(d.getTime())) {
    return {
      label: dateKey,
      subLabel: '',
      badgeText: dateKey,
      badgeStyle: 'bg-slate-100 text-black border-slate-300',
    };
  }

  const todayMidnight = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate());
  const targetMidnight = new Date(year, month, day);
  const diffDays = Math.round((targetMidnight.getTime() - todayMidnight.getTime()) / (24 * 60 * 60 * 1000));

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const dayName = daysOfWeek[d.getDay()];
  const monthName = months[d.getMonth()];
  const shortMonthName = shortMonths[d.getMonth()];

  if (diffDays === 1) {
    return {
      label: 'Tomorrow',
      subLabel: `${dayName}, ${day} ${monthName} ${year}`,
      badgeText: 'Tomorrow',
      badgeStyle: 'bg-slate-100 text-black border-slate-300',
    };
  }

  if (diffDays === 0) {
    return {
      label: 'Today',
      subLabel: `${dayName}, ${day} ${monthName} ${year}`,
      badgeText: 'Today',
      badgeStyle: 'bg-slate-100 text-black border-slate-300',
    };
  }

  if (diffDays === -1) {
    return {
      label: 'Yesterday',
      subLabel: `${dayName}, ${day} ${monthName} ${year}`,
      badgeText: 'Yesterday',
      badgeStyle: 'bg-slate-100 text-black border-slate-300',
    };
  }

  return {
    label: `${dayName} ${day} ${monthName} ${year}`,
    subLabel: `${dayName}, ${day} ${shortMonthName} ${year}`,
    badgeText: `${dayName.slice(0, 3)} ${day}`,
    badgeStyle: 'bg-slate-100 text-black border-slate-300',
  };
}

export default function PredictionsList({
  fixtures,
  title,
  subtitle,
  isLoading = false,
  showTodayTags,
  groupByDate = true,
  pageType
}: PredictionsListProps) {
  const [expandedFixture, setExpandedFixture] = useState<number | null>(null);
  const [dateFilter, setDateFilter] = useState<'all' | 'yesterday' | 'today' | 'tomorrow'>('all');

  // Deduplicate & Sort fixtures: latest date first, and within date earliest kickoff first
  const sortedFixtures = useMemo(() => {
    const map = new Map<number, Fixture>();
    (fixtures || []).forEach(f => {
      if (f && f.id) map.set(f.id, f);
    });
    const list = Array.from(map.values());
    return list.sort((a, b) => {
      const dayA = a.kickoffTime ? getFixtureDateKey(a.kickoffTime) : '';
      const dayB = b.kickoffTime ? getFixtureDateKey(b.kickoffTime) : '';
      if (dayA !== dayB) {
        return dayB.localeCompare(dayA); // Most latest date first
      }
      const timeA = a.kickoffTime ? new Date(a.kickoffTime.includes('T') ? a.kickoffTime : a.kickoffTime.replace(' ', 'T')).getTime() || 0 : 0;
      const timeB = b.kickoffTime ? new Date(b.kickoffTime.includes('T') ? b.kickoffTime : b.kickoffTime.replace(' ', 'T')).getTime() || 0 : 0;
      return timeA - timeB; // Earliest kickoff within the same day
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
      
      const pLower = (fixture.prediction || '').toLowerCase();
      const isDoubleChance = pLower.includes('double chance') || 
                             pLower.includes('1x') || 
                             pLower.includes('x1') || 
                             pLower.includes('x2') || 
                             pLower.includes('2x') || 
                             pLower.includes('12') ||
                             pLower.includes('21');

      const is3PlusGoals = pLower.includes('over 2.5') || 
                           pLower.includes('ov 2.5') || 
                           pLower.includes('o2.5') || 
                           pLower.includes('over25') || 
                           pLower.includes('ov 25') || 
                           pLower.includes('> 2.5') || 
                           pLower.includes('>2.5') ||
                           pLower.includes('3+ goals') ||
                           pLower.includes('3+') ||
                           pLower === '2.5 goals';

      const is2PlusGoals = !is3PlusGoals && (
                           pLower.includes('over 1.5') || 
                           pLower.includes('ov 1.5') || 
                           pLower.includes('o1.5') || 
                           pLower.includes('over15') || 
                           pLower.includes('ov 15') || 
                           pLower.includes('> 1.5') || 
                           pLower.includes('>1.5') ||
                           pLower.includes('2+ goals') ||
                           pLower.includes('2+') ||
                           pLower === '1.5 goals');

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
        is3PlusGoals,
        is2PlusGoals,
        displayConf,
        probs,
        desktopRowStyle
      };
    });
  }, [sortedFixtures, dateFilter]);

  const dateGroups = useMemo(() => {
    if (!groupByDate) return null;
    const groupsMap = new Map<string, typeof displayedFixtures>();

    displayedFixtures.forEach(fixture => {
      const dateKey = getFixtureDateKey(fixture.kickoffTime) || 'unknown';
      if (!groupsMap.has(dateKey)) {
        groupsMap.set(dateKey, []);
      }
      groupsMap.get(dateKey)!.push(fixture);
    });

    const groups: Array<{
      dateKey: string;
      label: string;
      subLabel: string;
      badgeText: string;
      badgeStyle: string;
      fixtures: typeof displayedFixtures;
    }> = [];

    const today = new Date();
    groupsMap.forEach((groupFixtures, dateKey) => {
      const info = getDateGroupInfo(dateKey, today);
      groups.push({
        dateKey,
        label: info.label,
        subLabel: info.subLabel,
        badgeText: info.badgeText,
        badgeStyle: info.badgeStyle,
        fixtures: groupFixtures
      });
    });

    return groups;
  }, [displayedFixtures, groupByDate]);

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
    if (s === 'FT' || s === 'AET' || s === 'AP') return 'bg-emerald-700 text-white font-bold';
    if (s === 'NS') return 'bg-slate-800 dark:bg-slate-700 text-white font-black';
    return 'bg-slate-700 text-white font-bold';
  };

  const getResultBadge = (fixture: Fixture, showScore = true) => {
    const { result, homeScore, awayScore, status } = fixture;
    const scoreText = (status === 'FT' || status === 'LIVE' || status === 'HT') ? `${homeScore} - ${awayScore}` : '—';
    
    if (result === 'won') {
      return (
        <span className="flex items-center gap-1 text-[10.5px] bg-emerald-700 text-white font-black px-2 py-0.5 rounded border border-emerald-700 font-mono">
          <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" /> {showScore ? scoreText : null}
        </span>
      );
    }
    if (result === 'lost') {
      return (
        <span className="flex items-center gap-1 text-[10.5px] bg-rose-700 text-white font-black px-2 py-0.5 rounded border border-rose-700 font-mono">
          <XCircle className="w-3.5 h-3.5 text-white shrink-0" /> {showScore ? scoreText : null}
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[10.5px] bg-slate-900 dark:bg-slate-800 text-white font-bold px-2 py-0.5 rounded border border-slate-800 dark:border-slate-700 font-mono">
        <Clock className="w-3.5 h-3.5 text-slate-300 shrink-0" /> {showScore ? 'PENDING' : null}
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
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-emerald-600" />
        
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-slate-900 dark:text-slate-100" />
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
        <div className="space-y-4 md:space-y-0">
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
          ) : dateGroups && dateGroups.length > 0 ? (
            dateGroups.map((group) => (
              <div key={`group-${group.dateKey}`} className="space-y-3 md:space-y-0">
                {/* Date Group Header Divider - pure DIV and SPAN, NO heading tags */}
                <div 
                  id={`date-group-${group.dateKey}`}
                  className="px-3.5 md:px-4 py-2.5 bg-black text-white border-b border-neutral-800 flex items-center justify-between gap-3 text-left transition-colors select-none"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-5 h-5 rounded-md bg-neutral-900 border border-neutral-700 flex items-center justify-center shrink-0 text-white">
                      <Calendar className="w-3 h-3 text-white stroke-[2.5]" />
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 md:gap-2 min-w-0">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider font-mono bg-neutral-900 text-white border border-neutral-700">
                        {group.badgeText}
                      </span>
                      <span className="text-xs md:text-sm font-black text-white font-mono tracking-tight">
                        {group.label}
                      </span>
                      {group.subLabel && group.subLabel !== group.label && (
                        <span className="hidden sm:inline-block text-[11px] font-bold text-neutral-300">
                          • {group.subLabel}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center">
                    <span className="text-[10px] font-mono font-bold text-white bg-neutral-900 border border-neutral-700 px-2 py-0.5 rounded-full">
                      {group.fixtures.length} {group.fixtures.length === 1 ? 'Tip' : 'Tips'}
                    </span>
                  </div>
                </div>

                {/* Fixtures for this Date */}
                <div className="md:divide-y md:divide-[var(--border)] space-y-4 md:space-y-0">
                  {group.fixtures.map((fixture) => (
                    <FixtureRow
                      key={fixture.id}
                      fixture={fixture}
                      isExpanded={expandedFixture === fixture.id}
                      toggleExpand={toggleExpand}
                      getStatusColor={getStatusColor}
                      getResultBadge={getResultBadge}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="md:divide-y md:divide-[var(--border)] space-y-4 md:space-y-0">
              {displayedFixtures.map((fixture) => (
                <FixtureRow
                  key={fixture.id}
                  fixture={fixture}
                  isExpanded={expandedFixture === fixture.id}
                  toggleExpand={toggleExpand}
                  getStatusColor={getStatusColor}
                  getResultBadge={getResultBadge}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
