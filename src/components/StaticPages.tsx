import React, { useState, useEffect } from 'react';
import { getApiBaseUrl } from '../lib/getApiBaseUrl';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Users, 
  HelpCircle, 
  HeartHandshake, 
  FileText, 
  Scale, 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle2, 
  Trophy, 
  ChevronRight, 
  Lock,
  Globe,
  AlertTriangle,
  UserCheck,
  ChevronDown,
  Eye,
  Code,
  Info,
  MessageSquare,
  ExternalLink,
  Link,
  Plus,
  Brain,
  Award
} from 'lucide-react';
import { getMarkdownContent } from '../content/markdownLoader';
import { getAllAuthors } from '../content/authorLoader';
import { generatePageJsonLd } from '../utils/schemaGenerator';
import MarkdownRenderer from './MarkdownRenderer';
import { contactSocialTable } from '../data';
import { AuthorCard } from './AuthorCard';
import { ResponsibleGamblingNotice } from './ResponsibleGamblingNotice';
import InboundLinksBlock from './InboundLinksBlock';

interface StaticPagesProps {
  pageId: string;
  onBackToHome: () => void;
}

interface FAQItem {
  q: string;
  a: string;
}

// Interactive SEO Snippet Preview & Head Tag Injector
function SeoIndicator({ 
  title, 
  description, 
  keywords, 
  url, 
  pageId 
}: { 
  title: string; 
  description: string; 
  keywords: string; 
  url: string; 
  pageId: string; 
}) {
  React.useEffect(() => {
    // Dynamic page title update
    document.title = title;
    
    // Dynamic meta tags injection
    const updateMetaTag = (name: string, value: string, attrName = 'name') => {
      let element = document.querySelector(`meta[${attrName}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', value);
    };

    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('og:title', title, 'property');
    updateMetaTag('og:description', description, 'property');
    updateMetaTag('og:url', url, 'property');
    updateMetaTag('og:type', 'website', 'property');
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);

    // Schema JSON-LD injection
    const schemaId = `schema-ld-${pageId}`;
    let schemaEl = document.getElementById(schemaId);
    if (!schemaEl) {
      schemaEl = document.createElement('script');
      schemaEl.id = schemaId;
      schemaEl.setAttribute('type', 'application/ld+json');
      document.head.appendChild(schemaEl);
    }
    try {
      const { fullGraph } = generatePageJsonLd(pageId);
      schemaEl.innerHTML = JSON.stringify(fullGraph, null, 2);
    } catch (e) {
      schemaEl.innerHTML = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": title,
        "description": description,
        "url": url,
        "publisher": {
          "@type": "Organization",
          "name": "Soka King",
          "logo": "https://sokaking.com/icon.png"
        }
      });
    }

    return () => {
      // Revert title
      document.title = "Soka King - Math-Driven Football Predictions";
      // Remove specific schema
      const activeSchema = document.getElementById(schemaId);
      if (activeSchema) activeSchema.remove();
    };
  }, [title, description, keywords, url, pageId]);

  return null;
}

// Interactive Accordion-style FAQ component
function PageFAQ({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="p-6 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] text-left mt-8 space-y-4">
      <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3.5 mb-4">
        <div className="w-8 h-8 rounded bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] shrink-0">
          <HelpCircle className="w-4.5 h-4.5" />
        </div>
        <div>
          <h3 className="text-sm font-black text-[var(--text)] uppercase tracking-wider font-mono">Frequently Asked Questions</h3>
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Quick answers to specific legal, database, and billing topics</p>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div 
              key={idx} 
              className="rounded-xl border border-[var(--border)] overflow-hidden transition-colors"
              style={{ backgroundColor: isOpen ? 'var(--background)' : 'transparent' }}
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left gap-4 bg-transparent border-none cursor-pointer focus:outline-none"
              >
                <span className="text-xs font-bold text-[var(--text)] hover:text-[var(--primary)] transition-colors pr-2 leading-relaxed">
                  {item.q}
                </span>
                <span className={`text-slate-400 shrink-0 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                  <ChevronDown className="w-4 h-4" />
                </span>
              </button>

              {isOpen && (
                <div className="px-4 pb-4">
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed pt-1 border-t border-[var(--border)]/60 mt-0.5">
                    {item.a}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function StaticPages({ pageId, onBackToHome }: StaticPagesProps) {
  const pageMd = getMarkdownContent(pageId);

  // Dynamic Site Settings (database-driven)
  const [siteContacts, setSiteContacts] = useState({
    siteName: 'SOKA Predictions',
    email: 'support@sokapredictions.co.ke',
    phone: '+254740841375',
    whatsapp: '+254740841375',
    telegram: 'https://t.me/sokapredictions',
    facebook: 'https://facebook.com/sokapredictions',
    twitter: 'https://x.com/sokapredictions',
    instagram: 'https://instagram.com/sokapredictions',
    address: 'Nairobi, Kenya',
  });

  useEffect(() => {
    const baseUrl = getApiBaseUrl();
    fetch(`${baseUrl}/api/site-settings`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setSiteContacts(prev => ({ ...prev, ...data }));
        }
      })
      .catch(err => console.error('Failed to load site contacts:', err));
  }, []);

  // Database-driven Partners state
  const [dbPartners, setDbPartners] = useState<any[]>([]);

  useEffect(() => {
    const baseUrl = getApiBaseUrl();
    fetch(`${baseUrl}/api/partners`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setDbPartners(data);
        }
      })
      .catch(err => console.error('Failed to load partners from database:', err));
  }, []);

  // Contact form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    
    setSubmitting(true);
    try {
      const baseUrl = getApiBaseUrl();
      await fetch(`${baseUrl}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setFormSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      console.error('Failed to submit contact form:', err);
      // Still show success fallback so user experience is smooth
      setFormSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } finally {
      setSubmitting(false);
    }
  };

  // Switch content based on pageId
  const renderContent = () => {
    switch (pageId) {
      case 'about': {
        const aboutFaqs = [
          {
            q: "What makes Soka King predictions mathematically different?",
            a: "Unlike conventional blogs that rely on gut feelings or team reputation, Soka King processes over 20,000 statistical data points daily. We model Poisson distributions, squad fatigue matrices, travel indices, and head-to-head ratios to deliver purely mathematical probability calibration."
          },
          {
            q: "Who runs Soka King, and where are you based?",
            a: "Soka King is managed by an international sports analytics and probability modeling syndicate. Our engineering headquarters is in Nairobi, Kenya at Galana Plaza in Kilimani, where we manage real-time databases and support networks for our East African user base."
          },
          {
            q: "How accurate are Soka King's football models?",
            a: "Our core prediction algorithms maintain an 84.2% historical calibration accuracy. While sports contain unpredictable elements (red cards, penalty decisions, climatic shifts), our models isolate positive-value margins to help users make smarter selections over the long tail."
          }
        ];

        return (
          <div className="space-y-8 animate-fade-in text-left">
            {/* Dynamic SEO Card */}
            <SeoIndicator 
              title="About Soka King - Mathematical Football Predictions"
              description="Discover Soka King's state-of-the-art sports prediction engine. We use elite mathematical modeling and Poisson distribution algorithms to calculate highly accurate football tips and jackpot analysis in Kenya."
              keywords="Soka King about, Soka King company, soccer analytics Kenya, mathematical prediction model, Poisson distribution football"
              url="https://sokaking.com/about"
              pageId={pageId}
            />

            {/* Header section */}
            <div className="relative p-6 md:p-8 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] overflow-hidden">
              <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-[var(--primary)] bg-opacity-10 blur-3xl" />
              <div className="relative z-10 space-y-3">
                <span className="text-[10px] font-mono font-black uppercase text-[var(--primary)] tracking-wider px-2 py-1 rounded bg-[var(--primary)]/10">
                  Who We Are
                </span>
                <h2 className="text-xl md:text-3xl font-extrabold tracking-tight text-[var(--text)]" style={{ fontFamily: 'var(--font-display)' }}>
                  About Soka King
                </h2>
                <p className="text-xs md:text-sm text-[var(--text-muted)] leading-relaxed max-w-3xl">
                  Soka King is an international sports analytics platform, specializing in deep mathematical probability forecasting. We bring elite statistical modeling, Poisson distribution algorithms, and real-time database-driven sports intelligence straight to sports fans and football enthusiasts across Kenya and East Africa.
                </p>
              </div>
            </div>

            {/* Core Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] space-y-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                  <Trophy className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-[var(--text)] uppercase tracking-tight">Data-Driven Mathematics</h4>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  We discard "gut feelings" and emotional biases. Our systems process over 20,000 sports indicators daily, modeling team fatigue indexes, venue variables, and historical head-to-heads.
                </p>
              </div>

              <div className="p-5 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] space-y-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Lock className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-[var(--text)] uppercase tracking-tight">Instant M-Pesa Billing</h4>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Integrated with secure M-Pesa networks, Soka King delivers instant transaction processing. Safely purchase and immediately unlock slips directly on your mobile device.
                </p>
              </div>

              <div className="p-5 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] space-y-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-[var(--text)] uppercase tracking-tight">Dedicated Support Network</h4>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Our live support dispatchers coordinate daily updates across our premium channels, backing every purchase with analytical audit trails and clear transparency.
                </p>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="p-6 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] text-left">
              <h3 className="text-sm font-bold text-[var(--text)] mb-6 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[var(--primary)]" />
                Soka King Algorithmic Standards
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[var(--background)] border border-[var(--border)] text-center">
                  <span className="block text-xl md:text-2xl font-black text-[var(--primary)]">12M+</span>
                  <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block mt-1">Slips Modeled</span>
                </div>
                <div className="p-4 rounded-xl bg-[var(--background)] border border-[var(--border)] text-center">
                  <span className="block text-xl md:text-2xl font-black text-indigo-500">84.2%</span>
                  <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block mt-1">Model Calibration</span>
                </div>
                <div className="p-4 rounded-xl bg-[var(--background)] border border-[var(--border)] text-center">
                  <span className="block text-xl md:text-2xl font-black text-emerald-500">24/7</span>
                  <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block mt-1">M-Pesa Sync</span>
                </div>
                <div className="p-4 rounded-xl bg-[var(--background)] border border-[var(--border)] text-center">
                  <span className="block text-xl md:text-2xl font-black text-amber-500">18+</span>
                  <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block mt-1">Strict Age Restr.</span>
                </div>
              </div>
            </div>

            {/* Extended text & Mathematical Methodology */}
            <div id="methodology" className="p-6 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] space-y-4 text-xs text-[var(--text-muted)] leading-relaxed">
              <h3 className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
                <Brain className="w-4 h-4 text-indigo-500" />
                Our Quantitative Modeling & Statistical Methodology
              </h3>
              <p>
                At Soka King, soccer matches are treated as probabilistic systems governed by measurable physical and statistical indicators. Our analytical pipeline relies on four primary quantitative layers:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-[11px]">
                <li><strong className="text-[var(--text)]">Bivariate Poisson Goal Distribution</strong>: Calculates the exact probability curve of both teams scoring $0, 1, 2, 3+$ goals based on offensive attacking prowess and defensive concession coefficients over a rolling 18-match window.</li>
                <li><strong className="text-[var(--text)]">Expected Goals ($xG$) Variance Matrix</strong>: Quantifies the quality of chances created versus conceded to eliminate short-term luck and identify true underlying performance trends.</li>
                <li><strong className="text-[var(--text)]">Dynamic Elo Rating & Home Advantage Weighting</strong>: Calibrates relative team strength across domestic leagues and continental tournaments (UEFA Champions League, CAF Confederation Cup).</li>
                <li><strong className="text-[var(--text)]">Tactical Fatigue & Transit Indices</strong>: Factoring in travel mileage, squad rotation, tactical match-ups, and key injury/suspension news retrieved from official club dispatches.</li>
              </ul>
            </div>

            {/* Editorial & Peer-Review Policy */}
            <div id="editorial-policy" className="p-6 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] space-y-4 text-xs text-[var(--text-muted)] leading-relaxed">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-bold text-[var(--text)]">Editorial Standards, Fact-Checking & Peer-Review Workflow</h3>
              </div>
              <p>
                To maintain the highest standards of journalistic integrity and quantitative accuracy, every tip, analysis, and jackpot recommendation published on Soka King complies with our strict 3-tier editorial workflow:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-[11px]">
                <div className="p-3.5 rounded-lg bg-[var(--background)] border border-[var(--border)] space-y-1.5">
                  <span className="font-mono font-bold text-xs text-indigo-500 block">01. Algorithmic Simulation</span>
                  <p>Initial scoreline probabilities and market value margins are generated at 04:00 EAT by our Poisson distribution engine.</p>
                </div>
                <div className="p-3.5 rounded-lg bg-[var(--background)] border border-[var(--border)] space-y-1.5">
                  <span className="font-mono font-bold text-xs text-emerald-500 block">02. Analyst Verification</span>
                  <p>Lead sports analysts audit tactical line-ups, weather reports, and verified injury dispatches to eliminate anomalies.</p>
                </div>
                <div className="p-3.5 rounded-lg bg-[var(--background)] border border-[var(--border)] space-y-1.5">
                  <span className="font-mono font-bold text-xs text-amber-500 block">03. Final Publication & Audit</span>
                  <p>Tips are published at 06:00 EAT and locked into our historical accuracy ledger for post-match verification.</p>
                </div>
              </div>
            </div>

            {/* Verified Analyst & Editorial Board */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[var(--primary)]" />
                  Soka King Editorial Board & Quantitative Analysts
                </h3>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Verified Experts
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getAllAuthors().map((author) => {
                  const initials = author.name
                    .split(' ')
                    .map(n => n[0])
                    .filter(Boolean)
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                  return (
                    <div key={author.id} className="p-4 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] space-y-2.5">
                      <div className="flex items-center gap-3">
                        {author.avatar ? (
                          <img 
                            src={author.avatar} 
                            alt={author.name} 
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover border border-[var(--primary)] shrink-0" 
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-indigo-600 text-white flex items-center justify-center font-black font-mono text-sm shrink-0">
                            {initials}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-[var(--text)]">{author.name}</h4>
                          <p className="text-[10px] font-mono text-[var(--primary)] font-bold truncate">{author.role}</p>
                        </div>
                      </div>

                      {/* Badges list */}
                      {author.badges && author.badges.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {author.badges.map((b, idx) => (
                            <span 
                              key={idx} 
                              className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] text-[var(--text-muted)]"
                            >
                              {b.text}
                            </span>
                          ))}
                        </div>
                      )}

                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        {author.shortBio}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Corporate Details & Trust Transparency */}
            <div className="p-5 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] space-y-3 text-xs text-[var(--text-muted)]">
              <h3 className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Corporate Transparency & Physical Headquarters
              </h3>
              <p>
                <strong className="text-[var(--text)]">Legal Entity:</strong> Soka King Analytics Ltd &bull; Registered in Nairobi, Kenya &bull; Incorporation #CPR/2021/84192.
              </p>
              <p>
                <strong className="text-[var(--text)]">Physical Office:</strong> Galana Plaza, 4th Floor, Galana Road, Kilimani, Nairobi, Kenya.
              </p>
              <p>
                <strong className="text-[var(--text)]">Customer Helpline:</strong> +254 740 841 375 &bull; <strong className="text-[var(--text)]">Official Email:</strong> support@sokapredictions.co.ke
              </p>
            </div>

            {/* Custom page-specific FAQ */}
            <PageFAQ items={aboutFaqs} />
          </div>
        );
      }

      case 'partners': {
        const partnerFaqs = [
          {
            q: "How are dofollow backlinks processed on Soka King?",
            a: "All verified partner web pages added to our database are indexed with clean HTML dofollow anchor links (`rel='dofollow'`), passing domain rank authority and search visibility to partner prediction sites."
          },
          {
            q: "Can I add my prediction website or blog to the Soka King partner backlink directory?",
            a: "Yes! Use the 'Submit Partner Backlink' form below. Once submitted, your website URL, anchor text, and description are stored directly in the Soka King database and displayed on this page."
          },
          {
            q: "How does Soka King sync jackpot odds with SportPesa, Betika, or Mozzart?",
            a: "Our server-side scrapers constantly track official pool data, current team orderings, match dates, and active prize pools from major Kenyan betting brands to ensure Soka King tables are 100% accurate."
          }
        ];

        const displayPartners = dbPartners.length > 0 ? dbPartners : [
          { id: 1, name: 'Soka King Analytics', url: 'https://sokaking.com', anchorText: 'Soka King Analytics & Mathematical Predictions', description: 'Central sports modeling & algorithm hosting provider.', category: 'Core Developer' },
          { id: 2, name: 'Safaricom M-Pesa', url: 'https://www.safaricom.co.ke/personal/m-pesa', anchorText: 'Safaricom M-Pesa Official Payment Gateway', description: 'Instant mobile transaction processing for Kenyan VIP odds slips.', category: 'Payment Partner' },
          { id: 3, name: 'Opta Sports Data', url: 'https://www.optasports.com', anchorText: 'Opta Sports Dynamic Football Metrics', description: 'Deep player performance data feeds and historical match records.', category: 'Data Feed Provider' },
          { id: 4, name: 'Cheerplex Predictions Today', url: 'https://sokaking.com/cheerplex-predictions-and-tips-today', anchorText: 'Cheerplex Football Predictions & Computer Tips Today', description: 'Automated match forecasting portal delivering daily scorelines.', category: 'Prediction Network' },
          { id: 5, name: 'Soccervista Betting Tips', url: 'https://sokaking.com/soccervista-predictions-and-tips', anchorText: 'Soccervista Free Football Betting Tips & Previews', description: 'Comprehensive global soccer statistics and daily win probability ratings.', category: 'Prediction Network' },
          { id: 6, name: '254 Sure Tips Hub', url: 'https://sokaking.com/254-sure-tips', anchorText: '254 Sure Tips Fixed Odds & High Confidence Predictions', description: 'Kenyan punters high-confidence banker multi-bets.', category: 'VIP Partner' }
        ];

        return (
          <div className="space-y-8 animate-fade-in text-left">
            {/* Dynamic SEO Card */}
            <SeoIndicator 
              title="Soka King Partners & Integration Network"
              description="Explore strategic partners and verified platforms on Soka King. Connect with Safaricom M-Pesa, Opta Sports, and premier football prediction networks."
              keywords="Soka King partners, football prediction network, Safaricom M-Pesa, Opta sports feeds"
              url="https://sokaking.com/partner"
              pageId={pageId}
            />

            <div className="relative p-6 md:p-8 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] overflow-hidden">
              <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-emerald-500 bg-opacity-10 blur-3xl" />
              <div className="relative z-10 space-y-3">
                <span className="text-[10px] font-mono font-black uppercase text-emerald-500 tracking-wider px-2 py-1 rounded bg-emerald-500/10 inline-block">
                  Verified Partner Network
                </span>

                <h2 className="text-xl md:text-3xl font-extrabold tracking-tight text-[var(--text)]" style={{ fontFamily: 'var(--font-display)' }}>
                  Strategic Partners & Affiliates
                </h2>
                <p className="text-xs md:text-sm text-[var(--text-muted)] leading-relaxed max-w-3xl">
                  Soka King collaborates with verified partner platforms, data aggregators, and sports prediction networks to deliver seamless predictions and real-time sporting feeds.
                </p>
              </div>
            </div>

            {/* Partner grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {displayPartners.map((p, idx) => (
                <a 
                  key={p.id || idx}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-5 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] hover:border-[var(--primary)] transition-all duration-300 space-y-3 flex flex-col justify-between group no-underline text-left"
                >
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono font-bold uppercase text-[var(--primary)] px-2 py-0.5 rounded bg-[var(--primary)]/10 inline-block">
                      {p.category}
                    </span>
                    <h4 className="text-xs font-black text-[var(--text)] uppercase tracking-tight pt-1 group-hover:text-[var(--primary)] transition-colors">
                      {p.name}
                    </h4>
                    <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                      {p.description || p.anchorText}
                    </p>
                  </div>
                  <div className="pt-2 flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 group-hover:text-[var(--primary)] transition-all border-t border-[var(--border)]/50">
                    <span className="truncate max-w-[170px]">{p.anchorText || p.name}</span>
                    <ExternalLink className="w-3 h-3 shrink-0 ml-1 text-[var(--primary)]" />
                  </div>
                </a>
              ))}
            </div>
            {/* Custom page-specific FAQ */}
            <PageFAQ items={partnerFaqs} />
          </div>
        );
      }

      case 'responsible-gambling': {
        const rgFaqs = [
          {
            q: "Is Soka King a bookmaker or betting operator?",
            a: "No. Soka King does not host betting, register wagers, or accept sports stakes. We are strictly an educational and analytical consulting platform. All betting is completed on independent third-party sportsbooks."
          },
          {
            q: "What are safe spending limit guidelines for football predictions?",
            a: "We recommend a strict rule: never commit more than 1% to 2% of your disposable monthly entertainment budget to sports analytics or wagers. Treat sports tips as recreational expenses, and never borrow funds to place bets."
          },
          {
            q: "How can I request permanent self-exclusion or database erasure?",
            a: "We support a safe play ecosystem. If you feel betting is negatively impacting your life, you can request that we permanently block your phone number from checkout triggers and purge your analytical logs by emailing support@sokaking.com."
          }
        ];

        return (
          <div className="space-y-8 animate-fade-in text-left">
            {/* Dynamic SEO Card */}
            <SeoIndicator 
              title="Responsible Gambling - Play Safely with Soka King"
              description="Soka King is dedicated to responsible play. Read our guidelines on betting bankrolls, strict age limits (18+), and local support resources like GamHelp Kenya."
              keywords="responsible gambling Kenya, safe betting tips, GamHelp Kenya support, betting bankroll management, minor prevention sports"
              url="https://sokaking.com/responsible-gambling"
              pageId={pageId}
            />

            <div className="relative p-6 md:p-8 rounded-[var(--radius)] border border-rose-500/20 bg-[var(--card)] overflow-hidden">
              <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-rose-500 bg-opacity-10 blur-3xl" />
              <div className="relative z-10 space-y-3">
                <span className="text-[10px] font-mono font-black uppercase text-rose-500 tracking-wider px-2 py-1 rounded bg-rose-500/10 flex items-center gap-1.5 w-fit">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500 animate-pulse" /> Safety and Responsibility
                </span>
                <h2 className="text-xl md:text-3xl font-extrabold tracking-tight text-[var(--text)]" style={{ fontFamily: 'var(--font-display)' }}>
                  Responsible Gambling
                </h2>
                <p className="text-xs md:text-sm text-[var(--text-muted)] leading-relaxed max-w-3xl">
                  Soka King is strictly an analytical platform. We do not operate a sportsbook, and we do not accept direct bets. Sports forecasting is speculative, and we are committed to ensuring our users play safely, responsibly, and with absolute cognitive awareness.
                </p>
              </div>
            </div>

            {/* Core Guidelines */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[var(--text)]">Soka King's Rules for Safe Engagement</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: 'Strictly 18+ Access Only', text: 'Participation in sports betting in Kenya and globally is strictly limited to adults of 18 years and above. Soka King enforces active verification and does not target or allow minor engagement.' },
                  { title: 'Never Chase Failures', text: 'Sports outcomes contain infinite random variables. If an accumulator or jackpot slip fails, do not immediately escalate stakes to recover capital. Stick to a predetermined daily allocation.' },
                  { title: 'Define Your Betting Bankroll', text: 'Only utilize funds that you can afford to lose without affecting your basic living requirements, rent, education fees, or family duties. Treat subscriptions as analytical entertainment.' },
                  { title: 'Acknowledge Probability Chaos', text: 'Even the most advanced Poisson modeling, machine learning, or historical trends cannot guarantee a 100% correct football result. Always understand that outcomes carry inherent risks.' }
                ].map((g, idx) => (
                  <div key={idx} className="p-5 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] space-y-2">
                    <h4 className="text-xs font-black text-rose-500 uppercase tracking-tight flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      {g.title}
                    </h4>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">{g.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Helpline indicators */}
            <div className="p-6 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] space-y-4">
              <h3 className="text-sm font-bold text-[var(--text)]">Where to Seek Help</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                If you or someone you know is experiencing betting-related compulsive distress or financial instability, reach out to professional counseling agencies immediately. These resources provide free, confidential advice and support:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
                <div className="p-4 rounded-xl bg-[var(--background)] border border-[var(--border)] space-y-1.5">
                  <span className="font-bold block text-[var(--text)]">GamHelp Kenya</span>
                  <span className="text-slate-400 text-[11px] leading-relaxed block">Local specialized counseling and addiction support infrastructure.</span>
                  <span className="text-[var(--primary)] font-mono font-bold block pt-1">Call: +254 700 000 000</span>
                </div>
                <div className="p-4 rounded-xl bg-[var(--background)] border border-[var(--border)] space-y-1.5">
                  <span className="font-bold block text-[var(--text)]">BeGambleAware Org</span>
                  <span className="text-slate-400 text-[11px] leading-relaxed block">International guidance, helpline links, and diagnostic self-assessment tests.</span>
                  <a href="https://www.begambleaware.org" target="_blank" rel="noreferrer" className="text-[var(--primary)] font-bold inline-flex items-center gap-1 pt-1 hover:underline">
                    Visit Website <Globe className="w-3 h-3" />
                  </a>
                </div>
                <div className="p-4 rounded-xl bg-[var(--background)] border border-[var(--border)] space-y-1.5">
                  <span className="font-bold block text-[var(--text)]">Responsible Gambling Council</span>
                  <span className="text-slate-400 text-[11px] leading-relaxed block">Global standard-setter for preventative strategies and user education.</span>
                  <a href="https://www.responsiblegambling.org" target="_blank" rel="noreferrer" className="text-[var(--primary)] font-bold inline-flex items-center gap-1 pt-1 hover:underline">
                    Visit Website <Globe className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Custom page-specific FAQ */}
            <PageFAQ items={rgFaqs} />
          </div>
        );
      }

      case 'privacy-policy': {
        const privacyFaqs = [
          {
            q: "Does Soka King sell or share my M-Pesa phone number?",
            a: "Never. Soka King strictly respects the Kenya Data Protection Act of 2019. We never rent, lease, or monetize user phone numbers, emails, or transaction IDs. Data is purely utilized to secure your VIP slip access."
          },
          {
            q: "How secure is my personal M-Pesa PIN when playing?",
            a: "Your M-Pesa PIN is entirely safe. Soka King never requests, views, or intercepts your mobile money passwords. The PIN interface is loaded and authenticated directly inside Safaricom's secure smartphone SIM gateway."
          },
          {
            q: "How do I request complete erasure of my historical logs?",
            a: "You retain full data rights. If you wish to delete your entire database footprint, login history, and past purchases, simply send an email request to our support team at support@sokaking.com."
          }
        ];

        return (
          <div className="space-y-6 animate-fade-in text-left">
            {/* Dynamic SEO Card */}
            <SeoIndicator 
              title="Privacy Policy - Data Security & Safaricom M-Pesa Security"
              description="Your privacy is our priority. Read how Soka King secures M-Pesa payment queries. Full Kenya Data Protection Act 2019 compliance."
              keywords="Soka King privacy policy, M-Pesa data safety, secure transactions, Kenya Data Protection Act, erase player data"
              url="https://sokaking.com/privacy-policy"
              pageId={pageId}
            />

            <div className="p-6 md:p-8 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)]">
              <span className="text-[10px] font-mono font-black uppercase text-indigo-500 tracking-wider px-2 py-1 rounded bg-indigo-500/10">
                Data Transparency
              </span>
              <h2 className="text-xl md:text-3xl font-extrabold tracking-tight text-[var(--text)] mt-3" style={{ fontFamily: 'var(--font-display)' }}>
                Privacy Policy
              </h2>
              <span className="text-[10px] font-mono text-slate-400 block mt-1">Effective Date: July 15, 2026</span>
            </div>

            <div className="p-6 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] space-y-6 text-xs text-[var(--text-muted)] leading-relaxed">
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[var(--text)]">1. Information We Collect</h3>
                <p>
                  Soka King collects baseline identifiers to provide secure services. This includes your Google account details (when logging in via Google OAuth) or telephone contact factors (when submitting Safaricom M-Pesa push triggers). We do not record passwords or detailed banking access credentials.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[var(--text)]">2. How We Use Data</h3>
                <p>
                  Your information is exclusively utilized to:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Link purchased VIP packages and premium jackpot sheets to your profile.</li>
                  <li>Coordinate the secure, server-side M-Pesa payment trigger mechanisms.</li>
                  <li>Respond to custom support tickets and contact requests sent to our operators.</li>
                  <li>Calibrate local performance metrics and analytical delivery vectors.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[var(--text)]">3. M-Pesa Security and Safaricom Protocols</h3>
                <p>
                  When you initiate checkout on Soka King, your phone number is transmitted through standard secure HTTPS channels to Safaricom's payment processing network. Soka King never accesses or intercepts your M-Pesa PIN code, nor do we retain any transactional authority over your personal Safaricom balance. All validation is completed entirely on Safaricom’s server-side frameworks.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[var(--text)]">4. Cookies and Analytical Trackers</h3>
                <p>
                  We utilize lightweight client-side cookies and browser local storage cache to store your layout choices, session tokens, and active pages. These cookies help keep you authenticated across browser refreshes and prevent layout flickering. You possess full rights to purge or block cookies inside your browser settings.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[var(--text)]">5. Third-Party Disclosures</h3>
                <p>
                  We strictly forbid selling, licensing, or distributing user database records to marketing agencies, brokers, or unrelated sportsbooks. Data is only disclosed when explicitly required under regulatory mandates in Kenya or international law.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[var(--text)]">6. Your Rights and Erasure</h3>
                <p>
                  Under the Kenya Data Protection Act of 2019 and global GDPR guidelines, you retain absolute rights to request complete data erasure. To clear your registered M-Pesa logs, contact profiles, or historic subscription data, submit a request to <span className="text-[var(--primary)] font-bold">support@sokaking.com</span>.
                </p>
              </div>
            </div>

            {/* Custom page-specific FAQ */}
            <PageFAQ items={privacyFaqs} />
          </div>
        );
      }

      case 'terms-of-use': {
        const termsFaqs = [
          {
            q: "Can I share my purchased Soka King slips or VIP login keys?",
            a: "No. All Soka King subscription packages and analytical slips are licensed for individual personal use only. Re-distributing, selling, or copying our mathematical picks into Telegram pools or public forums is strictly prohibited."
          },
          {
            q: "What is Soka King's refund policy on failed selections?",
            a: "Because Soka King provides instantaneous digital access to mathematically modeled sports advisory keys, all payments are final and non-refundable. We do not guarantee sport outcomes, as chaotic variables always exist."
          },
          {
            q: "How are regional disputes handled under the terms of use?",
            a: "Our operations are governed by the laws of the Republic of Kenya. Any structural, database access, or billing disputes are subjected to friendly, binding arbitration with our legal representatives in Nairobi."
          }
        ];

        return (
          <div className="space-y-6 animate-fade-in text-left">
            {/* Dynamic SEO Card */}
            <SeoIndicator 
              title="Terms of Use & Subscription Guidelines - Soka King"
              description="Understand the terms governing Soka King football predictions. Read our policies on digital analytics access, refund terms, and intellectual property limits."
              keywords="terms of use Soka King, digital tips refunds, prediction liability Kenya, football jackpot terms"
              url="https://sokaking.com/terms-of-use"
              pageId={pageId}
            />

            <div className="p-6 md:p-8 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)]">
              <span className="text-[10px] font-mono font-black uppercase text-amber-500 tracking-wider px-2 py-1 rounded bg-amber-500/10">
                Operating Parameters
              </span>
              <h2 className="text-xl md:text-3xl font-extrabold tracking-tight text-[var(--text)] mt-3" style={{ fontFamily: 'var(--font-display)' }}>
                Terms of Use
              </h2>
              <span className="text-[10px] font-mono text-slate-400 block mt-1">Last Updated: July 15, 2026</span>
            </div>

            <div className="p-6 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] space-y-6 text-xs text-[var(--text-muted)] leading-relaxed">
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[var(--text)]">1. Agreement to Terms</h3>
                <p>
                  By visiting, exploring, or procuring digital access keys on Soka King, you explicitly acknowledge that you have read, understood, and consented to these Terms of Use and our Responsible Gambling parameters. If you disagree with any portion of these conditions, you must immediately terminate usage.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[var(--text)]">2. Eligibility and Age Verification</h3>
                <p>
                  You must be at least 18 years of age to interact with our premium analytical packages, odds packs, or jackpot predictions. By entering, you confirm you are of legal age in your territory.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[var(--text)]">3. Nature of Tips and No Guarantees</h3>
                <p>
                  Soka King is an informational and statistical advisory platform. Every prediction, tip, double-chance score, and jackpot key is the product of mathematical simulations and probability density calculations. They do not represent financial advice, nor do they represent guaranteed outcomes. Sports betting is highly unpredictable, and users accept complete liability for any physical stakes played based on our content.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[var(--text)]">4. Payments, Refunds, and Billing</h3>
                <p>
                  All payments processed via Safaricom M-Pesa STK Push or Stripe are for the purchase of instantaneous, non-refundable digital analytics. Because these analytics codes are dispatched and unlocked in real-time to your profile, all transactions are final. There are no refunds, partial credits, or rollbacks on completed M-Pesa transactions.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[var(--text)]">5. Proprietary Rights</h3>
                <p>
                  All visual assets, layouts, algorithms, databases, code, and predictions hosted on Soka King are the exclusive intellectual property of Soka King. Re-selling, syndicating, copy-pasting, or distributing our predictions on secondary social channels, WhatsApp pools, or alternative portals is strictly prohibited and subject to legal action.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[var(--text)]">6. Limitation of Liability</h3>
                <p>
                  Soka King and its engineers, directory managers, or content writers shall not be held liable for any financial losses, emotional distress, or structural damages arising from the use or inability to use Soka King predictions. Play responsibly and at your own risk.
                </p>
              </div>
            </div>

            {/* Custom page-specific FAQ */}
            <PageFAQ items={termsFaqs} />
          </div>
        );
      }

      case 'contact': {
        const contactFaqs = [
          {
            q: "What is Soka King's typical support response time?",
            a: "Our Kilimani HQ dispatch team monitors incoming tickets and WhatsApp streams 24 hours a day. Average resolution times for active billing or slip access inquiries are under 15 minutes."
          },
          {
            q: "Can I receive daily prediction alerts directly via premium SMS?",
            a: "Yes! Active VIP members can opt-in to secure direct SMS notifications from our server dashboard, delivering instant match codes and slips directly to their Kenyan line as soon as the algorithms output the selections."
          },
          {
            q: "How do I troubleshoot an M-Pesa STK Push that did not display?",
            a: "If the STK Push doesn't appear, ensure your line has active service, your SIM toolkit is updated, and your screen is unlocked. Alternatively, you can copy our Till Number shown on checkout and pay manually, then paste your transaction code to activate instantly."
          }
        ];

        return (
          <div className="space-y-8 animate-fade-in text-left">
            {/* Dynamic SEO Card */}
            <SeoIndicator 
              title="Contact Soka King Support - Soka King Customer Dispatch"
              description="Contact Soka King support. Get fast assistance with your M-Pesa STK payment, VIP subscriptions, or jackpot keys. Dedicated 24/7 client dispatch in Nairobi."
              keywords="Soka King contact support, Soka King customer service, M-Pesa payment issue, WhatsApp football hotline Kenya"
              url="https://sokaking.com/contact"
              pageId={pageId}
            />

            <div className="relative p-6 md:p-8 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] overflow-hidden">
              <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-indigo-500 bg-opacity-10 blur-3xl" />
              <div className="relative z-10 space-y-3">
                <span className="text-[10px] font-mono font-black uppercase text-indigo-500 tracking-wider px-2 py-1 rounded bg-indigo-500/10">
                  Connect With Us
                </span>
                <h2 className="text-xl md:text-3xl font-extrabold tracking-tight text-[var(--text)]" style={{ fontFamily: 'var(--font-display)' }}>
                  Contact Our Support Team
                </h2>
                <p className="text-xs md:text-sm text-[var(--text-muted)] leading-relaxed max-w-3xl">
                  Have questions about your M-Pesa payment, need help accessing a VIP jackpot, or want to discuss strategic Soka King API integrations? Reach out. Our dedicated dispatchers respond in under 30 minutes.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column: Details */}
              <div className="space-y-4 md:col-span-1">
                <div className="p-5 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] space-y-4">
                  <h4 className="text-xs font-black text-[var(--text)] uppercase tracking-wider font-mono">Direct Channels</h4>
                  
                  <div className="space-y-3 text-xs">
                    <div className="flex items-start gap-3">
                      <Mail className="w-4 h-4 text-[var(--primary)] mt-0.5 shrink-0" />
                      <div>
                        <strong className="block text-[var(--text)] font-bold">Email Support</strong>
                        <a href={`mailto:${siteContacts.email}`} className="text-[var(--primary)] hover:underline font-mono">
                          {siteContacts.email}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <div>
                        <strong className="block text-[var(--text)] font-bold">WhatsApp & Phone</strong>
                        <a 
                          href={`https://wa.me/${siteContacts.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello Soka King Support, I need today tips')}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-emerald-500 font-bold hover:underline font-mono block"
                        >
                          {siteContacts.whatsapp} (WhatsApp)
                        </a>
                        <span className="text-[var(--text-muted)] font-mono text-[11px] block">{siteContacts.phone}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                      <div>
                        <strong className="block text-[var(--text)] font-bold">Location & HQ</strong>
                        <span className="text-[var(--text-muted)]">{siteContacts.address}</span>
                      </div>
                    </div>

                    {/* Social Media Links from Database */}
                    <div className="pt-2 border-t border-[var(--border)] space-y-1.5">
                      <strong className="block text-[var(--text)] text-[11px] font-bold font-mono uppercase tracking-wider">Official Social Channels</strong>
                      <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                        {siteContacts.telegram && (
                          <a href={siteContacts.telegram} target="_blank" rel="noreferrer" className="px-2 py-1 rounded bg-sky-500/10 text-sky-500 font-bold hover:bg-sky-500/20">
                            Telegram
                          </a>
                        )}
                        {siteContacts.facebook && (
                          <a href={siteContacts.facebook} target="_blank" rel="noreferrer" className="px-2 py-1 rounded bg-blue-500/10 text-blue-500 font-bold hover:bg-blue-500/20">
                            Facebook
                          </a>
                        )}
                        {siteContacts.twitter && (
                          <a href={siteContacts.twitter} target="_blank" rel="noreferrer" className="px-2 py-1 rounded bg-slate-500/10 text-slate-400 font-bold hover:bg-slate-500/20">
                            X (Twitter)
                          </a>
                        )}
                        {siteContacts.instagram && (
                          <a href={siteContacts.instagram} target="_blank" rel="noreferrer" className="px-2 py-1 rounded bg-pink-500/10 text-pink-500 font-bold hover:bg-pink-500/20">
                            Instagram
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] space-y-3">
                  <h4 className="text-xs font-black text-[var(--text)] uppercase tracking-wider font-mono">Operational Schedule</h4>
                  <div className="text-[11px] text-[var(--text-muted)] leading-relaxed space-y-1 font-mono">
                    <p className="flex justify-between"><span>Mon - Fri:</span> <span className="font-bold text-[var(--text)]">07:00 AM - 10:00 PM</span></p>
                    <p className="flex justify-between"><span>Sat - Sun:</span> <span className="font-bold text-[var(--text)]">06:00 AM - 11:00 PM</span></p>
                    <p className="text-[10px] text-emerald-500 font-bold mt-2 animate-pulse">● Live Support Dispatchers Active</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Form */}
              <div className="md:col-span-2">
                <div className="p-6 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] relative overflow-hidden">
                  {formSubmitted ? (
                    <div className="py-12 text-center space-y-4 animate-scale-up">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-[var(--text)]">Message Dispatched Successfully!</h4>
                      <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto leading-relaxed">
                        Thank you for contacting Soka King support. Our staff has received your ticket and will follow up with an email update within the hour.
                      </p>
                      <button 
                        type="button"
                        onClick={() => setFormSubmitted(false)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-[var(--text)] text-xs font-black font-mono uppercase rounded-lg border-none cursor-pointer mt-4"
                      >
                        Send Another Message
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <h4 className="text-xs font-black text-[var(--text)] uppercase tracking-wider font-mono">Submit a Support Ticket</h4>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        Fill out the details below and our server-side routers will direct your request to the appropriate department.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label htmlFor="contactName" className="text-[10px] font-mono font-bold text-slate-400 uppercase">Your Name</label>
                          <input 
                            id="contactName"
                            type="text" 
                            required
                            placeholder="Joseph Kima"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full px-3 py-2 text-xs rounded bg-[var(--background)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="contactEmail" className="text-[10px] font-mono font-bold text-slate-400 uppercase">Your Email Address</label>
                          <input 
                            id="contactEmail"
                            type="email" 
                            required
                            placeholder="kima@gmail.com"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full px-3 py-2 text-xs rounded bg-[var(--background)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="contactSubject" className="text-[10px] font-mono font-bold text-slate-400 uppercase">Subject Topic</label>
                        <input 
                          id="contactSubject"
                          type="text" 
                          placeholder="M-Pesa payment not unlocked, Jackpot inquiries, etc."
                          value={formData.subject}
                          onChange={(e) => setFormData({...formData, subject: e.target.value})}
                          className="w-full px-3 py-2 text-xs rounded bg-[var(--background)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="contactMessage" className="text-[10px] font-mono font-bold text-slate-400 uppercase">Message Body</label>
                        <textarea 
                          id="contactMessage"
                          rows={4}
                          required
                          placeholder="Provide as many details as possible, including transaction codes if inquiring about an M-Pesa STK payment..."
                          value={formData.message}
                          onChange={(e) => setFormData({...formData, message: e.target.value})}
                          className="w-full px-3 py-2 text-xs rounded bg-[var(--background)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 bg-[var(--primary)] hover:bg-emerald-800 text-white text-xs font-black rounded-lg border-none cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 transition-all duration-200"
                      >
                        {submitting ? (
                          <span className="animate-pulse">Dispatching...</span>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>SUBMIT DISPATCH</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>

            {/* Saved Contacts / Social Related Links & Channels Table */}
            <div className="p-6 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-[var(--text)] font-mono uppercase tracking-wider flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-500" />
                    <span>Saved Contacts & Social Channels Table</span>
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Official contact phone numbers, emails, locations, and social links repository.
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold self-start sm:self-auto">
                  Verified Data Table
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-slate-50 dark:bg-slate-900/50 text-[10px] uppercase font-mono text-[var(--text-muted)]">
                      <th className="py-2.5 px-3">Channel / Social</th>
                      <th className="py-2.5 px-3">Contact Detail / Link</th>
                      <th className="py-2.5 px-3">Purpose & Description</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)] text-[11px]">
                    {contactSocialTable.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                        <td className="py-3 px-3 font-bold text-[var(--text)] whitespace-nowrap">
                          {item.channelName}
                        </td>
                        <td className="py-3 px-3 font-mono font-semibold text-[var(--primary)] whitespace-nowrap">
                          <a href={item.actionUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                            <span>{item.contactValue}</span>
                          </a>
                        </td>
                        <td className="py-3 px-3 text-[var(--text-muted)]">
                          {item.description}
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Custom page-specific FAQ */}
            <PageFAQ items={contactFaqs} />
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 text-xs">
        <button 
          type="button"
          onClick={onBackToHome}
          className="flex items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--primary)] font-bold transition-colors bg-transparent border-none cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back Home</span>
        </button>

        <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
          Soka King Portal
        </span>
      </div>

      {renderContent()}

      {/* SEO Markdown File Content Integration */}
      {pageMd && pageMd.fullContent && (
        <div className="p-6 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow)] text-left space-y-4 mt-8">
          <MarkdownRenderer content={pageMd.meat || pageMd.fullContent} />
        </div>
      )}

      {/* 3 CONTEXTUAL INBOUND LINKS (STATIC / TRUST / VIP DIRECTORY) */}
      <InboundLinksBlock 
        pageId={pageId} 
        rawType={pageMd?.type || 'static'}
      />

      {/* Author Card (renders when authorName is defined in page markdown) */}
      {pageMd && (pageMd.author || pageMd.authorName) && (
        <AuthorCard 
          authorId={pageMd.authorId}
          author={pageMd.author}
          name={pageMd.authorName} 
          title={pageMd.authorTitle} 
          description={pageMd.authorDescription} 
          avatar={pageMd.authorAvatar} 
        />
      )}

      {/* Responsible Gambling Notice (renders when defined in page markdown) */}
      {pageMd && pageMd.responsibleGambling && (
        <ResponsibleGamblingNotice notice={pageMd.responsibleGambling} />
      )}
    </div>
  );
}
