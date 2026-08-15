import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Users, CheckCircle2, Lock } from 'lucide-react';
import { getApiBaseUrl } from '../lib/getApiBaseUrl';

export interface VoteStats {
  fixtureId: string;
  totalVotes: number;
  votes1: number;
  votesX: number;
  votes2: number;
  homePercent: number;
  drawPercent: number;
  awayPercent: number;
  userVote: string | null;
}

export interface VotePollProps {
  fixtureId: string | number;
  homeTeam?: string;
  awayTeam?: string;
  isEnded?: boolean;
  status?: string;
  result?: string;
  prediction?: string;
}

export interface PollOption {
  key: string;
  label: string;       // Primary display name e.g. 'Arsenal', 'Over 2.5', '1X (Home/Draw)'
  shortLabel: string;  // Concise label e.g. '1X', 'Over 2.5'
  sublabel?: string;   // Contextual helper
  dbKey: '1' | 'X' | '2';
  accentColor: string;
}

export function detectMarketType(prediction?: string, homeTeam?: string, awayTeam?: string): {
  type: '1X2' | 'DC' | 'BTTS' | 'OU';
  question: string;
  options: PollOption[];
} {
  const p = (prediction || '').trim().toUpperCase();
  const home = homeTeam || 'Home';
  const away = awayTeam || 'Away';

  // 1. Both Teams To Score (BTTS / GG / NG)
  if (
    p.includes('GG') ||
    p.includes('NG') ||
    p.includes('BTTS') ||
    p.includes('GOAL GOAL') ||
    p.includes('NO GOAL') ||
    p.includes('BOTH TEAMS') ||
    p === 'YES' ||
    p === 'NO'
  ) {
    return {
      type: 'BTTS',
      question: 'Both teams to score?',
      options: [
        {
          key: 'GG',
          label: 'Both Score (GG)',
          shortLabel: 'GG',
          sublabel: 'Yes - Both Teams Score',
          dbKey: '1',
          accentColor: 'emerald',
        },
        {
          key: 'NG',
          label: 'No Goal (NG)',
          shortLabel: 'NG',
          sublabel: 'No - Clean Sheet / 0-0',
          dbKey: '2',
          accentColor: 'rose',
        },
      ],
    };
  }

  // 2. Over / Under Goals
  if (
    p.includes('1.5') ||
    p.includes('2.5') ||
    p.includes('3.5') ||
    p.includes('0.5') ||
    p.includes('4.5') ||
    p.includes('OVER') ||
    p.includes('UNDER') ||
    p.includes('OV') ||
    p.includes('UN')
  ) {
    let line = '2.5';
    if (p.includes('1.5')) line = '1.5';
    else if (p.includes('3.5')) line = '3.5';
    else if (p.includes('0.5')) line = '0.5';
    else if (p.includes('4.5')) line = '4.5';

    return {
      type: 'OU',
      question: `Over / Under ${line} Goals?`,
      options: [
        {
          key: `Over ${line}`,
          label: `Over ${line}`,
          shortLabel: `Over ${line}`,
          dbKey: '1',
          accentColor: 'emerald',
        },
        {
          key: `Under ${line}`,
          label: `Under ${line}`,
          shortLabel: `Under ${line}`,
          dbKey: '2',
          accentColor: 'sky',
        },
      ],
    };
  }

  // 3. Double Chance
  if (
    p.includes('1X') ||
    p.includes('12') ||
    p.includes('2X') ||
    p.includes('X2') ||
    p.includes('X1') ||
    p.includes('DC') ||
    p.includes('DOUBLE')
  ) {
    return {
      type: 'DC',
      question: 'Double Chance prediction?',
      options: [
        {
          key: '1X',
          label: '1X',
          shortLabel: '1X',
          sublabel: 'Home or Draw',
          dbKey: '1',
          accentColor: 'emerald',
        },
        {
          key: '12',
          label: '12',
          shortLabel: '12',
          sublabel: 'Either Win',
          dbKey: 'X',
          accentColor: 'amber',
        },
        {
          key: 'X2',
          label: 'X2',
          shortLabel: 'X2',
          sublabel: 'Draw or Away',
          dbKey: '2',
          accentColor: 'sky',
        },
      ],
    };
  }

  // 4. Default: Standard 1X2 Match Winner
  return {
    type: '1X2',
    question: 'Who will win this match?',
    options: [
      {
        key: '1',
        label: home,
        shortLabel: '1',
        sublabel: `${home} Win`,
        dbKey: '1',
        accentColor: 'emerald',
      },
      {
        key: 'X',
        label: 'Draw',
        shortLabel: 'X',
        sublabel: 'Match Tie',
        dbKey: 'X',
        accentColor: 'amber',
      },
      {
        key: '2',
        label: away,
        shortLabel: '2',
        sublabel: `${away} Win`,
        dbKey: '2',
        accentColor: 'sky',
      },
    ],
  };
}

