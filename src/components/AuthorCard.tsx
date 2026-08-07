import React from 'react';
import { UserCheck, Award, ShieldCheck } from 'lucide-react';

interface AuthorCardProps {
  name: string;
  title?: string;
  description?: string;
  avatar?: string;
}

export const AuthorCard: React.FC<AuthorCardProps> = ({
  name,
  title,
  description,
  avatar
}) => {
  if (!name) return null;

  return (
    <div className="p-5 md:p-6 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow)] text-left space-y-3 relative overflow-hidden my-6">
      <div className="flex items-start gap-4">
        {avatar ? (
          <img 
            src={avatar} 
            alt={`Author photo of ${name}`}
            width={56}
            height={56}
            loading="lazy"
            decoding="async" 
            className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border-2 border-[var(--primary)] shrink-0"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-[var(--primary)] to-indigo-600 text-white flex items-center justify-center font-black font-mono text-base md:text-lg border-2 border-[var(--primary)]/30 shrink-0 shadow-sm">
            {name.charAt(0)}
          </div>
        )}

        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm md:text-base font-extrabold text-[var(--text)] tracking-tight font-display">
              {name}
            </h4>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black font-mono uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span>Verified Sports Analyst</span>
            </span>
          </div>

          {title && (
            <p className="text-[11px] font-mono font-bold text-[var(--primary)] uppercase tracking-wide">
              {title}
            </p>
          )}

          {description && (
            <p className="text-xs text-[var(--text-muted)] leading-relaxed pt-1">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
