import { useState, useEffect } from 'react';
import { Users, CheckCircle2, Sparkles } from 'lucide-react';
import { getApiBaseUrl } from '../lib/getApiBaseUrl';
import { detectMarketType, calculateExactPercentages } from './VotePoll';

interface VoteNudgeSnippetProps {
  fixtureId: string | number;
  prediction?: string;
  homeTeam?: string;
  awayTeam?: string;
  status?: string;
  result?: string;
  isEnded?: boolean;
  onExpand?: () => void;
  variant?: 'compact' | 'card' | 'desktop-row';
  className?: string;
}

export default function VoteNudgeSnippet({
  fixtureId,
  prediction,
  homeTeam,
  awayTeam,
  status,
  result,
  isEnded,
  onExpand,
  variant = 'compact',
  className = ''
}: VoteNudgeSnippetProps) {
  const [userVote, setUserVote] = useState<string | null>(null);
  const [counts, setCounts] = useState<{ v1: number; vX: number; v2: number }>({ v1: 0, vX: 0, v2: 0 });
  const [totalVotes, setTotalVotes] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasJustVoted, setHasJustVoted] = useState(false);

  const market = detectMarketType(prediction, homeTeam, awayTeam);

  const isMatchFinished =
    Boolean(isEnded) ||
    ['FT', 'AET', 'PEN', 'FINISHED', 'AWD', 'CANCELLED', 'POSTPONED'].includes(
      String(status || '').trim().toUpperCase()
    ) ||
    result === 'won' ||
    result === 'lost';

  useEffect(() => {
    let savedVote: string | null = null;
    if (typeof window !== 'undefined') {
      try {
        savedVote = localStorage.getItem(`vote_${fixtureId}`);
      } catch {}
    }
    setUserVote(savedVote);

    // Fetch real live votes from database backend
    const fetchLiveStats = async () => {
      try {
        const baseUrl = getApiBaseUrl();
        const visitorId = localStorage.getItem('aistudio_visitor_id') || 'visitor_anon';
        const res = await fetch(`${baseUrl}/api/predictions/vote?fixtureId=${encodeURIComponent(fixtureId)}&userId=${encodeURIComponent(visitorId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data) {
            if (data.userVote) {
              setUserVote(data.userVote);
              if (typeof window !== 'undefined') {
                try {
                  localStorage.setItem(`vote_${fixtureId}`, data.userVote);
                } catch {}
              }
            }
            const v1 = Number(data.votes1 || 0);
            const vX = Number(data.votesX || 0);
            const v2 = Number(data.votes2 || 0);
            const total = v1 + vX + v2;
            
            setCounts({ v1, vX, v2 });
            setTotalVotes(total);
          }
        }
      } catch (err) {
        console.warn('Live vote fetch error:', err);
      }
    };

    fetchLiveStats();
  }, [fixtureId]);

  const exactMath = calculateExactPercentages(market.options, counts.v1, counts.vX, counts.v2);

  const handleVote = async (e: React.MouseEvent, optionKey: string, dbKey: '1' | 'X' | '2') => {
    e.stopPropagation();
    if (userVote || isSubmitting || isMatchFinished) {
      if (onExpand) onExpand();
      return;
    }

    setIsSubmitting(true);
    setUserVote(optionKey);
    setHasJustVoted(true);

    // Optimistic UI update
    setCounts(prev => {
      const next = { ...prev };
      if (dbKey === '1') next.v1 += 1;
      else if (dbKey === 'X') next.vX += 1;
      else if (dbKey === '2') next.v2 += 1;
      return next;
    });
    setTotalVotes(prev => prev + 1);

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`vote_${fixtureId}`, optionKey);
      }

      let visitorId = localStorage.getItem('aistudio_visitor_id');
      if (!visitorId) {
        visitorId = 'visitor_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('aistudio_visitor_id', visitorId);
      }

      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/predictions/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fixtureId: String(fixtureId),
          vote: dbKey,
          userId: visitorId,
          isEnded: isMatchFinished,
          status
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.stats) {
          const s = data.stats;
          setCounts({
            v1: Number(s.votes1 || 0),
            vX: Number(s.votesX || 0),
            v2: Number(s.votes2 || 0)
          });
          setTotalVotes(Number(s.totalVotes || 0));
        }
      }
    } catch (err) {
      console.error('Vote submission error:', err);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setHasJustVoted(false), 2000);
    }
  };

  const options = market.options;

  // 1. MOBILE CARD VIEW
  if (variant === 'card') {
    return (
      <div 
        className={`w-full p-2.5 rounded-xl bg-slate-50/90 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 text-left space-y-2 select-none ${className}`}
        onClick={(e) => {
          if (onExpand) {
            e.stopPropagation();
            onExpand();
          }
        }}
      >
        {/* Minimal Header */}
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 font-extrabold text-[var(--text)]">
            <Users className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>{market.question}</span>
            {hasJustVoted && (
              <span className="text-[9.5px] font-black text-emerald-500 flex items-center gap-0.5 ml-1 animate-bounce">
                <Sparkles className="w-2.5 h-2.5" /> Voted
              </span>
            )}
          </div>

          <span className="text-[10px] font-mono text-[var(--text-muted)] font-bold">
            {totalVotes === 0 ? '0 votes' : `${totalVotes} votes`}
          </span>
        </div>

        {/* Clean Boxes with 100% Sum Guarantee */}
        <div className={`grid gap-1.5 ${options.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {options.map((opt, idx) => {
            const percentVal = exactMath.pcts[opt.key] ?? 0;
            const isVoted = userVote === opt.key || userVote === opt.dbKey;

            return (
              <button
                key={opt.key}
                disabled={isSubmitting || isMatchFinished}
                onClick={(e) => handleVote(e, opt.key, opt.dbKey)}
                className={`relative overflow-hidden py-1.5 px-2 rounded-lg border text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center min-h-[46px] ${
                  isVoted
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-extrabold ring-1 ring-emerald-500/40 shadow-xs'
                    : 'bg-white dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-750 text-[var(--text)] hover:border-amber-500/50 active:scale-[0.98]'
                }`}
              >
                {/* Visual Progress Fill */}
                {percentVal > 0 && (
                  <div 
                    className={`absolute left-0 top-0 bottom-0 opacity-20 dark:opacity-30 transition-all duration-500 pointer-events-none ${
                      isVoted 
                        ? 'bg-emerald-500' 
                        : idx === 0 
                          ? 'bg-indigo-500' 
                          : idx === 1 
                            ? 'bg-amber-500' 
                            : 'bg-sky-500'
                    }`}
                    style={{ width: `${percentVal}%` }}
                  />
                )}

                {/* Team / Choice Label */}
                <div className="relative z-10 w-full flex items-center justify-center gap-1">
                  <span className="font-bold text-[11px] truncate tracking-tight">
                    {opt.label}
                  </span>
                  {isVoted && (
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 font-black" />
                  )}
                </div>

                {/* Big Clean Percentage */}
                <span className={`relative z-10 text-[11.5px] font-black font-mono mt-0.5 leading-none ${
                  isVoted ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--text-muted)]'
                }`}>
                  {totalVotes === 0 ? '0%' : `${percentVal}%`}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // 2. ENHANCED DESKTOP NUDGE VIEW (Sleek, Minimalist, High-Density Table Chip)
  return (
    <button 
      type="button"
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100/80 dark:bg-slate-800/60 hover:bg-amber-500/10 hover:border-amber-500/30 border border-slate-200/60 dark:border-slate-750/70 text-left transition-all duration-150 group select-none cursor-pointer mt-0.5 max-w-full truncate ${className}`}
      onClick={(e) => {
        if (onExpand) {
          e.stopPropagation();
          onExpand();
        }
      }}
      title="Click to view full match fan poll & cast your vote"
    >
      <Users className="w-3 h-3 text-amber-500 shrink-0 group-hover:scale-110 transition-transform" />

      {totalVotes === 0 ? (
        <span className="text-[9.5px] font-mono text-[var(--text-muted)] group-hover:text-amber-600 dark:group-hover:text-amber-400">
          Fan Poll <span className="text-amber-500 font-bold">• Vote</span>
        </span>
      ) : (
        <div className="flex items-center gap-1 text-[9.5px] font-mono leading-none">
          {(() => {
            let topOpt = options[0];
            let topP = exactMath.pcts[options[0].key] ?? 0;
            for (const o of options) {
              const p = exactMath.pcts[o.key] ?? 0;
              if (p > topP) {
                topP = p;
                topOpt = o;
              }
            }

            return (
              <span className="text-[var(--text)] font-extrabold flex items-center gap-1">
                <span>{topP}%</span>
                <span className="text-[var(--text-muted)] font-bold">{topOpt.shortLabel}</span>
              </span>
            );
          })()}
          <span className="text-[8.5px] text-slate-400 dark:text-slate-500 font-mono">({totalVotes})</span>
        </div>
      )}

      {userVote && (
        <span className="inline-flex items-center text-emerald-500 shrink-0 ml-0.5" title={`You voted ${userVote}`}>
          <CheckCircle2 className="w-2.5 h-2.5" />
        </span>
      )}
    </button>
  );
}
