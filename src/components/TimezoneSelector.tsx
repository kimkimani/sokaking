import { useState, useEffect, useRef } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { SUPPORTED_TIMEZONES, getActiveTimezone, setActiveTimezone } from '../utils/timeUtils';

export default function TimezoneSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTz, setActiveTz] = useState(getActiveTimezone());
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleTzChange = () => {
      setActiveTz(getActiveTimezone());
    };
    window.addEventListener('timezone-changed', handleTzChange);
    return () => window.removeEventListener('timezone-changed', handleTzChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentZone = SUPPORTED_TIMEZONES.find(t => t.id === activeTz) || SUPPORTED_TIMEZONES[0];

  const handleSelect = (id: string) => {
    setActiveTimezone(id);
    setActiveTz(id);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 border border-[var(--border)] text-[10px] font-mono font-bold text-[var(--text)] transition-colors cursor-pointer select-none"
        title="Match Kickoff Timezone Settings"
      >
        <span>{currentZone.flag}</span>
        <span>{currentZone.shortLabel} ({currentZone.offset})</span>
        <ChevronDown className={`w-3 h-3 text-[var(--text-muted)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-60 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-xl p-1.5 z-50 animate-fadeIn text-left backdrop-blur-md">
          <div className="px-2.5 py-1.5 border-b border-[var(--border)] mb-1 flex items-center justify-between">
            <span className="text-[10px] font-mono font-black uppercase text-[var(--text-muted)] flex items-center gap-1">
              <Globe className="w-3 h-3 text-[var(--primary)]" /> Kickoff Timezone
            </span>
            <span className="text-[9px] font-mono text-emerald-500 font-bold">24H EAT</span>
          </div>

          <div className="space-y-0.5 max-h-64 overflow-y-auto">
            {SUPPORTED_TIMEZONES.map((tz) => {
              const isSelected = activeTz === tz.id;
              return (
                <button
                  key={tz.id}
                  onClick={() => handleSelect(tz.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors text-left cursor-pointer ${
                    isSelected 
                      ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-bold' 
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text)]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{tz.flag}</span>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-sans font-medium text-[var(--text)] leading-tight">{tz.label}</span>
                      <span className="text-[9px] text-[var(--text-muted)]">{tz.shortLabel}</span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />}
                </button>
              );
            })}
          </div>
          <div className="p-1.5 mt-1 border-t border-[var(--border)] bg-slate-50 dark:bg-slate-900/30 rounded-md">
            <p className="text-[8px] text-[var(--text-muted)] leading-tight">
              UTC kickoff times (e.g. 19:30 UTC) are automatically converted to 22:30 EAT for Kenya bettors.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
