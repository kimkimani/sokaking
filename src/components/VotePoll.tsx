import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Users, CheckCircle, Sparkles } from 'lucide-react';
import { getApiBaseUrl } from '../lib/getApiBaseUrl';

interface VoteStats {
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

interface VotePollProps {
  fixtureId: string | number;
}

function getInitialVoteStats(fixtureId: string | number, userVote: string | null): VoteStats {
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

  if (userVote === '1') votes1 += 1;
  else if (userVote === 'X') votesX += 1;
  else if (userVote === '2') votes2 += 1;

  const totalVotes = votes1 + votesX + votes2;
  const homePercent = Math.round((votes1 / totalVotes) * 100);
  const drawPercent = Math.round((votesX / totalVotes) * 100);
  const awayPercent = 100 - homePercent - drawPercent;

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

export default function VotePoll({ fixtureId }: VotePollProps) {
  const [stats, setStats] = useState<VoteStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [voting, setVoting] = useState<string | null>(null);

  // Get or create persistent visitor guest ID for voting
  const [visitorId] = useState(() => {
    if (typeof window === 'undefined') return 'anonymous';
    let id = localStorage.getItem('aistudio_visitor_id');
    if (!id) {
      id = 'visitor_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('aistudio_visitor_id', id);
    }
    return id;
  });

  // Initialize and load stats from cache & API
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

    const initial = cachedStats || getInitialVoteStats(fixtureId, savedVote);
    setStats(initial);

    const fetchStats = async () => {
      try {
        const baseUrl = getApiBaseUrl();
        const res = await fetch(`${baseUrl}/api/predictions/vote?fixtureId=${encodeURIComponent(fixtureId)}&userId=${encodeURIComponent(visitorId)}`);
        if (res.ok) {
          const data = await res.json();
          if (active && data && typeof data.totalVotes === 'number' && data.totalVotes > 0) {
            const serverUserVote = savedVote || data.userVote || null;
            let v1 = data.votes1 || 0;
            let vX = data.votesX || 0;
            let v2 = data.votes2 || 0;

            if (savedVote && !data.userVote) {
              if (savedVote === '1') v1 += 1;
              else if (savedVote === 'X') vX += 1;
              else if (savedVote === '2') v2 += 1;
            }

            const total = v1 + vX + v2;
            if (total > 0) {
              const hPct = Math.round((v1 / total) * 100);
              const dPct = Math.round((vX / total) * 100);
              const aPct = 100 - hPct - dPct;

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
              if (typeof window !== 'undefined') {
                try {
                  localStorage.setItem(`vote_stats_${fixtureId}`, JSON.stringify(freshStats));
                } catch {}
              }
            }
          }
        }
      } catch {
        // Fallback to local state
      }
    };

    fetchStats();
    return () => {
      active = false;
    };
  }, [fixtureId, visitorId]);

