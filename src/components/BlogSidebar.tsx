import React from 'react';
import { 
  BookOpen, 
  TrendingUp, 
  Tag, 
  User, 
  Calendar, 
  Clock, 
  ChevronRight, 
  Sparkles, 
  Send, 
  ShieldCheck,
  Search,
  Flame,
  Award
} from 'lucide-react';
import { getAllBlogPosts, getBlogCategories, getBlogAuthors, BlogPost } from '../content/blogLoader';

interface BlogSidebarProps {
  currentPostSlug?: string;
  onSelectPost: (slug: string) => void;
  onFilterByCategory?: (category: string) => void;
  onFilterByAuthor?: (authorId: string) => void;
}

export const BlogSidebar: React.FC<BlogSidebarProps> = ({
  currentPostSlug,
  onSelectPost,
  onFilterByCategory,
  onFilterByAuthor
}) => {
  const allPosts = getAllBlogPosts();
  const categories = getBlogCategories();
  const authors = getBlogAuthors();

  // Trending / Featured articles (excluding current post if on post page)
  const trendingPosts = allPosts
    .filter(p => p.slug !== currentPostSlug)
    .slice(0, 4);

  // Category counts
  const categoryCounts = categories.map(cat => ({
    name: cat,
    count: allPosts.filter(p => p.category.toLowerCase() === cat.toLowerCase()).length
  }));

  const getInitials = (n: string) => {
    const parts = n.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return n.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6 text-left">
      {/* 1. Blog Publication Badge Card */}
      <div className="p-4 sm:p-5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow)] space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center font-bold">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-mono font-black uppercase text-[var(--text)] tracking-wider m-0">
              Soka King Editorial
            </h2>
            <p className="text-[11px] font-mono text-[var(--text-muted)] m-0">
              Quantitative Football Insights
            </p>
          </div>
        </div>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed m-0">
          Peer-reviewed mathematical modeling, Poisson distributions, and empirical bankroll allocation strategies.
        </p>
      </div>

      {/* 2. Trending & Featured Articles */}
      <div className="p-4 sm:p-5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow)] space-y-3.5">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
          <span className="text-xs font-mono font-black uppercase text-[var(--text)] flex items-center gap-1.5 tracking-wider">
            <TrendingUp className="w-4 h-4 text-[var(--primary)]" />
            <span>Trending Articles</span>
          </span>
          <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
            Top Reads
          </span>
        </div>

        <div className="space-y-3">
          {trendingPosts.length > 0 ? (
            trendingPosts.map((post, idx) => (
              <article
                key={post.slug}
                onClick={() => onSelectPost(post.slug)}
                className="group cursor-pointer p-2.5 rounded-lg border border-transparent hover:border-[var(--border)] hover:bg-[var(--background)] transition-all flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)]">
                  <span className="px-2 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-bold">
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {post.readTime}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors leading-snug line-clamp-2 m-0">
                  {post.title}
                </h3>
                <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] pt-1">
                  <span className="truncate max-w-[140px] font-mono">
                    By {post.author.name}
                  </span>
                  <span className="text-[var(--primary)] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 text-[10px] font-mono">
                    Read →
                  </span>
                </div>
              </article>
            ))
          ) : (
            <p className="text-xs text-[var(--text-muted)] italic m-0">More analyses being published weekly.</p>
          )}
        </div>
      </div>

      {/* 3. Topics & Analytical Categories */}
      <div className="p-4 sm:p-5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow)] space-y-3">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
          <span className="text-xs font-mono font-black uppercase text-[var(--text)] flex items-center gap-1.5 tracking-wider">
            <Tag className="w-4 h-4 text-[var(--primary)]" />
            <span>Topics & Categories</span>
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          {categoryCounts.map(({ name, count }) => (
            <button
              key={name}
              onClick={() => onFilterByCategory ? onFilterByCategory(name) : undefined}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono text-[var(--text)] hover:text-[var(--primary)] hover:bg-[var(--background)] transition-colors cursor-pointer border-none bg-transparent"
            >
              <span className="font-semibold text-left truncate">{name}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--border)] text-[var(--text-muted)]">
                {count} {count === 1 ? 'article' : 'articles'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Verified Quantitative Analysts */}
      <div className="p-4 sm:p-5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow)] space-y-3.5">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
          <span className="text-xs font-mono font-black uppercase text-[var(--text)] flex items-center gap-1.5 tracking-wider">
            <Award className="w-4 h-4 text-[var(--primary)]" />
            <span>Lead Authors</span>
          </span>
          <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            Verified
          </span>
        </div>

        <div className="space-y-2.5">
          {authors.map((author) => (
            <div
              key={author.id}
              onClick={() => onFilterByAuthor ? onFilterByAuthor(author.id) : undefined}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--background)] transition-colors cursor-pointer group"
              title={`View articles by ${author.name}`}
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--primary)] to-indigo-600 text-white font-mono font-black text-xs flex items-center justify-center shrink-0 border border-[var(--primary)]/20 shadow-xs">
                {getInitials(author.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors truncate">
                    {author.name}
                  </span>
                  <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                </div>
                <p className="text-[10px] font-mono text-[var(--text-muted)] truncate m-0">
                  {author.role}
                </p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--primary)] group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* 5. Telegram Community / Analytical Channel Card */}
      <div className="p-5 rounded-[var(--radius)] border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 via-[var(--card)] to-indigo-500/5 shadow-[var(--shadow)] space-y-3 relative overflow-hidden">
        <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
          <Send className="w-4 h-4" />
          <span className="text-xs font-mono font-black uppercase tracking-wider">
            Analytical Telegram
          </span>
        </div>
        <h4 className="text-xs font-bold text-[var(--text)] m-0 leading-snug">
          Receive Live Expected Goals & Model Discrepancies
        </h4>
        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed m-0">
          Join over 25,000 analytical punters receiving tactical slate warnings, expected value shifts, and Poisson probabilities before every major matchday.
        </p>
        <a
          href="https://t.me/sokapredictions"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold font-mono transition-colors no-underline shadow-xs cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Join Free Channel</span>
        </a>
      </div>
    </div>
  );
};

export default BlogSidebar;
