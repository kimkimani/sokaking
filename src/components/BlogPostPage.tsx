'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Share2, 
  Check, 
  BookOpen, 
  ChevronRight, 
  ChevronDown,
  Tag, 
  ShieldCheck, 
  ExternalLink,
  MessageCircle,
  Twitter,
  User,
  Sparkles,
  FileText,
  HelpCircle,
  CheckCircle2,
  Bookmark,
  Layers,
  Award,
  Send
} from 'lucide-react';
import { BlogPost, getAllBlogPosts } from '../content/blogLoader';
import { AuthorCard } from './AuthorCard';
import { parseFaqsFromMarkdown } from '../utils/faqParser';
import MarkdownRenderer from './MarkdownRenderer';
import { RelatedArticles } from './RelatedArticles';
import { generateBlogPostJsonLd, calculateArticleWordCount } from '../utils/schemaGenerator';
import { ResponsibleGamblingNotice } from './ResponsibleGamblingNotice';

interface BlogPostPageProps {
  post: BlogPost;
  onBackToBlog: () => void;
  onSelectPost: (slug: string) => void;
  onFilterByAuthor: (authorId: string) => void;
  onBackToHome?: () => void;
}

interface FaqItem {
  question: string;
  answer: string;
  category?: string;
}

export const BlogPostPage: React.FC<BlogPostPageProps> = ({
  post,
  onBackToBlog,
  onSelectPost,
  onFilterByAuthor
}) => {
  const [copied, setCopied] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Track reading scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
        setReadingProgress(currentProgress);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate article word count
  const wordCount = calculateArticleWordCount(post.content || post.raw);

  // Sync rich Article & TechArticle JSON-LD structured data into document head
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const { fullGraph } = generateBlogPostJsonLd(post);
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
        console.warn('Could not inject blog post schema in BlogPostPage:', e);
      }
    }
  }, [post]);

  // All blog posts for dynamic related articles computation
  const allPosts = useMemo(() => getAllBlogPosts(), []);

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
      const text = encodeURIComponent(`Read "${post.title}" on Soka King Football Analytics:`);
      const url = encodeURIComponent(window.location.href);
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener,noreferrer');
    }
  };

  const handleShareWhatsApp = () => {
    if (typeof window !== 'undefined') {
      const text = encodeURIComponent(`Check out this football analysis: "${post.title}" - ${window.location.href}`);
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank', 'noopener,noreferrer');
    }
  };

  const handleShareTelegram = () => {
    if (typeof window !== 'undefined') {
      const text = encodeURIComponent(`"${post.title}" - Soka King Football Analytics`);
      const url = encodeURIComponent(window.location.href);
      window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank', 'noopener,noreferrer');
    }
  };

  // FAQ items parsed directly from markdown content (<!-- FAQ --> or ## Frequently Asked Questions)
  const faqItems = useMemo(() => {
    const rawContent = post.content || post.raw || '';
    return parseFaqsFromMarkdown(rawContent);
  }, [post.content, post.raw]);

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  return (
    <article className="space-y-8 text-left max-w-4xl mx-auto relative pb-16">
      {/* 1. Subtle Fixed Reading Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1 bg-[var(--primary)] z-50 transition-all duration-150"
        style={{ width: `${readingProgress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(readingProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
      />

      {/* 2. Top Breadcrumb and Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-mono overflow-x-auto scrollbar-none">
          <a 
            href="/blog"
            onClick={(e) => {
              e.preventDefault();
              onBackToBlog();
            }}
            className="hover:text-[var(--primary)] transition-colors cursor-pointer bg-transparent border-none p-0 text-[var(--text-muted)] font-mono no-underline"
          >
            Blog
          </a>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <span className="text-[var(--primary)] font-bold shrink-0">{post.category}</span>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <span className="text-[var(--text)] font-bold truncate max-w-[200px] sm:max-w-xs">
            {post.title}
          </span>
        </nav>

        <a
          href="/blog"
          onClick={(e) => {
            e.preventDefault();
            onBackToBlog();
          }}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors cursor-pointer bg-transparent border-none p-0 self-start sm:self-auto no-underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Articles</span>
        </a>
      </div>

      {/* 3. Clean, High-Legibility Article Header (Uncluttered, author moved to bottom) */}
      <header className="p-6 md:p-8 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow)] space-y-4 relative overflow-hidden">
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-500/25">
            {post.category}
          </span>
          <span className="text-[var(--text-muted)] flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> {post.formattedDate}
          </span>
          <span className="text-[var(--text-muted)] flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {post.readTime}
          </span>
          <span className="text-[var(--text-muted)] flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" /> {wordCount.toLocaleString()} words
          </span>
          {/poisson|expected-goals|xg|statistical|kelly|algorithm/i.test(post.slug + post.category) && (
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-500/20 text-[11px] flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> TechArticle
            </span>
          )}
        </div>

        <h1 
          className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--text)] leading-tight m-0"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {post.title}
        </h1>

        <p className="text-sm md:text-base text-[var(--text-muted)] leading-relaxed m-0 border-l-3 border-[var(--primary)] pl-3.5 bg-[var(--background)]/60 py-2.5 rounded-r">
          {post.description}
        </p>
      </header>

      {/* 4. Cover Image */}
      {post.coverImage && (
        <div className="rounded-[var(--radius)] overflow-hidden border border-[var(--border)] shadow-[var(--shadow)] max-h-96 bg-slate-900">
          <img 
            src={post.coverImage} 
            alt={post.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      {/* 5. Main Markdown Article Content */}
      <section className="p-6 md:p-10 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow)] space-y-6">
        <MarkdownRenderer content={post.content} postSlug={post.slug} className="text-sm md:text-base leading-relaxed" />
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 6. COLLAPSIBLE FAQ ACCORDION AT THE BOTTOM OF THE POST         */}
      {/* ───────────────────────────────────────────────────────────── */}
      {faqItems.length > 0 && (
        <section className="p-6 md:p-8 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow)] space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--border)]">
            <div className="p-2 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-extrabold text-[var(--text)] m-0">
                Frequently Asked Questions
              </h2>
            </div>
          </div>

          {/* Collapsible Accordion List */}
          <div className="space-y-3">
            {faqItems.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div 
                  key={idx}
                  className={`rounded-[var(--radius)] border transition-all duration-200 overflow-hidden ${
                    isOpen 
                      ? 'border-[var(--primary)]/50 bg-[var(--background)] shadow-xs' 
                      : 'border-[var(--border)] bg-[var(--card)] hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    aria-expanded={isOpen}
                    className="w-full p-4 flex items-center justify-between gap-3 text-left bg-transparent border-none cursor-pointer transition-colors"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="text-xs font-mono font-black text-[var(--primary)] shrink-0 mt-0.5">
                        0{idx + 1}
                      </span>
                      <h3 className="text-xs md:text-sm font-bold text-[var(--text)] leading-snug m-0">
                        {item.question}
                      </h3>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-[var(--text-muted)] shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[var(--primary)]' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-[var(--text-muted)] leading-relaxed border-t border-[var(--border)] border-dashed mt-1 pt-3">
                      <div className="prose prose-sm max-w-none text-[var(--text)] leading-relaxed m-0">
                        <MarkdownRenderer content={item.answer} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 7. BOTTOM POST HUB: AUTHOR CREDENTIALS, SOCIAL & DETAILS      */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="space-y-6 pt-2">
        {/* Author Full Credentials Box - Consolidated on the same place card */}
        <section className="space-y-2">
          <AuthorCard 
            author={post.author}
            authorId={post.authorId}
            name={post.author.name}
            title={post.author.role}
            description={post.author.shortBio}
            reviewerName={post.author.reviewerName}
            reviewerTitle={post.author.reviewerTitle}
            badges={post.author.badges}
            onViewMoreByAuthor={() => onFilterByAuthor(post.authorId)}
          />
        </section>

        {/* Social Sharing, Bookmark & Toolbox Card */}
        <section className="p-5 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-xs font-mono font-bold uppercase text-[var(--text)] m-0 flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>Share This Research Paper</span>
            </h3>
            <p className="text-[11px] text-[var(--text-muted)] m-0">
              Share quantitative football models with colleagues and fellow sports analysts:
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopyLink}
              title="Copy URL"
              className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text)] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5 text-[var(--primary)]" />}
              <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
            </button>

            <button
              onClick={handleShareTwitter}
              title="Share on X / Twitter"
              className="p-2 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text)] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              aria-label="Share on X / Twitter"
            >
              <Twitter className="w-3.5 h-3.5 text-sky-500" />
              <span className="hidden md:inline">X</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              title="Share on WhatsApp"
              className="p-2 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text)] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              aria-label="Share on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden md:inline">WhatsApp</span>
            </button>

            <button
              onClick={handleShareTelegram}
              title="Share on Telegram"
              className="p-2 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text)] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              aria-label="Share on Telegram"
            >
              <Send className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden md:inline">Telegram</span>
            </button>
          </div>
        </section>

        {/* Tags & Keywords */}
        {post.tags && post.tags.length > 0 && (
          <section className="p-4 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase text-[var(--text-muted)] flex items-center gap-1.5">
              <Tag className="w-3 h-3 text-[var(--primary)]" /> Analytical Keywords & Taxonomy:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((t, idx) => (
                <span 
                  key={idx}
                  className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-[var(--background)] border border-[var(--border)] text-[var(--text-muted)]"
                >
                  #{t}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Related Articles Section */}
        <RelatedArticles 
          currentPost={post}
          allPosts={allPosts}
          onSelectPost={onSelectPost}
          onFilterByAuthor={onFilterByAuthor}
        />

        {/* Footer Back Button and Scroll to Top */}
        <div className="pt-4 flex items-center justify-between">
          <button
            onClick={onBackToBlog}
            className="px-5 py-2.5 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] text-xs font-bold text-[var(--text)] hover:border-[var(--primary)] transition-all flex items-center gap-2 cursor-pointer shadow-3xs"
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
            className="text-xs font-mono font-bold text-[var(--text-muted)] hover:text-[var(--primary)] cursor-pointer bg-transparent border-none"
          >
            Back to Top ↑
          </button>
        </div>

        {/* Responsible Gambling Notice */}
        <ResponsibleGamblingNotice />
      </div>
    </article>
  );
};

export default BlogPostPage;
