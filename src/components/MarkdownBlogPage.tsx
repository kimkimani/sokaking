import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Share2, 
  Check, 
  BookOpen, 
  ChevronRight, 
  Tag, 
  ShieldCheck, 
  Twitter, 
  MessageCircle, 
  User, 
  Sparkles, 
  FileText, 
  ThumbsUp, 
  ThumbsDown, 
  ListOrdered, 
  TrendingUp, 
  ChevronDown, 
  ChevronUp, 
  Crown,
  CheckCircle2,
  ArrowUpRight,
  Bookmark
} from 'lucide-react';
import { ParsedMarkdownPage, buildCanonicalUrl } from '../content/markdownLoader';
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

interface TocItem {
  id: string;
  title: string;
  level: number;
}

export const MarkdownBlogPage: React.FC<MarkdownBlogPageProps> = ({
  pageKey,
  pageMd,
  onBackToHome,
  onBackToBlog,
  onSelectPage,
  onOpenPayment,
  fixtures = [],
  jackpots = []
}) => {
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [helpfulVote, setHelpfulVote] = useState<'yes' | 'no' | null>(null);
  const [tocOpen, setTocOpen] = useState(true);
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [fontSizeOffset, setFontSizeOffset] = useState<number>(0); // -1, 0, 1
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Content sources
  const fullBody = pageMd.fullContent || pageMd.meat || '';
  const wordCount = calculateArticleWordCount(fullBody);
  const calculatedReadTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;
  const displayReadTime = pageMd.readingTime || calculatedReadTime;
  const categoryName = pageMd.category || 'Football Strategy & Analysis';

  // Format date
  const displayDate = useMemo(() => {
    const raw = pageMd.dateModified || pageMd.datePublished || '2026-08-17';
    try {
      const d = new Date(raw);
      if (isNaN(d.getTime())) return raw;
      return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return raw;
    }
  }, [pageMd.dateModified, pageMd.datePublished]);

  // Extract Table of Contents from headings
  const tocItems: TocItem[] = useMemo(() => {
    const items: TocItem[] = [];
    const lines = fullBody.split('\n');
    let idx = 0;

    for (const line of lines) {
      const h2Match = line.match(/^##\s+([^#\r\n]+)/);
      const h3Match = line.match(/^###\s+([^#\r\n]+)/);

      if (h2Match) {
        const title = h2Match[1].replace(/\*\*|__/g, '').trim();
        const id = `heading-${idx}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
        items.push({ id, title, level: 2 });
        idx++;
      } else if (h3Match) {
        const title = h3Match[1].replace(/\*\*|__/g, '').trim();
        const id = `heading-${idx}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
        items.push({ id, title, level: 3 });
        idx++;
      }
    }
    return items;
  }, [fullBody]);

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

  // Extract 3-4 Key Takeaways for the Executive Summary Callout
  const keyHighlights = useMemo(() => {
    const listMatches = fullBody.match(/^\s*[-*]\s+([^\r\n]+)/gm);
    if (listMatches && listMatches.length >= 3) {
      return listMatches.slice(0, 4).map(item => item.replace(/^\s*[-*]\s+/, '').replace(/\*\*|__/g, '').trim());
    }
    // Fallback based on description or intro
    if (pageMd.description) {
      return [
        `Systematic betting approach with data-backed statistical rigor.`,
        pageMd.description,
        `Bankroll discipline and value-orientated staking models.`
      ];
    }
    return [
      `Data-driven betting models prioritizing long-term expected value (+EV).`,
      `Risk management fundamentals and statistical variance mitigation.`,
      `Verified tactical insights designed for Kenyan and African punters.`
    ];
  }, [fullBody, pageMd.description]);

  // Reading progress tracker and scroll spy
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)));
      }

      // Check headings for scroll spy
      if (tocItems.length > 0) {
        for (let i = tocItems.length - 1; i >= 0; i--) {
          const el = document.getElementById(tocItems[i].id);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= 120) {
              setActiveHeadingId(tocItems[i].id);
              break;
            }
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [tocItems]);

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

  // Social sharing handlers
  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const url = window.location.href;
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      });
    }
  };

  const handleShareTwitter = () => {
    if (typeof window !== 'undefined') {
      const text = encodeURIComponent(`Read "${pageMd.title}" on Soka King:`);
      const url = encodeURIComponent(window.location.href);
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener,noreferrer');
    }
  };

  const handleShareWhatsApp = () => {
    if (typeof window !== 'undefined') {
      const text = encodeURIComponent(`Check out this guide: "${pageMd.title}" - ${window.location.href}`);
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank', 'noopener,noreferrer');
    }
  };

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
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
  const authorInitials = authorName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  // Top confidence fixtures for the sidebar widget
  const topPicks = useMemo(() => {
    if (!fixtures || fixtures.length === 0) return [];
    return fixtures.slice(0, 4);
  }, [fixtures]);

  return (
    <article className="min-h-screen pb-16 space-y-6 text-left">
      {/* Top Reading Progress Bar */}
      <div 
        aria-hidden="true" 
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500 z-50 transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

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
          <span className="text-[var(--primary)] font-bold shrink-0">{categoryName}</span>
          <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
          <span className="text-[var(--text)] font-semibold truncate max-w-[180px] sm:max-w-xs">
            {pageMd.title.split('|')[0].trim()}
          </span>
        </nav>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onBackToBlog ? (
            <button
              onClick={onBackToBlog}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors cursor-pointer bg-transparent border-none p-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>All Articles</span>
            </button>
          ) : (
            <button
              onClick={onBackToHome}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors cursor-pointer bg-transparent border-none p-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
          )}
        </div>
      </div>

      {/* Editorial Hero Header Banner */}
      <header className="p-6 md:p-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-5 relative overflow-hidden">
        {/* Subtle decorative top bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/80 via-teal-500/80 to-amber-500/80" />

        {/* Badges & Meta strip */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/20 flex items-center gap-1.5">
            <Tag className="w-3 h-3 text-emerald-500" />
            <span>{categoryName}</span>
          </span>

          <span className="text-[var(--text-muted)] flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" /> {displayDate}
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
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--text)] leading-tight m-0 font-display">
          {pageMd.displayTitle || pageMd.title.split('|')[0].trim()}
        </h1>

        {/* Lead Subtitle */}
        {pageMd.description && (
          <div className="text-base sm:text-lg text-[var(--text-muted)] leading-relaxed m-0 border-l-4 border-emerald-500 pl-4 py-1 bg-emerald-500/5 rounded-r-lg">
            {pageMd.description}
          </div>
        )}

        {/* Author Byline & Social Actions Bar */}
        <div className="pt-4 border-t border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Author info pill */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-mono font-black text-sm flex items-center justify-center border-2 border-emerald-500/30 shrink-0 shadow-xs">
              {authorInitials}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-[var(--text)]">
                  {authorName}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold">
                  Verified Analyst
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] m-0 font-mono">
                {authorRole}
              </p>
            </div>
          </div>

          {/* Social share & reading adjustment toolbar */}
          <div className="flex items-center gap-2">
            {/* Font size adjustment */}
            <div className="flex items-center border border-[var(--border)] rounded-lg bg-[var(--background)] px-1 py-0.5 text-xs font-mono">
              <button 
                onClick={() => setFontSizeOffset(prev => Math.max(-1, prev - 1))}
                title="Decrease font size"
                className={`px-1.5 py-0.5 rounded ${fontSizeOffset === -1 ? 'font-black text-[var(--primary)]' : 'text-[var(--text-muted)]'} hover:text-[var(--text)] cursor-pointer`}
              >
                A-
              </button>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <button 
                onClick={() => setFontSizeOffset(0)}
                title="Default font size"
                className={`px-1.5 py-0.5 rounded ${fontSizeOffset === 0 ? 'font-black text-[var(--primary)]' : 'text-[var(--text-muted)]'} hover:text-[var(--text)] cursor-pointer`}
              >
                A
              </button>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <button 
                onClick={() => setFontSizeOffset(prev => Math.min(1, prev + 1))}
                title="Increase font size"
                className={`px-1.5 py-0.5 rounded ${fontSizeOffset === 1 ? 'font-black text-[var(--primary)]' : 'text-[var(--text-muted)]'} hover:text-[var(--text)] cursor-pointer`}
              >
                A+
              </button>
            </div>

            {/* Bookmark button */}
            <button
              onClick={() => setBookmarked(!bookmarked)}
              title={bookmarked ? 'Saved to bookmarks' : 'Bookmark this article'}
              className={`p-2 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${bookmarked ? 'text-amber-500 border-amber-500/40 bg-amber-500/10' : 'text-[var(--text-muted)]'}`}
              aria-label="Bookmark article"
            >
              <Bookmark className="w-4 h-4" />
            </button>

            {/* Share link button */}
            <button
              onClick={handleCopyLink}
              title="Copy link to article"
              className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text)] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Share'}</span>
            </button>

            {/* X / Twitter */}
            <button
              onClick={handleShareTwitter}
              title="Share on X / Twitter"
              className="p-2 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:bg-slate-100 dark:hover:bg-slate-800 text-sky-500 transition-colors cursor-pointer"
              aria-label="Share on X / Twitter"
            >
              <Twitter className="w-4 h-4" />
            </button>

            {/* WhatsApp */}
            <button
              onClick={handleShareWhatsApp}
              title="Share on WhatsApp"
              className="p-2 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:bg-slate-100 dark:hover:bg-slate-800 text-emerald-500 transition-colors cursor-pointer"
              aria-label="Share on WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
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

      {/* Executive Summary / Key Takeaways Callout Box */}
      {keyHighlights.length > 0 && (
        <section className="p-5 md:p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Key Takeaways & Executive Summary</span>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 m-0 p-0 list-none text-xs sm:text-sm text-[var(--text)]">
            {keyHighlights.map((highlight, i) => (
              <li key={i} className="flex items-start gap-2 bg-[var(--card)] p-2.5 rounded-lg border border-[var(--border)]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{highlight}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 2-Column Editorial Grid: Main Content + Sticky Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Article Column (8 cols on desktop) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Mobile In-Body Table of Contents */}
          {tocItems.length > 2 && (
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] lg:hidden">
              <button
                onClick={() => setTocOpen(!tocOpen)}
                className="w-full flex items-center justify-between text-xs font-bold font-mono text-[var(--text)] cursor-pointer bg-transparent border-none p-0"
              >
                <span className="flex items-center gap-2">
                  <ListOrdered className="w-4 h-4 text-emerald-500" />
                  Table of Contents ({tocItems.length} sections)
                </span>
                {tocOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {tocOpen && (
                <ul className="mt-3 pt-3 border-t border-[var(--border)] space-y-1.5 list-none p-0 text-xs">
                  {tocItems.map((item, idx) => (
                    <li 
                      key={idx} 
                      className={item.level === 3 ? 'pl-4' : 'pl-0'}
                    >
                      <button
                        onClick={() => scrollToHeading(item.id)}
                        className="text-left text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors cursor-pointer bg-transparent border-none p-0 leading-relaxed truncate max-w-full block"
                      >
                        {item.title}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Core Markdown Body */}
          <main className="p-6 md:p-10 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-6">
            <div 
              className={
                fontSizeOffset === 1 
                  ? 'text-base md:text-lg leading-relaxed' 
                  : fontSizeOffset === -1 
                    ? 'text-xs md:text-sm leading-relaxed' 
                    : 'text-sm md:text-base leading-relaxed'
              }
            >
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
                Direct answers to common questions regarding this betting strategy and tactical analysis.
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
                        className="w-full text-left p-4 flex items-center justify-between gap-3 text-sm font-bold text-[var(--text)] hover:text-[var(--primary)] transition-colors cursor-pointer bg-transparent border-none"
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

          {/* Helpful Feedback Rating & Share Footer */}
          <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[var(--text)]">
                Did you find this guide helpful?
              </span>
              <p className="text-[11px] text-[var(--text-muted)] m-0">
                Your feedback helps our quantitative editorial team improve our football models.
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

          {/* Author Credential Bio Box */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-black uppercase text-[var(--text-muted)] flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-600" />
                <span>About The Author</span>
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
              authorId={pageMd.authorId || 'john-mwangi'}
              name={authorName}
              title={authorRole}
              description={pageMd.author?.shortBio || 'Lead quantitative football analyst with over 12 years analyzing African and European leagues, Poisson distributions, and sportpesa mega jackpot combination probabilities.'}
              reviewerName={pageMd.author?.reviewerName}
              reviewerTitle={pageMd.author?.reviewerTitle}
              badges={pageMd.author?.badges}
            />
          </section>

          {/* Responsible Gambling Notice */}
          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-xs text-[var(--text-muted)] space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Responsible Betting Advisory (18+)</span>
            </div>
            <p className="m-0 leading-relaxed">
              {pageMd.responsibleGambling || 'Sports betting involves financial risk and may become addictive. Never bet money you cannot afford to lose. If you need confidential support in Kenya, call the BCLB helpline at 0800-720-000.'}
            </p>
          </div>
        </div>

        {/* Right Sticky Sidebar (4 cols on desktop) */}
        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
          {/* Desktop Sticky Table of Contents */}
          {tocItems.length > 0 && (
            <div className="hidden lg:block p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold font-mono text-[var(--text)] uppercase tracking-wider">
                <ListOrdered className="w-4 h-4 text-emerald-500" />
                <span>On This Page</span>
              </div>
              <nav aria-label="Table of contents" className="space-y-1 text-xs">
                {tocItems.map((item, idx) => {
                  const isActive = activeHeadingId === item.id;
                  return (
                    <button
                      key={idx}
                      onClick={() => scrollToHeading(item.id)}
                      className={`w-full text-left py-1.5 px-2 rounded-md transition-all cursor-pointer bg-transparent border-none block truncate ${
                        item.level === 3 ? 'pl-5 text-[11px]' : 'font-semibold'
                      } ${
                        isActive 
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold border-l-2 border-emerald-500' 
                          : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      {item.title}
                    </button>
                  );
                })}
              </nav>
            </div>
          )}

          {/* Today's Top Confidence Picks Mini-Widget */}
          {topPicks.length > 0 && (
            <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold font-mono text-[var(--text)] uppercase tracking-wider">
                    Today's Value Tips
                  </span>
                </div>
                <button
                  onClick={() => onSelectPage('today')}
                  className="text-[11px] font-mono font-bold text-emerald-600 hover:underline cursor-pointer bg-transparent border-none p-0 flex items-center gap-0.5"
                >
                  <span>All</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2">
                {topPicks.map((fix) => (
                  <div 
                    key={fix.id} 
                    className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] space-y-1 hover:border-emerald-500/40 transition-colors"
                  >
                    <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] font-mono">
                      <span className="truncate max-w-[120px]">{fix.leagueName}</span>
                      <span>{fix.time || fix.kickoffTime}</span>
                    </div>
                    <div className="text-xs font-bold text-[var(--text)] truncate">
                      {fix.homeTeam} vs {fix.awayTeam}
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold font-mono border border-emerald-500/20">
                        Tip: {fix.prediction}
                      </span>
                      {fix.confidence && (
                        <span className="text-[11px] font-mono text-[var(--text-muted)] font-semibold">
                          {fix.confidence}% Conf.
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIP Pass / Pro Jackpot Combinations CTA */}
          <div className="p-5 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent shadow-xs space-y-3 relative overflow-hidden">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs uppercase tracking-wider font-mono">
              <Crown className="w-4 h-4 text-amber-500" />
              <span>Soka King VIP Access</span>
            </div>

            <h3 className="text-base font-extrabold text-[var(--text)] m-0 leading-snug">
              Unlock 17/17 Pro Jackpot Combinations
            </h3>

            <p className="text-xs text-[var(--text-muted)] leading-relaxed m-0">
              Get access to daily 5+ odds slips, banker multi-bets, and mathematical SportPesa & Betika jackpot slips.
            </p>

            <button
              onClick={() => {
                if (onOpenPayment) {
                  onOpenPayment('VIP Predictions Package', 250, 'vip-sportpesa', 'vip-sportpesa', 'vip');
                } else {
                  onSelectPage('vip-packages');
                }
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Upgrade to VIP (KES 250)</span>
            </button>
          </div>
        </aside>
      </div>

      {/* Bottom Back Button */}
      <div className="pt-6 border-t border-[var(--border)] flex items-center justify-between">
        <button
          onClick={onBackToBlog ? onBackToBlog : () => onSelectPage('blog')}
          className="px-5 py-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs font-bold text-[var(--text)] hover:border-[var(--primary)] transition-all flex items-center gap-2 cursor-pointer shadow-3xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Articles</span>
        </button>

        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="text-xs font-mono font-bold text-[var(--text-muted)] hover:text-[var(--primary)] cursor-pointer bg-transparent border-none"
        >
          Back to Top ↑
        </button>
      </div>
    </article>
  );
};

export default MarkdownBlogPage;