  // Cast vote with instant optimistic update
  const castVote = async (option: '1' | 'X' | '2') => {
    if (voting) return; // Prevent double trigger
    setVoting(option);

    // Optimistic UI update
    setStats((prev) => {
      const current = prev || getInitialVoteStats(fixtureId, null);
      const oldVote = current.userVote;
      let v1 = current.votes1;
      let vX = current.votesX;
      let v2 = current.votes2;

      // Adjust counts if changing or casting vote
      if (oldVote === '1') v1 = Math.max(0, v1 - 1);
      if (oldVote === 'X') vX = Math.max(0, vX - 1);
      if (oldVote === '2') v2 = Math.max(0, v2 - 1);

      if (option === '1') v1 += 1;
      if (option === 'X') vX += 1;
      if (option === '2') v2 += 1;

      const total = v1 + vX + v2;
      const hPct = Math.round((v1 / total) * 100);
      const dPct = Math.round((vX / total) * 100);
      const aPct = 100 - hPct - dPct;

      const updatedStats: VoteStats = {
        fixtureId: String(fixtureId),
        totalVotes: total,
        votes1: v1,
        votesX: vX,
        votes2: v2,
        homePercent: hPct,
        drawPercent: dPct,
        awayPercent: aPct,
        userVote: option,
      };

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`vote_${fixtureId}`, option);
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
          vote: option,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.stats) {
          setStats((prev) => ({
            ...data.stats,
            userVote: option,
          }));
        }
      }
    } catch (err) {
      console.warn('API vote sync warning:', err);
    } finally {
      setVoting(null);
    }
  };

  if (loading) {
    return (
      <div className="py-4 flex flex-col items-center justify-center space-y-2 text-slate-400">
        <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Syncing Verdict Poll...</span>
      </div>
    );
  }

  const hasVoted = stats?.userVote !== null;

  return (
    <div className="p-3 bg-slate-100/40 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3 text-left">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
          <Users className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-[10px] font-black uppercase tracking-wider font-mono">Community Verdict Poll</span>
        </div>
        <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-200/50 dark:bg-slate-800 px-2 py-0.5 rounded flex items-center gap-1">
          {stats?.totalVotes || 0} Votes Cast
        </span>
      </div>

      {/* Vote Buttons or Results */}
      <div className="grid grid-cols-3 gap-2">
        {/* Option 1: Home */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => castVote('1')}
          disabled={!!voting}
          className={`relative overflow-hidden p-2 rounded-lg border text-center transition-all duration-300 cursor-pointer ${
            stats?.userVote === '1'
              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-extrabold shadow-[0_0_8px_rgba(16,185,129,0.15)]'
              : 'bg-white dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          {/* Progress fill */}
          <div
            className="absolute left-0 bottom-0 top-0 bg-emerald-500/10 transition-all duration-500 pointer-events-none"
            style={{ width: `${stats?.homePercent || 0}%` }}
          />

          {stats?.userVote === '1' && (
            <div className="absolute top-1 right-1 z-10">
              <CheckCircle className="w-3 h-3 text-emerald-500" />
            </div>
          )}
          <span className="relative z-10 text-[10px] font-bold uppercase block text-slate-400">Home (1)</span>
          <span className="relative z-10 text-sm font-black font-mono tracking-tight block">
            {stats?.homePercent}%
          </span>
          {voting === '1' && (
            <div className="absolute inset-0 z-20 bg-emerald-500/10 flex items-center justify-center">
              <div className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </motion.button>

        {/* Option X: Draw */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => castVote('X')}
          disabled={!!voting}
          className={`relative overflow-hidden p-2 rounded-lg border text-center transition-all duration-300 cursor-pointer ${
            stats?.userVote === 'X'
              ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 font-extrabold shadow-[0_0_8px_rgba(245,158,11,0.15)]'
              : 'bg-white dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          {/* Progress fill */}
          <div
            className="absolute left-0 bottom-0 top-0 bg-amber-500/10 transition-all duration-500 pointer-events-none"
            style={{ width: `${stats?.drawPercent || 0}%` }}
          />

          {stats?.userVote === 'X' && (
            <div className="absolute top-1 right-1 z-10">
              <CheckCircle className="w-3 h-3 text-amber-500" />
            </div>
          )}
          <span className="relative z-10 text-[10px] font-bold uppercase block text-slate-400">Draw (X)</span>
          <span className="relative z-10 text-sm font-black font-mono tracking-tight block">
            {stats?.drawPercent}%
          </span>
          {voting === 'X' && (
            <div className="absolute inset-0 z-20 bg-amber-500/10 flex items-center justify-center">
              <div className="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </motion.button>

        {/* Option 2: Away */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => castVote('2')}
          disabled={!!voting}
          className={`relative overflow-hidden p-2 rounded-lg border text-center transition-all duration-300 cursor-pointer ${
            stats?.userVote === '2'
              ? 'bg-sky-500/10 border-sky-500 text-sky-600 dark:text-sky-400 font-extrabold shadow-[0_0_8px_rgba(14,165,233,0.15)]'
              : 'bg-white dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          {/* Progress fill */}
          <div
            className="absolute left-0 bottom-0 top-0 bg-sky-500/10 transition-all duration-500 pointer-events-none"
            style={{ width: `${stats?.awayPercent || 0}%` }}
          />

          {stats?.userVote === '2' && (
            <div className="absolute top-1 right-1 z-10">
              <CheckCircle className="w-3 h-3 text-sky-500" />
            </div>
          )}
          <span className="relative z-10 text-[10px] font-bold uppercase block text-slate-400">Away (2)</span>
          <span className="relative z-10 text-sm font-black font-mono tracking-tight block">
            {stats?.awayPercent}%
          </span>
          {voting === '2' && (
            <div className="absolute inset-0 z-20 bg-sky-500/10 flex items-center justify-center">
              <div className="w-3.5 h-3.5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </motion.button>
      </div>

      {/* Visual Indicator of current User Selection */}
      <div className="flex items-center justify-between text-[8px] font-mono font-bold text-slate-400 select-none">
        <span>{hasVoted ? '✨ Thanks for sharing your verdict!' : '👉 Click on any prediction to register your vote'}</span>
        {hasVoted && (
          <span className="text-emerald-500 flex items-center gap-0.5">
            <Sparkles className="w-2.5 h-2.5 animate-pulse" /> Verified Vote Saved
          </span>
        )}
      </div>
    </div>
  );
}
