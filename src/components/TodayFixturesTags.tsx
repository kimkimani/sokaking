import { useState } from 'react';
import { Sparkles, Trophy, Layers, Copy, Check, Tag } from 'lucide-react';
import { Fixture } from '../types';
import { getTodayTags } from '../utils/todayFixturesTags';

interface TodayFixturesTagsProps {
  fixtures?: Fixture[];
  className?: string;
  showHeading?: boolean;
}

export default function TodayFixturesTags({
  fixtures,
  className = '',
  showHeading = true
}: TodayFixturesTagsProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const tags = getTodayTags(fixtures);

  // If no fixtures are present at all
  if (!tags.topTwoFixtures && !tags.leagues && !tags.predictionsSummary) {
    return null;
  }

  const handleCopy = (key: string, text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  return (
    <div 
      id="today-fixtures-tags-container"
      className={`rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] p-3.5 md:p-4 shadow-[var(--shadow)] relative overflow-hidden text-left space-y-3 ${className}`}
    >
      {/* Subtle top indicator bar */}
      <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-emerald-700" />

      {showHeading && (
        <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
              <Tag className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-black uppercase tracking-wider font-mono text-[var(--text)]">
              Today's Fixtures & Prediction Tags
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase hidden sm:inline-block">
            Auto-Generated Live Tags
          </span>
        </div>
      )}

      {/* Tags List */}
      <div className="space-y-2.5">
        {/* Tag 1: Top Two Today Fixtures */}
        <div 
          id="tag-top-two-fixtures"
          className="group flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-[var(--border)] hover:border-emerald-600 transition-colors"
        >
          <div className="flex items-start sm:items-center gap-2 min-w-0 flex-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono bg-emerald-700 text-white shrink-0">
              <Sparkles className="w-3 h-3 text-emerald-200" />
              Featured Match
            </span>
            <span className="text-xs font-bold text-[var(--text)] leading-snug break-words">
              {tags.topTwoFixtures}
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleCopy('topTwo', tags.topTwoFixtures)}
            title="Copy fixtures tag"
            className="inline-flex items-center gap-1 self-start sm:self-center px-2 py-1 rounded text-[10px] font-mono font-bold uppercase transition-colors bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-[var(--border)] text-slate-700 dark:text-slate-300 shrink-0 cursor-pointer"
          >
            {copiedKey === 'topTwo' ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span className="text-emerald-600 font-black">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                <span>Copy Tag</span>
              </>
            )}
          </button>
        </div>

        {/* Tag 2: Today Fixtures League Names */}
        <div 
          id="tag-today-leagues"
          className="group flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-[var(--border)] hover:border-emerald-600 transition-colors"
        >
          <div className="flex items-start sm:items-center gap-2 min-w-0 flex-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono bg-slate-800 dark:bg-slate-700 text-white shrink-0">
              <Trophy className="w-3 h-3 text-emerald-400" />
              Leagues
            </span>
            <span className="text-xs font-bold text-[var(--text)] leading-snug break-words">
              {tags.leagues}
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleCopy('leagues', tags.leagues)}
            title="Copy leagues tag"
            className="inline-flex items-center gap-1 self-start sm:self-center px-2 py-1 rounded text-[10px] font-mono font-bold uppercase transition-colors bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-[var(--border)] text-slate-700 dark:text-slate-300 shrink-0 cursor-pointer"
          >
            {copiedKey === 'leagues' ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span className="text-emerald-600 font-black">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                <span>Copy Tag</span>
              </>
            )}
          </button>
        </div>

        {/* Tag 3: Today Prediction Summary */}
        <div 
          id="tag-today-predictions"
          className="group flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-[var(--border)] hover:border-emerald-600 transition-colors"
        >
          <div className="flex items-start sm:items-center gap-2 min-w-0 flex-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono bg-emerald-800 text-white shrink-0">
              <Layers className="w-3 h-3 text-emerald-300" />
              Today Predictions
            </span>
            <span className="text-xs font-bold text-[var(--text)] leading-snug break-words">
              {tags.predictionsSummary}
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleCopy('predictions', tags.predictionsSummary)}
            title="Copy predictions breakdown tag"
            className="inline-flex items-center gap-1 self-start sm:self-center px-2 py-1 rounded text-[10px] font-mono font-bold uppercase transition-colors bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-[var(--border)] text-slate-700 dark:text-slate-300 shrink-0 cursor-pointer"
          >
            {copiedKey === 'predictions' ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span className="text-emerald-600 font-black">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                <span>Copy Tag</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
