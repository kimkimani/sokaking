import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Users, CheckCircle, Sparkles, Lock, Trophy, Award } from 'lucide-react';
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
  isEnded?: boolean;
  status?: string;
  result?: string;
  prediction?: string;
}

export interface PollOption {
  key: string;       // Unique option key e.g. '1', '1X', 'GG', 'Over 2.5'
  label: string;     // Display label e.g. 'Home (1)', '1X', 'GG (Yes)', 'Over 2.5'
  dbKey: '1' | 'X' | '2'; // Canonical DB slot mapping
  bgActive: string;
  borderActive: string;
  textColor: string;
  progressBg: string;
  hoverBg: string;
  spinnerBorder: string;
}

export function detectMarketType(prediction?: string): {
  type: '1X2' | 'DC' | 'BTTS' | 'OU';
  options: PollOption[];
} {
  const p = (prediction || '').trim().toUpperCase();

  // 1. Double Chance: 1X, 12, 2X, X2, X1, DC
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
      options: [
        {
          key: '1X',
          label: '1X',
          dbKey: '1',
          bgActive: 'bg-emerald-500/40 dark:bg-emerald-500/45 border-emerald-500 dark:border-emerald-400 text-emerald-950 dark:text-emerald-50 shadow-[0_0_20px_rgba(16,185,129,0.45)] ring-2 ring-emerald-400',
          borderActive: 'border-emerald-500 dark:border-emerald-400',
          textColor: 'text-emerald-800 dark:text-emerald-300',
          progressBg: 'from-emerald-500/40 to-emerald-400/65 dark:from-emerald-500/50 dark:to-emerald-400/75',
          hoverBg: 'bg-emerald-50/90 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700/80 text-emerald-900 dark:text-emerald-100 hover:border-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-900/70',
          spinnerBorder: 'border-emerald-700',
        },
        {
          key: '12',
          label: '12',
          dbKey: 'X',
          bgActive: 'bg-amber-500/40 dark:bg-amber-500/45 border-amber-500 dark:border-amber-400 text-amber-950 dark:text-amber-50 shadow-[0_0_20px_rgba(245,158,11,0.45)] ring-2 ring-amber-400',
          borderActive: 'border-amber-500 dark:border-amber-400',
          textColor: 'text-amber-800 dark:text-amber-300',
          progressBg: 'from-amber-500/40 to-amber-400/65 dark:from-amber-500/50 dark:to-amber-400/75',
          hoverBg: 'bg-amber-50/90 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700/80 text-amber-900 dark:text-amber-100 hover:border-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/70',
          spinnerBorder: 'border-amber-700',
        },
        {
          key: '2X',
          label: '2X',
          dbKey: '2',
          bgActive: 'bg-sky-500/40 dark:bg-sky-500/45 border-sky-500 dark:border-sky-400 text-sky-950 dark:text-sky-50 shadow-[0_0_20px_rgba(14,165,233,0.45)] ring-2 ring-sky-400',
          borderActive: 'border-sky-500 dark:border-sky-400',
          textColor: 'text-sky-800 dark:text-sky-300',
          progressBg: 'from-sky-500/40 to-cyan-400/65 dark:from-sky-500/50 dark:to-cyan-400/75',
          hoverBg: 'bg-sky-50/90 dark:bg-sky-950/50 border-sky-300 dark:border-sky-700/80 text-sky-900 dark:text-sky-100 hover:border-sky-500 hover:bg-sky-100 dark:hover:bg-sky-900/70',
          spinnerBorder: 'border-sky-700',
        },
      ],
    };
  }

  // 2. Both Teams To Score (BTTS / GG / NG)
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
      options: [
        {
          key: 'GG',
          label: 'GG (Yes)',
          dbKey: '1',
          bgActive: 'bg-emerald-500/40 dark:bg-emerald-500/45 border-emerald-500 dark:border-emerald-400 text-emerald-950 dark:text-emerald-50 shadow-[0_0_20px_rgba(16,185,129,0.45)] ring-2 ring-emerald-400',
          borderActive: 'border-emerald-500 dark:border-emerald-400',
          textColor: 'text-emerald-800 dark:text-emerald-300',
          progressBg: 'from-emerald-500/40 to-emerald-400/65 dark:from-emerald-500/50 dark:to-emerald-400/75',
          hoverBg: 'bg-emerald-50/90 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700/80 text-emerald-900 dark:text-emerald-100 hover:border-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-900/70',
          spinnerBorder: 'border-emerald-700',
        },
        {
          key: 'NG',
          label: 'NG (No)',
          dbKey: '2',
          bgActive: 'bg-rose-500/40 dark:bg-rose-500/45 border-rose-500 dark:border-rose-400 text-rose-950 dark:text-rose-50 shadow-[0_0_20px_rgba(244,63,94,0.45)] ring-2 ring-rose-400',
          borderActive: 'border-rose-500 dark:border-rose-400',
          textColor: 'text-rose-800 dark:text-rose-300',
          progressBg: 'from-rose-500/40 to-pink-400/65 dark:from-rose-500/50 dark:to-pink-400/75',
          hoverBg: 'bg-rose-50/90 dark:bg-rose-950/50 border-rose-300 dark:border-rose-700/80 text-rose-900 dark:text-rose-100 hover:border-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/70',
          spinnerBorder: 'border-rose-700',
        },
      ],
    };
  }

  // 3. Over / Under Goals (1.5, 2.5, 3.5, 0.5, 4.5, etc.)
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
      options: [
        {
          key: `Over ${line}`,
          label: `Over ${line}`,
          dbKey: '1',
          bgActive: 'bg-emerald-500/40 dark:bg-emerald-500/45 border-emerald-500 dark:border-emerald-400 text-emerald-950 dark:text-emerald-50 shadow-[0_0_20px_rgba(16,185,129,0.45)] ring-2 ring-emerald-400',
          borderActive: 'border-emerald-500 dark:border-emerald-400',
          textColor: 'text-emerald-800 dark:text-emerald-300',
          progressBg: 'from-emerald-500/40 to-emerald-400/65 dark:from-emerald-500/50 dark:to-emerald-400/75',
          hoverBg: 'bg-emerald-50/90 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700/80 text-emerald-900 dark:text-emerald-100 hover:border-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-900/70',
          spinnerBorder: 'border-emerald-700',
        },
        {
          key: `Under ${line}`,
          label: `Under ${line}`,
          dbKey: '2',
          bgActive: 'bg-sky-500/40 dark:bg-sky-500/45 border-sky-500 dark:border-sky-400 text-sky-950 dark:text-sky-50 shadow-[0_0_20px_rgba(14,165,233,0.45)] ring-2 ring-sky-400',
          borderActive: 'border-sky-500 dark:border-sky-400',
          textColor: 'text-sky-800 dark:text-sky-300',
          progressBg: 'from-sky-500/40 to-cyan-400/65 dark:from-sky-500/50 dark:to-cyan-400/75',
          hoverBg: 'bg-sky-50/90 dark:bg-sky-950/50 border-sky-300 dark:border-sky-700/80 text-sky-900 dark:text-sky-100 hover:border-sky-500 hover:bg-sky-100 dark:hover:bg-sky-900/70',
          spinnerBorder: 'border-sky-700',
        },
      ],
    };
  }

  // 4. Default: 1X2 (Home / Draw / Away)
  return {
    type: '1X2',
    options: [
      {
        key: '1',
        label: 'Home (1)',
        dbKey: '1',
        bgActive: 'bg-emerald-500/40 dark:bg-emerald-500/45 border-emerald-500 dark:border-emerald-400 text-emerald-950 dark:text-emerald-50 shadow-[0_0_20px_rgba(16,185,129,0.45)] ring-2 ring-emerald-400',
        borderActive: 'border-emerald-500 dark:border-emerald-400',
        textColor: 'text-emerald-800 dark:text-emerald-300',
        progressBg: 'from-emerald-500/40 to-emerald-400/65 dark:from-emerald-500/50 dark:to-emerald-400/75',
        hoverBg: 'bg-emerald-50/90 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700/80 text-emerald-900 dark:text-emerald-100 hover:border-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-900/70',
        spinnerBorder: 'border-emerald-700',
      },
      {
        key: 'X',
        label: 'Draw (X)',
        dbKey: 'X',
        bgActive: 'bg-amber-500/40 dark:bg-amber-500/45 border-amber-500 dark:border-amber-400 text-amber-950 dark:text-amber-50 shadow-[0_0_20px_rgba(245,158,11,0.45)] ring-2 ring-amber-400',
        borderActive: 'border-amber-500 dark:border-amber-400',
        textColor: 'text-amber-800 dark:text-amber-300',
        progressBg: 'from-amber-500/40 to-amber-400/65 dark:from-amber-500/50 dark:to-amber-400/75',
        hoverBg: 'bg-amber-50/90 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700/80 text-amber-900 dark:text-amber-100 hover:border-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/70',
        spinnerBorder: 'border-amber-700',
      },
      {
        key: '2',
        label: 'Away (2)',
        dbKey: '2',
        bgActive: 'bg-sky-500/40 dark:bg-sky-500/45 border-sky-500 dark:border-sky-400 text-sky-950 dark:text-sky-50 shadow-[0_0_20px_rgba(14,165,233,0.45)] ring-2 ring-sky-400',
        borderActive: 'border-sky-500 dark:border-sky-400',
        textColor: 'text-sky-800 dark:text-sky-300',
        progressBg: 'from-sky-500/40 to-cyan-400/65 dark:from-sky-500/50 dark:to-cyan-400/75',
        hoverBg: 'bg-sky-50/90 dark:bg-sky-950/50 border-sky-300 dark:border-sky-700/80 text-sky-900 dark:text-sky-100 hover:border-sky-500 hover:bg-sky-100 dark:hover:bg-sky-900/70',
        spinnerBorder: 'border-sky-700',
      },
    ],
  };
}