/**
 * Accurately compute percentages from raw database vote counts ensuring the sum is EXACTLY 100%
 */
export function calculateExactPercentages(
  options: PollOption[],
  votes1: number,
  votesX: number,
  votes2: number
): { pcts: Record<string, number>; total: number } {
  const isTwoOption = options.length === 2;
  const pcts: Record<string, number> = {};

  if (isTwoOption) {
    const v1 = Math.max(0, votes1);
    const v2 = Math.max(0, votes2);
    const total = v1 + v2;

    if (total <= 0) {
      pcts[options[0].key] = 0;
      pcts[options[1].key] = 0;
      return { pcts, total: 0 };
    }

    const p1 = Math.round((v1 / total) * 100);
    const p2 = 100 - p1;

    pcts[options[0].key] = p1;
    pcts[options[1].key] = p2;
    return { pcts, total };
  }

  // 3-Option Market (1X2 or Double Chance)
  const v1 = Math.max(0, votes1);
  const vX = Math.max(0, votesX);
  const v2 = Math.max(0, votes2);
  const total = v1 + vX + v2;

  if (total <= 0) {
    pcts[options[0].key] = 0;
    pcts[options[1].key] = 0;
    pcts[options[2].key] = 0;
    return { pcts, total: 0 };
  }

  const p1 = Math.round((v1 / total) * 100);
  let pX = Math.round((vX / total) * 100);
  let p2 = 100 - p1 - pX;

  if (p1 + pX > 100) {
    pX = Math.max(0, 100 - p1);
    p2 = 0;
  } else if (p2 < 0) {
    p2 = 0;
  }

  pcts[options[0].key] = p1;
  pcts[options[1].key] = pX;
  pcts[options[2].key] = p2;

  return { pcts, total };
}

