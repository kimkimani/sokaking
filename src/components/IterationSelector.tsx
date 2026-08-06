import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, CheckCircle2, ChevronRight, Layout, Info } from 'lucide-react';
import { designIterations } from '../data';
import { DesignIteration } from '../types';

interface IterationSelectorProps {
  currentIteration: DesignIteration;
  onSelectIteration: (iteration: DesignIteration) => void;
}

export default function IterationSelector({
  currentIteration,
  onSelectIteration
}: IterationSelectorProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="w-full border-b border-[var(--border)] bg-[var(--card)] backdrop-blur-[var(--backdrop)] px-4 py-3 sticky top-0 z-50 transition-all duration-300 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left column: Brand header & controller info */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[var(--primary)] text-white bg-opacity-20 flex items-center justify-center">
            <Layout className="w-5 h-5 text-[var(--primary)]" />
          </div>
          <div>
            <h1 
              className="text-lg font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Soka King <span className="text-[var(--primary)]">Design Studio</span>
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              Choose an iteration to preview different UI results in real-time
            </p>
          </div>
        </div>

        {/* Middle column: Visual buttons to toggle iterations */}
        <div className="flex flex-wrap gap-2 items-center">
          {designIterations.map((iter) => {
            const isActive = iter.id === currentIteration.id;
            return (
              <button
                key={iter.id}
                id={`iter-btn-${iter.id}`}
                onClick={() => onSelectIteration(iter)}
                className={`relative px-3.5 py-2 text-xs font-bold rounded-[var(--radius)] transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[var(--primary)] text-white shadow-md'
                    : 'bg-transparent border border-[var(--border)] hover:bg-[var(--border)] text-[var(--text)]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute inset-0 bg-[var(--primary)] rounded-[var(--radius)] -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="opacity-80 text-[10px] uppercase font-mono tracking-widest">{iter.version}</span>
                <span style={{ fontFamily: 'var(--font-sans)' }}>{iter.name.split(' ').slice(1).join(' ')}</span>
              </button>
            );
          })}
        </div>

        {/* Right column: Details drawer toggler */}
        <div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 text-xs text-[var(--primary)] font-semibold hover:underline cursor-pointer bg-transparent border-none py-1 px-2 rounded"
          >
            <Info className="w-4 h-4" />
            {isOpen ? 'Hide Specs' : 'View Specs'}
          </button>
        </div>
      </div>

      {/* Expanded specifications section details what changed */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden max-w-7xl mx-auto"
          >
            <div className="mt-4 pt-3 border-t border-[var(--border)] grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Iteration Summary */}
              <div className="p-3 rounded-[var(--radius)] bg-white bg-opacity-5 border border-[var(--border)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-mono tracking-wider text-[var(--primary)] font-bold uppercase">
                      {currentIteration.version} Specs
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-[var(--primary)] animate-pulse" />
                  </div>
                  <h3 className="font-bold text-sm mb-1">{currentIteration.name}</h3>
                  <p className="text-[var(--text-muted)] leading-relaxed">
                    {currentIteration.description}
                  </p>
                </div>
                <div className="mt-3 text-[10px] text-[var(--text-muted)] font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-[var(--secondary)]" />
                  Selected Design ready for production export
                </div>
              </div>

              {/* Specific iteration design log */}
              <div className="p-3 rounded-[var(--radius)] bg-white bg-opacity-5 border border-[var(--border)] md:col-span-2">
                <span className="text-[10px] font-mono tracking-wider text-[var(--primary)] font-bold uppercase block mb-2">
                  What is Reimagined Here?
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentIteration.notes.map((note, index) => (
                    <div key={index} className="flex items-start gap-2 text-[var(--text)]">
                      <ChevronRight className="w-4 h-4 text-[var(--primary)] flex-shrink-0 mt-0.5" />
                      <span className="leading-tight">{note}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
