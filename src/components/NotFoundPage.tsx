import React from 'react';
import { AlertCircle, Home, Flame, Trophy, ArrowLeft } from 'lucide-react';
import { getPageUrl } from '../utils/navigation';

interface NotFoundPageProps {
  onBackToHome?: () => void;
  onSelectPage?: (pageId: string) => void;
  attemptedPage?: string;
}

export default function NotFoundPage({
  onBackToHome,
  onSelectPage,
  attemptedPage
}: NotFoundPageProps) {
  const handleNav = (pageId: string) => {
    if (onSelectPage) {
      onSelectPage(pageId);
    } else if (onBackToHome) {
      onBackToHome();
    } else {
      window.location.href = getPageUrl(pageId);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      <div className="relative overflow-hidden p-8 md:p-12 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow)] text-center">
        <div className="max-w-xl mx-auto space-y-5">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 mb-2">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="inline-block px-3 py-1 rounded-full text-xs font-mono font-black uppercase tracking-wider bg-slate-500/10 text-[var(--text-muted)] border border-[var(--border)]">
            Error 404 &bull; Page Not Found
          </div>

          <h1 
            className="text-2xl md:text-4xl font-extrabold tracking-tight text-[var(--text)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Prediction Page Not Found
          </h1>

          <p className="text-sm md:text-base text-[var(--text-muted)] leading-relaxed">
            The page {attemptedPage ? <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">"{attemptedPage}"</span> : 'you requested'} does not exist, has been removed, or is no longer available on Soka King.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => handleNav('home')}
              className="px-5 py-2.5 rounded-lg bg-[var(--primary)] text-white text-xs font-black uppercase tracking-wider hover:opacity-90 transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Home className="w-4 h-4" />
              Go to Homepage
            </button>

            <button
              onClick={() => handleNav('category-today')}
              className="px-5 py-2.5 rounded-lg bg-[var(--card)] text-[var(--text)] border border-[var(--border)] text-xs font-bold uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Flame className="w-4 h-4 text-red-500" />
              Today's Predictions
            </button>

            <button
              onClick={() => handleNav('jackpot-list')}
              className="px-5 py-2.5 rounded-lg bg-[var(--card)] text-[var(--text)] border border-[var(--border)] text-xs font-bold uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              All Jackpots
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