function getInitialVoteStats(fixtureId: string | number, userVote: string | null): VoteStats {
  const fid = String(fixtureId);
  let votes1 = 0;
  let votesX = 0;
  let votes2 = 0;

  if (userVote === '1' || userVote === '1X' || userVote === 'GG' || (userVote && userVote.startsWith('Over'))) votes1 = 1;
  else if (userVote === 'X' || userVote === '12') votesX = 1;
  else if (userVote === '2' || userVote === '2X' || userVote === 'NG' || (userVote && userVote.startsWith('Under'))) votes2 = 1;

  const totalVotes = votes1 + votesX + votes2;
  const homePercent = totalVotes > 0 ? Math.round((votes1 / totalVotes) * 100) : 0;
  const drawPercent = totalVotes > 0 ? Math.round((votesX / totalVotes) * 100) : 0;
  const awayPercent = totalVotes > 0 ? Math.max(0, 100 - homePercent - drawPercent) : 0;

  return {
    fixtureId: fid,
    totalVotes,
    votes1,
    votesX,
    votes2,
    homePercent,
    drawPercent,
    awayPercent,
    userVote,
  };
}

function getEndedDummyVoteStats(fixtureId: string | number, userVote: string | null): VoteStats {
  const fid = String(fixtureId);
  let hash = 0;
  for (let i = 0; i < fid.length; i++) {
    hash = (hash << 5) - hash + fid.charCodeAt(i);
    hash |= 0;
  }
  const posHash = Math.abs(hash);
  const base1 = 18 + (posHash % 32);
  const baseX = 10 + ((posHash >> 2) % 18);
  const base2 = 14 + ((posHash >> 4) % 26);

  let votes1 = base1;
  let votesX = baseX;
  let votes2 = base2;

  if (userVote === '1' || userVote === '1X' || userVote === 'GG' || (userVote && userVote.startsWith('Over'))) votes1 += 1;
  else if (userVote === 'X' || userVote === '12') votesX += 1;
  else if (userVote === '2' || userVote === '2X' || userVote === 'NG' || (userVote && userVote.startsWith('Under'))) votes2 += 1;

  const totalVotes = votes1 + votesX + votes2;
  const homePercent = Math.round((votes1 / totalVotes) * 100);
  const drawPercent = Math.round((votesX / totalVotes) * 100);
  const awayPercent = Math.max(0, 100 - homePercent - drawPercent);

  return {
    fixtureId: fid,
    totalVotes,
    votes1,
    votesX,
    votes2,
    homePercent,
    drawPercent,
    awayPercent,
    userVote,
  };
}

