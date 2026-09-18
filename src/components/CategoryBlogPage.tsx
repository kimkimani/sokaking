'use client';

import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Calculator, 
  GraduationCap, 
  TrendingUp, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  ArrowRight, 
  ChevronRight, 
  ChevronDown,
  Search, 
  Sliders, 
  Percent, 
  BarChart3, 
  Layers, 
  FileText, 
  CheckCircle2, 
  Target, 
  Cpu, 
  Award, 
  Info,
  X,
  Compass,
  ArrowUpRight,
  HelpCircle,
  Zap,
  Bookmark,
  Share2,
  Check,
  Twitter,
  MessageCircle,
  User,
  Send
} from 'lucide-react';
import { getAllBlogPosts, BlogPost } from '../content/blogLoader';
import { getMarkdownContent } from '../content/markdownLoader';
import MarkdownRenderer from './MarkdownRenderer';
import { ResponsibleGamblingNotice } from './ResponsibleGamblingNotice';
import { AuthorCard } from './AuthorCard';
import { parseFaqsFromMarkdown } from '../utils/faqParser';

export type BlogStructureType = 'magazine' | 'academy' | 'strategy-hub';

interface CategoryBlogPageProps {
  onSelectPost: (slug: string) => void;
  onBackToHome: () => void;
  onSelectPage?: (pageId: string) => void;
}

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

