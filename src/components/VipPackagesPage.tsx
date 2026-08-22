import React from 'react';
import { motion } from 'motion/react';
import { Crown, Zap, Trophy, ShieldCheck, Sparkles, ArrowRight, Check, Star } from 'lucide-react';
import { VipPackage, OddsPack } from '../types';
import { JackpotConfig, jackpotsData } from '../jackpotsData';
import VipPackages from './VipPackages';
import OddsPacks from './OddsPacks';
import JackpotListPage from './JackpotListPage';
import FaqSection from './FaqSection';
import { getMarkdownContent } from '../content/markdownLoader';
import MarkdownRenderer from './MarkdownRenderer';
import { AuthorCard } from './AuthorCard';
import { ResponsibleGamblingNotice } from './ResponsibleGamblingNotice';

interface VipPackagesPageProps {
  vipPackages: VipPackage[];
  oddsPacks: OddsPack[];
  jackpots?: JackpotConfig[];
  unlockedJackpots?: string[];
  userPurchasedItemIds?: string[];
  onOpenPayment: (pkgName: string, price: number, id: string | number, slug: string, type: 'vip' | 'jackpot' | 'odds') => void;
  onSelectJackpot: (jackpotId: string) => void;
  onBackToHome?: () => void;
}

export default function VipPackagesPage({
  vipPackages,
  oddsPacks,
  jackpots = [],
  unlockedJackpots = [],
  userPurchasedItemIds = [],
  onOpenPayment,
  onSelectJackpot,
  onBackToHome
}: VipPackagesPageProps) {
  const pageMd = getMarkdownContent('vip-packages');
  const activeJackpots = jackpots.length > 0 ? jackpots : jackpotsData;

  return (
    <div className="space-y-8 text-left animate-fadeIn">
      {/* 1. HERO BANNER HEADER */}
      <div className="relative overflow-hidden p-6 md:p-8 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow)]">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 via-[var(--primary)] to-emerald-500" />
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1 animate-pulse">
              <Crown className="w-3.5 h-3.5" /> Soka King Premium VIP Center
            </span>
            <span className="text-[10px] text-[var(--text-muted)] font-mono font-bold uppercase tracking-wider">
              Instant Digital Activation
            </span>
          </div>

          <h1 className="text-xl md:text-3xl font-black text-[var(--text)] tracking-tight uppercase" style={{ fontFamily: 'var(--font-display)' }}>
            {pageMd.displayTitle || pageMd.title || <>VIP PACKAGES, <span className="text-amber-500">DAILY ODDS PACKS</span> & JACKPOT SLIPS</>}
          </h1>

          <p className="text-xs md:text-sm text-[var(--text-muted)] leading-relaxed max-w-2xl">
            Upgrade your game with algorithmic precision. Choose from daily/weekly VIP subscription bundles, targeted 2+ to 10+ decimal odds shortlists, or complete 17 & 15 match jackpot prediction slips.
          </p>

          {/* Quick jump anchor buttons */}
          <div className="flex flex-wrap gap-2.5 pt-2">
            <a 
              href="#vip-bundles-section" 
              className="px-3.5 py-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-xs font-black uppercase font-mono transition-all no-underline flex items-center gap-1.5"
            >
              <Crown className="w-3.5 h-3.5" /> VIP Packages
            </a>
            <a 
              href="#odds-packs-section" 
              className="px-3.5 py-2 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-700 hover:text-white text-xs font-black uppercase font-mono transition-all no-underline flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" /> Daily Odds Packs
            </a>
            <a 
              href="#jackpot-listing-section" 
              className="px-3.5 py-2 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 hover:bg-indigo-700 hover:text-white text-xs font-black uppercase font-mono transition-all no-underline flex items-center gap-1.5"
            >
              <Trophy className="w-3.5 h-3.5" /> Jackpot Listing
            </a>
          </div>
        </div>

        {/* Highlight Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 mt-6 border-t border-[var(--border)] relative z-10">
          <div className="space-y-1">
            <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold font-mono">VIP Hit Accuracy</span>
            <p className="text-sm font-black text-amber-500">89.4% Multi-Bet Success</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold font-mono">Odds Delivery</span>
            <p className="text-sm font-black text-emerald-500">~5 Minutes via SMS</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold font-mono">Jackpots Listed</span>
            <p className="text-sm font-black text-[var(--text)]">{activeJackpots.length} Major Kenya Bookies</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold font-mono">Instant Checkout</span>
            <p className="text-sm font-black text-indigo-500">Secure Mobile Payment</p>
          </div>
        </div>
      </div>

      {/* 2. VIP PACKAGES SECTION */}
      <section id="vip-bundles-section" className="space-y-4 scroll-mt-20">
        <VipPackages 
          packages={vipPackages}
          onOpenPayment={onOpenPayment}
          userPurchasedItemIds={userPurchasedItemIds}
        />
      </section>

      {/* MIDDLE SEO MARKDOWN (After VIP Section) */}
      {pageMd && pageMd.middle && (
        <div className="p-4 md:p-5 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow)] text-left text-xs leading-relaxed text-[var(--text-muted)]">
          <MarkdownRenderer content={pageMd.middle} />
        </div>
      )}

      {/* 3. ODDS PACKS SECTION */}
      <section id="odds-packs-section" className="space-y-4 scroll-mt-20">
        <OddsPacks 
          packs={oddsPacks}
          onOpenPayment={onOpenPayment}
          userPurchasedItemIds={userPurchasedItemIds}
        />
      </section>

      {/* MEAT SEO MARKDOWN (Before Jackpot Listing) */}
      {pageMd && pageMd.meat && (
        <div className="p-5 md:p-6 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow)] text-left text-xs leading-relaxed">
          <MarkdownRenderer content={pageMd.meat} />
        </div>
      )}

      {/* Author Card (renders when authorName is defined in page markdown) */}
      {pageMd && (pageMd.author || pageMd.authorName) && (
        <AuthorCard 
          authorId={pageMd.authorId}
          author={pageMd.author}
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

      {/* 4. JACKPOT LISTING SECTION */}
      <section id="jackpot-listing-section" className="space-y-4 scroll-mt-20">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-emerald-500" />
            <div>
              <h2 className="text-base md:text-lg font-bold text-[var(--text)]" style={{ fontFamily: 'var(--font-display)' }}>
                Kenyan Major Jackpot Prediction Slips
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Select any jackpot below to view full 17 & 15 match analysis and unlock complete double-chance slips.
              </p>
            </div>
          </div>
        </div>

        <JackpotListPage 
          onSelectJackpot={onSelectJackpot}
          unlockedJackpots={unlockedJackpots}
          hasPaidJackpot={unlockedJackpots.length > 0}
          jackpots={activeJackpots}
        />
      </section>

      {/* 5. FREQUENTLY ASKED QUESTIONS (MARKDOWN EDITABLE) */}
      <FaqSection pageId="vip-packages" />
    </div>
  );
}
