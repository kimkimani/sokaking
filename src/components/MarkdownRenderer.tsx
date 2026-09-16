import React, { useState, useEffect, useMemo } from 'react';
import { expandTopFixturesParameters, fetchLiveJackpotFixtures, fetchLiveMegaJackpotFixtures, getCachedLiveJackpotFixtures, isDoubleChanceTip } from '../utils/topJackpotFixtures';
import { Fixture } from '../types';
import { getLinkRel } from '../utils/linkUtils';
import { Crown, Users, Star, ArrowRight, ExternalLink } from 'lucide-react';
import PaymentModal from './PaymentModal';
import JackpotCountdownTimer from './JackpotCountdownTimer';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  postSlug?: string;
  fixtures?: Fixture[];
  jackpotId?: string;
}

/**
 * Resolves a local or relative image URL within a post to the public /blog-assets/[slug]/ URL
 */
function resolveRelativeImageUrl(url: string, postSlug?: string): string {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) {
    return url;
  }
  if (postSlug) {
    const cleanUrl = url.replace(/^\.\//, '');
    return `/blog-assets/${postSlug}/${cleanUrl}`;
  }
  return url;
}

// Parses inline markdown formatting (images: ![alt](url), links: [text](url), bold: **text** or __text__, italic: *text* or _text_, code: `text`)
function parseInline(text: string, postSlug?: string): React.ReactNode[] {
  if (!text) return [];

  // Match:
  // 1: ![alt](url) -> match[2] = alt, match[3] = url
  // 2: [text](url) -> match[5] = text, match[6] = url
  // 3: **text** or __text__ -> match[7] or match[8]
  // 4: `code` -> match[9]
  // 5: *text* or _text_ -> match[10] or match[11]
  const regex = /(!\[([^\]]*)\]\(([^)]+)\)|\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|__([^_]+)__|`([^`]+)`|\*([^*]+)\*|_([^_]+)_)/g;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const matchStart = match.index;
    if (matchStart > lastIndex) {
      nodes.push(text.slice(lastIndex, matchStart));
    }

    if (match[1] && match[1].startsWith('!')) {
      // Inline Image ![alt](url)
      const altText = match[2] || 'Illustration';
      const rawImgUrl = match[3];
      const imgUrl = resolveRelativeImageUrl(rawImgUrl, postSlug);
      nodes.push(
        <img
          key={`img-${matchStart}`}
          src={imgUrl}
          alt={altText}
          className="inline-block max-w-full h-auto rounded-lg border border-[var(--border)] my-1 align-middle"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      );
    } else if (match[4] && match[5]) {
      // Link [text](url)
      const linkText = match[4];
      const linkUrl = match[5];
      const isExternal = linkUrl.startsWith('http');
      nodes.push(
        <a
          key={`link-${matchStart}`}
          href={linkUrl}
          target={isExternal ? '_blank' : undefined}
          rel={getLinkRel(linkUrl)}
          className="text-indigo-500 hover:text-indigo-600 underline font-semibold transition-colors"
        >
          {linkText}
        </a>
      );
    } else if (match[6] || match[7]) {
      // Bold **text** or __text__
      nodes.push(
        <strong key={`bold-${matchStart}`} className="font-black text-[var(--text)]">
          {match[6] || match[7]}
        </strong>
      );
    } else if (match[8]) {
      // Inline code `text`
      nodes.push(
        <code key={`code-${matchStart}`} className="px-1.5 py-0.5 rounded bg-[var(--card)] border border-[var(--border)] font-mono text-[11px] text-[var(--text)]">
          {match[8]}
        </code>
      );
    } else if (match[9] || match[10]) {
      // Italic *text* or _text_
      nodes.push(
        <em key={`italic-${matchStart}`} className="italic text-[var(--text)]">
          {match[9] || match[10]}
        </em>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : [text];
}

interface CompactJackpotTopConfidenceSectionProps {
  items: Array<{
    matchTeams: string;
    matchTip: string;
    isHighest: boolean;
    highestSuffixText: string;
    explanation: string;
  }>;
  postSlug?: string;
}

function CompactJackpotTopConfidenceSection({ items, postSlug }: CompactJackpotTopConfidenceSectionProps) {
  const [filter, setFilter] = useState<'all' | 'dc'>('all');

  const dcItems = useMemo(() => {
    return items.filter(item => isDoubleChanceTip(item.matchTip));
  }, [items]);

  const displayedItems = filter === 'dc' ? dcItems : items;

  return (
    <div className="my-2.5 rounded-lg border border-[var(--border)] bg-[var(--card)]/90 overflow-hidden shadow-2xs">
      {/* Compact Top Header Bar with Filter Tags */}
      <div className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-slate-50 dark:bg-slate-900/60 border-b border-[var(--border)]/70 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-[10.5px] sm:text-[11px] font-mono font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span>Top Confidence Picks</span>
        </div>

        {/* Filter Tags: All vs Double Chance Only */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-2 py-0.5 rounded text-[9.5px] sm:text-[10px] font-mono font-bold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
            }`}
          >
            All Picks ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('dc')}
            className={`px-2 py-0.5 rounded text-[9.5px] sm:text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
              filter === 'dc'
                ? 'bg-amber-500 text-slate-950 font-black shadow-2xs'
                : 'text-amber-800 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25'
            }`}
          >
            <span>⚡ Double Chance Only</span>
            <span className="text-[9px] opacity-85">({dcItems.length})</span>
          </button>
        </div>
      </div>

      {/* Compact Fixtures List */}
      <div className="divide-y divide-[var(--border)]/40">
        {displayedItems.length === 0 ? (
          <div className="p-3 text-center text-xs font-mono text-[var(--text-muted)]">
            No double chance fixtures found in this selection.
          </div>
        ) : (
          displayedItems.map((item, idx) => {
            const isDC = isDoubleChanceTip(item.matchTip);
            return (
              <div
                key={`fix-item-${idx}`}
                className={`px-2.5 py-1.5 sm:px-3 sm:py-1.5 transition-colors ${
                  item.isHighest
                    ? 'bg-amber-500/[0.08] border-l-2 border-l-amber-500'
                    : 'hover:bg-[var(--accent)]/30'
                }`}
              >
                <div className="flex items-center justify-between gap-1.5 flex-wrap sm:flex-nowrap">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-bold text-[11.5px] sm:text-xs text-[var(--text)] truncate">
                      {item.matchTeams}
                    </span>
                    <span className="text-[var(--text-muted)] text-[11px] font-semibold shrink-0">—</span>
                    <span className={`inline-flex items-center px-1.5 py-0.2 rounded font-mono font-black text-[10px] sm:text-[10.5px] shrink-0 ${
                      isDC
                        ? 'bg-amber-500/20 text-amber-950 dark:text-amber-200 border border-amber-500/40'
                        : 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30'
                    }`}>
                      {item.matchTip}
                    </span>
                    {isDC && (
                      <span className="text-[8.5px] font-mono font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-500/15 px-1 py-0.2 rounded border border-amber-500/25">
                        DC
                      </span>
                    )}
                  </div>
                  {item.isHighest && (
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[8.5px] sm:text-[9px] font-black font-mono uppercase tracking-wider bg-amber-500 text-slate-950 shrink-0 shadow-2xs">
                      Highest Confidence
                    </span>
                  )}
                </div>
                {item.explanation && (
                  <p className="text-[10.5px] sm:text-[11px] text-[var(--text-muted)] leading-tight mt-0.5 font-normal">
                    {parseInline(item.explanation, postSlug)}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

interface CompactAllJackpotFixturesSectionProps {
  items: Array<{
    gameNumber: number;
    matchTeams: string;
    prediction: string;
    isVipLocked: boolean;
    confidence: number | string;
    mostVoted: string;
    explanation: string;
  }>;
  postSlug?: string;
  jackpotId?: string;
}

function parseAllFixtureLine(line: string): {
  gameNumber: number;
  matchTeams: string;
  prediction: string;
  isVipLocked: boolean;
  confidence: number | string;
  mostVoted: string;
} | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  // Must have ' vs ' and an em-dash/hyphen separator
  if (!/\s+vs\s+/i.test(trimmed) || !/[—–-]/.test(trimmed)) return null;

  // Check for presence of jackpot clues or metadata
  const hasJackpotClues =
    /^(?:###\s+|\*\*)?(?:Game|Match|\d+\.)/i.test(trimmed) ||
    /confidence:/i.test(trimmed) ||
    /database\s*tip:/i.test(trimmed) ||
    /user\s*votes/i.test(trimmed) ||
    /user\s*tip/i.test(trimmed) ||
    /most\s*voted/i.test(trimmed);

  if (!hasJackpotClues) return null;

  // Look for metadata part e.g. (Confidence: 85% | User Votes/Tip: 2 - 60%)
  const metaIndex = trimmed.lastIndexOf('(Confidence:');
  let mainPart = trimmed;
  let metaPart = '';
  if (metaIndex !== -1) {
    mainPart = trimmed.substring(0, metaIndex).trim();
    metaPart = trimmed.substring(metaIndex).trim().replace(/^\(|\)$/g, '');
  }

  const headerMatch = mainPart.match(
    /^(?:###\s+|\*\*)?(?:(?:Game|Match)\s*(\d+)?:?|(\d+)\.)?\s*(.+?\s+vs\s+.+?)\s*[—–-]\s*(.+?)(?:\*\*)?$/i
  );
  if (!headerMatch) return null;

  const gameNumber = parseInt(headerMatch[1] || headerMatch[2] || '0', 10) || 1;
  const matchTeams = headerMatch[3].trim();
  let rawTip = headerMatch[4].trim();

  // Strip leading "Database Tip:" if present
  rawTip = rawTip.replace(/^Database\s*Tip:\s*/i, '').trim();

  const isVipLocked = /vip/i.test(rawTip) || /join vip/i.test(rawTip);
  const prediction = isVipLocked ? 'Join VIP' : rawTip.replace(/[\[\]]/g, '').trim();

  let confidence = '75%';
  const confMatch = metaPart.match(/Confidence:\s*(\d+%?)/i);
  if (confMatch) confidence = confMatch[1].includes('%') ? confMatch[1] : `${confMatch[1]}%`;

  let mostVoted = '';
  const voteMatch = metaPart.match(/(?:User\s*(?:Votes\/Tip|Votes|Tip)|Most\s*Voted):\s*([^|)]+)/i);
  if (voteMatch) {
    mostVoted = voteMatch[1].trim();
  } else {
    mostVoted = !isVipLocked ? `${prediction} (55%)` : '1 (55%)';
  }

  return {
    gameNumber,
    matchTeams,
    prediction,
    isVipLocked,
    confidence,
    mostVoted
  };
}

function CompactAllJackpotFixturesSection({
  items,
  postSlug,
  jackpotId = 'sportpesa-mega'
}: CompactAllJackpotFixturesSectionProps) {
  const [filter, setFilter] = useState<'all' | 'free' | 'vip'>('all');
  const [sortBy, setSortBy] = useState<'game' | 'confidence'>('game');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const freeItems = useMemo(() => items.filter(i => !i.isVipLocked), [items]);
  const vipItems = useMemo(() => items.filter(i => i.isVipLocked), [items]);

  const displayedItems = useMemo(() => {
    let list = filter === 'free' ? freeItems : filter === 'vip' ? vipItems : items;
    if (sortBy === 'confidence') {
      return [...list].sort((a, b) => {
        const cA = parseInt(String(a.confidence), 10) || 0;
        const cB = parseInt(String(b.confidence), 10) || 0;
        return cB - cA;
      });
    }
    return [...list].sort((a, b) => a.gameNumber - b.gameNumber);
  }, [items, freeItems, vipItems, filter, sortBy]);

  const titleName = jackpotId.toLowerCase().includes('mega')
    ? 'SportPesa Mega Jackpot'
    : jackpotId.toLowerCase().includes('betika')
    ? 'Betika Midweek Jackpot'
    : jackpotId.toLowerCase().includes('mozzart')
    ? 'Mozzart Grand Jackpot'
    : 'Jackpot';

  const handleOpenMegaJackpotPayment = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('soka-open-payment', {
          detail: {
            packageName: `${titleName} VIP Slip`,
            price: 250,
            packageId: `${jackpotId}-vip`,
            packageSlug: jackpotId,
            packageType: 'jackpot'
          }
        })
      );
    }
    setPaymentModalOpen(true);
  };

  return (
    <div className="my-3 rounded-xl border border-[var(--border)] bg-[var(--card)]/95 overflow-hidden shadow-xs">
      {/* Top Header Bar */}
      <div className="px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-50 dark:bg-slate-900/80 border-b border-[var(--border)]/70 flex items-center justify-between gap-2.5 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Crown className="w-3 h-3" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
              <span>{titleName} — All {items.length} Fixtures</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="text-[10px] sm:text-[10.5px] font-mono text-[var(--text-muted)]">
              Showing 2/3 Free Predictions ({freeItems.length}) • 1/3 VIP Slips ({vipItems.length})
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-200/50 dark:hover:bg-slate-800/50'
            }`}
          >
            All ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('free')}
            className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
              filter === 'free'
                ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 font-black shadow-2xs'
                : 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20'
            }`}
          >
            Free ({freeItems.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('vip')}
            className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
              filter === 'vip'
                ? 'bg-amber-500 text-slate-950 font-black shadow-2xs'
                : 'text-amber-800 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25'
            }`}
          >
            <span>⭐ VIP ({vipItems.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSortBy(s => s === 'game' ? 'confidence' : 'game')}
            className="px-2 py-0.5 sm:px-2 sm:py-1 rounded text-[9.5px] font-mono text-[var(--text-muted)] hover:text-[var(--text)] bg-transparent hover:bg-slate-200/40 dark:hover:bg-slate-800/40 border border-dashed border-[var(--border)] cursor-pointer"
            title="Toggle sort order"
          >
            Sort: {sortBy === 'game' ? 'Match #' : 'Conf %'}
          </button>
        </div>
      </div>

      {/* Fixtures List */}
      <div className="divide-y divide-[var(--border)]/40">
        {displayedItems.length === 0 ? (
          <div className="p-4 text-center text-xs font-mono text-[var(--text-muted)]">
            No fixtures match the selected filter.
          </div>
        ) : (
          displayedItems.map((item, idx) => {
            const confNum = parseInt(String(item.confidence), 10) || 75;
            const confClass =
              confNum >= 80
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                : confNum >= 75
                ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30'
                : 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/25';

            return (
              <div
                key={`all-fix-item-${item.gameNumber}-${idx}`}
                className={`p-2.5 sm:p-3 transition-colors ${
                  item.isVipLocked
                    ? 'bg-amber-500/[0.03] hover:bg-amber-500/[0.06]'
                    : 'hover:bg-[var(--accent)]/30'
                }`}
              >
                <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                  {/* Left: Game Number + Teams */}
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-mono font-black bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 shrink-0">
                      Game #{item.gameNumber}
                    </span>
                    <span className="font-bold text-xs sm:text-[13px] text-[var(--text)] truncate">
                      {item.matchTeams}
                    </span>
                  </div>

                  {/* Right: Badges with explicit labels for Confidence, User Votes/Tip, and Database Tip */}
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto sm:ml-0 flex-wrap justify-end">
                    {/* Confidence score */}
                    <div
                      className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded font-mono text-[9.5px] sm:text-[10px] border ${confClass}`}
                      title={`Confidence Score: ${item.confidence}`}
                    >
                      <span className="text-[8.5px] sm:text-[9px] uppercase tracking-wider font-semibold opacity-75">Confidence:</span>
                      <strong className="font-black">{item.confidence.toString().includes('%') ? item.confidence : `${item.confidence}%`}</strong>
                    </div>

                    {/* User votes consensus prediction */}
                    {item.mostVoted && (
                      <div
                        className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded font-mono text-[9.5px] sm:text-[10px] bg-sky-500/10 text-sky-850 dark:text-sky-300 border border-sky-500/25"
                        title="User votes consensus prediction"
                      >
                        <Users className="w-2.5 h-2.5 text-sky-600 dark:text-sky-400 opacity-80 shrink-0" />
                        <span className="text-[8.5px] sm:text-[9px] uppercase tracking-wider text-sky-700 dark:text-sky-400 font-semibold">User Votes/Tip:</span>
                        <strong className="font-black">{item.mostVoted}</strong>
                      </div>
                    )}

                    {/* Database Tip (2/3 disclosed) or Join VIP button (remaining 1/3) */}
                    {item.isVipLocked ? (
                      <button
                        type="button"
                        onClick={handleOpenMegaJackpotPayment}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-slate-950 font-black text-[11px] shadow-2xs cursor-pointer transition-all transform hover:scale-[1.03] shrink-0 border-0"
                        title="Unlock Database Tip with Mega Jackpot VIP Slip"
                      >
                        <span className="text-[8.5px] uppercase tracking-wider font-black opacity-90">Database Tip:</span>
                        <Star className="w-3 h-3 fill-slate-950" />
                        <span>Join VIP</span>
                      </button>
                    ) : (
                      <div
                        className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded font-mono text-[11px] sm:text-xs shrink-0 border ${
                          isDoubleChanceTip(item.prediction)
                            ? 'bg-amber-500/20 text-amber-950 dark:text-amber-200 border-amber-500/40'
                            : 'bg-emerald-500/15 text-emerald-950 dark:text-emerald-200 border border-emerald-500/30'
                        }`}
                        title="Official Database Tip"
                      >
                        <span className="text-[8.5px] sm:text-[9px] uppercase tracking-wider font-semibold opacity-75">Database Tip:</span>
                        <strong className="font-black text-xs sm:text-sm">{item.prediction}</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Explanation text matching top confidence format, or VIP Lock notice */}
                {item.isVipLocked ? (
                  <div className="flex items-center justify-between gap-2 mt-1.5 pt-1 text-[10.5px] sm:text-[11px] text-amber-800/90 dark:text-amber-300/90 font-medium flex-wrap sm:flex-nowrap">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="shrink-0 text-amber-600 dark:text-amber-400 font-bold">🔒 VIP Tip:</span>
                      <span className="truncate">Confidential database prediction and double-chance slips reserved for Soka King VIP members.</span>
                    </div>
                    <a
                      href="https://sokaking.com/sportpesa-mjp-prediction"
                      className="underline font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 shrink-0 text-[10.5px] inline-flex items-center gap-1"
                      title="Unlock full SportPesa MJP Prediction analysis"
                    >
                      <span>Unlock Now</span>
                      <ExternalLink className="w-3 h-3 inline" />
                    </a>
                  </div>
                ) : (
                  item.explanation && (
                    <p className="text-[11px] sm:text-[11.5px] text-[var(--text-muted)] leading-relaxed mt-1 font-normal">
                      {parseInline(item.explanation, postSlug)}
                    </p>
                  )
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Conversion Banner */}
      <div className="p-3 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-white flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap border-t border-[var(--border)]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Crown className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="font-bold text-xs sm:text-sm text-amber-300 flex items-center gap-1.5">
              <span>Unlock All {items.length} {titleName} Predictions</span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-300 leading-tight">
              Get all {items.length} tips with 3 double-chance slips sent directly via SMS and Telegram before kickoff.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
          <button
            type="button"
            onClick={handleOpenMegaJackpotPayment}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs shrink-0 cursor-pointer transition-all shadow-sm border-0"
            title="Open Mega Jackpot VIP payment modal"
          >
            <Star className="w-3.5 h-3.5 fill-slate-950" />
            <span>Join VIP (KES 250)</span>
          </button>
          <a
            href="https://sokaking.com/sportpesa-mjp-prediction"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shrink-0 no-underline transition-all border border-slate-700 hover:border-slate-600"
            title="View full SportPesa MJP Prediction analysis"
          >
            <span>Unlock MJP Analysis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Mega Jackpot Payment Modal */}
      {paymentModalOpen && (
        <PaymentModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          packageName={`${titleName} VIP Slip`}
          price={250}
          packageId={`${jackpotId}-vip`}
          packageSlug={jackpotId}
          packageType="jackpot"
        />
      )}
    </div>
  );
}

export default function MarkdownRenderer({
  content,
  className = '',
  postSlug,
  fixtures,
  jackpotId = 'sportpesa-mega'
}: MarkdownRendererProps) {
  if (!content) return null;

  const [liveDbFixtures, setLiveDbFixtures] = useState<Fixture[] | null>(() => fixtures || getCachedLiveJackpotFixtures(jackpotId));

  useEffect(() => {
    if (fixtures && fixtures.length > 0) {
      setLiveDbFixtures(fixtures);
      return;
    }
    // If not supplied and content contains jackpot fixtures shortcode, fetch directly from DB
    if (/TOP_.*FIXTURES|SPORTPESA.*TOP|DOUBLE_CHANCE|LEAGUES|LEAGUE_NAMES|.*SCHEDULE|.*DATES|.*SELECTIONS|.*OUTCOMES|UPSET_ALERT|.*COMBOS|.*JACKPOT|UI_TIMER|TIMER|COUNTDOWN/i.test(content)) {
      fetchLiveJackpotFixtures(jackpotId).then(fetched => {
        if (fetched && fetched.length > 0) {
          setLiveDbFixtures(fetched);
        }
      }).catch(() => {});
    }
  }, [fixtures, jackpotId, content]);

  // Expand top jackpot / confidence fixtures parameters using live database fixtures
  const activeFixtures = (fixtures && fixtures.length > 0) ? fixtures : (liveDbFixtures || undefined);
  const expandedContent = expandTopFixturesParameters(content, jackpotId, activeFixtures);

  // 1. Clean out raw markdown marker headings and HTML comments
  const cleanContent = expandedContent
    .replace(/^#{1,4}\s*(INTRO|MIDDLE|MEAT|FAQ|MIDDLE_CONTENT|MEAT_CONTENT|RESPONSIBLE_GAMBLING_START|RESPONSIBLE_GAMBLING_END)\s*$/gim, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();

  if (!cleanContent) return null;

  // 2. Parse block elements
  const lines = cleanContent.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // 00. UI Countdown Timer Tag
    // Matches [[UI_TIMER:sportpesa-mega]], {{UI_TIMER}}, {{JACKPOT_TIMER}}, {{COUNTDOWN_TIMER}}, {{TIMER}}, {{COUNTDOWN}}, etc.
    const timerMatch = trimmed.match(/^(?:\[\[|\[|\{\{|\{\{\s*)?(UI_TIMER|JACKPOT_TIMER|COUNTDOWN_TIMER|TIMER|COUNTDOWN|MEGA_JACKPOT_TIMER|SPORTPESA_MEGA_TIMER|BETIKA_MIDWEEK_TIMER|TIMER_ONLY)(?::([a-zA-Z0-9_-]+))?(?:\]\]|\]|\}\}|\s*\}\})?$/i);
    if (timerMatch) {
      const targetJackpotId = timerMatch[2] || jackpotId || 'sportpesa-mega';
      elements.push(
        <div key={`ui-timer-${i}`} className="my-5 flex items-center justify-center">
          <JackpotCountdownTimer
            jackpotId={targetJackpotId}
            fixtures={activeFixtures}
          />
        </div>
      );
      i++;
      continue;
    }

    // 0a. All Jackpot Fixtures Line (Full jackpot list with confidence, votes, and 2/3 partial disclosure + VIP lock)
    // e.g. "Game 1: Rayo Vallecano vs Racing Santander — Database Tip: DCX2 (Confidence: 85% | User Votes/Tip: 2 - 60%)"
    // e.g. "Game 12: Genoa vs Bologna — Database Tip: [⭐ Join VIP](/vip-packages) (Confidence: 74% | User Votes/Tip: X - 52%)"
    const initialParsedAllFixture = parseAllFixtureLine(trimmed);

    if (initialParsedAllFixture) {
      const allFixtureItems: Array<{
        gameNumber: number;
        matchTeams: string;
        prediction: string;
        isVipLocked: boolean;
        confidence: number | string;
        mostVoted: string;
        explanation: string;
      }> = [];

      let curIdx = i;
      while (curIdx < lines.length) {
        const curLine = lines[curIdx].trim();
        if (!curLine) {
          curIdx++;
          continue;
        }

        const parsed = parseAllFixtureLine(curLine);
        if (!parsed) {
          break;
        }

        // Check if next non-empty line is explanation
        let explanation = '';
        let nextIdx = curIdx + 1;
        while (nextIdx < lines.length && !lines[nextIdx].trim()) {
          nextIdx++;
        }
        if (nextIdx < lines.length) {
          const candidateLine = lines[nextIdx].trim();
          if (
            !candidateLine.startsWith('#') &&
            !parseAllFixtureLine(candidateLine) &&
            !candidateLine.match(/^(?:###\s+|\*\*)?.+?\s+vs\s+.+?\s*[—–-]/i)
          ) {
            explanation = candidateLine;
            curIdx = nextIdx;
          }
        }

        allFixtureItems.push({
          ...parsed,
          explanation
        });

        curIdx++;
      }

      i = curIdx;

      elements.push(
        <CompactAllJackpotFixturesSection
          key={`all-fixgroup-${i}`}
          items={allFixtureItems}
          postSlug={postSlug}
          jackpotId={jackpotId}
        />
      );
      continue;
    }

    // 0. Top Jackpot Confidence Fixture Line: e.g. "Parma vs Monza — 1", "Everton vs Manchester United — 2 (The game with the highest confidence score)"
    const fixtureMatch = trimmed.match(/^(?:###\s+|\*\*)?(.+?\s+vs\s+.+?)\s*[—–-]\s*([0-9X]|DC1X|DC2X|DCX2|DC12|DC2)(?:\s*(\([^)]*(?:highest|highest)\s+confidence[^)]*\)))?(?:\*\*)?$/i);
    if (fixtureMatch) {
      const fixtureItems: Array<{
        matchTeams: string;
        matchTip: string;
        isHighest: boolean;
        highestSuffixText: string;
        explanation: string;
      }> = [];

      let curIdx = i;
      while (curIdx < lines.length) {
        const curLine = lines[curIdx].trim();
        if (!curLine) {
          curIdx++;
          continue;
        }

        const match = curLine.match(/^(?:###\s+|\*\*)?(.+?\s+vs\s+.+?)\s*[—–-]\s*([0-9X]|DC1X|DC2X|DCX2|DC12|DC2)(?:\s*(\([^)]*(?:highest|highest)\s+confidence[^)]*\)))?(?:\*\*)?$/i);
        if (!match) {
          break;
        }

        const matchTeams = match[1].trim();
        const matchTip = match[2].trim();
        const isHighest = !!match[3];
        const highestSuffixText = match[3] ? match[3].trim() : '(The game with the highest confidence score)';

        // Check if next non-empty line is the prediction explanation text
        let explanation = '';
        let nextIdx = curIdx + 1;
        while (nextIdx < lines.length && !lines[nextIdx].trim()) {
          nextIdx++;
        }
        if (nextIdx < lines.length) {
          const candidateLine = lines[nextIdx].trim();
          if (!candidateLine.startsWith('#') && !candidateLine.match(/^(?:###\s+|\*\*)?.+?\s+vs\s+.+?\s*[—–-]/i)) {
            explanation = candidateLine;
            curIdx = nextIdx; // Advance loop to include the explanation
          }
        }

        fixtureItems.push({
          matchTeams,
          matchTip,
          isHighest,
          highestSuffixText,
          explanation
        });

        curIdx++;
      }

      i = curIdx;

      elements.push(
        <CompactJackpotTopConfidenceSection
          key={`fixgroup-${i}`}
          items={fixtureItems}
          postSlug={postSlug}
        />
      );
      continue;
    }

    // 1. Headings
    if (trimmed.startsWith('# ')) {
      elements.push(
        <h2
          key={`h1-${i}`}
          className="text-xl sm:text-2xl font-black text-[var(--text)] tracking-tight mb-2 mt-4 uppercase font-display"
        >
          {parseInline(trimmed.substring(2), postSlug)}
        </h2>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2
          key={`h2-${i}`}
          className="text-base sm:text-lg font-extrabold text-[var(--text)] tracking-tight mt-6 mb-2 uppercase font-mono text-[var(--primary)] flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-[var(--primary)] inline-block shrink-0" />
          {parseInline(trimmed.substring(3), postSlug)}
        </h2>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3
          key={`h3-${i}`}
          className="text-sm sm:text-base font-bold text-[var(--text)] mt-4 mb-2"
        >
          {parseInline(trimmed.substring(4), postSlug)}
        </h3>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith('#### ')) {
      elements.push(
        <h4
          key={`h4-${i}`}
          className="text-xs sm:text-sm font-extrabold text-[var(--text)] mt-3 mb-1 uppercase font-mono tracking-wider"
        >
          {parseInline(trimmed.substring(5), postSlug)}
        </h4>
      );
      i++;
      continue;
    }

    // 2. Blockquotes
    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s*/, ''));
        i++;
      }
      elements.push(
        <blockquote
          key={`quote-${i}`}
          className="border-l-4 border-[var(--primary)] pl-4 italic bg-[var(--card)] py-2 my-3 rounded-r text-[var(--text-muted)] leading-relaxed"
        >
          {quoteLines.map((ql, qIdx) => (
            <p key={qIdx} className={qIdx > 0 ? 'mt-1.5' : ''}>
              {parseInline(ql, postSlug)}
            </p>
          ))}
        </blockquote>
      );
      continue;
    }

    // 3. Tables (| col1 | col2 |)
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        const headerCells = tableLines[0]
          .split('|')
          .slice(1, -1)
          .map(c => c.trim());
        const isSeparator = /^[\s|:-]+$/.test(tableLines[1]);
        const bodyLines = isSeparator ? tableLines.slice(2) : tableLines.slice(1);

        elements.push(
          <div key={`table-${i}`} className="overflow-x-auto my-4 rounded-xl border border-[var(--border)]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr>
                  {headerCells.map((hc, hIdx) => (
                    <th key={hIdx} className="bg-[var(--card)] p-3 font-bold border-b border-[var(--border)] text-[var(--text)]">
                      {parseInline(hc, postSlug)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyLines.map((row, rIdx) => {
                  const rowCells = row.split('|').slice(1, -1).map(c => c.trim());
                  return (
                    <tr key={rIdx} className="hover:bg-[var(--card)]/50">
                      {rowCells.map((rc, cIdx) => (
                        <td key={cIdx} className="p-3 border-b border-[var(--border)]">
                          {parseInline(rc, postSlug)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // 4. Unordered Lists (* item or - item)
    if (/^(\*|-)\s+/.test(trimmed)) {
      const listItems: string[] = [];
      while (i < lines.length && /^(\*|-)\s+/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^(\*|-)\s+/, ''));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[var(--text-muted)] mb-3">
          {listItems.map((liText, liIdx) => (
            <li key={liIdx} className="leading-relaxed">
              {parseInline(liText, postSlug)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // 5. Ordered Lists (1. item)
    if (/^\d+\.\s+/.test(trimmed)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="list-decimal pl-5 space-y-1.5 text-xs sm:text-sm text-[var(--text-muted)] mb-3">
          {listItems.map((liText, liIdx) => (
            <li key={liIdx} className="leading-relaxed">
              {parseInline(liText, postSlug)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // 6. Block Image: ![alt](url) alone on a line
    const imgBlockMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgBlockMatch) {
      const altText = imgBlockMatch[1] || 'Illustration';
      const rawImgUrl = imgBlockMatch[2];
      const imgUrl = resolveRelativeImageUrl(rawImgUrl, postSlug);
      elements.push(
        <figure key={`img-fig-${i}`} className="my-6 space-y-2">
          <div className="rounded-[var(--radius)] overflow-hidden border border-[var(--border)] bg-slate-900/5 dark:bg-slate-900/40 shadow-xs">
            <img
              src={imgUrl}
              alt={altText}
              className="w-full h-auto max-h-[500px] object-contain mx-auto"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </div>
          {altText && altText !== 'Illustration' && (
            <figcaption className="text-center text-[11px] font-mono text-[var(--text-muted)] italic">
              {altText}
            </figcaption>
          )}
        </figure>
      );
      i++;
      continue;
    }

    // 7. Regular Paragraphs
    elements.push(
      <p key={`p-${i}`} className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed mb-2.5">
        {parseInline(trimmed, postSlug)}
      </p>
    );
    i++;
  }

  return (
    <div className={`markdown-body text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed space-y-3 ${className}`}>
      {elements}
    </div>
  );
}