export const CategoryBlogPage: React.FC<CategoryBlogPageProps> = ({
  onSelectPost,
  onBackToHome,
  onSelectPage
}) => {
  const [activeStructure, setActiveStructure] = useState<BlogStructureType>('magazine');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [activeAcademyModule, setActiveAcademyModule] = useState<number>(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [copied, setCopied] = useState(false);

  // Live Calculator States (for Strategy Hub)
  const [homeExpectancy, setHomeExpectancy] = useState<number>(1.65);
  const [awayExpectancy, setAwayExpectancy] = useState<number>(1.15);
  
  // Kelly Calculator States
  const [decimalOdds, setDecimalOdds] = useState<number>(2.10);
  const [winProbPercent, setWinProbPercent] = useState<number>(55);
  const [bankrollSize, setBankrollSize] = useState<number>(10000);

  // Load content
  const pageMd = useMemo(() => getMarkdownContent('category-blog'), []);
  const allPosts = useMemo(() => getAllBlogPosts(), []);

  // Filtered posts
  const filteredPosts = useMemo(() => {
    return allPosts.filter(post => {
      if (selectedTag !== 'All' && !post.tags.some(t => t.toLowerCase() === selectedTag.toLowerCase())) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = post.title.toLowerCase().includes(q);
        const matchDesc = post.description.toLowerCase().includes(q);
        const matchTag = post.tags.some(t => t.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchTag) return false;
      }
      return true;
    });
  }, [allPosts, selectedTag, searchQuery]);

  const featuredPost = useMemo(() => {
    return allPosts.find(p => p.featured) || allPosts[0] || null;
  }, [allPosts]);

  // All distinct tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    allPosts.forEach(p => p.tags.forEach(t => set.add(t)));
    return ['All', ...Array.from(set)];
  }, [allPosts]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      });
    }
  };

  const handleShareTwitter = () => {
    if (typeof window !== 'undefined') {
      const text = encodeURIComponent('Soka King Football Analytics & Research Hub:');
      const url = encodeURIComponent(window.location.href);
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener,noreferrer');
    }
  };

  const handleShareWhatsApp = () => {
    if (typeof window !== 'undefined') {
      const text = encodeURIComponent(`Soka King Quantitative Football Analytics: ${window.location.href}`);
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank', 'noopener,noreferrer');
    }
  };

  // Poisson Mathematical Model Calculation (for Strategy Hub view)
  const poissonCalculations = useMemo(() => {
    const factorial = (n: number): number => {
      if (n <= 1) return 1;
      let res = 1;
      for (let i = 2; i <= n; i++) res *= i;
      return res;
    };

    const poisson = (lambda: number, k: number): number => {
      return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
    };

    let pHomeWin = 0;
    let pDraw = 0;
    let pAwayWin = 0;
    let pOver25 = 0;
    let pBtts = 0;

    for (let h = 0; h <= 6; h++) {
      for (let a = 0; a <= 6; a++) {
        const prob = poisson(homeExpectancy, h) * poisson(awayExpectancy, a);
        if (h > a) pHomeWin += prob;
        else if (h === a) pDraw += prob;
        else pAwayWin += prob;

        if (h + a >= 3) pOver25 += prob;
        if (h > 0 && a > 0) pBtts += prob;
      }
    }

    return {
      homeWin: (pHomeWin * 100).toFixed(1),
      draw: (pDraw * 100).toFixed(1),
      awayWin: (pAwayWin * 100).toFixed(1),
      over25: (pOver25 * 100).toFixed(1),
      under25: ((1 - pOver25) * 100).toFixed(1),
      btts: (pBtts * 100).toFixed(1),
      fairHomeOdds: pHomeWin > 0 ? (1 / pHomeWin).toFixed(2) : '—',
      fairDrawOdds: pDraw > 0 ? (1 / pDraw).toFixed(2) : '—',
      fairAwayOdds: pAwayWin > 0 ? (1 / pAwayWin).toFixed(2) : '—'
    };
  }, [homeExpectancy, awayExpectancy]);

  // Kelly Staking Calculation
  const kellyCalculation = useMemo(() => {
    const b = decimalOdds - 1;
    const p = winProbPercent / 100;
    const q = 1 - p;
    if (b <= 0) return { fullKelly: '0.00', quarterKelly: '0.00', stakeKsh: 0, edgePercent: '0.0' };

    const edge = (b * p - q) / b;
    const fullKelly = Math.max(0, edge * 100);
    const quarterKelly = Math.max(0, fullKelly * 0.25);
    const stakeKsh = Math.round((quarterKelly / 100) * bankrollSize);
    const edgePercent = ((p - 1 / decimalOdds) * 100);

    return {
      fullKelly: fullKelly.toFixed(2),
      quarterKelly: quarterKelly.toFixed(2),
      stakeKsh,
      edgePercent: edgePercent.toFixed(1)
    };
  }, [decimalOdds, winProbPercent, bankrollSize]);

  // FAQ Data parsed directly from category-blog markdown content (<!-- FAQ -->)
  const strategyFaqs = useMemo(() => {
    return parseFaqsFromMarkdown(pageMd.faq || pageMd.fullContent || '');
  }, [pageMd.faq, pageMd.fullContent]);

  // Academy Modules Breakdown
  const academyModules = [
    {
      id: 0,
      title: "1. Goal Expectancy Foundations (HAS & ADW)",
      level: "Beginner",
      levelColor: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30",
      readTime: "4 min",
      summary: "Deconstructing team attacking and defensive strengths relative to league baselines to generate unskewed goal metrics.",
      formula: "Expected Home Goals (λ_home) = HAS × ADW × League_Home_Average",
      keyPoints: [
        "Home Attack Strength (HAS) normalizes home scoring rate against domestic league averages.",
        "Away Defense Weakness (ADW) quantifies away concession rates without situational noise.",
        "League home advantage coefficients typically add +0.28 to +0.42 goals per 90 minutes."
      ]
    },
    {
      id: 1,
      title: "2. Poisson Distribution & Scoreline Probability Matrix",
      level: "Intermediate",
      levelColor: "bg-sky-500/15 text-sky-800 dark:text-sky-300 border-sky-500/30",
      readTime: "6 min",
      summary: "Converting continuous goal expectancy into discrete matrix cells from 0-0 up to 5-5 to derive true 1X2, BTTS, and Over/Under fair odds.",
      formula: "P(k goals) = (λ^k × e^-λ) / k!",
      keyPoints: [
        "Sums diagonal cells to derive unskewed Draw probabilities.",
        "Reveals market discrepancies where public favorites are priced shorter than statistical reality.",
        "Over 2.5 probability is extracted by summing matrix coordinates where Home + Away ≥ 3."
      ]
    },
    {
      id: 2,
      title: "3. SportPesa Mega Jackpot Permutations & Variance",
      level: "Advanced Quant",
      levelColor: "bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-500/30",
      readTime: "8 min",
      summary: "Navigating 129 million possible 17-game outcomes through banker stratification, double-chance rotations, and contrarian hedging.",
      formula: "Total Outcome Pool = 3^17 = 129,140,163 Permutations",
      keyPoints: [
        "Banker Stratification: Isolate 4–6 high-confidence anchors with win probability > 68%.",
        "Double Chance Rotation: Protect medium-volatility fixtures without runaway exponential entry costs.",
        "Contrarian Draw Selection: Capitalize on public over-subscription to vulnerable favorites."
      ]
    },
    {
      id: 3,
      title: "4. Capital Preservation: Fractional Kelly Staking Model",
      level: "Essential Risk",
      levelColor: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30",
      readTime: "5 min",
      summary: "Mathematical risk management designed to maximize logarithmic bankroll growth while preventing catastrophic drawdowns.",
      formula: "f* = ((bp - q) / b) × 0.25 (Quarter-Kelly)",
      keyPoints: [
        "Scaling down to Quarter-Kelly reduces drawdown risk by over 75% compared to full Kelly.",
        "Never stake on negative edge: If model probability is below bookmaker implied odds, stake is 0.",
        "Protects capital against refereeing variance, unexpected weather, and red cards."
      ]
    }
  ];

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto pb-16">
      {/* 1. Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-mono">
        <a 
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onBackToHome();
          }}
          className="hover:text-[var(--primary)] transition-colors cursor-pointer text-[var(--text-muted)] no-underline"
        >
          Home
        </a>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[var(--text)] font-bold">Research & Strategy Hub</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[var(--primary)] font-bold">/category-blog</span>
      </nav>

      {/* 2. Interactive Structure Switcher Header Banner */}
      <section className="p-5 md:p-6 rounded-[var(--radius)] border-2 border-[var(--primary)] bg-[var(--card)] shadow-[var(--shadow)] relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-[10px] font-mono font-black uppercase tracking-wider border border-[var(--primary)]/20">
              <Sparkles className="w-3 h-3 text-[var(--primary)]" />
              <span>Dedicated /category-blog UI Architecture</span>
            </div>
            <h1 
              className="text-xl md:text-3xl font-extrabold text-[var(--text)] tracking-tight m-0"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Football Betting Strategy & Analytics Hub
            </h1>
            <p className="text-xs md:text-sm text-[var(--text-muted)] m-0">
              Select between three UI structures to preview how tactical research, mathematical models, and betting guides are organized:
            </p>
          </div>

          {/* Structure Selector Pill Buttons */}
          <div className="w-full lg:w-auto bg-[var(--background)] p-1.5 rounded-[var(--radius)] border border-[var(--border)] flex flex-wrap sm:flex-nowrap gap-1.5 shrink-0">
            <button
              onClick={() => setActiveStructure('magazine')}
              className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                activeStructure === 'magazine'
                  ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm'
                  : 'bg-transparent text-[var(--text-muted)] hover:text-[var(--text)] border-transparent'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Editorial Magazine</span>
            </button>

            <button
              onClick={() => setActiveStructure('academy')}
              className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                activeStructure === 'academy'
                  ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm'
                  : 'bg-transparent text-[var(--text-muted)] hover:text-[var(--text)] border-transparent'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Analytics Academy</span>
            </button>

            <button
              onClick={() => setActiveStructure('strategy-hub')}
              className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                activeStructure === 'strategy-hub'
                  ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm'
                  : 'bg-transparent text-[var(--text-muted)] hover:text-[var(--text)] border-transparent'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Strategy Hub + Calculators</span>
            </button>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* STRUCTURE 1: EDITORIAL SPORTS MAGAZINE                       */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeStructure === 'magazine' && (
        <div className="space-y-6">
          {/* Tag Filter Bar & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)]">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <span className="text-[10px] font-mono font-bold uppercase text-[var(--text-muted)] mr-1 shrink-0">
                Topic:
              </span>
              {allTags.slice(0, 5).map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer border ${
                    selectedTag === tag
                      ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                      : 'bg-[var(--background)] text-[var(--text-muted)] hover:text-[var(--text)] border-[var(--border)]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search strategies or models..."
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-[var(--background)] border border-[var(--border)] rounded-md text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] bg-transparent border-none cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Lead Magazine Story Card */}
          {featuredPost && (
            <article className="rounded-[var(--radius)] border-2 border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow)] overflow-hidden transition-all hover:border-[var(--primary)] group">
              <div className="grid grid-cols-1 lg:grid-cols-12">
                {featuredPost.coverImage && (
                  <div className="lg:col-span-5 bg-slate-900 relative min-h-[220px] lg:min-h-full overflow-hidden">
                    <img 
                      src={featuredPost.coverImage} 
                      alt={featuredPost.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-[var(--primary)] text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                      <Sparkles className="w-3 h-3" /> Lead Strategic Editorial
                    </div>
                  </div>
                )}
                <div className={`p-6 md:p-8 flex flex-col justify-between space-y-4 ${featuredPost.coverImage ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-[11px] font-mono text-[var(--text-muted)] flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-500/30">
                        {featuredPost.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {featuredPost.formattedDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {featuredPost.readTime}
                      </span>
                    </div>

                    <h2 className="text-xl md:text-2xl font-extrabold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors leading-snug m-0">
                      {featuredPost.title}
                    </h2>

                    <p className="text-xs md:text-sm text-[var(--text-muted)] leading-relaxed">
                      {featuredPost.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {featuredPost.tags.slice(0, 4).map(tag => (
                        <span key={tag} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] text-[var(--text-muted)]">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-white font-mono font-black text-xs flex items-center justify-center">
                        {featuredPost.author.name.slice(0, 2).toUpperCase()}
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
                      <span>Read Deep Dive</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          )}

          {/* Asymmetric Magazine Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="p-5 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow)] flex flex-col justify-between hover:border-[var(--primary)] transition-all">
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-mono font-black text-sm">
                  01
                </div>
                <h3 className="text-base font-extrabold text-[var(--text)] m-0 leading-snug">
                  Poisson Match Goal Expectancy Modeling
                </h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Normalizing Home Attack Strength against Away Defense Weakness yields discrete scoreline probabilities that reveal fair value margins.
                </p>
                <div className="p-2.5 rounded bg-[var(--background)] border border-[var(--border)] font-mono text-[11px] text-[var(--text)] space-y-1">
                  <div className="text-[10px] text-[var(--text-muted)] uppercase font-bold">Key Formula:</div>
                  <code>λ_home = HAS × ADW × League_Avg</code>
                </div>
              </div>
              <div className="pt-3 border-t border-[var(--border)] mt-4 flex items-center justify-between">
                <span className="text-[10px] font-mono text-[var(--primary)] font-bold">Mathematical Desk</span>
                <span className="text-[10px] text-[var(--text-muted)]">5 min read</span>
              </div>
            </div>

            <div className="p-5 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow)] flex flex-col justify-between hover:border-[var(--primary)] transition-all">
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-lg bg-sky-500/15 text-sky-800 dark:text-sky-300 flex items-center justify-center font-mono font-black text-sm">
                  02
                </div>
                <h3 className="text-base font-extrabold text-[var(--text)] m-0 leading-snug">
                  Navigating SportPesa Mega Jackpot Variance
                </h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Filtering across 129 million permutations using banker anchors, disciplined double-chance coverage, and contrarian draw hedging.
                </p>
                <div className="p-2.5 rounded bg-[var(--background)] border border-[var(--border)] font-mono text-[11px] text-[var(--text)] space-y-1">
                  <div className="text-[10px] text-[var(--text-muted)] uppercase font-bold">Jackpot Model:</div>
                  <code>3^17 = 129,140,163 Outcomes</code>
                </div>
              </div>
              <div className="pt-3 border-t border-[var(--border)] mt-4 flex items-center justify-between">
                <span className="text-[10px] font-mono text-[var(--primary)] font-bold">Jackpot Analytics</span>
                <span className="text-[10px] text-[var(--text-muted)]">7 min read</span>
              </div>
            </div>

            <div className="p-5 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow)] flex flex-col justify-between hover:border-[var(--primary)] transition-all">
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-lg bg-purple-500/15 text-purple-800 dark:text-purple-300 flex items-center justify-center font-mono font-black text-sm">
                  03
                </div>
                <h3 className="text-base font-extrabold text-[var(--text)] m-0 leading-snug">
                  Capital Preservation: Fractional Kelly Staking
                </h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Why Quarter-Kelly staking shields bankrolls from downswings while compounding steady long-term growth on verified +EV wagers.
                </p>
                <div className="p-2.5 rounded bg-[var(--background)] border border-[var(--border)] font-mono text-[11px] text-[var(--text)] space-y-1">
                  <div className="text-[10px] text-[var(--text-muted)] uppercase font-bold">Staking Rule:</div>
                  <code>f* = ((bp - q) / b) × 0.25</code>
                </div>
              </div>
              <div className="pt-3 border-t border-[var(--border)] mt-4 flex items-center justify-between">
                <span className="text-[10px] font-mono text-[var(--primary)] font-bold">Bankroll Science</span>
                <span className="text-[10px] text-[var(--text-muted)]">6 min read</span>
              </div>
            </div>
          </div>

          {/* Full Markdown Guide Embedded Preview */}
          <div className="p-6 md:p-8 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow)] space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
              <FileText className="w-4 h-4 text-[var(--primary)]" />
              <h3 className="text-base font-extrabold text-[var(--text)] m-0">
                Core Publication: Quantitative Football Analysis & Modern Betting Frameworks
              </h3>
            </div>
            <div className="prose prose-sm max-w-none text-[var(--text)]">
              <MarkdownRenderer content={pageMd.meat || pageMd.fullContent} />
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* STRUCTURE 2: ANALYTICS ACADEMY & KNOWLEDGE BASE               */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeStructure === 'academy' && (
        <div className="space-y-6">
          <div className="p-4 rounded-[var(--radius)] bg-indigo-500/10 border border-indigo-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-6 h-6 text-indigo-500 shrink-0" />
              <div>
                <h2 className="text-sm font-extrabold text-[var(--text)] m-0">
                  Soka King Betting Analytics Curriculum
                </h2>
                <p className="text-xs text-[var(--text-muted)] m-0">
                  Structured learning path from raw football statistical metrics to advanced jackpot distribution theory.
                </p>
              </div>
            </div>
            <div className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 shrink-0 bg-white/40 dark:bg-black/20 px-2.5 py-1 rounded">
              4 Core Modules
            </div>
          </div>

          {/* Academy Two-Column Layout: Sidebar Nav + Module Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Curriculum Directory */}
            <div className="lg:col-span-4 space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-muted)] px-1">
                Curriculum Modules
              </span>
              <div className="space-y-2">
                {academyModules.map((mod) => {
                  const isActive = activeAcademyModule === mod.id;
                  return (
                    <button
                      key={mod.id}
                      onClick={() => setActiveAcademyModule(mod.id)}
                      className={`w-full p-3.5 rounded-[var(--radius)] text-left transition-all cursor-pointer border flex flex-col gap-1.5 ${
                        isActive
                          ? 'bg-[var(--card)] border-[var(--primary)] shadow-sm'
                          : 'bg-[var(--card)]/60 border-[var(--border)] hover:border-[var(--primary)]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-black uppercase border ${mod.levelColor}`}>
                          {mod.level}
                        </span>
                        <span className="text-[10px] font-mono text-[var(--text-muted)] flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {mod.readTime}
                        </span>
                      </div>
                      <h3 className={`text-xs font-bold leading-snug m-0 ${isActive ? 'text-[var(--primary)]' : 'text-[var(--text)]'}`}>
                        {mod.title}
                      </h3>
                      <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 m-0">
                        {mod.summary}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Module Deep-Dive Canvas */}
            <div className="lg:col-span-8 space-y-5">
              {(() => {
                const currentMod = academyModules[activeAcademyModule];
                return (
                  <div className="p-6 md:p-8 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow)] space-y-5">
                    <div className="space-y-2 pb-4 border-b border-[var(--border)]">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-black uppercase border ${currentMod.levelColor}`}>
                          {currentMod.level}
                        </span>
                        <span className="text-xs font-mono text-[var(--text-muted)]">
                          Estimated Study Time: {currentMod.readTime}
                        </span>
                      </div>
                      <h2 className="text-xl md:text-2xl font-extrabold text-[var(--text)] m-0 leading-tight">
                        {currentMod.title}
                      </h2>
                      <p className="text-xs md:text-sm text-[var(--text-muted)] leading-relaxed m-0">
                        {currentMod.summary}
                      </p>
                    </div>

                    {/* Mathematical Formula Callout Card */}
                    <div className="p-4 rounded-[var(--radius)] bg-[var(--background)] border-2 border-[var(--border)] space-y-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono font-black uppercase text-[var(--primary)]">
                        <Cpu className="w-3.5 h-3.5" /> Quantitative Specification
                      </div>
                      <div className="p-3 rounded bg-[var(--card)] border border-[var(--border)] font-mono text-xs text-[var(--text)] font-bold overflow-x-auto">
                        {currentMod.formula}
                      </div>
                    </div>

                    {/* Key Strategic Pillars */}
                    <div className="space-y-2.5">
                      <h3 className="text-xs font-mono font-black uppercase text-[var(--text)] tracking-wider">
                        Core Principles & Execution:
                      </h3>
                      <ul className="space-y-2 m-0 p-0 list-none">
                        {currentMod.keyPoints.map((pt, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs text-[var(--text)] leading-relaxed">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Step-by-Step Practical Application */}
                    <div className="p-4 rounded-[var(--radius)] bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Soka King Real-World Application Rule</span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed m-0">
                        Always compute probabilities independently of published bookmaker odds. Only place wagers when your model probability yields at least a <strong>3.5% edge</strong> over bookmaker implied odds to overcome standard vig deductions.
                      </p>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                      <button
                        disabled={activeAcademyModule === 0}
                        onClick={() => setActiveAcademyModule(prev => Math.max(0, prev - 1))}
                        className="px-4 py-2 rounded-lg text-xs font-bold bg-[var(--background)] border border-[var(--border)] text-[var(--text)] hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                      >
                        ← Previous Module
                      </button>
                      <button
                        disabled={activeAcademyModule === academyModules.length - 1}
                        onClick={() => setActiveAcademyModule(prev => Math.min(academyModules.length - 1, prev + 1))}
                        className="px-4 py-2 rounded-lg text-xs font-bold bg-[var(--primary)] text-white hover:bg-emerald-800 disabled:opacity-30 disabled:pointer-events-none cursor-pointer border-none"
                      >
                        Next Module →
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* STRUCTURE 3: STRATEGY HUB + INTERACTIVE CALCULATORS          */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeStructure === 'strategy-hub' && (
        <div className="space-y-6">
          <div className="p-4 rounded-[var(--radius)] bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
            <Calculator className="w-5 h-5 text-[var(--primary)] shrink-0" />
            <div className="text-xs leading-relaxed">
              <strong className="text-[var(--text)]">Interactive Strategy Tooling:</strong> Test the exact Poisson goal expectancy equations and Kelly bankroll formulas discussed in our analytical papers with these live calculation engines.
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tool 1: Poisson Match Expectancy Simulator */}
            <div className="p-6 rounded-[var(--radius)] bg-[var(--card)] border-2 border-[var(--border)] shadow-[var(--shadow)] space-y-5">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9.5px] font-mono font-black uppercase bg-sky-500/15 text-sky-800 dark:text-sky-300 border border-sky-500/30">
                  <BarChart3 className="w-3 h-3" /> Tool 1: Poisson Distribution Engine
                </div>
                <h3 className="text-base font-extrabold text-[var(--text)] m-0">
                  Match Goal Expectancy Simulator
                </h3>
                <p className="text-xs text-[var(--text-muted)] m-0">
                  Adjust expected goals (λ) for Home and Away sides to calculate fair probabilities and fair decimal odds.
                </p>
              </div>

              {/* Instant Scenario Presets */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-mono font-bold uppercase text-[var(--text-muted)]">
                  Quick Scenario Presets:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => { setHomeExpectancy(1.65); setAwayExpectancy(1.15); }}
                    className="px-2.5 py-1 rounded bg-[var(--background)] hover:bg-slate-100 dark:hover:bg-slate-800 border border-[var(--border)] text-[11px] font-mono text-[var(--text)] cursor-pointer"
                  >
                    Premier League Baseline (1.65 - 1.15)
                  </button>
                  <button
                    onClick={() => { setHomeExpectancy(2.45); setAwayExpectancy(0.75); }}
                    className="px-2.5 py-1 rounded bg-[var(--background)] hover:bg-slate-100 dark:hover:bg-slate-800 border border-[var(--border)] text-[11px] font-mono text-[var(--text)] cursor-pointer"
                  >
                    Heavy Home Favorite (2.45 - 0.75)
                  </button>
                  <button
                    onClick={() => { setHomeExpectancy(2.10); setAwayExpectancy(1.95); }}
                    className="px-2.5 py-1 rounded bg-[var(--background)] hover:bg-slate-100 dark:hover:bg-slate-800 border border-[var(--border)] text-[11px] font-mono text-[var(--text)] cursor-pointer"
                  >
                    High-Scoring Derby (2.10 - 1.95)
                  </button>
                  <button
                    onClick={() => { setHomeExpectancy(0.95); setAwayExpectancy(0.80); }}
                    className="px-2.5 py-1 rounded bg-[var(--background)] hover:bg-slate-100 dark:hover:bg-slate-800 border border-[var(--border)] text-[11px] font-mono text-[var(--text)] cursor-pointer"
                  >
                    Defensive Grind (0.95 - 0.80)
                  </button>
                </div>
              </div>

              {/* Sliders */}
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-[var(--text)]">Home Expected Goals (λ_home):</span>
                    <span className="font-extrabold text-[var(--primary)] text-sm">{homeExpectancy.toFixed(2)}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.4" 
                    max="3.5" 
                    step="0.05"
                    value={homeExpectancy}
                    onChange={(e) => setHomeExpectancy(parseFloat(e.target.value))}
                    className="w-full accent-[var(--primary)] cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-[var(--text-muted)]">
                    <span>0.4 (Low Attack)</span>
                    <span>1.65 (Average)</span>
                    <span>3.5 (Dominant)</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-[var(--text)]">Away Expected Goals (λ_away):</span>
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">{awayExpectancy.toFixed(2)}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.3" 
                    max="3.2" 
                    step="0.05"
                    value={awayExpectancy}
                    onChange={(e) => setAwayExpectancy(parseFloat(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-[var(--text-muted)]">
                    <span>0.3 (Defensive Away)</span>
                    <span>1.15 (Average)</span>
                    <span>3.2 (Dominant Away)</span>
                  </div>
                </div>
              </div>

              {/* Calculated Outputs */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Simulated 1X2 Probabilities & Fair Odds:
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-[var(--radius)] bg-[var(--background)] border border-[var(--border)] text-center space-y-1">
                    <span className="text-[10px] font-mono text-[var(--text-muted)] block">Home (1)</span>
                    <span className="text-base font-extrabold text-[var(--primary)] font-mono block">
                      {poissonCalculations.homeWin}%
                    </span>
                    <span className="text-[9px] font-mono text-[var(--text-muted)] block">
                      Fair: {poissonCalculations.fairHomeOdds}
                    </span>
                  </div>
                  <div className="p-3 rounded-[var(--radius)] bg-[var(--background)] border border-[var(--border)] text-center space-y-1">
                    <span className="text-[10px] font-mono text-[var(--text-muted)] block">Draw (X)</span>
                    <span className="text-base font-extrabold text-amber-600 dark:text-amber-400 font-mono block">
                      {poissonCalculations.draw}%
                    </span>
                    <span className="text-[9px] font-mono text-[var(--text-muted)] block">
                      Fair: {poissonCalculations.fairDrawOdds}
                    </span>
                  </div>
                  <div className="p-3 rounded-[var(--radius)] bg-[var(--background)] border border-[var(--border)] text-center space-y-1">
                    <span className="text-[10px] font-mono text-[var(--text-muted)] block">Away (2)</span>
                    <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400 font-mono block">
                      {poissonCalculations.awayWin}%
                    </span>
                    <span className="text-[9px] font-mono text-[var(--text-muted)] block">
                      Fair: {poissonCalculations.fairAwayOdds}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div className="p-2.5 rounded bg-[var(--background)] border border-[var(--border)] flex items-center justify-between text-xs">
                    <span className="text-[var(--text-muted)]">Over 2.5 Goals:</span>
                    <span className="font-mono font-bold text-[var(--text)]">{poissonCalculations.over25}%</span>
                  </div>
                  <div className="p-2.5 rounded bg-[var(--background)] border border-[var(--border)] flex items-center justify-between text-xs">
                    <span className="text-[var(--text-muted)]">BTTS (GG):</span>
                    <span className="font-mono font-bold text-[var(--text)]">{poissonCalculations.btts}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tool 2: Quarter-Kelly Staking Calculator */}
            <div className="p-6 rounded-[var(--radius)] bg-[var(--card)] border-2 border-[var(--border)] shadow-[var(--shadow)] space-y-5">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9.5px] font-mono font-black uppercase bg-purple-500/15 text-purple-800 dark:text-purple-300 border border-purple-500/30">
                  <Percent className="w-3 h-3" /> Tool 2: Fractional Kelly Model
                </div>
                <h3 className="text-base font-extrabold text-[var(--text)] m-0">
                  Quarter-Kelly Bankroll Staking Calculator
                </h3>
                <p className="text-xs text-[var(--text-muted)] m-0">
                  Determine the mathematically optimal stake size to maximize growth while preventing bankroll ruin.
                </p>
              </div>

              {/* Inputs */}
              <div className="space-y-3.5 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold text-[var(--text)]">Decimal Odds:</label>
                    <input 
                      type="number"
                      step="0.05"
                      min="1.05"
                      max="20"
                      value={decimalOdds}
                      onChange={(e) => setDecimalOdds(Math.max(1.01, parseFloat(e.target.value) || 1.01))}
                      className="w-full p-2.5 rounded bg-[var(--background)] border border-[var(--border)] text-xs font-mono font-bold text-[var(--text)]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold text-[var(--text)]">Model Win Prob (%):</label>
                    <input 
                      type="number"
                      step="1"
                      min="1"
                      max="99"
                      value={winProbPercent}
                      onChange={(e) => setWinProbPercent(Math.min(99, Math.max(1, parseFloat(e.target.value) || 1)))}
                      className="w-full p-2.5 rounded bg-[var(--background)] border border-[var(--border)] text-xs font-mono font-bold text-[var(--text)]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-[var(--text)]">Total Bankroll Size (KES):</label>
                  <input 
                    type="number"
                    step="500"
                    min="100"
                    value={bankrollSize}
                    onChange={(e) => setBankrollSize(Math.max(100, parseFloat(e.target.value) || 100))}
                    className="w-full p-2.5 rounded bg-[var(--background)] border border-[var(--border)] text-xs font-mono font-bold text-[var(--text)]"
                  />
                </div>
              </div>

              {/* Output Results */}
              <div className="p-4 rounded-[var(--radius)] bg-[var(--background)] border border-[var(--border)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text-muted)]">Calculated Edge (+EV):</span>
                  <span className={`text-xs font-mono font-bold ${parseFloat(kellyCalculation.edgePercent) > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                    {parseFloat(kellyCalculation.edgePercent) > 0 ? `+${kellyCalculation.edgePercent}%` : `${kellyCalculation.edgePercent}%`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text-muted)]">Full Kelly Staking:</span>
                  <span className="text-xs font-mono font-bold text-[var(--text)]">{kellyCalculation.fullKelly}% of Bankroll</span>
                </div>
                <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 block">Recommended Quarter-Kelly:</span>
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">75% variance buffer protection</span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-mono font-black text-emerald-800 dark:text-emerald-300 block">
                      {kellyCalculation.quarterKelly}%
                    </span>
                    <span className="text-[10px] font-mono font-bold text-[var(--primary)] block">
                      {kellyCalculation.stakeKsh.toLocaleString()} KES
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. COLLAPSIBLE FAQ ACCORDION SECTION (SOURCED FROM MARKDOWN)  */}
      {/* ───────────────────────────────────────────────────────────── */}
      {strategyFaqs.length > 0 && (
        <section className="p-6 md:p-8 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow)] space-y-5">
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

          <div className="space-y-3">
            {strategyFaqs.map((faq, idx) => {
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
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    className="w-full p-4 flex items-center justify-between gap-3 text-left bg-transparent border-none cursor-pointer transition-colors"
                  >
                    <h3 className="text-xs md:text-sm font-bold text-[var(--text)] leading-snug m-0">
                      {faq.question}
                    </h3>
                    <ChevronDown className={`w-4 h-4 text-[var(--text-muted)] shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[var(--primary)]' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-[var(--text-muted)] leading-relaxed border-t border-[var(--border)] border-dashed mt-1 pt-3">
                      <div className="prose prose-sm max-w-none text-[var(--text)] leading-relaxed m-0">
                        <MarkdownRenderer content={faq.answer} />
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
      {/* 4. COMPREHENSIVE BOTTOM POST HUB: AUTHOR, SHARING & POLICIES   */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="space-y-6 pt-2">
        {/* Full Author Credential Box */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-black uppercase text-[var(--text-muted)] flex items-center gap-1.5">
              <User className="w-4 h-4 text-[var(--primary)]" />
              <span>Research Desk & Author Credentials</span>
            </span>
            <span className="text-[11px] font-mono text-[var(--text-muted)]">
              E-E-A-T Verified Actuarial Team
            </span>
          </div>

          <AuthorCard 
            authorId="john-mwangi"
            name="John Mwangi"
            title="Senior Actuarial Modeler & Chief Quantitative Analyst"
            description="Specializes in continuous goal distribution matrices, Poisson modeling, and SportPesa jackpot variance mitigation strategies."
            reviewerName="David Ochieng"
            reviewerTitle="Senior Statistical Verifier"
          />
        </section>

        {/* Social Sharing & Toolbox */}
        <section className="p-5 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-xs font-mono font-bold uppercase text-[var(--text)] m-0 flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>Share Research Hub</span>
            </h3>
            <p className="text-[11px] text-[var(--text-muted)] m-0">
              Share quantitative models and jackpot combinatorics with colleagues:
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopyLink}
              title="Copy Hub URL"
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
          </div>
        </section>

        {/* Responsible Gambling Notice */}
        <ResponsibleGamblingNotice />
      </div>
    </div>
  );
};

export default CategoryBlogPage;
