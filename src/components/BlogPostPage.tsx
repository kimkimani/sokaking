import React, { useState, useEffect } from 'react';
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
  ExternalLink,
  MessageCircle,
  Twitter,
  User,
  Sparkles,
  FileText
} from 'lucide-react';
import { BlogPost, getAllBlogPosts } from '../content/blogLoader';
import { AuthorCard } from './AuthorCard';
import MarkdownRenderer from './MarkdownRenderer';
import { RelatedArticles } from './RelatedArticles';
import { generateBlogPostJsonLd, calculateArticleWordCount } from '../utils/schemaGenerator';

interface BlogPostPageProps {
  post: BlogPost;
  onBackToBlog: () => void;
  onSelectPost: (slug: string) => void;
  onFilterByAuthor: (authorId: string) => void;
}

export const BlogPostPage: React.FC<BlogPostPageProps> = ({
  post,
  onBackToBlog,
  onSelectPost,
  onFilterByAuthor
}) => {
  const [copied, setCopied] = useState(false);

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
  const allPosts = getAllBlogPosts();

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

  const getInitials = (n: string) => {
    const parts = n.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return n.slice(0, 2).toUpperCase();
  };

  return (
    <article className="space-y-8 text-left max-w-4xl mx-auto">
      {/* Top Breadcrumb and Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-mono overflow-x-auto scrollbar-none">
          <button 
            onClick={onBackToBlog}
            className="hover:text-[var(--primary)] transition-colors cursor-pointer bg-transparent border-none p-0 text-[var(--text-muted)] font-mono"
          >
            Blog
          </button>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <span className="text-[var(--primary)] font-bold shrink-0">{post.category}</span>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <span className="text-[var(--text)] font-bold truncate max-w-[200px] sm:max-w-xs">
            {post.title}
          </span>
        </nav>

        <button
          onClick={onBackToBlog}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors cursor-pointer bg-transparent border-none p-0 self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Articles</span>
        </button>
      </div>

      {/* Article Header Card */}
      <header className="p-6 md:p-8 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow)] space-y-4 relative overflow-hidden">
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-500/20">
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
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-500/20 text-[11px] flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> TechArticle Schema
            </span>
          )}
        </div>

        <h1 
          className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--text)] leading-tight m-0 font-display"
        >
          {post.title}
        </h1>

        <p className="text-sm md:text-base text-[var(--text-muted)] leading-relaxed m-0 border-l-3 border-[var(--primary)] pl-3.5 italic bg-[var(--background)]/50 py-2 rounded-r">
          {post.description}
        </p>

        {/* Author Byline & Social Share Bar */}
        <div className="pt-4 border-t border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Author info pill */}
          <div 
            onClick={() => onFilterByAuthor(post.authorId)}
            title={`View all articles by ${post.author.name}`}
            className="flex items-center gap-3 cursor-pointer group hover:opacity-85 transition-opacity"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-indigo-600 text-white font-mono font-black text-xs flex items-center justify-center border-2 border-[var(--primary)]/30 shrink-0 shadow-xs">
              {getInitials(post.author.name)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
                  {post.author.name}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold">
                  Verified
                </span>
              </div>
              <p className="text-[11px] font-mono text-[var(--text-muted)] m-0">
                {post.author.role}
              </p>
            </div>
          </div>

          {/* Social share actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              title="Copy link to article"
              className="p-2 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text)] transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>
            <button
              onClick={handleShareTwitter}
              title="Share on X / Twitter"
              className="p-2 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text)] transition-colors cursor-pointer"
              aria-label="Share on X / Twitter"
            >
              <Twitter className="w-3.5 h-3.5 text-sky-500" />
            </button>
            <button
              onClick={handleShareWhatsApp}
              title="Share on WhatsApp"
              className="p-2 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text)] transition-colors cursor-pointer"
              aria-label="Share on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
            </button>
          </div>
        </div>
      </header>

      {/* Cover Image */}
      {post.coverImage && (
        <div className="rounded-[var(--radius)] overflow-hidden border border-[var(--border)] shadow-[var(--shadow)] max-h-96">
          <img 
            src={post.coverImage} 
            alt={post.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      {/* Main Markdown Body Content */}
      <section className="p-6 md:p-10 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow)] space-y-6">
        <MarkdownRenderer content={post.content} postSlug={post.slug} className="text-sm md:text-base leading-relaxed" />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="pt-6 border-t border-[var(--border)] space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase text-[var(--text-muted)] flex items-center gap-1.5">
              <Tag className="w-3 h-3 text-[var(--primary)]" /> Related Topics & Keywords:
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
          </div>
        )}
      </section>

      {/* Full Author Credential Box */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-black uppercase text-[var(--text-muted)] flex items-center gap-1.5">
            <User className="w-4 h-4 text-[var(--primary)]" />
            <span>About The Author</span>
          </span>
          <button
            onClick={() => onFilterByAuthor(post.authorId)}
            className="text-xs font-mono font-bold text-[var(--primary)] hover:underline cursor-pointer bg-transparent border-none p-0"
          >
            More by {post.author.name} →
          </button>
        </div>

        <AuthorCard 
          author={post.author}
          authorId={post.authorId}
          name={post.author.name}
          title={post.author.role}
          description={post.author.shortBio}
          reviewerName={post.author.reviewerName}
          reviewerTitle={post.author.reviewerTitle}
          badges={post.author.badges}
        />
      </section>

      {/* Related Articles Section */}
      <RelatedArticles 
        currentPost={post}
        allPosts={allPosts}
        onSelectPost={onSelectPost}
        onFilterByAuthor={onFilterByAuthor}
      />

      {/* Footer Back Button */}
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
    </article>
  );
};

export default BlogPostPage;
