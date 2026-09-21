import { PREDICTION_CATEGORIES, PredictionCategory, getCategoryCountText } from '../utils/predictionGenerator';
import { getPageUrl } from '../utils/navigation';
import { 
  History, 
  Flame, 
  CalendarRange, 
  ChevronRight,
  ShieldAlert,
  Dribbble,
  Sparkles
} from 'lucide-react';

interface PredictionsSidebarProps {
  activeCategoryId: string;
  onSelectCategory: (id: string) => void;
  fixtures?: any[];
}

export default function PredictionsSidebar({ 
  activeCategoryId, 
  onSelectCategory,
  fixtures
}: PredictionsSidebarProps) {
  
  // Map category IDs to custom Lucide icons for unique aesthetics
  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'category-yesterday':
        return <History className="w-4 h-4 text-slate-500 shrink-0" />;
      case 'category-today':
        return <Flame className="w-4 h-4 text-red-500 shrink-0" />;
      case 'category-tomorrow':
        return <CalendarRange className="w-4 h-4 text-blue-500 shrink-0" />;
      default:
        return <Dribbble className="w-4 h-4 text-indigo-500 shrink-0" />;
    }
  };

  return (
    <div className="w-full bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] shadow-[var(--shadow)] text-left overflow-hidden">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-[var(--border)] bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-700 dark:text-emerald-400 animate-pulse shrink-0" />
          <div className="text-xs font-black uppercase text-[var(--text)] tracking-wider font-mono">
            Predictions Sidebar
          </div>
        </div>
        <span className="text-[9px] font-mono font-black text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
          FREE and SURE
        </span>
      </div>

      {/* Navigation List */}
      <nav className="p-2 space-y-1">
        {PREDICTION_CATEGORIES.map((category) => {
          const isActive = activeCategoryId === category.id;
          const targetUrl = getPageUrl(category.id);
          
          return (
            <a
              key={category.id}
              href={targetUrl}
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                  e.preventDefault();
                  onSelectCategory(category.id);
                }
              }}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-all duration-150 no-underline cursor-pointer group ${
                isActive 
                  ? 'bg-emerald-700 text-white shadow-xs font-black' 
                  : 'bg-transparent text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Category Icon */}
                <div className={`p-1.5 rounded-md transition-colors ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}>
                  <span className="text-sm shrink-0 block line-height-1">{category.icon}</span>
                </div>
                
                <div className="min-w-0">
                  <span className={`text-[11px] block truncate tracking-tight font-black leading-tight ${
                    isActive ? 'text-white' : 'text-slate-850 dark:text-slate-200'
                  }`}>
                    {category.label}
                  </span>
                  <span className={`text-[9px] block font-mono font-bold mt-0.5 ${
                    isActive ? 'text-emerald-100' : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {getCategoryCountText(category.id, fixtures)}
                  </span>
                </div>
              </div>

              <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-150 ${
                isActive ? 'text-white translate-x-0.5' : 'text-slate-400 group-hover:translate-x-0.5'
              }`} />
            </a>
          );
        })}
      </nav>

      {/* Sidebar Footer Advice */}
      <div className="p-3 bg-slate-50/50 dark:bg-slate-900/15 border-t border-[var(--border)] text-[10px] text-[var(--text-muted)] leading-normal">
        <div className="flex gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
          <p>
            Tips updated automatically every hour via Soka King Poisson models. Always play with controlled stakes.
          </p>
        </div>
      </div>
    </div>
  );
}
