import { motion } from 'motion/react';
import { Crown, Check, ShieldCheck, Sparkles, AlertCircle, ShoppingCart } from 'lucide-react';
import { VipPackage } from '../types';

interface VipPackagesProps {
  packages: VipPackage[];
  onOpenPayment: (pkgName: string, price: number, id: string | number, slug: string, type: 'vip' | 'jackpot' | 'odds') => void;
  userPurchasedItemIds?: string[];
  title?: string;
  subtitle?: string;
}

export default function VipPackages({
  packages,
  onOpenPayment,
  userPurchasedItemIds = [],
  title,
  subtitle
}: VipPackagesProps) {
  return (
    <section id="vip-showcase" className="py-2.5">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-6 rounded-full bg-[var(--primary)] badge-glow block" />
          <div>
            <h2 className="text-base md:text-lg font-bold flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
              <Crown className="w-5 h-5 text-[var(--primary)]" />
              {title || "Premium VIP Selections"}
            </h2>
            <p className="text-xs text-[var(--text-muted)]">{subtitle || "Maximize your winnings with high-confidence professional packages"}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg) => {
          const isFeatured = pkg.isFeatured;
          return (
            <div
              key={pkg.id}
              className={`
                relative p-6 rounded-[var(--radius)] border bg-[var(--card)] backdrop-blur-[var(--backdrop)] transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-[var(--shadow)] hover:border-[var(--primary)]
                ${isFeatured ? 'border-[var(--primary)] ring-1 ring-[var(--primary)] ring-opacity-35' : 'border-[var(--border)]'}
              `}
            >
              {isFeatured && (
                <div className="absolute top-0 right-6 -translate-y-1/2 bg-[var(--primary)] text-white text-[9px] font-extrabold font-mono tracking-widest px-3 py-1 rounded-full uppercase flex items-center gap-1 shadow-md">
                  <Sparkles className="w-3 h-3 text-white animate-spin" /> Most Popular
                </div>
              )}

              <div>
                {/* Title & Desc */}
                <div className="mb-4">
                  <h3 className="text-base font-extrabold mb-1" style={{ fontFamily: 'var(--font-display)' }}>{pkg.name}</h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">{pkg.description}</p>
                </div>

                {/* Price Display */}
                <div className="mb-5 flex items-baseline gap-1">
                  <span className="text-[10px] text-[var(--text-muted)] uppercase font-mono font-bold">KES</span>
                  <span className="text-3xl font-black font-mono text-[var(--primary)] tracking-tight">
                    {pkg.price.toLocaleString()}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">/ {pkg.durationDays} Days</span>
                </div>

                {/* Divider */}
                <div className="h-px bg-[var(--border)] mb-5" />

                {/* Features Checklist */}
                <ul className="space-y-3 mb-6">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-[var(--text)]">
                      <div className="p-0.5 rounded-full bg-emerald-500 bg-opacity-15 text-emerald-700 mt-0.5 flex-shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className="leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              {userPurchasedItemIds.includes(String(pkg.id)) ? (
                <div className="w-full py-3.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 rounded-[var(--radius)] font-mono font-black text-xs text-center flex items-center justify-center gap-1.5 uppercase">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Active Subscription</span>
                </div>
              ) : (
                <button
                  onClick={() => onOpenPayment(pkg.name, pkg.price, pkg.id, pkg.slug, 'vip')}
                  className={`
                    w-full py-3.5 text-xs rounded-[var(--radius)] shadow-sm hover:opacity-95 flex items-center justify-center gap-2 transition-all duration-200 border-none cursor-pointer font-black uppercase tracking-wider
                    ${isFeatured 
                      ? 'bg-emerald-700 hover:bg-emerald-800 text-white' 
                      : 'bg-slate-900 hover:bg-slate-800 dark:bg-emerald-700 dark:hover:bg-emerald-800 text-white'
                    }
                  `}
                >
                  <ShoppingCart className="w-3.5 h-3.5 text-white" />
                  <span>Subscribe via M-Pesa</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
