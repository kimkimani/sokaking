import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  User, 
  Folder, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  Calendar, 
  CheckCircle2,
  Tag,
  Compass
} from 'lucide-react';
import { BlogPost } from '../content/blogLoader';

interface RelatedArticlesProps {
  currentPost: BlogPost;
  allPosts: BlogPost[];
  onSelectPost: (slug: string) => void;
  onFilterByAuthor: (authorId: string) => void;
}

type FilterMode = 'all' | 'category' | 'author';

interface ScoredPost {
  post: BlogPost;
  score: number;
  isSameAuthor: boolean;
  isSameCategory: boolean;
  sharedTags: string[];
  reasonBadge: {
    label: string;
    type: 'both' | 'author' | 'category' | 'tag' | 'recommended';
  };
}

export const RelatedArticles: React.FC<RelatedArticlesProps> = ({
  currentPost,
  allPosts,
  onSelectPost,
  onFilterByAuthor
}) => {
  const [filterMode, setFilterMode] = useState<FilterMode>('all');

  // Compute related posts with dynamic matching scoring
  const { scoredPosts, sameCategoryPosts, sameAuthorPosts } = useMemo(() => {
    const others = allPosts.filter(p => p.slug !== currentPost.slug);

    const scored: ScoredPost[] = others.map(p => {
      const isSameAuthor = p.authorId === currentPost.authorId;
      const isSameCategory = p.category.toLowerCase() === currentPost.category.toLowerCase();
      
      const currentTagsLower = (currentPost.tags || []).map(t => t.toLowerCase());
      const sharedTags = (p.tags || []).filter(t => currentTagsLower.includes(t.toLowerCase()));

      let score = 0;
      if (isSameAuthor && isSameCategory) {
        score += 8;
      } else if (isSameCategory) {
        score += 5;
      } else if (isSameAuthor) {
        score += 4;
      }

      score += sharedTags.length * 2;

      // Determine the primary reason badge to display on the card
      let reasonBadge: ScoredPost['reasonBadge'];
      if (isSameAuthor && isSameCategory) {
        reasonBadge = { label: 'Same Author & Category', type: 'both' };
      } else if (isSameCategory) {
        reasonBadge = { label: `Category: ${p.category}`, type: 'category' };
      } else if (isSameAuthor) {
        reasonBadge = { label: `By ${p.author.name}`, type: 'author' };
      } else if (sharedTags.length > 0) {
        reasonBadge = { label: `Topic: #${sharedTags[0]}`, type: 'tag' };
      } else {
        reasonBadge = { label: 'Recommended', type: 'recommended' };
      }

      return {
        post: p,
        score,
        isSameAuthor,
        isSameCategory,
        sharedTags,
        reasonBadge
      };
    });

    // Sort descending by score, then newest first
    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(b.post.date).getTime() - new Date(a.post.date).getTime();
    });

    const sameCat = scored.filter(sp => sp.isSameCategory);
    const sameAuth = scored.filter(sp => sp.isSameAuthor);

    return {
      scoredPosts: scored,
      sameCategoryPosts: sameCat,
      sameAuthorPosts: sameAuth
    };
  }, [allPosts, currentPost]);

  // Determine active list based on filter tab
  const displayedPosts = useMemo(() => {
    if (filterMode === 'category') {
      return sameCategoryPosts;
    }
    if (filterMode === 'author') {
      return sameAuthorPosts;
    }
    // 'all' mode: prioritize matches that have relevance (score > 0)
    const matches = scoredPosts.filter(sp => sp.score > 0);
    return matches.length > 0 ? matches.slice(0, 6) : scoredPosts.slice(0, 3);
  }, [filterMode, scoredPosts, sameCategoryPosts, sameAuthorPosts]);

  if (allPosts.length <= 1) {
    return null;
  }

  const getInitials = (n: string) => {
    const parts = n.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return n.slice(0, 2).toUpperCase();
  };

  return (
    <section 
      aria-label="Related Articles"
      className="space-y-6 pt-8 border-t border-[var(--border)]"
    >
      {/* Header section with category and author context */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[var(--primary)] uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4 text-[var(--primary)]" />
            <span>Curated Insights</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--text)] tracking-tight m-0 font-display">
            Related Articles & Analysis
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 m-0">
            Dynamically suggested football predictions, mathematical models, and jackpot strategies
          </p>
        </div>

        {/* Quick link to view all by author */}
        <button
          onClick={() => onFilterByAuthor(currentPost.authorId)}
          className="text-xs font-mono font-bold text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors inline-flex items-center gap-1.5 cursor-pointer bg-transparent border-none p-0 self-start sm:self-auto"
        >
          <span>All by {currentPost.author.name}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Dynamic Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 pb-1 border-b border-[var(--border)]">
        <button
          onClick={() => setFilterMode('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            filterMode === 'all'
              ? 'bg-[var(--primary)] text-white shadow-3xs'
              : 'bg-[var(--card)] text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--border)]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>All Suggested</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/15 dark:bg-white/15 font-mono">
            {Math.min(scoredPosts.filter(p => p.score > 0).length, 6)}
          </span>
        </button>

        <button
          onClick={() => setFilterMode('category')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            filterMode === 'category'
              ? 'bg-[var(--primary)] text-white shadow-3xs'
              : 'bg-[var(--card)] text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--border)]'
          }`}
        >
          <Folder className="w-3.5 h-3.5" />
          <span>In "{currentPost.category}"</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/15 dark:bg-white/15 font-mono">
            {sameCategoryPosts.length}
          </span>
        </button>

        <button
          onClick={() => setFilterMode('author')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            filterMode === 'author'
              ? 'bg-[var(--primary)] text-white shadow-3xs'
              : 'bg-[var(--card)] text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--border)]'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>By {currentPost.author.name}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/15 dark:bg-white/15 font-mono">
            {sameAuthorPosts.length}
          </span>
        </button>
      </div>

      {/* Cards Grid */}
      {displayedPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedPosts.map(({ post, reasonBadge }) => {
            return (
              <article 
                key={post.slug}
                onClick={() => {
                  onSelectPost(post.slug);
                  if (typeof window !== 'undefined') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow)] hover:border-[var(--primary)] transition-all cursor-pointer flex flex-col justify-between overflow-hidden group hover:-translate-y-0.5"
              >
                {/* Optional Cover Thumbnail */}
                {post.coverImage && (
                  <div className="relative h-40 w-full overflow-hidden bg-slate-900">
                    <img 
                      src={post.coverImage} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    
                    {/* Reason badge floating on thumbnail */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold shadow-xs backdrop-blur-md ${
                        reasonBadge.type === 'both' 
                          ? 'bg-emerald-600/90 text-white' 
                          : reasonBadge.type === 'author' 
                          ? 'bg-amber-600/90 text-white' 
                          : reasonBadge.type === 'category'
                          ? 'bg-indigo-600/90 text-white'
                          : 'bg-black/70 text-white'
                      }`}>
                        {reasonBadge.label}
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 right-3 text-[11px] font-mono font-bold text-white/90 drop-shadow flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                )}

                {/* Card Content Area */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    {/* Category & Date (if no thumbnail) */}
                    {!post.coverImage && (
                      <div className="flex items-center justify-between gap-2 text-xs font-mono">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          reasonBadge.type === 'both' 
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' 
                            : reasonBadge.type === 'author' 
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300' 
                            : 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300'
                        }`}>
                          {reasonBadge.label}
                        </span>
                        <span className="text-[var(--text-muted)] text-[11px]">
                          {post.readTime}
                        </span>
                      </div>
                    )}

                    <h3 className="text-sm sm:text-base font-bold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors line-clamp-2 m-0 leading-snug">
                      {post.title}
                    </h3>

                    <p className="text-xs text-[var(--text-muted)] line-clamp-2 m-0 leading-relaxed">
                      {post.description}
                    </p>
                  </div>

                  {/* Author Mini Byline & Reading CTA */}
                  <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--primary)] to-indigo-600 text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                        {getInitials(post.author.name)}
                      </div>
                      <span className="text-xs font-medium text-[var(--text)] truncate max-w-[120px]">
                        {post.author.name}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-[var(--primary)] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      <span>Read</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* Empty State for Filter Tab */
        <div className="p-8 rounded-[var(--radius)] border border-dashed border-[var(--border)] bg-[var(--card)] text-center space-y-3">
          <BookOpen className="w-8 h-8 text-[var(--text-muted)] mx-auto opacity-50" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-[var(--text)] m-0">
              No additional articles found in this filter
            </h4>
            <p className="text-xs text-[var(--text-muted)] m-0">
              {filterMode === 'author' 
                ? `There are currently no other published articles by ${currentPost.author.name}.`
                : `No other guides currently filed under ${currentPost.category}.`
              }
            </p>
          </div>
          <button
            onClick={() => setFilterMode('all')}
            className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>View All Suggested Articles</span>
          </button>
        </div>
      )}
    </section>
  );
};

export default RelatedArticles;