export default function VotePoll({ 
  fixtureId, 
  homeTeam, 
  awayTeam, 
  isEnded, 
  status, 
  result, 
  prediction 
}: VotePollProps) {
  const [stats, setStats] = useState<VoteStats>({
    fixtureId: String(fixtureId),
    totalVotes: 0,
    votes1: 0,
    votesX: 0,
    votes2: 0,
    homePercent: 0,
    drawPercent: 0,
    awayPercent: 0,
    userVote: null,
  });
  const [voting, setVoting] = useState<string | null>(null);

  const market = detectMarketType(prediction, homeTeam, awayTeam);

  const isMatchFinished =
    Boolean(isEnded) ||
    ['FT', 'AET', 'PEN', 'FINISHED', 'AWD', 'CANCELLED', 'POSTPONED'].includes(
      String(status || '').trim().toUpperCase()
    ) ||
    result === 'won' ||
    result === 'lost';

  const [visitorId] = useState(() => {
    if (typeof window === 'undefined') return 'anonymous';
    let id = localStorage.getItem('aistudio_visitor_id');
    if (!id) {
      id = 'visitor_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('aistudio_visitor_id', id);
    }
    return id;
  });

  useEffect(() => {
    let active = true;
    let savedVote: string | null = null;

    if (typeof window !== 'undefined') {
      try {
        savedVote = localStorage.getItem(`vote_${fixtureId}`);
      } catch {}
    }

    // Fetch directly from live database backend
    const fetchDbVotes = async () => {
      try {
        const baseUrl = getApiBaseUrl();
        const res = await fetch(`${baseUrl}/api/predictions/vote?fixtureId=${encodeURIComponent(fixtureId)}&userId=${encodeURIComponent(visitorId)}`);
        if (res.ok) {
          const data = await res.json();
          if (active && data) {
            const serverUserVote = data.userVote || savedVote || null;
            const v1 = Number(data.votes1 || 0);
            const vX = Number(data.votesX || 0);
            const v2 = Number(data.votes2 || 0);
            const total = v1 + vX + v2;

            const hPct = total > 0 ? Math.round((v1 / total) * 100) : 0;
            const dPct = total > 0 ? Math.round((vX / total) * 100) : 0;
            const aPct = total > 0 ? Math.max(0, 100 - hPct - dPct) : 0;

            const freshStats: VoteStats = {
              fixtureId: String(fixtureId),
              totalVotes: total,
              votes1: v1,
              votesX: vX,
              votes2: v2,
              homePercent: hPct,
              drawPercent: dPct,
              awayPercent: aPct,
              userVote: serverUserVote,
            };

            setStats(freshStats);
            if (typeof window !== 'undefined' && serverUserVote) {
              try {
                localStorage.setItem(`vote_${fixtureId}`, serverUserVote);
              } catch {}
            }
          }
        }
      } catch (err) {
        console.warn('DB vote fetch fallback:', err);
      }
    };

    fetchDbVotes();
    return () => {
      active = false;
    };
  }, [fixtureId, visitorId]);

  const castVote = async (opt: PollOption) => {
    if (isMatchFinished || voting) return;
    setVoting(opt.key);

    const newVoteKey = opt.key;

    // Optimistic calculation with exact sum to 100%
    setStats((prev) => {
      let v1 = prev.votes1;
      let vX = prev.votesX;
      let v2 = prev.votes2;

      // If switching vote
      if (prev.userVote) {
        if (prev.userVote === '1' || prev.userVote === '1X' || prev.userVote === 'GG' || prev.userVote.startsWith('Over')) v1 = Math.max(0, v1 - 1);
        else if (prev.userVote === 'X' || prev.userVote === '12') vX = Math.max(0, vX - 1);
        else if (prev.userVote === '2' || prev.userVote === '2X' || prev.userVote === 'NG' || prev.userVote.startsWith('Under')) v2 = Math.max(0, v2 - 1);
      }

      if (opt.dbKey === '1') v1 += 1;
      else if (opt.dbKey === 'X') vX += 1;
      else if (opt.dbKey === '2') v2 += 1;

      const total = v1 + vX + v2;
      const hPct = total > 0 ? Math.round((v1 / total) * 100) : 0;
      const dPct = total > 0 ? Math.round((vX / total) * 100) : 0;
      const aPct = total > 0 ? Math.max(0, 100 - hPct - dPct) : 0;

      const updatedStats: VoteStats = {
        fixtureId: String(fixtureId),
        totalVotes: total,
        votes1: v1,
        votesX: vX,
        votes2: v2,
        homePercent: hPct,
        drawPercent: dPct,
        awayPercent: aPct,
        userVote: newVoteKey,
      };

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`vote_${fixtureId}`, newVoteKey);
        } catch {}
      }

      return updatedStats;
    });

    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/predictions/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fixtureId: String(fixtureId),
          userId: visitorId,
          vote: opt.dbKey,
          isEnded: isMatchFinished,
          status,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.stats) {
          const s = data.stats;
          const total = Number(s.totalVotes || 0);
          const v1 = Number(s.votes1 || 0);
          const vX = Number(s.votesX || 0);
          const v2 = Number(s.votes2 || 0);

          const hPct = total > 0 ? Math.round((v1 / total) * 100) : 0;
          const dPct = total > 0 ? Math.round((vX / total) * 100) : 0;
          const aPct = total > 0 ? Math.max(0, 100 - hPct - dPct) : 0;

          setStats({
            fixtureId: String(fixtureId),
            totalVotes: total,
            votes1: v1,
            votesX: vX,
            votes2: v2,
            homePercent: hPct,
            drawPercent: dPct,
            awayPercent: aPct,
            userVote: s.userVote || newVoteKey
          });
        }
      }
    } catch (err) {
      console.warn('API vote sync warning:', err);
    } finally {
      setVoting(null);
    }
  };

  const exactCalculations = calculateExactPercentages(
    market.options,
    stats?.votes1 ?? 0,
    stats?.votesX ?? 0,
    stats?.votes2 ?? 0
  );

  const isUserSelected = (opt: PollOption) => {
    if (!stats?.userVote) return false;
    return stats.userVote === opt.key || stats.userVote === opt.dbKey;
  };

  return (
    <div className="p-3.5 sm:p-4 bg-slate-50/90 dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 text-left shadow-xs">
      {/* Clean Top Bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-extrabold text-[var(--text)] text-xs sm:text-sm">
          <Users className="w-4 h-4 text-amber-500 shrink-0" />
          <span>{market.question}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {isMatchFinished ? (
            <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-200/70 dark:bg-slate-800 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Lock className="w-2.5 h-2.5 text-slate-400" /> Match Ended
            </span>
          ) : (
            <span className="text-[10.5px] font-mono font-bold text-[var(--text-muted)] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-750">
              {stats.totalVotes === 0 ? '0 votes (Cast first vote)' : `${stats.totalVotes} total votes`}
            </span>
          )}
        </div>
      </div>

      {/* Clean Minimal Selection Boxes - Percentages add to EXACTLY 100% */}
      <div className={`grid gap-2.5 ${market.options.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {market.options.map((opt) => {
          const pct = exactCalculations.pcts[opt.key] ?? 0;
          const selected = isUserSelected(opt);

          return (
            <motion.button
              key={opt.key}
              whileTap={isMatchFinished ? undefined : { scale: 0.98 }}
              onClick={() => castVote(opt)}
              disabled={isMatchFinished || !!voting}
              className={`relative overflow-hidden p-2.5 sm:p-3 rounded-xl border text-center transition-all duration-200 flex flex-col items-center justify-between min-h-[64px] sm:min-h-[72px] ${
                isMatchFinished ? 'cursor-not-allowed opacity-90' : 'cursor-pointer hover:shadow-xs'
              } ${
                selected
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500/30'
                  : 'bg-white dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-750 text-[var(--text)] hover:border-amber-500/50'
              }`}
            >
              {/* Progress Fill */}
              {pct > 0 && (
                <div
                  className={`absolute left-0 bottom-0 top-0 transition-all duration-500 pointer-events-none opacity-20 dark:opacity-25 ${
                    selected 
                      ? 'bg-emerald-500' 
                      : opt.dbKey === '1' 
                        ? 'bg-indigo-500' 
                        : opt.dbKey === 'X' 
                          ? 'bg-amber-500' 
                          : 'bg-sky-500'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              )}

              {/* Top Option Label */}
              <div className="relative z-10 flex items-center justify-center gap-1.5 w-full px-1">
                <span className="font-extrabold text-xs sm:text-sm tracking-tight truncate">
                  {opt.label}
                </span>
                {selected && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 font-bold" />
                )}
              </div>

              {/* Sub-label helper if present */}
              {opt.sublabel && (
                <span className="relative z-10 text-[9.5px] sm:text-[10.5px] font-medium text-[var(--text-muted)] truncate max-w-full px-0.5 leading-none my-0.5">
                  {opt.sublabel}
                </span>
              )}

              {/* Big Clean Percentage */}
              <span className={`relative z-10 text-sm sm:text-base font-black font-mono leading-none ${
                selected ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--text)]'
              }`}>
                {pct}%
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
