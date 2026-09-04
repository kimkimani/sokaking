import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Search, 
  Tag, 
  User, 
  ArrowRight, 
  Sparkles, 
  ChevronRight, 
  ShieldCheck, 
  TrendingUp, 
  Filter,
  CheckCircle2,
  GraduationCap,
  X
} from 'lucide-react';
import { getAllBlogPosts, getBlogCategories, getBlogAuthors, BlogPost } from '../content/blogLoader';
import { ParsedAuthor } from '../content/authorLoader';

interface BlogPageProps {
  onSelectPost: (slug: string) => void;
  onBackToHome: () => void;
  initialAuthorFilter?: string;
}

export const BlogPage: React.FC<BlogPageProps> = ({
  onSelectPost,
  onBackToHome,
  initialAuthorFilter
}) => {
  const allPosts = useMemo(() => getAllBlogPosts(), []);
  const categories = useMemo(() => ['All', ...getBlogCategories()], []);
  const authors = useMemo(() => getBlogAuthors(), []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedAuthorId, setSelectedAuthorId] = useState<string | null>(initialAuthorFilter || null);

  // Filtered posts
  const filteredPosts = useMemo(() => {
    return allPosts.filter(post => {
      // Category filter
      if (selectedCategory !== 'All' && post.category !== selectedCategory) {
        return false;
      }
      // Author filter
      if (selectedAuthorId && post.authorId !== selectedAuthorId && post.author.id !== selectedAuthorId) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = post.title.toLowerCase().includes(query);
        const matchesDesc = post.description.toLowerCase().includes(query);
        const matchesAuthor = post.author.name.toLowerCase().includes(query);
        const matchesTags = post.tags.some(t => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesDesc && !matchesAuthor && !matchesTags) {
          return false;
        }
      }
      return true;
    });
  }, [allPosts, selectedCategory, selectedAuthorId, searchQuery]);

  // Active author object if filtered
  const activeAuthor: ParsedAuthor | undefined = useMemo(() => {
    if (!selectedAuthorId) return undefined;
    return authors.find(a => a.id === selectedAuthorId);
  }, [selectedAuthorId, authors]);

  // Featured post (first featured post or first post if not filtering)
  const featuredPost: BlogPost | null = useMemo(() => {
    if (selectedCategory !== 'All' || selectedAuthorId || searchQuery.trim()) return null;
    return allPosts.find(p => p.featured) || allPosts[0] || null;
  }, [allPosts, selectedCategory, selectedAuthorId, searchQuery]);

  // Remaining posts if featured post is shown
  const regularPosts = useMemo(() => {
    if (featuredPost && !searchQuery.trim() && selectedCategory === 'All' && !selectedAuthorId) {
      return filteredPosts.filter(p => p.slug !== featuredPost.slug);
    }
    return filteredPosts;
  }, [filteredPosts, featuredPost, searchQuery, selectedCategory, selectedAuthorId]);

  const getInitials = (n: string) => {
    const parts = n.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return n.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-8 text-left max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-mono">
        <button 
          onClick={onBackToHome}
          className="hover:text-[var(--primary)] transition-colors cursor-pointer bg-transparent border-none p-0 text-[var(--text-muted)] font-mono"
        >
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[var(--text)] font-bold">Football Analytics Blog</span>
        {selectedAuthorId && activeAuthor && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[var(--primary)] font-bold">{activeAuthor.name}</span>
          </>
        )}
      </nav>

      {/* Hero Header */}
      <section className="p-6 md:p-8 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow)] backdrop-blur-[var(--backdrop)] relative overflow-hidden">
        <div className="absolute -top-16 -left-16 w-52 h-52 rounded-full bg-[var(--primary)]/10 blur-3xl" />
        <div className="absolute -bottom-16 -right-16 w-52 h-52 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary)] text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
            <BookOpen className="w-3.5 h-3.5 text-white" />
            <span>Soka King Mathematical Insights & Research</span>
          </div>

          <h1 
            className="text-2xl md:text-4xl font-extrabold tracking-tight leading-[1.1] text-[var(--text)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Football Betting Analytics & Strategy Blog
          </h1>

          <p className="text-xs md:text-sm text-[var(--text-muted)] leading-relaxed max-w-2xl">
            In-depth tactical breakdowns, Poisson distribution guides, SportPesa jackpot permutation methodologies, and quantitative bankroll models written by certified analysts.
          </p>

          {/* Search bar */}
          <div className="pt-2 relative max-w-xl">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles by title, metric (xG, Poisson), or author..."
              className="w-full pl-10 pr-10 py-3 rounded-[var(--radius)] bg-[var(--background)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 shadow-inner"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--text-muted)] hover:text-[var(--text)] bg-transparent border-none cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Author Filter Bar (Highlights Authors) */}
      <section className="p-4 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[var(--primary)]" />
            <span>Filter by Verified Analyst / Author</span>
          </span>
          {selectedAuthorId && (
            <button 
              onClick={() => setSelectedAuthorId(null)}
              className="text-[10px] font-mono text-[var(--primary)] hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-none p-0 font-bold"
            >
              <X className="w-3 h-3" /> Clear Author Filter
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedAuthorId(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 border ${
              selectedAuthorId === null
                ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-xs'
                : 'bg-[var(--background)] text-[var(--text-muted)] hover:text-[var(--text)] border-[var(--border)]'
            }`}
          >
            All Analysts ({allPosts.length})
          </button>

          {authors.map((author) => {
            const isSelected = selectedAuthorId === author.id;
            const postCount = allPosts.filter(p => p.authorId === author.id || p.author.id === author.id).length;
            return (
              <button
                key={author.id}
                onClick={() => setSelectedAuthorId(isSelected ? null : author.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-xs'
                    : 'bg-[var(--background)] text-[var(--text-muted)] hover:text-[var(--text)] border-[var(--border)]'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-[var(--primary)]/20 text-[9px] font-mono font-black flex items-center justify-center text-inherit">
                  {getInitials(author.name)}
                </div>
                <span>{author.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-[var(--border)] text-[var(--text-muted)]'}`}>
                  {postCount}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Selected Author Profile Highlight */}
      {activeAuthor && (
        <div className="p-5 rounded-[var(--radius)] bg-indigo-500/5 border-2 border-indigo-500/20 text-left space-y-2">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--primary)] to-indigo-600 text-white flex items-center justify-center font-black font-mono text-base shrink-0 shadow-sm">
              {getInitials(activeAuthor.name)}
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-extrabold text-[var(--text)] m-0">
                  {activeAuthor.name}
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black font-mono uppercase bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3" /> Verified Contributor
                </span>
              </div>
              <p className="text-[11px] font-mono font-bold text-[var(--primary)]">
                {activeAuthor.role}
              </p>
              {activeAuthor.credentials && (
                <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                  <GraduationCap className="w-3 h-3 text-indigo-500" />
                  <span>{activeAuthor.credentials}</span>
                </p>
              )}
              <p className="text-xs text-[var(--text-muted)] pt-1">
                {activeAuthor.shortBio}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-[var(--border)]">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 text-xs font-bold transition-all border-b-2 -mb-[1px] cursor-pointer whitespace-nowrap bg-transparent ${
                isActive 
                  ? 'border-[var(--primary)] text-[var(--primary)] font-black' 
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Featured Article Card */}
      {featuredPost && (
        <article className="rounded-[var(--radius)] border-2 border-[var(--primary)]/30 bg-[var(--card)] shadow-[var(--shadow)] overflow-hidden transition-all hover:border-[var(--primary)] group">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {featuredPost.coverImage && (
              <div className="lg:col-span-5 relative h-56 lg:h-auto overflow-hidden bg-slate-900">
                <img 
                  src={featuredPost.coverImage} 
                  alt={featuredPost.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="eager"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-[var(--primary)] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Featured Analysis
                </div>
              </div>
            )}

            <div className={`p-6 md:p-8 space-y-4 flex flex-col justify-between ${featuredPost.coverImage ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)] font-mono flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-500/20">
                    {featuredPost.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {featuredPost.formattedDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {featuredPost.readTime}
                  </span>
                </div>

                <h2 
                  onClick={() => onSelectPost(featuredPost.slug)}
                  className="text-xl md:text-2xl font-extrabold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors cursor-pointer leading-snug font-display m-0"
                >
                  {featuredPost.title}
                </h2>

                <p className="text-xs md:text-sm text-[var(--text-muted)] leading-relaxed">
                  {featuredPost.description}
                </p>
              </div>

              {/* Author & CTA */}
              <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[var(--primary)] text-white font-mono font-black text-xs flex items-center justify-center shadow-xs">
                    {getInitials(featuredPost.author.name)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--text)] m-0 leading-tight">
                      {featuredPost.author.name}
                    </p>
                    <p className="text-[10px] font-mono text-[var(--text-muted)] m-0">
                      {featuredPost.author.role}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onSelectPost(featuredPost.slug)}
                  className="px-4 py-2 bg-[var(--primary)] hover:bg-emerald-800 text-white text-xs font-black rounded-[var(--radius)] transition-all flex items-center gap-1.5 cursor-pointer border-none shadow-xs"
                >
                  <span>Read Full Article</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </article>
      )}

      {/* Blog Posts Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base md:text-lg font-extrabold text-[var(--text)] m-0 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[var(--primary)]" />
            <span>
              {selectedCategory === 'All' ? 'Latest Articles' : `${selectedCategory} Articles`}
              <span className="text-xs font-mono font-bold text-[var(--text-muted)] ml-2">
                ({regularPosts.length})
              </span>
            </span>
          </h2>
        </div>

        {regularPosts.length === 0 ? (
          <div className="p-12 text-center rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] space-y-3">
            <BookOpen className="w-10 h-10 text-[var(--text-muted)] mx-auto opacity-40" />
            <h3 className="text-sm font-bold text-[var(--text)]">No articles found</h3>
            <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
              No published articles match your current search query or filter selection. Try clearing the filters.
            </p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedAuthorId(null);
              }}
              className="px-4 py-2 bg-[var(--primary)] text-white text-xs font-bold rounded-lg cursor-pointer border-none"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {regularPosts.map((post) => (
              <article 
                key={post.slug}
                className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow)] overflow-hidden flex flex-col justify-between hover:border-[var(--primary)]/60 transition-all group"
              >
                {/* Optional Cover Image */}
                {post.coverImage && (
                  <div 
                    onClick={() => onSelectPost(post.slug)}
                    className="h-44 overflow-hidden relative cursor-pointer bg-slate-900"
                  >
                    <img 
                      src={post.coverImage} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-sm text-white text-[9.5px] font-mono font-bold px-2 py-0.5 rounded border border-white/10">
                      {post.category}
                    </span>
                  </div>
                )}

                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    {!post.coverImage && (
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[9.5px] font-mono font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                          {post.category}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-[10px] text-[var(--text-muted)] font-mono">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {post.formattedDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {post.readTime}
                      </span>
                    </div>

                    <h3 
                      onClick={() => onSelectPost(post.slug)}
                      className="text-sm md:text-base font-extrabold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors cursor-pointer leading-snug line-clamp-2 m-0"
                    >
                      {post.title}
                    </h3>

                    <p className="text-xs text-[var(--text-muted)] leading-relaxed line-clamp-3">
                      {post.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2 mt-3">
                    {/* Author Chip */}
                    <div 
                      onClick={() => setSelectedAuthorId(post.authorId)}
                      title={`Filter posts by ${post.author.name}`}
                      className="flex items-center gap-2 cursor-pointer group/author hover:opacity-80"
                    >
                      <div className="w-7 h-7 rounded-full bg-[var(--primary)]/15 text-[var(--primary)] font-mono font-black text-[10px] flex items-center justify-center border border-[var(--primary)]/20 shrink-0">
                        {getInitials(post.author.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-[var(--text)] m-0 truncate group-hover/author:text-[var(--primary)]">
                          {post.author.name}
                        </p>
                        <p className="text-[9px] font-mono text-[var(--text-muted)] m-0 truncate">
                          {post.author.role.split(' ')[0]} {post.author.role.split(' ')[1]}
                        </p>
                      </div>
                    </div>

                    {/* Action */}
                    <button
                      onClick={() => onSelectPost(post.slug)}
                      className="p-1.5 text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-md transition-colors cursor-pointer bg-transparent border-none"
                      aria-label={`Read article: ${post.title}`}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* E-E-A-T Editorial Disclaimer Banner */}
      <section className="p-5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] text-xs text-[var(--text-muted)] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
          <p className="leading-relaxed m-0 text-slate-700 dark:text-slate-300">
            <strong>Editorial Standard:</strong> Every article published on Soka King is peer-reviewed by our statistical verification team to ensure Poisson metrics and tactical diagrams adhere to strict quantitative standards.
          </p>
        </div>
      </section>
    </div>
  );
};

export default BlogPage;
