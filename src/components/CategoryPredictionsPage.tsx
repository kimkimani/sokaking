import { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Sparkles, 
  Copy, 
  Check, 
  Trophy, 
  Crown, 
  BookOpen, 
  Zap,
  ShieldCheck,
  Star,
  CheckCircle2,
  XCircle,
  Calendar,
  TrendingUp,
  Filter
} from 'lucide-react';
import { Fixture } from '../types';
import { PredictionCategory, getCategoryCountText } from '../utils/predictionGenerator';
import PredictionsList from './PredictionsList';
import { jackpotsData } from '../jackpotsData';
import { vipPackages, oddsPacks } from '../data';
import { getMarkdownContent } from '../content/markdownLoader';
import MarkdownRenderer from './MarkdownRenderer';
import FaqSection from './FaqSection';
import { AuthorCard } from './AuthorCard';
import { ResponsibleGamblingNotice } from './ResponsibleGamblingNotice';
import { sortJackpotsByStatusAndTime } from '../utils/jackpotDateShifter';

interface CategoryPredictionsPageProps {
  category: PredictionCategory;
  fixtures: Fixture[];
  onBackToHome: () => void;
  onSelectPage?: (pageId: string) => void;
  onOpenPayment?: (
    pkgName: string, 
    price: number, 
    id: string | number, 
    slug: string, 
    type: 'vip' | 'jackpot' | 'odds'
  ) => void;
  jackpots?: any[];
  pageId?: string;
  isLoading?: boolean;
}