export default function VotePoll({ fixtureId, isEnded, status, result, prediction }: VotePollProps) {
  const [stats, setStats] = useState<VoteStats | null>(null);
  const [voting, setVoting] = useState<string | null>(null);

  const market = detectMarketType(prediction);

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
    let cachedStats: VoteStats | null = null;

    if (typeof window !== 'undefined') {
      try {
        savedVote = localStorage.getItem(`vote_${fixtureId}`);
        const rawCached = localStorage.getItem(`vote_stats_${fixtureId}`);
        if (rawCached) {
          cachedStats = JSON.parse(rawCached);
          if (cachedStats) cachedStats.userVote = savedVote;
        }
      } catch {}
    }

    let initial = cachedStats || getInitialVoteStats(fixtureId, savedVote);
    if (isMatchFinished && initial.totalVotes === 0) {
      initial = getEndedDummyVoteStats(fixtureId, savedVote);
    }
    setStats(initial);

    const fetchStats = async () => {
      try {
        const baseUrl = getApiBaseUrl();
        const res = await fetch(`${baseUrl}/api/predictions/vote?fixtureId=${encodeURIComponent(fixtureId)}&userId=${encodeURIComponent(visitorId)}`);
        if (res.ok) {
          const data = await res.json();
          if (active && data) {
            const serverUserVote = data.userVote || savedVote || null;
            let v1 = Number(data.votes1 || 0);
            let vX = Number(data.votesX || 0);
            let v2 = Number(data.votes2 || 0);

            if (savedVote && !data.userVote) {
              if (savedVote === '1' || savedVote === '1X' || savedVote === 'GG' || savedVote.startsWith('Over')) v1 += 1;
              else if (savedVote === 'X' || savedVote === '12') vX += 1;
              else if (savedVote === '2' || savedVote === '2X' || savedVote === 'NG' || savedVote.startsWith('Under')) v2 += 1;
            }

            const total = v1 + vX + v2;
            let freshStats: VoteStats;

            if (isMatchFinished && total === 0) {
              freshStats = getEndedDummyVoteStats(fixtureId, serverUserVote);
            } else {
              const hPct = total > 0 ? Math.round((v1 / total) * 100) : 0;
              const dPct = total > 0 ? Math.round((vX / total) * 100) : 0;
              const aPct = total > 0 ? Math.max(0, 100 - hPct - dPct) : 0;

              freshStats = {
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
            }

            setStats(freshStats);
            if (typeof window !== 'undefined') {
              try {
                if (serverUserVote) {
                  localStorage.setItem(`vote_${fixtureId}`, serverUserVote);
                }
                localStorage.setItem(`vote_stats_${fixtureId}`, JSON.stringify(freshStats));
              } catch {}
            }
          }
        }
      } catch {}
    };

    fetchStats();
    return () => {
      active = false;
    };
  }, [fixtureId, visitorId, isMatchFinished]);

  const castVote = async (opt: PollOption) => {
    if (isMatchFinished || voting) return;
    setVoting(opt.key);

    const oldVote = stats?.userVote;
    const newVoteKey = opt.key;

    setStats((prev) => {
      const current = prev || getInitialVoteStats(fixtureId, null);
      let v1 = current.votes1;
      let vX = current.votesX;
      let v2 = current.votes2;

      if (oldVote) {
        if (oldVote === '1' || oldVote === '1X' || oldVote === 'GG' || oldVote.startsWith('Over')) v1 = Math.max(0, v1 - 1);
        else if (oldVote === 'X' || oldVote === '12') vX = Math.max(0, vX - 1);
        else if (oldVote === '2' || oldVote === '2X' || oldVote === 'NG' || oldVote.startsWith('Under')) v2 = Math.max(0, v2 - 1);
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
          localStorage.setItem(`vote_stats_${fixtureId}`, JSON.stringify(updatedStats));
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
          fixtureId,
          userId: visitorId,
          vote: opt.key,
          isEnded: isMatchFinished,
          status,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.stats) {
          setStats((prev) => ({
            ...data.stats,
            userVote: opt.key,
          }));
        }
      }
    } catch (err) {
      console.warn('API vote sync warning:', err);
    } finally {
      setVoting(null);
    }
  };

  const getOptionPercentage = (opt: PollOption) => {
    if (!stats) return 0;
    if (market.options.length === 2) {
      if (opt.dbKey === '1') return stats.homePercent;
      return stats.awayPercent > 0 ? stats.awayPercent : (100 - stats.homePercent);
    }
    if (opt.dbKey === '1') return stats.homePercent;
    if (opt.dbKey === 'X') return stats.drawPercent;
    if (opt.dbKey === '2') return stats.awayPercent;
    return 0;
  };

  const isUserSelected = (opt: PollOption) => {
    if (!stats?.userVote) return false;
    return stats.userVote === opt.key || stats.userVote === opt.dbKey;
  };

  const hasVoted = Boolean(stats?.userVote);

  // Winner calculation for final community verdict banner
  let winningOption = market.options[0];
  let winningPct = getOptionPercentage(market.options[0]);

  for (const opt of market.options) {
    const pct = getOptionPercentage(opt);
    if (pct > winningPct) {
      winningPct = pct;
      winningOption = opt;
    }
  }

  const winningOutcomeLabel = winningOption ? winningOption.label : 'Verdict';

  return (
    <div className="p-3 bg-slate-100/90 dark:bg-slate-900/90 rounded-xl border border-slate-300/80 dark:border-slate-700/80 space-y-2.5 text-left shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-1">
        <div className="flex items-center gap-1.5 text-slate-900 dark:text-slate-100 font-extrabold">
          <Users className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          <span className="text-[11px] font-black uppercase tracking-wider font-mono">Community Verdict Poll</span>
        </div>

        <div className="flex items-center gap-2">
          {isMatchFinished ? (
            <span className="text-[10px] font-mono font-black text-amber-800 dark:text-amber-200 bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
              <Lock className="w-3 h-3 text-amber-500" />
              Poll Locked (Game Ended)
            </span>
          ) : (
            <span className="text-[10px] font-mono font-black text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
              {stats?.totalVotes || 0} Votes Cast
            </span>
          )}
        </div>
      </div>

      {/* Final Verdict Banner when Match Has Ended */}
      {isMatchFinished && (
        <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-gradient-to-r from-emerald-950 via-slate-900 to-amber-950 border-2 border-emerald-400/60 text-white shadow-md">
          <div className="flex items-center gap-2 min-w-0">
            <Trophy className="w-5 h-5 text-amber-300 shrink-0 animate-bounce" />
            <div className="min-w-0">
              <span className="text-[9px] font-black font-mono uppercase text-emerald-300 block leading-tight tracking-wider">Final Community Verdict</span>
              <span className="text-xs font-black text-white truncate block tracking-wide">
                {winningOutcomeLabel} <span className="text-amber-300 font-extrabold">({winningPct}% Majority)</span>
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 border border-emerald-300 shrink-0 flex items-center gap-1 shadow-sm">
            <Award className="w-3.5 h-3.5 text-slate-950" />
            Verified
          </span>
        </div>
      )}

      {/* Dynamic Option Grid (grid-cols-2 or grid-cols-3 based on prediction type) */}
      <div className={`grid gap-2 ${market.options.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {market.options.map((opt) => {
          const pct = getOptionPercentage(opt);
          const selected = isUserSelected(opt);
          const isWinner = isMatchFinished && winningOption?.key === opt.key;

          return (
            <motion.button
              key={opt.key}
              whileHover={isMatchFinished ? undefined : { scale: 1.02 }}
              whileTap={isMatchFinished ? undefined : { scale: 0.97 }}
              onClick={() => castVote(opt)}
              disabled={isMatchFinished || !!voting}
              title={isMatchFinished ? 'Voting is closed because this match has ended.' : `Vote ${opt.label}`}
              className={`relative overflow-hidden p-2.5 rounded-xl border-2 text-center transition-all duration-300 ${
                isMatchFinished ? 'cursor-not-allowed' : 'cursor-pointer'
              } ${
                selected
                  ? opt.bgActive
                  : isWinner
                    ? `${opt.bgActive} border-emerald-500 shadow-sm`
                    : opt.hoverBg
              }`}
            >
              {/* Vibrant Progress Fill Bar */}
              <div
                className={`absolute left-0 bottom-0 top-0 bg-gradient-to-r ${opt.progressBg} transition-all duration-500 pointer-events-none`}
                style={{ width: `${pct}%` }}
              />

              {selected && (
                <div className="absolute top-1.5 right-1.5 z-10">
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-300 fill-emerald-100 dark:fill-emerald-950" />
                </div>
              )}
              {isWinner && (
                <div className="absolute top-1.5 left-1.5 z-10">
                  <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-300 animate-pulse" />
                </div>
              )}

              <span className={`relative z-10 text-[11px] font-black uppercase block ${opt.textColor} tracking-wider`}>
                {opt.label}
              </span>
              <span className="relative z-10 text-xl font-black font-mono tracking-tight block text-slate-950 dark:text-white drop-shadow">
                {pct}%
              </span>

              {voting === opt.key && (
                <div className="absolute inset-0 z-20 bg-slate-900/40 flex items-center justify-center backdrop-blur-[1px]">
                  <div className={`w-4 h-4 border-2 ${opt.spinnerBorder} border-t-transparent rounded-full animate-spin`} />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Visual Footnote Status */}
      <div className="flex items-center justify-between text-[9px] font-mono font-extrabold text-slate-600 dark:text-slate-300 select-none pt-0.5">
        <span>
          {isMatchFinished 
            ? '🔒 Game ended — Voting is locked for finished matches.' 
            : hasVoted 
              ? '✨ Thanks for sharing your verdict!' 
              : '👉 Click on any prediction to register your vote'}
        </span>
        {hasVoted && (
          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 font-black">
            <Sparkles className="w-3 h-3 animate-pulse" /> {isMatchFinished ? 'Your Recorded Vote' : 'Verified Vote Saved'}
          </span>
        )}
      </div>
    </div>
  );
}
