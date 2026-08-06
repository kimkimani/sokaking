import React from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

interface ResponsibleGamblingNoticeProps {
  notice?: string;
}

export const ResponsibleGamblingNotice: React.FC<ResponsibleGamblingNoticeProps> = ({ notice }) => {
  if (!notice) return null;

  return (
    <div className="p-4 md:p-5 rounded-[var(--radius)] bg-amber-500/10 dark:bg-amber-950/25 border-2 border-amber-500/40 text-left my-6 relative overflow-hidden shadow-sm">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
          <ShieldAlert className="w-5 h-5" />
        </div>

        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 font-mono flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Responsible Gambling Notice
            </span>
            <span className="text-[10px] font-black font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              STRICTLY 18+ ONLY
            </span>
          </div>

          <div className="text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed font-medium">
            <MarkdownRenderer content={notice} />
          </div>
        </div>
      </div>
    </div>
  );
};

