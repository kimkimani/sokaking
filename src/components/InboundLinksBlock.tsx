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

interface InboundLinksBlockProps {
  pageId: string;
  rawType?: string;
  jackpotId?: string;
  onSelectPage?: (pageId: string) => void;
  className?: string;
}

export default function InboundLinksBlock({
  pageId,
  rawType,
  jackpotId,
  onSelectPage,
  className = ''
}: InboundLinksBlockProps) {
  const group = getInboundLinks(pageId, rawType, jackpotId);

  if (!group || !group.links || group.links.length === 0) {
    return null;
  }

  // Visual header styling and icon matching the page archetype
  const getHeaderBadge = () => {
    switch (group.type) {
      case 'competitor':
        return {
          icon: <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />,
          badgeText: 'Alternative Portals',
          badgeClass: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
          accentColor: 'border-purple-500/30 hover:border-purple-500/60',
          tagBg: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
          arrowColor: 'text-purple-600 dark:text-purple-400'
        };
      case 'jackpot':
        return {
          icon: <Trophy className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
          badgeText: 'Major Kenyan Pools',
          badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
          accentColor: 'border-emerald-500/30 hover:border-emerald-500/60',
          tagBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
          arrowColor: 'text-emerald-600 dark:text-emerald-400'
        };
      case 'category':
        return {
          icon: <TrendingUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />,
          badgeText: 'Market Angles',
          badgeClass: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
          accentColor: 'border-blue-500/30 hover:border-blue-500/60',
          tagBg: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
          arrowColor: 'text-blue-600 dark:text-blue-400'
        };
      default:
        return {
          icon: <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />,
          badgeText: 'Platform & Trust',
          badgeClass: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20',
          accentColor: 'border-indigo-500/30 hover:border-indigo-500/60',
          tagBg: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20',
          arrowColor: 'text-indigo-600 dark:text-indigo-400'
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
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase tracking-wider border ${styling.badgeClass}`}>
              {styling.icon}
              {styling.badgeText}
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-black text-[var(--text)] tracking-tight uppercase font-mono">
            {group.sectionTitle}
          </h3>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-2xl">
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
            className={`group relative flex flex-col justify-between p-4 rounded-xl border bg-[var(--background)]/60 hover:bg-slate-100/50 dark:hover:bg-slate-900/40 transition-all duration-200 no-underline cursor-pointer shadow-3xs ${styling.accentColor}`}
          >
            {/* Top row: Icon and Tag */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xl" role="img" aria-label={item.title}>
                  {item.icon}
                </span>
                <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded border truncate ${styling.tagBg}`}>
                  {item.tag}
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <h4 className="text-xs sm:text-sm font-black text-[var(--text)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase font-mono tracking-tight leading-snug">
                  {item.title}
                </h4>
                <p className="text-[11px] text-[var(--text-muted)] mt-1.5 leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>
            </div>

            {/* Bottom Call to Action */}
            <div className="mt-3 pt-2.5 border-t border-[var(--border)] flex items-center justify-between text-[10px] font-black uppercase font-mono">
              <span className={`flex items-center gap-1 group-hover:underline ${styling.arrowColor}`}>
                <span>Explore Guide</span>
                <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
