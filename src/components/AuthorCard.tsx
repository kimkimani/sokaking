import React from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  FileText, 
  Sparkles, 
  Scale, 
  Award, 
  Crosshair, 
  Lock, 
  HeartHandshake, 
  GraduationCap,
  ExternalLink
} from 'lucide-react';
import { getAuthor, ParsedAuthor, AuthorBadge } from '../content/authorLoader';

interface AuthorCardProps {
  authorId?: string;
  author?: ParsedAuthor;
  name?: string;
  title?: string;
  description?: string;
  avatar?: string;
  reviewerName?: string;
  reviewerTitle?: string;
  badges?: AuthorBadge[];
  lastUpdatedText?: string;
  compact?: boolean;
}

export const AuthorCard: React.FC<AuthorCardProps> = ({
  authorId,
  author: providedAuthor,
  name,
  title,
  description,
  avatar,
  reviewerName,
  reviewerTitle,
  badges: customBadges,
  lastUpdatedText,
  compact = false
}) => {
  // Resolve full author object from author markdown file
  const resolvedAuthor: ParsedAuthor | undefined = providedAuthor || (authorId || name ? getAuthor(authorId || name) : undefined);

  const displayName = name || resolvedAuthor?.name;
  if (!displayName) return null;

  const displayTitle = title || resolvedAuthor?.role;
  const displayDescription = description || resolvedAuthor?.shortBio;
  const displayAvatar = avatar || resolvedAuthor?.avatar;
  const displayReviewerName = reviewerName || resolvedAuthor?.reviewerName;
  const displayReviewerTitle = reviewerTitle || resolvedAuthor?.reviewerTitle;
  const displayBadges = customBadges && customBadges.length > 0 ? customBadges : (resolvedAuthor?.badges || []);

  const getBadgeStyle = (type?: string) => {
    switch (type) {
      case 'modeler':
        return {
          bg: 'bg-indigo-500/15 text-indigo-900 dark:text-indigo-200 border-indigo-500/30',
          icon: <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
        };
      case 'experience':
        return {
          bg: 'bg-blue-500/15 text-blue-900 dark:text-blue-200 border-blue-500/30',
          icon: <Award className="w-3 h-3 text-blue-600 dark:text-blue-400" />
        };
      case 'tactical':
        return {
          bg: 'bg-amber-500/15 text-amber-950 dark:text-amber-200 border-amber-500/30',
          icon: <Crosshair className="w-3 h-3 text-amber-600 dark:text-amber-400" />
        };
      case 'security':
        return {
          bg: 'bg-purple-500/15 text-purple-950 dark:text-purple-200 border-purple-500/30',
          icon: <Lock className="w-3 h-3 text-purple-600 dark:text-purple-400" />
        };
      case 'support':
        return {
          bg: 'bg-rose-500/15 text-rose-950 dark:text-rose-200 border-rose-500/30',
          icon: <HeartHandshake className="w-3 h-3 text-rose-600 dark:text-rose-400" />
        };
      case 'verified':
      default:
        return {
          bg: 'bg-emerald-500/15 text-emerald-950 dark:text-emerald-200 border-emerald-500/30',
          icon: <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
        };
    }
  };

  const getInitials = (n: string) => {
    const parts = n.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return n.slice(0, 2).toUpperCase();
  };

  return (
    <div className="p-5 md:p-6 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow)] text-left space-y-4 relative overflow-hidden my-6">
      {/* Top author details */}
      <div className="flex items-start gap-4">
        {displayAvatar ? (
          <img 
            src={displayAvatar} 
            alt={`Author photo of ${displayName}`}
            width={56}
            height={56}
            loading="lazy"
            decoding="async" 
            className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border-2 border-[var(--primary)] shrink-0"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-[var(--primary)] to-indigo-600 text-white flex items-center justify-center font-black font-mono text-base md:text-lg border-2 border-[var(--primary)]/30 shrink-0 shadow-sm">
            {getInitials(displayName)}
          </div>
        )}

        <div className="space-y-2 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base md:text-lg font-black text-[var(--text)] tracking-tight font-display m-0">
              {displayName}
            </h3>

            {/* Dynamic Badges from Markdown */}
            {displayBadges && displayBadges.map((badge, idx) => {
              const style = getBadgeStyle(badge.type);
              return (
                <span 
                  key={idx}
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black font-mono uppercase tracking-wider border ${style.bg}`}
                >
                  {style.icon}
                  <span>{badge.text}</span>
                </span>
              );
            })}
          </div>

          {displayTitle && (
            <p className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide m-0">
              {displayTitle}
            </p>
          )}

          {resolvedAuthor?.credentials && (
            <p className="text-[11px] text-[var(--text-muted)] font-medium flex items-center gap-1.5 m-0 pt-0.5">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>{resolvedAuthor.credentials}</span>
            </p>
          )}

          {resolvedAuthor?.specialization && (
            <p className="text-[11px] text-[var(--text-muted)] font-mono flex items-center gap-1.5 m-0">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span><strong className="text-[var(--text)] font-semibold">Specialization:</strong> {resolvedAuthor.specialization}</span>
            </p>
          )}

          {displayDescription && (
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed pt-1 m-0">
              {displayDescription}
            </p>
          )}

          {resolvedAuthor?.knowsAbout && resolvedAuthor.knowsAbout.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
              <span className="text-[10px] font-mono font-bold uppercase text-[var(--text-muted)] mr-1">
                Focus:
              </span>
              {resolvedAuthor.knowsAbout.map((item, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-[var(--text)] font-semibold"
                >
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* E-E-A-T Reviewer and Transparency Bar - only shown if reviewer is defined */}
      {(displayReviewerName || lastUpdatedText) && (
        <div className="pt-3.5 border-t border-[var(--border)]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
          {displayReviewerName && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="font-semibold text-[var(--text)]">Fact-Checked & Verified by:</span>
              <span className="text-emerald-700 dark:text-emerald-300 font-bold">{displayReviewerName}</span>
              {displayReviewerTitle && (
                <span className="text-[11px] text-[var(--text-muted)]">({displayReviewerTitle})</span>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 font-mono text-[11px] text-[var(--text-muted)]">
            <a 
              href="/about-us#editorial-policy" 
              className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Editorial Standards</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
