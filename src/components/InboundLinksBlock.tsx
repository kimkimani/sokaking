import React from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  Trophy, 
  ShieldCheck, 
  TrendingUp, 
  ExternalLink,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { getInboundLinks, detectPageType } from '../utils/inboundLinks';
import { getMarkdownContent } from '../content/markdownLoader';

interface InboundLinksBlockProps {
  pageId: string;
  rawType?: string;
  jackpotId?: string;
  customTitle?: string;
  customSubtitle?: string;
  customBadge?: string;
  onSelectPage?: (pageId: string) => void;
  className?: string;
}

export default function InboundLinksBlock({
  pageId,
  rawType,
  jackpotId,
  customTitle,
  customSubtitle,
  customBadge,
  onSelectPage,
  className = ''
}: InboundLinksBlockProps) {
  // Check if page markdown provides custom inbound metadata
  let mdInboundTitle: string | undefined = customTitle;
  let mdInboundSubtitle: string | undefined = customSubtitle;
  let mdInboundBadge: string | undefined = customBadge;

  try {
    const md = getMarkdownContent(pageId);
    if (!mdInboundTitle) {
      mdInboundTitle = md.inboundTitle || md.inboundHeading;
    }
    if (!mdInboundSubtitle) {
      mdInboundSubtitle = md.inboundDescription || md.inboundSubtitle;
    }
    if (!mdInboundBadge) {
      mdInboundBadge = md.inboundBadge;
    }
  } catch (e) {}

  const group = getInboundLinks(pageId, rawType, jackpotId, {
    title: mdInboundTitle,
    subtitle: mdInboundSubtitle,
    badgeText: mdInboundBadge
  });

  if (!group || !group.links || group.links.length === 0) {
    return null;
  }

  // Visual header styling and icon matching the page archetype
  const getHeaderBadge = () => {
    const defaultBadge = group.badgeText;
    switch (group.type) {
      case 'competitor':
        return {
          icon: <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />,
          badgeText: defaultBadge || 'Alternative Portals',
          badgeClass: 'bg-purple-500/15 text-purple-950 dark:text-purple-200 border-purple-500/30',
          accentColor: 'border-purple-500/30 hover:border-purple-500/60',
          tagBg: 'bg-purple-500/15 text-purple-950 dark:text-purple-200 border-purple-500/30',
          arrowColor: 'text-purple-700 dark:text-purple-300'
        };
      case 'jackpot':
        return {
          icon: <Trophy className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
          badgeText: defaultBadge || 'Major Kenyan Pools',
          badgeClass: 'bg-emerald-500/15 text-emerald-950 dark:text-emerald-200 border-emerald-500/30',
          accentColor: 'border-emerald-500/30 hover:border-emerald-500/60',
          tagBg: 'bg-emerald-500/15 text-emerald-950 dark:text-emerald-200 border-emerald-500/30',
          arrowColor: 'text-emerald-700 dark:text-emerald-300'
        };
      case 'category':
        return {
          icon: <TrendingUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />,
          badgeText: defaultBadge || 'Market Angles',
          badgeClass: 'bg-blue-500/15 text-blue-950 dark:text-blue-200 border-blue-500/30',
          accentColor: 'border-blue-500/30 hover:border-blue-500/60',
          tagBg: 'bg-blue-500/15 text-blue-950 dark:text-blue-200 border-blue-500/30',
          arrowColor: 'text-blue-700 dark:text-blue-300'
        };
      default:
        return {
          icon: <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />,
          badgeText: defaultBadge || 'Platform & Trust',
          badgeClass: 'bg-indigo-500/15 text-indigo-950 dark:text-indigo-200 border-indigo-500/30',
          accentColor: 'border-indigo-500/30 hover:border-indigo-500/60',
          tagBg: 'bg-indigo-500/15 text-indigo-950 dark:text-indigo-200 border-indigo-500/30',
          arrowColor: 'text-indigo-700 dark:text-indigo-300'
        };
    }
  };

  const styling = getHeaderBadge();

  return (
    <section 
      id={`inbound-links-${pageId}`} 
      aria-label={group.sectionTitle}
      className={`p-5 md:p-6 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow)] text-left space-y-4 ${className}`}
    >
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-mono font-black uppercase tracking-wider border ${styling.badgeClass}`}>
              {styling.icon}
              {styling.badgeText}
            </span>
          </div>
          <h2 className="text-sm sm:text-base font-black text-[var(--text)] tracking-tight uppercase font-mono">
            {group.sectionTitle}
          </h2>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-2xl font-medium">
            {group.sectionSubtitle}
          </p>
        </div>
      </div>

      {/* 3 INBOUND LINK CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
        {group.links.map((item) => (
          <a
            key={item.id}
            id={`inbound-link-card-${item.id}`}
            href={item.url}
            onClick={(e) => {
              if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                if (onSelectPage) {
                  e.preventDefault();
                  onSelectPage(item.id);
                }
              }
            }}
            className={`group relative flex flex-col justify-between p-4 rounded-xl border bg-[var(--background)] hover:bg-slate-100/60 dark:hover:bg-slate-900/60 transition-all duration-200 no-underline cursor-pointer shadow-3xs min-h-[44px] ${styling.accentColor}`}
          >
            {/* Top row: Icon and Tag */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xl" role="img" aria-label={item.title}>
                  {item.icon}
                </span>
                <span className={`text-[9.5px] font-mono font-black uppercase px-2.5 py-0.5 rounded border truncate ${styling.tagBg}`}>
                  {item.tag}
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <div className="text-xs sm:text-sm font-black text-[var(--text)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase font-mono tracking-tight leading-snug">
                  {item.title}
                </div>
                <p className="text-[11.5px] text-slate-700 dark:text-slate-300 mt-1.5 leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>
            </div>

            {/* Bottom Call to Action */}
            <div className="mt-3 pt-2.5 border-t border-[var(--border)] flex items-center justify-between text-[11px] font-black uppercase font-mono min-h-[36px]">
              <span className={`flex items-center gap-1 group-hover:underline ${styling.arrowColor}`}>
                <span>Explore Guide</span>
                <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
