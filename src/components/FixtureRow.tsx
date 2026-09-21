import React from 'react';
import { ChevronDown, ChevronUp, Clock, BookOpen, Sparkles } from 'lucide-react';
import { Fixture } from '../types';
import VotePoll from './VotePoll';
import VoteNudgeSnippet from './VoteNudgeSnippet';
import { FlagImage } from '../utils/flagUtils';
import { formatTime } from '../utils/timeUtils';

export interface FixtureRowProps {
  fixture: any;
  isExpanded: boolean;
  toggleExpand: (id: number) => void;
  getStatusColor: (status: any) => string;
  getResultBadge: (fixture: any, showScore?: boolean) => React.ReactNode;
}

export default function FixtureRow({
  fixture,
  isExpanded,
  toggleExpand,
  getStatusColor,
  getResultBadge,
}: FixtureRowProps) {
  const { isCompleted, isWon, isLost, isDoubleChance, displayConf, probs, desktopRowStyle } = fixture;

  return (
    <div 
      key={fixture.id} 
      className={`transition-all duration-300 md:hover:bg-slate-50/50 md:dark:hover:bg-slate-900/10 cursor-pointer bg-transparent ${desktopRowStyle}`}
      onClick={() => toggleExpand(fixture.id)}
    >
      {/* Desktop View (hidden on mobile, visible on md and up) */}
      <div className="hidden md:grid p-3.5 grid-cols-12 items-center gap-2 select-none">
        {/* Left: Kickoff time, Status & Teams with Scoreboard */}
        <div className="flex items-center gap-3 col-span-12 md:col-span-4 min-w-0">
          <div className="flex flex-col items-center justify-center bg-[var(--background)] px-2 py-1 rounded-[var(--radius)] border border-[var(--border)] text-center w-[65px] shrink-0">
            <span className="text-[9px] font-mono font-bold text-slate-700 dark:text-slate-300">
              {formatTime(fixture.kickoffTime)}
            </span>
            <span className={`text-[7px] font-black px-1.5 py-0.5 rounded mt-0.5 uppercase ${getStatusColor(fixture.status)}`}>
              {fixture.status}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 text-[9px] text-[var(--text-muted)] font-bold uppercase font-mono tracking-wider leading-none">
              <FlagImage countryFlag={fixture.countryFlag || (fixture as any).country_flag} flag={fixture.leagueFlag} countryName={fixture.countryName || fixture.leagueCountry || (fixture as any).country_name} />
              <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700 truncate font-semibold">
                {fixture.leagueName || (fixture as any).league_name}
              </span>
              {(fixture.countryName || fixture.leagueCountry || (fixture as any).country_name) && (
                <>
                  <span>•</span>
                  <span className="truncate">{fixture.countryName || fixture.leagueCountry || (fixture as any).country_name}</span>
                </>
              )}
              {fixture.isDoubleChance && (
                <>
                  <span>•</span>
                  <span className="px-1.5 py-0.5 bg-amber-500/15 text-amber-900 dark:text-amber-300 border border-amber-500/30 rounded-[4px] text-[7.5px] tracking-normal lowercase shrink-0 font-sans leading-none font-bold">double chance</span>
                </>
              )}
              {fixture.is3PlusGoals && (
                <>
                  <span>•</span>
                  <span className="px-1.5 py-0.5 bg-indigo-500/15 text-indigo-900 dark:text-indigo-300 border border-indigo-500/30 rounded-[4px] text-[7.5px] tracking-normal shrink-0 font-sans leading-none font-bold">3+ Goals</span>
                </>
              )}
              {fixture.is2PlusGoals && (
                <>
                  <span>•</span>
                  <span className="px-1.5 py-0.5 bg-emerald-500/15 text-emerald-900 dark:text-emerald-300 border border-emerald-500/30 rounded-[4px] text-[7.5px] tracking-normal shrink-0 font-sans leading-none font-bold">2+ Goals</span>
                </>
              )}
            </div>
            
            <div className="text-xs font-bold mt-1.5 tracking-tight flex items-center gap-1.5 truncate">
              <span className="text-[var(--text)] truncate">{fixture.homeTeam}</span>
              <span className="text-[10px] text-slate-600 dark:text-slate-400 font-bold shrink-0 mx-1">vs</span>
              <span className="text-[var(--text)] truncate">{fixture.awayTeam}</span>
            </div>
          </div>
        </div>

        {/* Prediction Pill */}
        <div className="col-span-12 md:col-span-3 flex flex-col items-center justify-center">
          <span className={`text-[11px] md:text-xs font-bold font-mono border px-2.5 py-1 rounded-md shadow-2xs flex items-center justify-center gap-1 transition-all ${
            isCompleted 
              ? isWon
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-350 border-emerald-500/40 font-bold shadow-emerald-500/10'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-750 line-through opacity-70'
              : 'bg-sky-50 dark:bg-sky-950/30 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800/60'
          }`}>
            <span className="font-bold tracking-tight">{fixture.prediction}</span>
            {(isWon || (isCompleted && fixture.result === 'won')) && (
              <span className="inline-flex items-center justify-center bg-emerald-500 text-white font-black rounded-full w-3.5 h-3.5 text-[9px] ml-0.5 shadow-2xs">✓</span>
            )}
          </span>
        </div>

        {/* Confidence Rating */}
        <div className="col-span-12 md:col-span-1 flex flex-col items-center justify-center">
          <span className="text-xs font-black text-[var(--text)] font-mono">{displayConf}%</span>
        </div>

        {/* Results column */}
        <div className="col-span-12 md:col-span-2 flex items-center justify-center gap-2">
          {getResultBadge(fixture)}
        </div>

        {/* READ ANALYSIS ACTION BUTTON (DESKTOP) */}
        <div className="col-span-12 md:col-span-2 flex items-center justify-end pr-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(fixture.id);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase font-mono transition-all duration-200 cursor-pointer shadow-3xs ${
              isExpanded 
                ? 'bg-emerald-700 text-white border-emerald-700'
                : isCompleted
                  ? isWon
                    ? 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/35 text-emerald-850 dark:text-emerald-300 font-black'
                    : 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-black'
                  : 'bg-white dark:bg-slate-850 border-[var(--border)] hover:border-indigo-500/40 hover:bg-indigo-500/[0.06] text-slate-900 dark:text-slate-100 hover:text-indigo-800 dark:hover:text-indigo-300 font-black'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span>Read Analysis</span>
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Mobile View (visible on mobile, hidden on md and up) */}
      <div className={`md:hidden p-3 rounded-xl border transition-all duration-200 space-y-2.5 select-none text-left ${
        fixture.status === 'LIVE' 
          ? 'border-red-500 bg-red-500/[0.01] ring-1 ring-red-500/10' 
          : isCompleted
            ? isWon
              ? 'border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.03] to-transparent'
              : 'border-slate-200 dark:border-slate-800/80 bg-slate-500/[0.005] opacity-90'
            : 'border-slate-200/80 dark:border-slate-800/60 bg-white dark:bg-slate-900 shadow-3xs'
      }`}>
        
        {/* Top line: Country Flag, League, Time, Status and Outcome */}
        <div className="flex items-center justify-between gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-1.5">
          <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
            <FlagImage countryFlag={fixture.countryFlag || (fixture as any).country_flag} flag={fixture.leagueFlag} countryName={fixture.countryName || fixture.leagueCountry || (fixture as any).country_name} />
            <span className="font-mono text-[9px] font-bold text-slate-750 dark:text-slate-200 uppercase tracking-wider truncate px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              {fixture.leagueName || (fixture as any).league_name}
            </span>
            {fixture.isDoubleChance && (
              <span className="px-1.5 py-0.5 bg-amber-500/15 text-amber-900 dark:text-amber-300 border border-amber-500/30 rounded text-[7.5px] tracking-normal lowercase shrink-0 font-sans leading-none font-bold">
                double chance
              </span>
            )}
            {fixture.is3PlusGoals && (
              <span className="px-1.5 py-0.5 bg-indigo-500/15 text-indigo-900 dark:text-indigo-300 border border-indigo-500/30 rounded text-[7.5px] tracking-normal shrink-0 font-sans leading-none font-bold">
                3+ Goals
              </span>
            )}
            {fixture.is2PlusGoals && (
              <span className="px-1.5 py-0.5 bg-emerald-500/15 text-emerald-900 dark:text-emerald-300 border border-emerald-500/30 rounded text-[7.5px] tracking-normal shrink-0 font-sans leading-none font-bold">
                2+ Goals
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Time Pill */}
            {!isCompleted && (
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold text-slate-800 dark:text-slate-200">
                <Clock className="w-2.5 h-2.5 text-slate-600 dark:text-slate-400" />
                <span>{formatTime(fixture.kickoffTime)}</span>
              </div>
            )}

            {/* Status Badge */}
            <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase ${getStatusColor(fixture.status)}`}>
              {fixture.status}
            </span>
          </div>
        </div>

        {/* Teams Section: Home Team on Top, Away Team Below */}
        <div className="space-y-1.5">
          {/* Home Team */}
          <div className="flex items-center justify-between gap-2 bg-slate-50/50 dark:bg-slate-950/40 px-2 py-1 rounded-lg border border-slate-100/40 dark:border-slate-850">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`font-black text-xs truncate tracking-tight ${
                isCompleted
                  ? isWon
                    ? 'text-slate-900 dark:text-slate-100 font-extrabold'
                    : 'text-slate-500 dark:text-slate-400 line-through opacity-80'
                  : 'text-slate-900 dark:text-slate-100'
              }`}>
                {fixture.homeTeam}
              </span>
            </div>
            
            {/* Home Score or Dash */}
            {fixture.status === 'NS' && (fixture.homeScore === undefined || fixture.homeScore === null || fixture.homeScore === '-' || fixture.homeScore === '') ? (
              <span className="text-slate-300 dark:text-slate-700 font-mono font-bold text-xs pr-1.5">-</span>
            ) : (
              <div className={`w-6 h-6 flex items-center justify-center border rounded-md text-xs font-mono font-black ${
                isCompleted
                  ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-150 dark:border-slate-700 text-slate-850 dark:text-slate-200'
              }`}>
                {fixture.homeScore}
              </div>
            )}
          </div>

          {/* Away Team */}
          <div className="flex items-center justify-between gap-2 bg-slate-50/50 dark:bg-slate-950/40 px-2 py-1 rounded-lg border border-slate-100/40 dark:border-slate-850">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`font-black text-xs truncate tracking-tight ${
                isCompleted
                  ? isWon
                    ? 'text-slate-900 dark:text-slate-100 font-extrabold'
                    : 'text-slate-500 dark:text-slate-400 line-through opacity-80'
                  : 'text-slate-900 dark:text-slate-100'
              }`}>
                {fixture.awayTeam}
              </span>
            </div>
            
            {/* Away Score or Dash */}
            {fixture.status === 'NS' && (fixture.awayScore === undefined || fixture.awayScore === null || fixture.awayScore === '-' || fixture.awayScore === '') ? (
              <span className="text-slate-300 dark:text-slate-700 font-mono font-bold text-xs pr-1.5">-</span>
            ) : (
              <div className={`w-6 h-6 flex items-center justify-center border rounded-md text-xs font-mono font-black ${
                isCompleted
                  ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-150 dark:border-slate-700 text-slate-850 dark:text-slate-200'
              }`}>
                {fixture.awayScore}
              </div>
            )}
          </div>
        </div>

        {/* Community Fan Poll Card (Mobile) */}
        <div className="pt-0.5">
          <VoteNudgeSnippet 
            fixtureId={fixture.id} 
            prediction={fixture.prediction} 
            homeTeam={fixture.homeTeam}
            awayTeam={fixture.awayTeam}
            status={fixture.status} 
            result={fixture.result} 
            isEnded={isCompleted} 
            onExpand={() => toggleExpand(fixture.id)}
            variant="card"
          />
        </div>

        {/* ACTION/TIP BOTTOM BAR & READ ANALYSIS TRIGGER (MOBILE) */}
        <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
          isCompleted
            ? 'bg-slate-100/70 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800 text-slate-400'
            : 'bg-indigo-500/[0.06] dark:bg-indigo-500/12 border-indigo-500/20 dark:border-indigo-500/25'
        }`}>
          <div className="min-w-0 flex-1 flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] uppercase font-mono font-black text-slate-800 dark:text-slate-200 shrink-0">TIP:</span>
            <span className={`text-[11px] sm:text-xs font-mono font-bold tracking-tight flex items-center gap-1 px-2 py-0.5 rounded-md border ${
              isCompleted
                ? 'bg-slate-200/60 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 border-slate-300/60 dark:border-slate-700'
                : 'bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-950 dark:text-indigo-100 border-indigo-500/30'
            }`}>
              <span className="font-bold tracking-tight">{fixture.prediction}</span>
              {(isWon || (isCompleted && fixture.result === 'won')) && (
                <span className="inline-flex items-center justify-center bg-emerald-600 text-white font-black rounded-full w-3.5 h-3.5 text-[8px] ml-0.5 shrink-0">✓</span>
              )}
            </span>
          </div>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(fixture.id);
            }}
            className={`active:scale-95 text-white font-black text-[10px] uppercase px-3.5 py-2.5 rounded-lg flex items-center gap-1.5 transition-all border-none shrink-0 cursor-pointer shadow-xs ${
              isCompleted
                ? 'bg-slate-700 hover:bg-slate-800'
                : 'bg-indigo-700 hover:bg-indigo-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-white" />
            <span>Read Analysis</span>
          </button>
        </div>
      </div>

      {/* Expanding Analyst Assessment (Free Predictions) */}
      <div 
        className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out bg-slate-50/50 dark:bg-slate-900/10 border-t border-[var(--border)] overflow-hidden ${
          isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 border-t-0'
        }`}
        onClick={(e) => e.stopPropagation()} // Prevent double trigger
      >
        <div className="overflow-hidden">
          {isExpanded && (
            <div className="p-4 text-xs space-y-3 leading-relaxed text-left">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1 text-indigo-700 dark:text-indigo-400 font-mono uppercase tracking-wider text-[10px]">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-700 dark:text-indigo-400 animate-pulse" /> Live Expert Evaluation
                </span>
                <span className="text-[10px] font-mono text-[var(--text-muted)] bg-[var(--background)] px-2 py-0.5 rounded border border-[var(--border)]">
                  Confidence factor: <strong className="text-sky-700 dark:text-sky-400 font-black">{displayConf}%</strong>
                </span>
              </div>
              <p className="text-[var(--text-muted)] leading-relaxed font-sans">
                {fixture.aiAnalysis || "Advanced computer equations favor selected outcomes based on high offensive conversion metrics and defensive low-block performance factors. Current dynamic odds trend heavily towards recommendations."}
              </p>

              {/* Probability Split bar */}
              <div className="pt-1 pb-1">
                <div className="flex justify-between text-[9px] font-mono font-black mb-1 uppercase">
                  <span className="text-emerald-700 dark:text-emerald-400">Home: {probs.home}%</span>
                  <span className="text-amber-800 dark:text-amber-400">Draw: {probs.draw}%</span>
                  <span className="text-sky-700 dark:text-sky-400">Away: {probs.away}%</span>
                </div>
                <div className="w-full h-1.5 bg-[var(--border)] rounded-full overflow-hidden flex">
                  <div className="h-full bg-emerald-500" style={{ width: `${probs.home}%` }} />
                  <div className="h-full bg-amber-500" style={{ width: `${probs.draw}%` }} />
                  <div className="h-full bg-sky-500" style={{ width: `${probs.away}%` }} />
                </div>
              </div>

              {/* Community Verdict Poll */}
              <div className="pt-1.5">
                <VotePoll 
                  fixtureId={fixture.id} 
                  homeTeam={fixture.homeTeam}
                  awayTeam={fixture.awayTeam}
                  isEnded={isCompleted} 
                  status={fixture.status} 
                  result={fixture.result} 
                  prediction={fixture.prediction}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
