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
      case 'Conservative': return 'text-white bg-emerald-800 border-emerald-800 font-black';
      case 'Balanced': return 'text-slate-950 bg-amber-400 border-amber-400 font-black';
      case 'Aggressive': return 'text-white bg-rose-700 border-rose-700 font-black';
      default: return 'text-white bg-slate-800 border-slate-800 font-black';
    }
  };

  const getPackBgClass = (risk: OddsPack['riskLevel']) => {
    switch (risk) {
      case 'Conservative': return 'bg-gradient-to-br from-emerald-50/90 to-emerald-100/40 border-emerald-300/80 hover:border-emerald-500/80 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.15)]';
      case 'Balanced': return 'bg-gradient-to-br from-amber-50/90 to-amber-100/40 border-amber-300/80 hover:border-amber-500/80 shadow-[0_4px_20px_-4px_rgba(245,158,11,0.15)]';
      case 'Aggressive': return 'bg-gradient-to-br from-rose-50/90 to-rose-100/40 border-rose-300/80 hover:border-rose-500/80 shadow-[0_4px_20px_-4px_rgba(244,63,94,0.15)]';
      default: return 'bg-gradient-to-br from-slate-50/90 to-slate-100/40 border-slate-300/80';
    }
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
              className={`flex flex-col justify-between p-5 rounded-[var(--radius)] border transition-all duration-300 relative group shadow-sm ${getPackBgClass(pack.riskLevel)}`}
            >
              {/* Top Row: Title, Tag, and Odds Badge */}
              <div>
                <div className="flex justify-between items-start gap-4 mb-3.5">
                  <div>
                    <span className={`text-[9px] font-mono font-extrabold tracking-widest px-2.5 py-0.5 rounded uppercase border ${getRiskColorClass(pack.riskLevel)}`}>
                      {pack.tag}
                    </span>
                    <h3 className="text-sm font-extrabold mt-2 text-[var(--text)]" style={{ fontFamily: 'var(--font-display)' }}>
                      {pack.name}
                    </h3>
                  </div>

                  {/* Decimal Odds Indicator Badge */}
                  <div className="px-3 py-1.5 bg-transparent text-black border border-black rounded-[var(--radius)] text-center min-w-[65px] font-mono shrink-0">
                    <div className="text-sm font-black tracking-tight leading-none">{pack.oddsMinDecimal}</div>
                    <div className="text-[8px] font-extrabold uppercase mt-0.5 tracking-wide">Odds+</div>
                  </div>
                </div>

                {/* Package Sub Description */}
                <p className="text-xs text-[var(--text-muted)] mb-4 leading-relaxed">
                  {pack.description}
                </p>

                {/* Mini analytics row */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-[var(--radius)] bg-[var(--background)] bg-opacity-80 border border-[var(--border)] text-[10px] mb-4">
                  <div>
                    <span className="text-slate-600 block uppercase font-mono font-bold">Picks Ratio</span>
                    <strong className="text-slate-900 font-extrabold">{pack.picksPerDay} Selections / Slip</strong>
                  </div>
                  <div>
                    <span className="text-slate-600 block uppercase font-mono font-bold">Risk Profile</span>
                    <strong className="text-slate-900 font-extrabold">{pack.riskLevel}</strong>
                  </div>
                </div>
              </div>

              {/* Price & Action Button */}
              <div className="border-t border-[var(--border)] pt-4 mt-1">
                <div className="flex items-baseline justify-between mb-4">
                  <div className="text-xs text-[var(--text-muted)] font-mono uppercase">Ticket Price</div>
                  <div className="text-lg font-black font-mono text-[var(--primary)]">
                    KES {pack.price}
                  </div>
                </div>

                {isUnlocked ? (
                  <div className="w-full py-2.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 rounded-[var(--radius)] font-mono font-black text-xs text-center flex items-center justify-center gap-1.5 uppercase">
                    <span>✓ Active Pack</span>
                  </div>
                ) : (
                  <button
                    onClick={() => onOpenPayment(pack.name, pack.price, pack.id, pack.slug, 'odds')}
                    className="w-full py-3 px-4 bg-[var(--primary)] hover:bg-emerald-800 active:scale-98 text-white font-black text-xs rounded-[var(--radius)] shadow-sm flex items-center justify-center gap-2 transition-all duration-200 border-none cursor-pointer"
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
