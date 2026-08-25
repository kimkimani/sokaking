import { 
  Trophy, 
  Crown, 
  Percent, 
  ShieldCheck, 
  TrendingUp, 
  BookOpen, 
  MessageSquare, 
  Lock, 
  UserCheck, 
  Sparkles,
  Flame,
  LayoutDashboard,
  X,
  History,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { VipPackage } from '../types';
import { getPageUrl } from '../utils/navigation';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  firstVipPackage: VipPackage | null;
  onOpenPayment: (pkgName: string, price: number, id: string | number, slug: string, type: 'vip' | 'jackpot' | 'odds') => void;
  activePage: string;
  onSelectPage: (pageId: string) => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  firstVipPackage,
  onOpenPayment,
  activePage,
  onSelectPage
}: SidebarProps) {
  
  const handleNavClick = (pageId: string) => {
    onClose();
    if (pageId === 'odds-packs') {
      onSelectPage('home');
      requestAnimationFrame(() => {
        const el = document.getElementById('odds-packs');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      });
    } else {
      onSelectPage(pageId);
    }
  };

  const menuItems = [
    { label: "Home Predictions", icon: TrendingUp, id: 'home', color: 'text-amber-500' },
    { label: "Jackpots", icon: Trophy, id: 'jackpot-list', color: 'text-emerald-500' },
    { label: "Odds Packs", icon: Percent, id: 'odds-packs', color: 'text-indigo-400' },
    { label: "Mega JP", icon: Trophy, id: 'sportpesa-mega', color: 'text-amber-400' },
    { label: "Midweek JP", icon: Trophy, id: 'sportpesa-midweek', color: 'text-sky-400' },
    { label: "VIP", icon: Crown, id: 'vip-packages', color: 'text-amber-500' },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/30 dark:bg-black/40 z-40 lg:hidden backdrop-blur-[2px] transition-opacity duration-300"
        />
      )}

      {/* Main Sidebar Wrapper */}
      <aside className={`
        fixed top-0 left-0 h-screen w-[280px] flex-shrink-0 z-50 lg:hidden
        bg-[var(--card)] border-r border-[var(--border)] backdrop-blur-[var(--backdrop)]
        flex flex-col justify-between p-5 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full overflow-y-auto scrollbar-none space-y-6">
          {/* Header & Mobile Close Button */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center text-white font-black text-xs select-none">
                SK
              </div>
              <span 
                className="font-extrabold text-lg tracking-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                SOKA <span className="text-[var(--primary)]">KING</span>
              </span>
            </div>

            <button 
              onClick={onClose}
              aria-label="Close menu drawer"
              className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text)] bg-[var(--background)] border border-[var(--border)] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Items Group */}
          <div>
            <p className="text-[9px] font-mono tracking-wider text-[var(--text-muted)] uppercase font-semibold mb-3 text-left">
              Select Betting Portal
            </p>
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activePage === item.id;
                const targetUrl = getPageUrl(item.id);
                return (
                  <a
                    key={item.id}
                    href={targetUrl}
                    onClick={(e) => {
                      if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                        e.preventDefault();
                        handleNavClick(item.id);
                      }
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-[var(--radius)] flex items-center justify-between text-xs font-extrabold transition-all duration-200 no-underline cursor-pointer ${
                      isActive 
                        ? 'bg-[var(--primary)] text-white shadow-sm' 
                        : 'text-[var(--text)] hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className={`w-4 h-4 ${isActive ? 'text-white' : item.color}`} />
                      <span className={isActive ? 'text-white font-black' : ''}>{item.label}</span>
                    </div>
                    {isActive && (
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    )}
                  </a>
                );
              })}
            </nav>
          </div>

          {/* Trust Indicators Section */}
          <div className="border-t border-[var(--border)] pt-4">
            <p className="text-[9px] font-mono tracking-wider text-[var(--text-muted)] uppercase font-semibold mb-3 text-left">
              Trust & Security
            </p>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 text-xs text-[var(--text-muted)] text-left">
                <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Instant M-Pesa Integration</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-[var(--text-muted)] text-left">
                <UserCheck className="w-4 h-4 text-sky-500 flex-shrink-0" />
                <span>Verified 89% Accuracy Factor</span>
              </div>
            </div>
          </div>


        </div>
      </aside>
    </>
  );
}
