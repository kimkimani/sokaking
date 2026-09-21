import { Percent, Send, Zap } from 'lucide-react';
import { OddsPack } from '../types';

interface OddsPacksProps {
  packs: OddsPack[];
  onOpenPayment: (pkgName: string, price: number, id: string | number, slug: string, type: 'vip' | 'jackpot' | 'odds') => void;
  userPurchasedItemIds?: string[];
  title?: string;
  subtitle?: string;
}

export default function OddsPacks({
  packs,
  onOpenPayment,
  userPurchasedItemIds = [],
  title,
  subtitle
}: OddsPacksProps) {
  
  const getRiskColorClass = (risk: OddsPack['riskLevel']) => {
    switch (risk) {
      case 'Conservative': return 'text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 font-bold';
      case 'Balanced': return 'text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-800 font-bold';
      case 'Aggressive': return 'text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 font-bold';
      default: return 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-bold';
    }
  };

  const getPackBgClass = () => {
    return 'bg-[var(--card)] border-[var(--border)] hover:border-emerald-600/50 dark:hover:border-emerald-500/50 shadow-xs';
  };

  return (
    <section id="odds-packs" className="p-5 md:p-6 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow)] backdrop-blur-[var(--backdrop)] relative text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-6 rounded-full bg-[var(--primary)] badge-glow block" />
          <div>
            <h2 className="text-base md:text-lg font-bold flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
              <Percent className="w-5 h-5 text-[var(--primary)]" />
              {title || "Premium Odds Shortlists"}
            </h2>
            <p className="text-xs text-[var(--text-muted)]">{subtitle || "Curated daily slips focused strictly on hitting specific decimal targets"}</p>
          </div>
        </div>
        <div className="text-xs font-mono text-[var(--text-muted)] flex items-center gap-1.5 bg-[var(--background)] px-3 py-1.5 rounded-[var(--radius)] border border-[var(--border)] w-fit self-start">
          <Send className="w-3.5 h-3.5 text-[var(--primary)] text-[var(--primary)]" /> Average Delivery Time: ~5 Mins
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packs.map((pack) => {
          const isUnlocked = userPurchasedItemIds.includes(String(pack.id));
          
          return (
            <div 
              key={pack.id}
              className={`flex flex-col justify-between p-5 rounded-[var(--radius)] border transition-all duration-300 relative group ${getPackBgClass()}`}
            >
              {/* Top Row: Title, Tag, and Odds Badge */}
              <div>
                <div className="flex justify-between items-start gap-4 mb-3.5">
                  <div>
                    <span className={`text-[9px] font-mono font-bold tracking-wider px-2.5 py-0.5 rounded uppercase border ${getRiskColorClass(pack.riskLevel)}`}>
                      {pack.tag}
                    </span>
                    <div className="text-sm font-extrabold mt-2 text-[var(--text)]" style={{ fontFamily: 'var(--font-display)' }}>
                      {pack.name}
                    </div>
                  </div>

                  {/* Decimal Odds Indicator Badge */}
                  <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-[var(--radius)] text-center min-w-[65px] font-mono shrink-0">
                    <div className="text-sm font-black tracking-tight leading-none text-emerald-700 dark:text-emerald-400">{pack.oddsMinDecimal}</div>
                    <div className="text-[8px] font-bold uppercase mt-0.5 tracking-wide text-slate-500 dark:text-slate-400">Odds+</div>
                  </div>
                </div>

                {/* Package Sub Description */}
                <p className="text-xs text-[var(--text-muted)] mb-4 leading-relaxed">
                  {pack.description}
                </p>

                {/* Mini analytics row */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-[var(--radius)] bg-slate-50 dark:bg-slate-900/60 border border-[var(--border)] text-[10px] mb-4">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block uppercase font-mono font-bold">Picks Ratio</span>
                    <strong className="text-slate-900 dark:text-slate-100 font-extrabold">{pack.picksPerDay} Selections / Slip</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block uppercase font-mono font-bold">Risk Profile</span>
                    <strong className="text-slate-900 dark:text-slate-100 font-extrabold">{pack.riskLevel}</strong>
                  </div>
                </div>
              </div>

              {/* Price and Action Button */}
              <div className="border-t border-[var(--border)] pt-4 mt-1">
                <div className="flex items-baseline justify-between mb-4">
                  <div className="text-xs text-[var(--text-muted)] font-mono uppercase">Ticket Price</div>
                  <div className="text-lg font-black font-mono text-emerald-700 dark:text-emerald-400">
                    KES {pack.price}
                  </div>
                </div>

                {isUnlocked ? (
                  <div className="w-full py-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-[var(--radius)] font-mono font-black text-xs text-center flex items-center justify-center gap-1.5 uppercase">
                    <span>✓ Active Pack</span>
                  </div>
                ) : (
                  <button
                    onClick={() => onOpenPayment(pack.name, pack.price, pack.id, pack.slug, 'odds')}
                    className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-black text-xs rounded-[var(--radius)] shadow-xs flex items-center justify-center gap-2 transition-all duration-200 border-none cursor-pointer"
                  >
                    <Zap className="w-4 h-4 text-white" />
                    <span>Buy KES {pack.price}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
