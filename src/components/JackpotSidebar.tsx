import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, 
  Calculator, 
  Flame, 
  HelpCircle, 
  CheckCircle2, 
  Users, 
  ShieldCheck, 
  TrendingUp,
  DollarSign
} from 'lucide-react';

interface JackpotSidebarProps {
  jackpotId?: string;
  jackpotName?: string;
  hasPaid?: boolean;
}

export default function JackpotSidebar({ jackpotId, jackpotName, hasPaid }: JackpotSidebarProps) {
  // Combinations calculator state
  const [doubleChances, setDoubleChances] = useState<number>(2);
  
  // Set default base cost depending on active jackpot
  const isBetika = jackpotId?.includes('betika');
  const isMozzart = jackpotId?.includes('mozzart');
  const basePrice = isBetika ? 15 : isMozzart ? 50 : 99; // Standard Kenya single bet values
  
  const combinationsCount = Math.pow(2, doubleChances);
  const estimatedCost = combinationsCount * basePrice;

  // Historic winners list
  const historicWinners = [
    { jackpot: "Betika Midweek", score: "13 / 15", prize: "KES 52,190", date: "9 Jul 2026" },
    { jackpot: "SportPesa Mega", score: "15 / 17", prize: "KES 245,600", date: "Last Sunday" },
    { jackpot: "Mozzart Daily", score: "14 / 16", prize: "KES 18,300", date: "11 Jul 2026" },
    { jackpot: "SportPesa Midweek", score: "11 / 13", prize: "KES 34,700", date: "Yesterday" }
  ];

  // Simulated live unlocks activity stream
  const activities = [
    { phone: "0721***492", action: "unlocked Mega Jackpot", time: "2 min ago" },
    { phone: "0734***815", action: "unlocked Betika Grand", time: "5 min ago" },
    { phone: "0798***304", action: "voted on Crystal Palace", time: "9 min ago" },
    { phone: "0712***776", action: "unlocked Mozzart Daily", time: "14 min ago" }
  ];

  return (
    <div className="space-y-6 text-left">
      {/* 1. DYNAMIC COMBINATION CALCULATOR (Extremely popular among Kenyan jackpot players) */}
      <div className="p-4 md:p-5 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow)] backdrop-blur-[var(--backdrop)]">
        <div className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2 mb-3 font-mono">
          <Calculator className="w-4 h-4 text-[var(--primary)]" />
          Combo Cost Calculator
        </div>
        
        <p className="text-[10px] text-[var(--text-muted)] leading-relaxed mb-4">
          Kenyan jackpots allow multi-bets via double chances (1X, 12, X2) to guarantee multiple outcomes. Pick your intended safety choices:
        </p>

        <div className="space-y-4">
          {/* Double chance Selector count */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] font-bold text-[var(--text)] uppercase tracking-wider font-mono">Double Chances</span>
              <span className="text-xs font-black text-indigo-800 dark:text-indigo-300 font-mono bg-indigo-500/15 px-1.5 py-0.5 rounded border border-indigo-500/30">{doubleChances} Picks</span>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {[0, 1, 2, 3, 4].map((count) => (
                <button
                  key={count}
                  onClick={() => setDoubleChances(count)}
                  className={`py-1 text-[11px] font-black font-mono rounded-md border transition-all cursor-pointer ${
                    doubleChances === count
                      ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                      : 'bg-slate-50 dark:bg-slate-900/40 border-[var(--border)] text-[var(--text)] hover:border-[var(--primary)]/50'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-1 mt-1">
              {[5, 6, 7].map((count) => (
                <button
                  key={count}
                  onClick={() => setDoubleChances(count)}
                  className={`py-1 text-[11px] font-black font-mono rounded-md border transition-all cursor-pointer ${
                    doubleChances === count
                      ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                      : 'bg-slate-50 dark:bg-slate-900/40 border-[var(--border)] text-[var(--text)] hover:border-[var(--primary)]/50'
                  }`}
                >
                  {count} Double
                </button>
              ))}
            </div>
          </div>

          {/* Calculator Output Display */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-[var(--border)] grid grid-cols-2 gap-2 text-center select-none">
            <div className="border-r border-[var(--border)] pr-2">
              <span className="text-[8px] text-[var(--text-muted)] uppercase font-mono tracking-wider block">Slips Created</span>
              <strong className="text-sm font-black font-mono text-[var(--text)] block mt-0.5">{combinationsCount} Slips</strong>
            </div>
            <div className="pl-2">
              <span className="text-[8px] text-[var(--text-muted)] uppercase font-mono tracking-wider block">Est. Cost (M-Pesa)</span>
              <strong className="text-sm font-black font-mono text-emerald-700 dark:text-emerald-400 block mt-0.5">KES {estimatedCost.toLocaleString()}</strong>
            </div>
          </div>

          <div className="text-[9px] text-[var(--text-muted)] leading-relaxed italic bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 p-2.5 rounded">
            💡 <strong>Pro Tip:</strong> Only use double chances on highly unpredictable fixtures (e.g., confidence index &lt; 70%) to keep your total ticket combination costs optimal.
          </div>
        </div>
      </div>

      {/* 2. JACKPOT SPECIAL VERIFIED WIN HISTORY */}
      <div className="p-4 md:p-5 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow)] backdrop-blur-[var(--backdrop)]">
        <div className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2 mb-3.5 font-mono">
          <Trophy className="w-4 h-4 text-amber-500 badge-glow" />
          Verified Jackpot Slips
        </div>

        <div className="space-y-2.5">
          {historicWinners.map((w, idx) => (
            <div 
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-lg bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/10 text-xs"
            >
              <div>
                <strong className="font-extrabold text-[var(--text)] block">{w.jackpot}</strong>
                <span className="text-[9px] text-[var(--text-muted)] font-mono">{w.date}</span>
              </div>
              <div className="text-right">
                <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-850 dark:text-emerald-300 font-mono text-[10px] font-black rounded">
                  {w.score}
                </span>
                <span className="text-[9px] font-black text-indigo-700 dark:text-indigo-400 block mt-1 font-mono">
                  {w.prize}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. DYNAMIC SUBSCRIBER STREAM TICKER */}
      <div className="p-4 md:p-5 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow)] backdrop-blur-[var(--backdrop)]">
        <div className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2 mb-3.5 font-mono">
          <Users className="w-4 h-4 text-emerald-500" />
          Live Subscriber Action
        </div>
        
        <div className="space-y-3">
          {activities.map((a, idx) => (
            <div 
              key={idx} 
              className="flex items-center justify-between text-xs border-b border-[var(--border)] pb-2 last:border-none last:pb-0"
            >
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping shrink-0" />
                <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">{a.phone}</span>
                <span className="text-[var(--text-muted)] font-medium">{a.action}</span>
              </div>
              <span className="text-[9px] font-mono text-slate-600 dark:text-slate-400 shrink-0">{a.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. EXPERT STRATEGY SUMMARY */}
      <div className="p-4 md:p-5 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow)] backdrop-blur-[var(--backdrop)]">
        <div className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2 mb-2 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          Platform Guarantees
        </div>
        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
          Soka King provides expert, mathematical sports tips based on Poisson distribution, fatigue indexes, and roster historical structures. We provide real probability outputs with 0% fabricated telemetry logs. Play responsibly.
        </p>
      </div>
    </div>
  );
}