export default function CategoryPredictionsPage({  
  category, 
  fixtures, 
  onBackToHome,
  onSelectPage,
  onOpenPayment,
  jackpots,
  pageId,
  isLoading = false
}: CategoryPredictionsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const [yesterdayFilter, setYesterdayFilter] = useState<'won' | 'lost' | 'all'>('won');

  const listJackpots = sortJackpotsByStatusAndTime(jackpots && jackpots.length > 0 ? jackpots : jackpotsData);

  const formattedYesterdayDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }, []);

  // Yesterday's Performance Statistics (computed over ALL unfiltered yesterday fixtures)
  const yesterdayStats = useMemo(() => {
    if (category.id !== 'category-yesterday') return null;

    const total = fixtures.length;
    const wonCount = fixtures.filter(f => f.result === 'won').length;
    const lostCount = fixtures.filter(f => f.result === 'lost').length;
    
    // We compute percentages
    const winRate = total > 0 ? ((wonCount / total) * 100).toFixed(1) : '0.0';
    const lossRate = total > 0 ? ((lostCount / total) * 100).toFixed(1) : '0.0';

    return {
      total,
      wonCount,
      lostCount,
      winRate,
      lossRate
    };
  }, [fixtures, category.id]);

  // Filter fixtures based on search term AND yesterday's result filter if applicable
  const filteredFixtures = useMemo(() => {
    let result = fixtures;

    // Filter by won/lost/all for yesterday page
    if (category.id === 'category-yesterday') {
      if (yesterdayFilter === 'won') {
        result = result.filter(f => f.result === 'won');
      } else if (yesterdayFilter === 'lost') {
        result = result.filter(f => f.result === 'lost');
      }
    }

    return result.filter(f => 
      f.homeTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.awayTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.leagueName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.countryName && f.countryName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [fixtures, searchTerm, category.id, yesterdayFilter]);

  // Copy coupon action
  const handleCopyCoupon = () => {
    if (filteredFixtures.length === 0) return;
    
    const textToCopy = filteredFixtures.map((fixture, idx) => 
      `${idx + 1}. ${fixture.homeTeam} vs ${fixture.awayTeam} - Tip: ${fixture.prediction}`
    ).join('\n');

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Custom markdown parsing & styling engine for React 19 safety
  const parseAndRenderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-4 text-xs md:text-sm text-[var(--text-muted)] leading-relaxed font-sans">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return null;

          // H1 Header
          if (trimmed.startsWith('# ')) {
            return (
              <h1 
                key={idx} 
                className="text-md md:text-lg font-black text-[var(--text)] tracking-tight leading-tight uppercase border-b border-[var(--border)] pb-2.5 mt-6 mb-3 flex items-center gap-2"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                <BookOpen className="w-4 h-4 text-indigo-500 shrink-0" />
                {trimmed.substring(2)}
              </h1>
            );
          }
          // H2 Header
          if (trimmed.startsWith('## ')) {
            return (
              <h2 
                key={idx} 
                className="text-xs md:text-sm font-extrabold text-[var(--text)] tracking-tight uppercase font-mono mt-4 mb-2"
              >
                {trimmed.substring(3)}
              </h2>
            );
          }
          // H3 Header
          if (trimmed.startsWith('### ')) {
            return (
              <h3 
                key={idx} 
                className="text-[11px] md:text-xs font-black text-indigo-500 uppercase tracking-wider font-mono mt-3 mb-1"
              >
                {trimmed.substring(4)}
              </h3>
            );
          }

          // Bullets
          if (trimmed.startsWith('* ')) {
            const content = trimmed.substring(2);
            return (
              <li key={idx} className="list-disc pl-4 ml-4 text-[11px] md:text-xs text-[var(--text-muted)] mt-1">
                {renderInlineStyles(content)}
              </li>
            );
          }

          // Numbered lists
          if (/^\d+\.\s/.test(trimmed)) {
            const content = trimmed.replace(/^\d+\.\s/, '');
            return (
              <li key={idx} className="list-decimal pl-4 ml-4 text-[11px] md:text-xs text-[var(--text-muted)] mt-1">
                {renderInlineStyles(content)}
              </li>
            );
          }

          // Paragraphs
          return (
            <p key={idx} className="text-[11px] md:text-xs text-[var(--text-muted)] leading-relaxed">
              {renderInlineStyles(trimmed)}
            </p>
          );
        })}
      </div>
    );
  };

  const renderInlineStyles = (text: string) => {
    const parts = text.split(/\*\*|__/);
    if (parts.length <= 1) return text;
    
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-black text-[var(--text)]">{part}</strong>;
      }
      return part;
    });
  };

  const pageMd = getMarkdownContent(pageId || category.id);

  return (
    <div id={`category-page-${category.id}`} className="space-y-6 text-left">
      
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-[11px]">
        <button 
          onClick={onBackToHome}
          className="flex items-center gap-1 text-slate-500 hover:text-indigo-500 font-bold bg-transparent border-none cursor-pointer transition-colors p-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back Home
        </button>
      </div>

      {/* Category Card Header & Yesterday Performance Dashboard */}
      {category.id === 'category-yesterday' && yesterdayStats ? (
        <div className="space-y-6">
          {/* Main Performance Showcase */}
          <div className="p-6 md:p-8 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow)] relative overflow-hidden text-left">
            {/* Top decorative gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-emerald-500 via-indigo-500 to-amber-500" />
            {/* Soft decorative radial light */}
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              {/* Top Row: Title, Date & Verified Badge */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-black uppercase tracking-wider font-mono">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span>Verified Outcomes Ledger</span>
                  </div>
                  
                  <h1 
                    className="text-2xl md:text-3xl font-extrabold text-[var(--text)] tracking-tight leading-none uppercase"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {pageMd.displayTitle || pageMd.title || "Yesterday's Football Predictions & Winning Results"}
                  </h1>
                  <p className="text-xs font-mono font-bold text-[var(--text-muted)] flex items-center gap-1.5 uppercase tracking-wide">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    {formattedYesterdayDate}
                  </p>
                </div>

                <div className="flex flex-col items-start md:items-end gap-1 shrink-0">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Yesterday's Accuracy Metric</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black font-mono text-emerald-500">{yesterdayStats.winRate}%</span>
                    <span className="text-xs font-bold text-emerald-500/80">WIN RATIO</span>
                  </div>
                  <span className="text-[9px] text-emerald-500 font-bold font-mono uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 animate-pulse">
                    🔥 Superb Algorithmic Peak
                  </span>
                </div>
              </div>

              {pageMd.intro && (
                <div className="text-xs md:text-sm text-[var(--text-muted)] leading-relaxed pt-2 border-t border-[var(--border)]/50">
                  <MarkdownRenderer content={pageMd.intro} />
                </div>
              )}

              {/* Middle Row: Detailed Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Total Posted */}
                <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)] bg-opacity-30 relative overflow-hidden group hover:border-indigo-500/30 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-wider">Total Predictions Posted</span>
                    <TrendingUp className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2.5xl font-black font-mono text-[var(--text)]">{yesterdayStats.total}</span>
                    <span className="text-[10px] text-[var(--text-muted)] font-bold">Mathematical Slates</span>
                  </div>
                  <div className="mt-1 text-[9px] text-slate-400 font-mono">100% Calculated Coverage</div>
                </div>

                {/* Won Slips */}
                <div className="p-4 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.02] relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Won Predictions</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2.5xl font-black font-mono text-emerald-600 dark:text-emerald-400">{yesterdayStats.wonCount}</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Matches Settled Won</span>
                  </div>
                  <div className="mt-1 text-[9px] text-emerald-500/80 font-mono">Win Probability: {yesterdayStats.winRate}%</div>
                </div>

                {/* Lost Slips */}
                <div className="p-4 rounded-xl border border-rose-500/10 bg-rose-500/[0.005] relative overflow-hidden group hover:border-rose-500/25 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-wider">Lost Predictions</span>
                    <XCircle className="w-4 h-4 text-rose-500" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2.5xl font-black font-mono text-[var(--text)]">{yesterdayStats.lostCount}</span>
                    <span className="text-[10px] text-[var(--text-muted)] font-bold">Matches Settled Lost</span>
                  </div>
                  <div className="mt-1 text-[9px] text-slate-400 font-mono">Loss Variance: {yesterdayStats.lossRate}%</div>
                </div>
              </div>

              {/* Bottom Row: Gorgeous Percentage Visualization Bar */}
              <div className="pt-2">
                <div className="flex justify-between items-center text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                    Win Rate ({yesterdayStats.winRate}%)
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-600 inline-block"></span>
                    Loss Rate ({yesterdayStats.lossRate}%)
                  </span>
                </div>
                {/* Segmented Dual Bar */}
                <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.35)] transition-all duration-500" 
                    style={{ width: `${yesterdayStats.winRate}%` }} 
                  />
                  <div 
                    className="h-full bg-slate-300 dark:bg-slate-700 transition-all duration-500" 
                    style={{ width: `${yesterdayStats.lossRate}%` }} 
                  />
                </div>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed mt-2.5 font-sans">
                  Soka King algorithms utilize yesterday's verified sporting data points to feed back into our neural-motivational models. This guarantees that today's selections leverage the absolute latest momentum coefficients.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive filter switcher tabs */}
          <div className="bg-[var(--card)] border border-[var(--border)] p-3.5 rounded-2xl shadow-3xs text-left">
            <span className="text-[10px] font-mono font-black text-indigo-500 uppercase tracking-widest block mb-2.5 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-indigo-500" /> Filter Yesterday Results by Outcome
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setYesterdayFilter('won')}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black uppercase font-mono transition-all border cursor-pointer ${
                  yesterdayFilter === 'won'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-3xs scale-[1.01]'
                    : 'bg-[var(--background)] text-emerald-600 dark:text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/10'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Won Tips</span>
                <span className={`text-[9.5px] px-1.5 py-0.5 rounded-md font-mono ${yesterdayFilter === 'won' ? 'bg-white/20 text-white' : 'bg-emerald-500/10 text-emerald-600'}`}>
                  {yesterdayStats.wonCount}
                </span>
              </button>

              <button
                onClick={() => setYesterdayFilter('lost')}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black uppercase font-mono transition-all border cursor-pointer ${
                  yesterdayFilter === 'lost'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-3xs scale-[1.01]'
                    : 'bg-[var(--background)] text-rose-600 dark:text-rose-450 border-rose-500/25 hover:bg-rose-500/10'
                }`}
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Lost Tips</span>
                <span className={`text-[9.5px] px-1.5 py-0.5 rounded-md font-mono ${yesterdayFilter === 'lost' ? 'bg-white/20 text-white' : 'bg-rose-500/10 text-rose-600'}`}>
                  {yesterdayStats.lostCount}
                </span>
              </button>

              <button
                onClick={() => setYesterdayFilter('all')}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black uppercase font-mono transition-all border cursor-pointer ${
                  yesterdayFilter === 'all'
                    ? 'bg-slate-700 text-white border-slate-700 shadow-3xs scale-[1.01]'
                    : 'bg-[var(--background)] text-slate-700 dark:text-slate-350 border-[var(--border)] hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>All Matches</span>
                <span className={`text-[9.5px] px-1.5 py-0.5 rounded-md font-mono ${yesterdayFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-850 text-slate-700 dark:text-slate-300'}`}>
                  {yesterdayStats.total}
                </span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Original Category Card Header */
        <div className="p-6 md:p-8 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow)] relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-indigo-500 bg-opacity-[0.03] blur-3xl" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2.5 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 text-[10px] font-black uppercase tracking-wider">
                <span className="text-sm shrink-0 block leading-none">{category.icon}</span>
                <span>{getCategoryCountText(category.id, fixtures)} Live Selections</span>
              </div>
              
              <h1 
                className="text-2xl md:text-3.5xl font-extrabold text-[var(--text)] tracking-tight leading-tight uppercase"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {pageMd.displayTitle || pageMd.title || category.name}
              </h1>
              
              <div className="text-xs md:text-sm text-[var(--text-muted)] leading-relaxed">
                {pageMd.intro ? (
                  <MarkdownRenderer content={pageMd.intro} />
                ) : (
                  <>{category.description} Powered by Soka King's state-of-the-art sporting index systems, Poisson probability modeling, and real-time team statistics.</>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 shrink-0 self-start md:self-center">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 text-center">
                <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">Accuracy Metric</span>
                <span className="text-2xl font-black font-mono text-indigo-500 block mt-1">84.2%</span>
                <span className="text-[9px] text-emerald-500 font-bold block mt-0.5">🔥 Verified Win Ratio</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Predictions Feed (Page Major Prediction Table) */}
      {isLoading ? (
        <PredictionsList 
          fixtures={[]}
          isLoading={true}
          title={
            pageMd.listTitle || (
              category.id === 'category-yesterday'
                ? "Yesterday's Matches"
                : (category.id === 'category-today' || category.id === 'today' || pageMd.type === 'competitor')
                  ? "Today's Free Football Predictions"
                  : `${category.name} Predictions list`
            )
          }
          subtitle="Loading predictions..."
        />
      ) : filteredFixtures.length > 0 ? (
        <PredictionsList 
          fixtures={filteredFixtures}
          isLoading={false}
          title={
            pageMd.listTitle || (
              category.id === 'category-yesterday'
                ? yesterdayFilter === 'won'
                  ? "Yesterday's Winning Selections"
                  : yesterdayFilter === 'lost'
                    ? "Yesterday's Unsettled/Lost Selections"
                    : "Yesterday's Complete Historical Match list"
                : (category.id === 'category-today' || category.id === 'today' || pageMd.type === 'competitor')
                  ? "Today's Free Football Predictions"
                  : `${category.name} Predictions list`
            )
          }
          subtitle={
            pageMd.listSubtitle || (
              category.id === 'category-yesterday'
                ? `Showing ${filteredFixtures.length} match results filtered from ${formattedYesterdayDate}.`
                : (category.id === 'category-today' || category.id === 'today' || pageMd.type === 'competitor')
                  ? "High-probability daily double-chance options and standard single tips for today verified by Soka King mathematical indexes."
                  : `Showing ${filteredFixtures.length} predictions filtered according to standard Poisson models.`
            )
          }
        />
      ) : (
        <div className="p-12 text-center bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)]">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <Search className="w-5 h-5" />
          </div>
          <p className="text-xs font-black text-[var(--text)] uppercase tracking-tight">No fixtures found matching your criteria</p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">Try resetting or editing your team search query above.</p>
        </div>
      )}

      {/* Middle Markdown Section (Renders immediately after the major prediction table) */}
      {pageMd && pageMd.middle && (
        <div className="p-4 md:p-5 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow)] text-left text-xs leading-relaxed text-[var(--text-muted)]">
          <MarkdownRenderer content={pageMd.middle} />
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

      {/* PREMIUM JACKPOTS SECTION */}
      <div className="bg-[var(--card)] border border-[var(--border)] p-5 rounded-[var(--radius)] shadow-[var(--shadow)] text-left space-y-4">
        <div className="flex items-center gap-2.5 border-b border-[var(--border)] pb-3">
          <Trophy className="w-5 h-5 text-emerald-500 shrink-0" />
          <div>
            <h3 className="text-xs font-black uppercase text-[var(--text)] tracking-tight font-mono">
              Soka King Premium Jackpots
            </h3>
            <p className="text-[10px] text-[var(--text-muted)] font-medium">
              Unlock mathematically computed prediction codes for elite jackpot pools.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {listJackpots.map((jackpot) => (
            <div 
              key={jackpot.id}
              className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)] bg-opacity-40 hover:border-indigo-500/30 transition-all duration-300 flex flex-col justify-between gap-3 group"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    {jackpot.gamesCount} GAMES
                  </span>
                  <span className="text-[9px] font-mono font-black text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    {jackpot.submissionsFill} FULL
                  </span>
                </div>
                <h4 className="text-xs font-black text-[var(--text)] group-hover:text-indigo-500 transition-colors uppercase font-mono">
                  {jackpot.name}
                </h4>
                <p className="text-[10px] text-[var(--text-muted)]">
                  Pool: <strong className="font-mono text-emerald-500">{jackpot.estimatedPool}</strong>
                </p>
                <p className="text-[9px] text-slate-400 font-mono">
                  {jackpot.nextGameStartTime}
                </p>
              </div>

              <button 
                onClick={() => onSelectPage && onSelectPage(jackpot.id)}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase font-mono rounded-lg transition-colors border-none cursor-pointer flex items-center justify-center gap-1 shadow-3xs"
              >
                <span>Analyze Jackpot</span>
                <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* PREMIUM PACKAGES & ODDS PACKS SECTION (Last component of the page) */}
      <div className="bg-[var(--card)] border border-[var(--border)] p-5 rounded-[var(--radius)] shadow-[var(--shadow)] text-left space-y-4">
        <div className="flex items-center gap-2.5 border-b border-[var(--border)] pb-3">
          <Crown className="w-5 h-5 text-amber-500 shrink-0" />
          <div>
            <h3 className="text-xs font-black uppercase text-[var(--text)] tracking-tight font-mono">
              {pageMd?.unlockHeading || "Soka King Subscription Packages & Odds"}
            </h3>
            <p className="text-[10px] text-[var(--text-muted)] font-medium">
              {pageMd?.unlockDescription || "Activate VIP models or unlock custom daily multi-bet odds with instant M-Pesa push validation."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* VIP Packages Column */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono font-black text-amber-500 uppercase tracking-wider block flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Premium VIP Bundles
            </span>
            <div className="space-y-2">
              {vipPackages.map((pkg) => (
                <div 
                  key={pkg.id}
                  className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--background)] bg-opacity-40 hover:border-indigo-500/30 transition-all duration-300 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-black text-[var(--text)] truncate uppercase font-mono">
                        {pkg.name}
                      </h4>
                      {pkg.isFeatured && (
                        <span className="text-[8px] font-black uppercase bg-amber-500 text-white px-1.5 py-0.5 rounded font-mono animate-pulse">
                          BEST
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] line-clamp-1">
                      {pkg.description}
                    </p>
                    <div className="text-[9px] font-mono text-slate-400">
                      Duration: <strong className="text-indigo-500">{pkg.durationDays} Days</strong>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[9px] font-mono text-slate-400 block uppercase">Price</span>
                    <span className="text-xs font-black font-mono text-emerald-500 block">
                      KES {pkg.price}
                    </span>
                    <button 
                      onClick={() => onOpenPayment && onOpenPayment(pkg.name, pkg.price, pkg.id, pkg.slug, 'vip')}
                      className="mt-1.5 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-black uppercase font-mono rounded transition-colors border-none cursor-pointer"
                    >
                      Buy Pack
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Odds Packs Column */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono font-black text-emerald-500 uppercase tracking-wider block flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-emerald-500" /> Premium Daily Odds Packs
            </span>
            <div className="space-y-2">
              {oddsPacks.map((pack) => (
                <div 
                  key={pack.id}
                  className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--background)] bg-opacity-40 hover:border-indigo-500/30 transition-all duration-300 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-black text-[var(--text)] truncate uppercase font-mono">
                        {pack.name}
                      </h4>
                      <span className="text-[8px] font-mono font-black px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        {pack.tag}
                      </span>
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] line-clamp-1">
                      {pack.description}
                    </p>
                    <div className="text-[9px] font-mono text-slate-400">
                      Target Odds: <strong className="text-indigo-500">{pack.oddsMinDecimal}</strong> | Risk: <strong className="text-amber-500">{pack.riskLevel}</strong>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[9px] font-mono text-slate-400 block uppercase">Price</span>
                    <span className="text-xs font-black font-mono text-emerald-500 block">
                      KES {pack.price}
                    </span>
                    <button 
                      onClick={() => onOpenPayment && onOpenPayment(pack.name, pack.price, pack.id, pack.slug, 'odds')}
                      className="mt-1.5 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-black uppercase font-mono rounded transition-colors border-none cursor-pointer"
                    >
                      Unlock Odds
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SEO Markdown Meat Section */}
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

      {/* FREQUENTLY ASKED QUESTIONS (MARKDOWN EDITABLE) */}
      <FaqSection pageId={category.id} />
    </div>
  );
}
