import { motion } from 'motion/react';
import { Trophy, Clock, ArrowRight, ShieldCheck, Zap, HelpCircle, Star } from 'lucide-react';
import { jackpotsData, JackpotConfig } from '../jackpotsData';
import FaqSection from './FaqSection';
import { getMarkdownContent } from '../content/markdownLoader';
import MarkdownRenderer from './MarkdownRenderer';
import { AuthorCard } from './AuthorCard';
import { ResponsibleGamblingNotice } from './ResponsibleGamblingNotice';
import { FlagImage } from '../utils/flagUtils';
import { sortJackpotsByStatusAndTime } from '../utils/jackpotDateShifter';

interface JackpotListPageProps {
  onSelectJackpot: (jackpotId: string) => void;
  unlockedJackpots: string[];
  hasPaidJackpot: boolean;
  jackpots?: JackpotConfig[];
}

export default function JackpotListPage({ 
  onSelectJackpot, 
  unlockedJackpots, 
  hasPaidJackpot,
  jackpots
}: JackpotListPageProps) {
  
  const listData = sortJackpotsByStatusAndTime(jackpots && jackpots.length > 0 ? jackpots : jackpotsData);
  const pageMd = getMarkdownContent('jackpot-list');
  
  // Custom brand badges matching actual Kenyan betting houses
  const getBrandInfo = (id: string) => {
    switch(id) {
      case 'sportpesa-mega':
      case 'sportpesa-midweek':
        return {
          brand: 'SportPesa',
          bgClass: 'bg-blue-600/10 text-blue-500 dark:text-blue-400 border-blue-500/20',
          badgeText: 'SP',
          logoColor: 'text-blue-500'
        };
      case 'betika-grand':
      case 'betika-midweek':
        return {
          brand: 'Betika',
          bgClass: 'bg-emerald-600/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20',
          badgeText: 'BK',
          logoColor: 'text-emerald-500'
        };
      case 'mozzart-super-grand':
      case 'mozzart-daily':
      case 'mozzart-super-daily':
        return {
          brand: 'Mozzart',
          bgClass: 'bg-amber-600/10 text-amber-500 dark:text-amber-400 border-amber-500/20',
          badgeText: 'MZ',
          logoColor: 'text-amber-500'
        };
      case 'sportybet-jackpot':
        return {
          brand: 'SportyBet',
          bgClass: 'bg-red-600/10 text-red-500 dark:text-red-400 border-red-500/20',
          badgeText: 'SB',
          logoColor: 'text-red-500'
        };
      case 'betpawa-pick-jackpot':
        return {
          brand: 'betPawa',
          bgClass: 'bg-lime-600/10 text-lime-500 dark:text-lime-400 border-lime-500/20',
          badgeText: 'BP',
          logoColor: 'text-lime-500'
        };
      case 'odibet-laki-tatu':
        return {
          brand: 'OdiBet',
          bgClass: 'bg-green-600/10 text-green-500 dark:text-green-400 border-green-500/20',
          badgeText: 'OD',
          logoColor: 'text-green-500'
        };
      default:
        return {
          brand: 'Premium',
          bgClass: 'bg-purple-600/10 text-purple-500 dark:text-purple-400 border-purple-500/20',
          badgeText: 'PR',
          logoColor: 'text-purple-500'
        };
    }
  };

  return (
    <div className="space-y-8 text-left animate-fadeIn">
      {/* 1. HERO HEADER BANNER */}
      <div className="relative overflow-hidden p-6 md:p-8 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow)]">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 via-[var(--primary)] to-indigo-500" />
        
        <div className="max-w-3xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1 animate-pulse">
              <Trophy className="w-3 h-3" /> All Major Jackpots
            </span>
            <span className="text-[10px] text-[var(--text-muted)] font-mono font-bold uppercase tracking-wider">
              2026 Kenyan Season
            </span>
          </div>
          
          <h1 className="text-xl md:text-3xl font-black text-[var(--text)] tracking-tight uppercase" style={{ fontFamily: 'var(--font-display)' }}>
            {pageMd.displayTitle || pageMd.title || <>KENYA'S BEST <span className="text-[var(--primary)]">JACKPOT PREDICTIONS</span></>}
          </h1>
          <p className="text-xs md:text-sm text-[var(--text-muted)] leading-relaxed max-w-2xl">
            Access scientifically curated prediction slips with double-chance parameters and safety locks designed by sports scientists and football analysts. We offer predictions for all Kenya-facing major bookmaker jackpots.
          </p>
        </div>

        {/* Highlight Stats Block */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 mt-6 border-t border-[var(--border)]">
          <div className="space-y-1">
            <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold font-mono">Jackpot Slips</span>
            <p className="text-sm font-black text-[var(--text)]">6 Active Listings</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold font-mono">Bonus Hit Rate</span>
            <p className="text-sm font-black text-emerald-500">84.2% Verified</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold font-mono">Payment Method</span>
            <p className="text-sm font-black text-[var(--text)]">M-Pesa Express</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold font-mono">Unlock Window</span>
            <p className="text-sm font-black text-indigo-500">Instant SMS Code</p>
          </div>
        </div>
      </div>

      {/* SEO Markdown Middle Section */}
      {pageMd && pageMd.middle && (
        <div className="p-5 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow)] text-left text-xs leading-relaxed text-[var(--text-muted)]">
          <MarkdownRenderer content={pageMd.middle} />
        </div>
      )}

      {/* 2. ALL JACKPOTS GRID */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <span className="w-2.5 h-5 rounded bg-[var(--primary)] block" />
          <h2 className="text-sm font-black uppercase text-[var(--text)] tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
            Available Football Jackpots
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {listData.map((jackpot) => {
            const brandInfo = getBrandInfo(jackpot.id);
            const isUnlocked = unlockedJackpots.includes(jackpot.id) || hasPaidJackpot;

            const times = (jackpot.fixtures || [])
              .map(f => {
                const val = f.kickoffTime || f.date || f.time;
                const d = val ? new Date(val) : null;
                return d && !isNaN(d.getTime()) ? d.getTime() : null;
              })
              .filter((t): t is number => t !== null && !isNaN(t));
            const earliestTime = times.length > 0 ? Math.min(...times) : null;
            const latestTime = times.length > 0 ? Math.max(...times) : null;
            const nowTime = Date.now();

            const hasStarted = earliestTime ? nowTime >= earliestTime : false;
            const hasEnded = latestTime ? nowTime >= latestTime + 2 * 60 * 60 * 1000 : false;

            let statusBadge = null;
            if (hasEnded) {
              statusBadge = (
                <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider font-mono bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  Completed and closed
                </span>
              );
            } else if (hasStarted) {
              statusBadge = (
                <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider font-mono bg-amber-500/15 text-amber-500 border border-amber-500/30 animate-pulse">
                  Live In Progress
                </span>
              );
            } else {
              statusBadge = (
                <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider font-mono bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  Open • Not started
                </span>
              );
            }

            return (
              <div 
                key={jackpot.id}
                onClick={() => onSelectJackpot(jackpot.id)}
                className="group relative flex flex-col justify-between p-5 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] hover:border-emerald-500/40 dark:hover:border-emerald-500/30 transition-all duration-300 hover:shadow-md cursor-pointer text-left"
              >
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-slate-100 dark:bg-slate-805 group-hover:bg-emerald-500 transition-colors" />

                <div className="space-y-4">
                  {/* Top First Line: Brand, Country, Matches, Status, & Price (Fully Responsive) */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 min-w-0">
                      {/* Brand Badge */}
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-black uppercase tracking-wider border shrink-0 whitespace-nowrap ${brandInfo.bgClass}`}>
                        {brandInfo.brand}
                      </span>

                      {/* Country Flag & Name */}
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0 whitespace-nowrap">
                        <FlagImage countryFlag={(jackpot as any).countryFlag || (jackpot as any).country_flag} flag={(jackpot as any).leagueFlag} countryName={(jackpot as any).countryName || (jackpot as any).country_name || (jackpot as any).country || "Kenya"} />
                        <span className="capitalize">{(jackpot as any).countryName || (jackpot as any).country_name || (jackpot as any).country || "Kenya"}</span>
                      </span>

                      {/* Matches Count Badge */}
                      <span className="px-1.5 py-0.5 rounded text-[9px] text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 font-mono font-bold shrink-0 whitespace-nowrap">
                        {jackpot.gamesCount} Matches
                      </span>

                      {/* Status Badge */}
                      <div className="shrink-0 whitespace-nowrap">
                        {statusBadge}
                      </div>
                    </div>

                    {/* Price Pill - High Contrast & Distinctive */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 font-mono shadow-sm shrink-0 whitespace-nowrap ring-1 ring-emerald-700/20 dark:ring-emerald-400/30">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider opacity-90">Price:</span>
                      <span className="text-xs sm:text-[13px] font-black tracking-tight">KES {jackpot.price}</span>
                    </div>
                  </div>

                  {/* Middle: Jackpot Name & Estimated Cash Pool */}
                  <div className="space-y-1">
                    <h3 className="text-md font-black text-[var(--text)] tracking-tight group-hover:text-[var(--primary)] transition-colors uppercase">
                      {jackpot.name}
                    </h3>
                    <div className="pt-1.5 flex items-baseline gap-2">
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                        EST. PRIZE POOL:
                      </span>
                      <span className="text-lg font-black text-emerald-500 font-mono tracking-tight">
                        {jackpot.estimatedPool}
                      </span>
                    </div>
                  </div>

                  {/* Kickoff Info & Submission Stats */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-[var(--border)] space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-[var(--text-muted)]">
                      <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span className="font-bold text-[11px] font-mono truncate text-[var(--text)]">
                        {hasEnded ? 'Completed and closed' : hasStarted ? 'Live In Progress' : `Open (Not started) • ${jackpot.nextGameStartTime || ''}`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1 text-[var(--text-muted)]">
                        <Star className="w-3 h-3 text-amber-500 fill-current" />
                        <span>Analysis Completeness:</span>
                      </div>
                      <span className="font-black font-mono text-emerald-500">{jackpot.submissionsFill}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom: Action trigger with visual state badge */}
                <div className="mt-5 pt-4 border-t border-[var(--border)] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isUnlocked ? (
                      <span className="px-2 py-0.5 rounded text-[8px] font-black font-mono bg-emerald-500/15 text-emerald-500 border border-emerald-500/20 uppercase tracking-wider animate-pulse">
                        Unlocked
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[8px] font-black font-mono bg-slate-150 dark:bg-slate-800 text-[var(--text-muted)] border border-[var(--border)] uppercase tracking-wider">
                        Premium
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 font-mono font-medium">
                      {jackpot.premiumCount} premium buyers
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-black text-[var(--primary)] group-hover:translate-x-1.5 transition-transform">
                    <span>VIEW PREDICTIONS</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. FREQUENTLY ASKED QUESTIONS (MARKDOWN EDITABLE) */}
      <FaqSection pageId="jackpot-list" />

      {/* SEO Markdown Meat Section */}
      {pageMd && pageMd.meat && (
        <div className="p-6 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow)] text-left space-y-4">
          <MarkdownRenderer content={pageMd.meat} />
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
    </div>
  );
}
