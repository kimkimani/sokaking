import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  BookOpen, 
  ChevronRight, 
  Tag, 
  ShieldCheck, 
  User, 
  FileText, 
  ThumbsUp, 
  ThumbsDown, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2
} from 'lucide-react';
import { ParsedMarkdownPage } from '../content/markdownLoader';
import { calculateArticleWordCount } from '../utils/schemaGenerator';
import { AuthorCard } from './AuthorCard';
import MarkdownRenderer from './MarkdownRenderer';
import { Fixture } from '../types';
import { generatePageJsonLd } from '../utils/schemaGenerator';

interface MarkdownBlogPageProps {
  pageKey: string;
  pageMd: ParsedMarkdownPage;
  onBackToHome: () => void;
  onBackToBlog?: () => void;
  onSelectPage: (pageId: string) => void;
  onOpenPayment?: (pkgName: string, price: number, id: string | number, slug: string, type: 'vip' | 'jackpot' | 'odds') => void;
  fixtures?: Fixture[];
  jackpots?: any[];
}

export const MarkdownBlogPage: React.FC<MarkdownBlogPageProps> = ({
  pageKey,
  pageMd,
  onBackToHome,
  onBackToBlog,
  onSelectPage,
  fixtures = []
}) => {
  const [helpfulVote, setHelpfulVote] = useState<'yes' | 'no' | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Content sources
  const fullBody = pageMd.fullContent || pageMd.meat || '';
  const wordCount = calculateArticleWordCount(fullBody);
  const calculatedReadTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;
  const displayReadTime = pageMd.readingTime || calculatedReadTime;
  const categoryName = pageMd.category || 'Football Strategy & Analysis';

  // Parse FAQs if present in pageMd.faq or body
  const parsedFaqs = useMemo(() => {
    if (!pageMd.faq) return [];
    const blocks = pageMd.faq.split(/(?=###\s+)/g);
    const result: { question: string; answer: string }[] = [];

    for (const block of blocks) {
      const qMatch = block.match(/###\s+(.+)/);
      if (qMatch) {
        const question = qMatch[1].replace(/\*\*|__/g, '').trim();
        const answer = block.replace(/###\s+.+/, '').replace(/<!--\s*FAQ\s*-->/gi, '').trim();
        if (question && answer) {
          result.push({ question, answer });
        }
      }
    }
    return result;
  }, [pageMd.faq]);

  // Dynamic Schema.org JSON-LD Structured Data Injection for Blog Page
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const { fullGraph } = generatePageJsonLd(pageKey);
        const schemaScriptId = 'sokaking-schema-jsonld';
        let schemaScript = document.getElementById(schemaScriptId) as HTMLScriptElement | null;
        if (!schemaScript) {
          schemaScript = document.createElement('script');
          schemaScript.id = schemaScriptId;
          schemaScript.type = 'application/ld+json';
          document.head.appendChild(schemaScript);
        }
        schemaScript.textContent = JSON.stringify(fullGraph, null, 2);
      } catch (e) {
        console.warn('Could not inject BlogPosting schema in MarkdownBlogPage:', e);
      }
    }
  }, [pageKey]);

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 90;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const authorName = pageMd.author?.name || pageMd.authorName || 'John K. Mwangi';
  const authorRole = pageMd.author?.role || pageMd.authorTitle || 'Lead Quantitative Analyst';

  return (
    <article className="min-h-screen pb-16 space-y-6 text-left max-w-4xl mx-auto px-4 sm:px-6">
      {/* Top Navigation & Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-mono overflow-x-auto scrollbar-none">
          <button 
            onClick={onBackToHome}
            className="hover:text-[var(--primary)] transition-colors cursor-pointer bg-transparent border-none p-0 text-[var(--text-muted)] font-mono"
          >
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
          <button 
            onClick={onBackToBlog ? onBackToBlog : () => onSelectPage('blog')}
            className="hover:text-[var(--primary)] transition-colors cursor-pointer bg-transparent border-none p-0 text-[var(--text-muted)] font-mono"
          >
            Blog
          </button>
          <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
          <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">{categoryName}</span>
          <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
          <span className="text-[var(--text)] font-semibold truncate max-w-[180px] sm:max-w-xs">
            {pageMd.title.split('|')[0].trim()}
          </span>
        </nav>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onBackToBlog ? (
            <button
              onClick={onBackToBlog}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--text-muted)] hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer bg-transparent border-none p-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>All Articles</span>
            </button>
          ) : (
            <button
              onClick={onBackToHome}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--text-muted)] hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer bg-transparent border-none p-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
          )}
        </div>
      </div>

      {/* Editorial Header - Purely Content Focused, No Scattered Author Header */}
      <header className="p-6 md:p-10 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-6 relative overflow-hidden">
        {/* Subtle decorative top bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500" />

        {/* Badges & Meta strip */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/20 flex items-center gap-1.5">
            <Tag className="w-3 h-3 text-emerald-500" />
            <span>{categoryName}</span>
          </span>

          <span className="text-[var(--text-muted)] flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" /> {displayReadTime}
          </span>

          <span className="text-[var(--text-muted)] flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-slate-400" /> {wordCount.toLocaleString()} words
          </span>

          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 font-semibold border border-blue-500/20 text-[11px] flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-blue-500" /> Verified Guide
          </span>
        </div>

        {/* Main Title (H1) */}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-[var(--text)] leading-snug m-0">
          {pageMd.displayTitle || pageMd.title.split('|')[0].trim()}
        </h1>

        {/* Lead Deck / Abstract */}
        {pageMd.description && (
          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed m-0 font-normal">
            {pageMd.description}
          </p>
        )}
      </header>

      {/* Featured Cover / Hero Image if provided */}
      {pageMd.coverImage && (
        <div className="rounded-2xl overflow-hidden border border-[var(--border)] shadow-xs max-h-96">
          <img 
            src={pageMd.coverImage} 
            alt={pageMd.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      {/* Main Single-Column Article Body (Clean, Centered, No Side Widgets) */}
      <main className="p-6 md:p-10 lg:p-12 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-6">
        <div className="text-sm sm:text-base leading-relaxed">
          <MarkdownRenderer 
            content={fullBody} 
            postSlug={pageKey} 
            fixtures={fixtures}
          />
        </div>

        {/* Tags strip */}
        {pageMd.tags && pageMd.tags.length > 0 && (
          <div className="pt-6 border-t border-[var(--border)] space-y-2">
            <span className="text-xs font-mono font-bold uppercase text-[var(--text-muted)] flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-emerald-500" /> Topics & Focus Areas:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {pageMd.tags.map((t, idx) => (
                <span 
                  key={idx}
                  className="px-2.5 py-1 rounded-md text-xs font-mono bg-[var(--background)] border border-[var(--border)] text-[var(--text-muted)]"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Interactive FAQ Accordion Section (if available) */}
      {parsedFaqs.length > 0 && (
        <section className="p-6 md:p-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg md:text-xl font-extrabold text-[var(--text)] m-0 font-display">
              {pageMd.faqTitle || 'Frequently Asked Questions'}
            </h2>
          </div>
          <p className="text-xs text-[var(--text-muted)] m-0">
            Direct answers to common questions regarding this betting strategy and mathematical line optimization.
          </p>

          <div className="space-y-3 pt-2">
            {parsedFaqs.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div 
                  key={idx} 
                  className="border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--background)] transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full text-left p-4 flex items-center justify-between gap-3 text-sm font-bold text-[var(--text)] hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer bg-transparent border-none"
                  >
                    <span>{item.question}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed border-t border-[var(--border)]/60">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Helpful Feedback Rating Bar */}
      <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold text-[var(--text)]">
            Did you find this guide helpful?
          </span>
          <p className="text-[11px] text-[var(--text-muted)] m-0">
            Your feedback helps our sports modeling team improve our mathematical jackpot and fixture analysis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {helpfulVote === null ? (
            <>
              <button
                onClick={() => setHelpfulVote('yes')}
                className="px-3.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:border-emerald-500 hover:text-emerald-600 text-xs font-bold text-[var(--text)] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Yes</span>
              </button>
              <button
                onClick={() => setHelpfulVote('no')}
                className="px-3.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:border-rose-500 hover:text-rose-600 text-xs font-bold text-[var(--text)] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                <span>No</span>
              </button>
            </>
          ) : (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Thank you for your feedback!
            </span>
          )}
        </div>
      </div>

      {/* The Single Unified Author Credential Card Below - ONLY rendered if author is specified on markdown */}
      {Boolean(pageMd.author || pageMd.authorId || pageMd.authorName) && (
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-black uppercase text-[var(--text-muted)] flex items-center gap-1.5">
              <User className="w-4 h-4 text-emerald-600" />
              <span>About The Author & Statistical Methodology</span>
            </span>
            <button
              onClick={() => onSelectPage('about')}
              className="text-xs font-mono font-bold text-emerald-600 hover:underline cursor-pointer bg-transparent border-none p-0"
            >
              Editorial Team Standards →
            </button>
          </div>

          <AuthorCard 
            author={pageMd.author}
            authorId={pageMd.authorId}
            name={pageMd.author?.name || pageMd.authorName}
            title={pageMd.author?.role || pageMd.authorTitle}
            description={pageMd.author?.shortBio || pageMd.authorDescription}
            reviewerName={pageMd.author?.reviewerName}
            reviewerTitle={pageMd.author?.reviewerTitle}
            badges={pageMd.author?.badges}
          />
        </section>
      )}

      {/* Responsible Gambling Advisory */}
      <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-xs text-[var(--text-muted)] space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400">
          <ShieldCheck className="w-4 h-4" />
          <span>Responsible Betting Advisory (18+)</span>
        </div>
        <p className="m-0 leading-relaxed">
          {pageMd.responsibleGambling || 'Sports betting involves financial risk and may become addictive. Never bet money you cannot afford to lose. If you need confidential support in Kenya, call the BCLB helpline at 0800-720-000.'}
        </p>
      </div>

      {/* Footer Navigation Buttons */}
      <div className="pt-6 border-t border-[var(--border)] flex items-center justify-between">
        <button
          onClick={onBackToBlog ? onBackToBlog : () => onSelectPage('blog')}
          className="px-5 py-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs font-bold text-[var(--text)] hover:border-emerald-500 transition-all flex items-center gap-2 cursor-pointer shadow-3xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Articles</span>
        </button>

        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="text-xs font-mono font-bold text-[var(--text-muted)] hover:text-emerald-600 cursor-pointer bg-transparent border-none"
        >
          Back to Top ↑
        </button>
      </div>
    </article>
  );
};

export default MarkdownBlogPage;
