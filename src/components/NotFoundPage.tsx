import React from 'react';
import { AlertTriangle, Home, Flame, Trophy, Crown, ArrowLeft } from 'lucide-react';
import { getPageUrl } from '../utils/navigation';

interface NotFoundPageProps {
  onNavigate: (pageId: string) => void;
  status?: 404 | 410;
  requestedPath?: string;
}

export default function NotFoundPage({ onNavigate, status = 404, requestedPath }: NotFoundPageProps) {
  const is410 = status === 410;

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-300">
      <section className="p-6 md:p-10 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow)] text-center max-w-2xl mx-auto space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-red-500/10 text-red-400 border border-red-500/20">
            HTTP {status} &bull; {is410 ? 'Content Permanently Removed' : 'Page Not Found'}
          </div>
          <h1 
            className="text-2xl md:text-3xl font-black text-[var(--text)] tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {is410 ? 'Legacy Resource Retired' : 'Requested Page Does Not Exist'}
          </h1>
          <p className="text-xs md:text-sm text-[var(--text-muted)] max-w-md mx-auto leading-relaxed">
            {is410 
              ? 'This URL belonged to legacy or expired historical content. It has been permanently removed and purged from our database.'
              : 'The link you followed may be broken, mistyped, or the page may have been moved.'}
          </p>
          {requestedPath && (
            <div className="inline-block bg-slate-900 border border-slate-800 text-slate-400 font-mono text-[11px] px-3 py-1.5 rounded-lg mt-2 break-all max-w-full">
              {requestedPath}
            </div>
          )}
        </div>

        {/* Recommended Navigation Links */}
        <div className="pt-2 border-t border-[var(--border)] space-y-3">
          <span className="text-[11px] font-mono font-bold uppercase text-[var(--text-muted)] tracking-wider block">
            Explore Verified Football Analytics
          </span>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('category-today')}
              className="px-4 py-2.5 bg-[var(--primary)] hover:bg-emerald-800 text-white text-xs font-black rounded-lg shadow-sm flex items-center gap-2 cursor-pointer transition-all border-none"
            >
              <Flame className="w-4 h-4 text-white" />
              <span>Today's Predictions</span>
            </button>
            <button
              onClick={() => onNavigate('sportpesa-mega')}
              className="px-4 py-2.5 bg-[var(--card)] hover:bg-slate-800 border border-[var(--border)] text-[var(--text)] text-xs font-bold rounded-lg flex items-center gap-2 cursor-pointer transition-all"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Mega Jackpot</span>
            </button>
            <button
              onClick={() => onNavigate('vip-packages')}
              className="px-4 py-2.5 bg-[var(--card)] hover:bg-slate-800 border border-[var(--border)] text-[var(--text)] text-xs font-bold rounded-lg flex items-center gap-2 cursor-pointer transition-all"
            >
              <Crown className="w-4 h-4 text-amber-400" />
              <span>VIP Packages</span>
            </button>
            <button
              onClick={() => onNavigate('home')}
              className="px-4 py-2.5 bg-transparent hover:bg-slate-800 text-[var(--text-muted)] hover:text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
