'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import { 
  Menu, 
  Zap, 
  MessageSquare, 
  Send, 
  Sparkles, 
  ChevronRight, 
  BookOpen, 
  Trophy, 
  Crown,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle2,
  Star,
  Mail,
  X,
  Flame,
  Layers,
  Facebook,
  Twitter,
  Instagram,
  Youtube
} from 'lucide-react';

import { designIterations, vipPackages, oddsPacks, fixturesData } from './data';
import { jackpotsData } from './jackpotsData';
import { DesignIteration, Fixture, VipPackage, OddsPack } from './types';
import { getMarkdownContent, getDynamicUrlMaps, buildCanonicalUrl } from './content/markdownLoader';
import { getRefinedConfidence } from './utils/probability';

import { apiFetch } from './utils/api.ts';
import { getApiBaseUrl } from './lib/getApiBaseUrl';
import { PredictionCategory, getCategoryCountText, PREDICTION_CATEGORIES, getCategoryFixtures, isSameDay } from './utils/predictionGenerator';

// Import essential initial UI components
import Sidebar from './components/Sidebar';
import PredictionsList from './components/PredictionsList';
import VipPackages from './components/VipPackages';
import OddsPacks from './components/OddsPacks';
import PredictionsSidebar from './components/PredictionsSidebar';
import LiveUpdates from './components/LiveUpdates';
import JackpotSidebar from './components/JackpotSidebar';
import { AuthorCard } from './components/AuthorCard';
import { ResponsibleGamblingNotice } from './components/ResponsibleGamblingNotice';
import InboundLinksBlock from './components/InboundLinksBlock';

// Code-split routes and heavy overlay components to reduce initial mobile JS bundle
const JackpotPage = lazy(() => import('./components/JackpotPage'));
const JackpotListPage = lazy(() => import('./components/JackpotListPage'));
const VipPackagesPage = lazy(() => import('./components/VipPackagesPage'));
const CategoryPredictionsPage = lazy(() => import('./components/CategoryPredictionsPage'));
const StaticPages = lazy(() => import('./components/StaticPages'));
const NotFoundPage = lazy(() => import('./components/NotFoundPage'));
const PaymentModal = lazy(() => import('./components/PaymentModal'));
const FaqSection = lazy(() => import('./components/FaqSection'));
const MarkdownRenderer = lazy(() => import('./components/MarkdownRenderer'));

import { 
  URL_TO_PAGE_MAP, 
  PAGE_TO_URL_MAP, 
  DYNAMIC_CATEGORY_PAGES, 
  DYNAMIC_JACKPOT_PAGES, 
  DYNAMIC_JACKPOT_IDS,
  ALL_JACKPOT_IDS,
  getNormalizedPath,
  getPageUrl,
  getPageIdFromUrl
} from './utils/navigation';
import { generatePageJsonLd } from './utils/schemaGenerator';

const getInitialPage = () => {
  if (typeof window === 'undefined') return 'home';
  return getPageIdFromUrl(window.location.pathname);
};

const getInitialJackpot = (initialPage: string) => {
  if (ALL_JACKPOT_IDS.includes(initialPage)) {
    return initialPage;
  }
  return 'sportpesa-mega';
};
export interface AppProps {
  initialPage?: string;
  initialJackpotId?: string;
  initialPredictions?: Fixture[];
  initialJackpots?: any[];
}

export default function App({ initialPage, initialJackpotId, initialPredictions, initialJackpots }: AppProps = {}) {
  const [currentIteration, setCurrentIteration] = useState<DesignIteration>(designIterations[0]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // DB Driven states initialized with baseline fallback data to prevent CLS layout shift
  const [dbJackpots, setDbJackpots] = useState<any[]>(() => (Array.isArray(initialJackpots) && initialJackpots.length > 0 ? initialJackpots : jackpotsData));
  const [dbVipPackages, setDbVipPackages] = useState<VipPackage[]>(() => vipPackages);
  const [dbOddsPacks, setDbOddsPacks] = useState<OddsPack[]>(() => oddsPacks);
  const [dbPredictions, setDbPredictions] = useState<Record<string, Fixture[]>>(() => {
    const hasInitial = Array.isArray(initialPredictions) && initialPredictions.length > 0;
    const defaultSeedPool = [
      ...(fixturesData.today || []),
      ...(fixturesData.yesterday || []),
      ...(fixturesData.tomorrow || [])
    ];
    const initialPool = hasInitial ? initialPredictions : defaultSeedPool;
    const clientToday = new Date();
    const clientYesterday = new Date();
    clientYesterday.setDate(clientToday.getDate() - 1);
    const clientTomorrow = new Date();
    clientTomorrow.setDate(clientToday.getDate() + 1);

    const todayPreds = initialPool.filter((f: any) => isSameDay(f.kickoffTime, clientToday));
    const yesterdayPreds = initialPool.filter((f: any) => isSameDay(f.kickoffTime, clientYesterday));
    const tomorrowPreds = initialPool.filter((f: any) => isSameDay(f.kickoffTime, clientTomorrow));

    const initialMap: Record<string, Fixture[]> = {
      'all': initialPool,
      'category-today': todayPreds.length > 0 ? todayPreds : (fixturesData.today || []),
      'category-yesterday': yesterdayPreds.length > 0 ? yesterdayPreds : (fixturesData.yesterday || []),
      'category-tomorrow': tomorrowPreds.length > 0 ? tomorrowPreds : (fixturesData.tomorrow || []),
    };

    return initialMap;
  });
  const [userPurchasedItemIds, setUserPurchasedItemIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('guest_purchased_item_ids');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {}
      }
    }
    return [];
  });
  const [loadingDb, setLoadingDb] = useState<boolean>(true);
  const [loadingCategory, setLoadingCategory] = useState<boolean>(false);
  const [siteContacts, setSiteContacts] = useState<{
    email: string;
    phone: string;
    whatsapp: string;
    telegram: string;
    facebook: string;
    twitter: string;
    instagram: string;
    youtube?: string;
  }>({
    email: 'support@sokaking.com',
    phone: '+254740841375',
    whatsapp: '+254740841375',
    telegram: 'https://t.me/sokapredictions',
    facebook: 'https://facebook.com/sokaking',
    twitter: 'https://x.com/sokaking',
    instagram: 'https://instagram.com/sokaking',
    youtube: 'https://youtube.com/@sokaking'
  });

  // Portal active views state
  const defaultPage = initialPage || getInitialPage();
  const defaultJackpot = initialJackpotId || getInitialJackpot(defaultPage);
  const [activePage, setActivePage] = useState<string>(defaultPage);
  const [unlockedJackpots, setUnlockedJackpots] = useState<string[]>([]);

  // Keep unlocked jackpots in sync with purchases
  useEffect(() => {
    const jackpots = userPurchasedItemIds.filter((id: string) => ALL_JACKPOT_IDS.includes(id));
    setUnlockedJackpots(jackpots);
  }, [userPurchasedItemIds]);

  // Section active states
  const [activeJackpotId, setActiveJackpotId] = useState<string>(defaultJackpot);

  // Listen to popstate event for back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const pageId = getPageIdFromUrl(window.location.pathname);
      setActivePage(pageId);
      if (ALL_JACKPOT_IDS.includes(pageId)) {
        setActiveJackpotId(pageId);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Dynamic SEO Client-side update driven by markdown frontmatter and Schema.org
  useEffect(() => {
    const pageMd = getMarkdownContent(activePage);
    const fallbackUrl = PAGE_TO_URL_MAP[activePage] || `/${activePage}`;
    const canonicalPath = pageMd.link || fallbackUrl;
    const fullCanonicalUrl = buildCanonicalUrl(canonicalPath, activePage);
    
    if (pageMd.title) {
      document.title = pageMd.title;
    }

    const updateMetaTag = (name: string, value: string, attrName = 'name') => {
      let element = document.querySelector(`meta[${attrName}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', value);
    };

    if (pageMd.description) {
      updateMetaTag('description', pageMd.description);
      updateMetaTag('og:description', pageMd.description, 'property');
      updateMetaTag('twitter:description', pageMd.description);
    }

    if (pageMd.title) {
      updateMetaTag('og:title', pageMd.title, 'property');
      updateMetaTag('twitter:title', pageMd.title);
    }

    if (pageMd.keywords) {
      updateMetaTag('keywords', pageMd.keywords);
    }

    updateMetaTag('og:url', fullCanonicalUrl, 'property');
    updateMetaTag('og:type', activePage === 'vip-packages' ? 'product' : 'website', 'property');
    updateMetaTag('og:site_name', 'Soka King', 'property');
    updateMetaTag('og:image', 'https://sokaking.com/icon.png', 'property');
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:image', 'https://sokaking.com/icon.png');

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', fullCanonicalUrl);

    // Dynamic Schema.org JSON-LD structured data injection
    try {
      const { fullGraph } = generatePageJsonLd(activePage);
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
      console.warn('Could not generate Schema.org JSON-LD for page:', activePage, e);
    }
  }, [activePage]);

  // FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Fetch Database-driven data
  const loadDatabaseData = async () => {
    try {
      setLoadingDb(true);
      const baseUrl = getApiBaseUrl();
      const [jackpotsRes, vipRes, oddsRes, allPredictionsRes, settingsRes] = await Promise.all([
        fetch(`${baseUrl}/api/jackpots`).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(`${baseUrl}/api/vip-packages`).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(`${baseUrl}/api/odds-packs`).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(`${baseUrl}/api/predictions`).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(`${baseUrl}/api/site-settings`).then(r => r.ok ? r.json() : null).catch(() => null),
      ]);

      if (settingsRes) {
        setSiteContacts(prev => ({
          ...prev,
          ...settingsRes
        }));
      }

      // Filter dynamically based on client/user date timezone
      const clientToday = new Date();
      const clientYesterday = new Date();
      clientYesterday.setDate(clientToday.getDate() - 1);
      const clientTomorrow = new Date();
      clientTomorrow.setDate(clientToday.getDate() + 1);

      if (Array.isArray(jackpotsRes) && jackpotsRes.length > 0) {
        setDbJackpots(jackpotsRes);
      }
      if (Array.isArray(vipRes) && vipRes.length > 0) {
        setDbVipPackages(vipRes);
      }
      if (Array.isArray(oddsRes) && oddsRes.length > 0) {
        setDbOddsPacks(oddsRes);
      }

      const predictionsList = Array.isArray(allPredictionsRes) ? allPredictionsRes : [];
      const yesterdayPreds = predictionsList.filter((f: any) => isSameDay(f.kickoffTime, clientYesterday));
      const todayPreds = predictionsList.filter((f: any) => isSameDay(f.kickoffTime, clientToday));
      const tomorrowPreds = predictionsList.filter((f: any) => isSameDay(f.kickoffTime, clientTomorrow));

      setDbPredictions(prev => ({
        ...prev,
        'all': predictionsList,
        'category-today': todayPreds,
        'category-yesterday': yesterdayPreds,
        'category-tomorrow': tomorrowPreds,
      }));
    } catch (err) {
      console.error('Failed to load database content:', err);
    } finally {
      setLoadingDb(false);
    }
  };

  useEffect(() => {
    loadDatabaseData();
  }, []);

  // Handle predictions loading for specific category on activePage change
  useEffect(() => {
    if (activePage.startsWith('category-') && 
        activePage !== 'category-today' && 
        activePage !== 'category-yesterday' && 
        activePage !== 'category-tomorrow' && 
        !dbPredictions[activePage]) {
      const fetchCategoryPredictions = async () => {
        try {
          setLoadingCategory(true);
          const baseUrl = getApiBaseUrl();
          const preds = await fetch(`${baseUrl}/api/predictions?category=${activePage}`)
            .then(r => r.ok ? r.json() : [])
            .catch(() => []);
          setDbPredictions(prev => ({
            ...prev,
            [activePage]: Array.isArray(preds) ? preds : [],
          }));
        } catch (err) {
          console.error(`Failed to load predictions for category: ${activePage}`, err);
          setDbPredictions(prev => ({
            ...prev,
            [activePage]: [],
          }));
        } finally {
          setLoadingCategory(false);
        }
      };
      fetchCategoryPredictions();
    }
  }, [activePage, dbPredictions]);

  // Attach active design iteration to document body
  useEffect(() => {
    const body = document.body;
    designIterations.forEach((iter) => {
      body.classList.remove(iter.themeClass);
    });
    body.classList.add(currentIteration.themeClass);
  }, [currentIteration]);

  // Dynamic SEO title handler
  useEffect(() => {
    const pageMd = getMarkdownContent(activePage);
    if (pageMd && pageMd.title) {
      document.title = pageMd.title;
    }
  }, [activePage]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleScrollTo = (sectionId: string) => {
    requestAnimationFrame(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  };

  const handleSelectPage = (pageId: string) => {
    let resolvedPageId = pageId;
    if (pageId === 'today') resolvedPageId = 'category-today';
    if (pageId === 'yesterday') resolvedPageId = 'category-yesterday';
    if (pageId === 'tomorrow') resolvedPageId = 'category-tomorrow';

    // Handle VIP scroll or redirect (VIP packages are on the home page)
    if (resolvedPageId === 'vip') {
      const isCurrentlyOnHomePage = activePage.startsWith('category-');
      if (isCurrentlyOnHomePage) {
        handleScrollTo('vip-showcase');
      } else {
        setActivePage('category-today');
        const url = PAGE_TO_URL_MAP['category-today'];
        if (url && typeof window !== 'undefined') {
          window.history.pushState(null, '', url);
        }
        setTimeout(() => handleScrollTo('vip-showcase'), 150);
      }
      return;
    }

    // Handle Odds scroll or redirect (Odds Packs are on the home page)
    if (resolvedPageId === 'odds') {
      const isCurrentlyOnHomePage = activePage.startsWith('category-');
      if (isCurrentlyOnHomePage) {
        handleScrollTo('odds-packs');
      } else {
        setActivePage('category-today');
        const url = PAGE_TO_URL_MAP['category-today'];
        if (url && typeof window !== 'undefined') {
          window.history.pushState(null, '', url);
        }
        setTimeout(() => handleScrollTo('odds-packs'), 150);
      }
      return;
    }

    // Regular page selections
    setActivePage(resolvedPageId);
    if (ALL_JACKPOT_IDS.includes(resolvedPageId) || DYNAMIC_JACKPOT_PAGES[resolvedPageId]) {
      setActiveJackpotId(resolvedPageId);
    }

    // Push URL state for normal subpages
    const url = PAGE_TO_URL_MAP[resolvedPageId] || `/${resolvedPageId}`;
    if (url && typeof window !== 'undefined') {
      window.history.pushState(null, '', url);
    }

    // Handle scrolling
    if (resolvedPageId.startsWith('category-') || 
        resolvedPageId === 'jackpot-list' || 
        ALL_JACKPOT_IDS.includes(resolvedPageId) ||
        ['about', 'partners', 'responsible-gambling', 'privacy-policy', 'terms-of-use', 'contact'].includes(resolvedPageId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Payment states
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [payPackageName, setPayPackageName] = useState('');
  const [payPrice, setPayPrice] = useState(500);
  const [payId, setPayId] = useState<string | number>('');
  const [paySlug, setPaySlug] = useState('');
  const [payType, setPayType] = useState<'vip' | 'jackpot' | 'odds'>('vip');
  
  const handleOpenPayment = (
    pkgName: string, 
    price: number, 
    id: string | number, 
    slug: string, 
    type: 'vip' | 'jackpot' | 'odds'
  ) => {
    setPayPackageName(pkgName);
    setPayPrice(price);
    setPayId(id);
    setPaySlug(slug);
    setPayType(type);
    setPaymentOpen(true);
  };

  const handlePaymentSuccess = async () => {
    try {
      let guestIds: string[] = [];
      const storedGuestPurchases = localStorage.getItem('guest_purchased_item_ids');
      if (storedGuestPurchases) {
        try {
          guestIds = JSON.parse(storedGuestPurchases);
        } catch {}
      }
      if (!guestIds.includes(String(payId))) {
        guestIds.push(String(payId));
      }
      localStorage.setItem('guest_purchased_item_ids', JSON.stringify(guestIds));
      setUserPurchasedItemIds(guestIds);

      if (payType === 'jackpot') {
        showToast(`🎉 ${payPackageName} Selections Unlocked!`);
      } else {
        showToast(`🎉 Premium ${payPackageName} activated! Checked out on Safaricom.`);
      }
    } catch (err) {
      console.error('Failed to sync purchase record:', err);
      showToast('❌ Payment processed.');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] font-sans antialiased selection:bg-[var(--primary)] selection:text-white transition-colors duration-500 pb-16">
      
      {/* Skip to Content Link for Screen Readers */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--primary)] focus:text-white focus:rounded-md font-bold focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* 1. MAIN HEADER & DESKTOP TOOLBAR */}
      <header className="w-full border-b border-[var(--border)] bg-[var(--card)] backdrop-blur-[var(--backdrop)] sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          
          {/* Left: Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-1.5 rounded-lg bg-white bg-opacity-5 border border-[var(--border)] text-[var(--text)] cursor-pointer"
            >
              <Menu className="w-5 h-5 text-[var(--primary)]" />
            </button>
            
            <a 
              href="/"
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                  e.preventDefault();
                  handleSelectPage('home');
                }
              }}
              aria-label="Soka King Home"
              className="flex items-center gap-2 cursor-pointer bg-transparent no-underline p-0 text-left text-[var(--text)]"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center text-white font-black text-xs select-none">
                SK
              </div>
              <span 
                className="font-extrabold text-lg tracking-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                SOKA <span className="text-[var(--primary)]">KING</span>
              </span>
            </a>
          </div>

          {/* Center: Desktop Toolbar Navigation Menu */}
          <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-1 bg-slate-100/60 dark:bg-slate-900/40 p-1 rounded-full border border-[var(--border)] shadow-3xs">
            <a 
              href={getPageUrl('home')}
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                  e.preventDefault();
                  handleSelectPage('home');
                }
              }}
              className={`px-3.5 py-1.5 text-xs font-bold transition-all no-underline cursor-pointer rounded-full ${activePage === 'home' ? 'bg-[var(--primary)] text-white font-black shadow-3xs' : 'bg-transparent text-[var(--text-muted)] hover:text-[var(--primary)]'}`}
            >
              Home
            </a>
            <a 
              href={getPageUrl('category-today')}
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                  e.preventDefault();
                  handleSelectPage('category-today');
                }
              }}
              className={`px-3.5 py-1.5 text-xs font-bold transition-all no-underline cursor-pointer rounded-full ${activePage === 'category-today' ? 'bg-[var(--primary)] text-white font-black shadow-3xs' : 'bg-transparent text-[var(--text-muted)] hover:text-[var(--primary)]'}`}
            >
              Today's Tips
            </a>
            <a 
              href={getPageUrl('jackpot-list')}
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                  e.preventDefault();
                  handleSelectPage('jackpot-list');
                }
              }}
              className={`px-3.5 py-1.5 text-xs font-bold transition-all no-underline cursor-pointer rounded-full ${activePage === 'jackpot-list' ? 'bg-[var(--primary)] text-white font-black shadow-3xs' : 'bg-transparent text-[var(--text-muted)] hover:text-[var(--primary)]'}`}
            >
              Jackpots
            </a>
            <a 
              href="/#odds-packs"
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                  e.preventDefault();
                  if (activePage.startsWith('category-') || activePage === 'home') {
                    handleScrollTo('odds-packs');
                  } else {
                    handleSelectPage('home');
                    setTimeout(() => handleScrollTo('odds-packs'), 100);
                  }
                }
              }}
              className="px-3.5 py-1.5 text-xs font-bold transition-all bg-transparent no-underline cursor-pointer rounded-full text-[var(--text-muted)] hover:text-[var(--primary)]"
            >
              Odds Packs
            </a>
            <a 
              href={getPageUrl('sportpesa-mega')}
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                  e.preventDefault();
                  handleSelectPage('sportpesa-mega');
                }
              }}
              className={`px-3.5 py-1.5 text-xs font-bold transition-all no-underline cursor-pointer rounded-full ${activePage === 'sportpesa-mega' ? 'bg-[var(--primary)] text-white font-black shadow-3xs' : 'bg-transparent text-[var(--text-muted)] hover:text-[var(--primary)]'}`}
            >
              Mega JP
            </a>
            <a 
              href={getPageUrl('vip-packages')}
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                  e.preventDefault();
                  handleSelectPage('vip-packages');
                }
              }}
              className={`px-3.5 py-1.5 text-xs font-bold transition-all no-underline cursor-pointer rounded-full ${activePage === 'vip-packages' ? 'bg-[var(--primary)] text-white font-black shadow-3xs' : 'bg-transparent text-[var(--text-muted)] hover:text-[var(--primary)]'}`}
            >
              VIP
            </a>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (dbVipPackages.length > 0) {
                  const firstPkg = dbVipPackages[0];
                  handleOpenPayment(firstPkg.name, firstPkg.price, firstPkg.id, firstPkg.slug, 'vip');
                } else {
                  handleSelectPage('vip-packages');
                }
              }}
              className="px-4 py-2 bg-[var(--primary)] hover:bg-emerald-800 text-white text-[11px] lg:text-xs font-black rounded-lg shadow-sm transition-all cursor-pointer border-none"
            >
              Go VIP
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE DRAWER NAVIGATION OVERLAY */}
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        firstVipPackage={(dbVipPackages[0] || { id: 'jackpot-vip', name: 'SportPesa Mega VIP', price: 500 }) as any}
        onOpenPayment={handleOpenPayment}
        activePage={activePage}
        onSelectPage={handleSelectPage}
      />

      {/* 3. CENTERED INTERACTIVE WORKSPACE */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-6 min-h-[85vh] md:min-h-[1000px]">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* MAIN CENTER DASHBOARD CONTAINER */}
            <main id="main-content" className="flex-1 w-full space-y-8 min-h-[650px] md:min-h-[850px] overflow-hidden">
              <Suspense fallback={
                <div className="min-h-[400px] flex items-center justify-center p-8">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
                    <span className="text-xs text-[var(--text-muted)] font-mono">Loading content...</span>
                  </div>
                </div>
              }>
              {(() => {
                const category = PREDICTION_CATEGORIES.find(c => 
                  c.id === activePage || 
                  (c.id === 'sunpel-free-football-betting-tips' && activePage.startsWith('sunpel-free-football-betting-tips'))
                ) || DYNAMIC_CATEGORY_PAGES[activePage];

                if (category) {
                  const pageMd = getMarkdownContent(activePage);
                  const categoryFixtures = getCategoryFixtures(
                    category.id, 
                    dbPredictions.all && dbPredictions.all.length > 0 ? dbPredictions.all : dbPredictions,
                    pageMd.type
                  );
                  return (
                    <CategoryPredictionsPage 
                      category={category}
                      fixtures={categoryFixtures}
                      isLoading={loadingDb || loadingCategory}
                      onBackToHome={() => handleSelectPage('home')}
                      onSelectPage={handleSelectPage}
                      onOpenPayment={handleOpenPayment}
                      jackpots={dbJackpots}
                      pageId={activePage}
                    />
                  );
                }

                if (activePage === 'jackpot-list') {
                  return (
                    <JackpotListPage 
                      onSelectJackpot={(id) => handleSelectPage(id)}
                      unlockedJackpots={unlockedJackpots}
                      hasPaidJackpot={unlockedJackpots.length > 0}
                      jackpots={dbJackpots}
                    />
                  );
                }

                if (ALL_JACKPOT_IDS.includes(activePage) || DYNAMIC_JACKPOT_PAGES[activePage]) {
                  const dynamicJpInfo = DYNAMIC_JACKPOT_PAGES[activePage];
                  const targetJackpotId = dynamicJpInfo ? dynamicJpInfo.jackpotId : activePage;

                  let activeJackpot = dbJackpots.find(j => j.id === targetJackpotId || j.slug === targetJackpotId || j.id === activePage || j.slug === activePage);
                  if (!activeJackpot) {
                    activeJackpot = jackpotsData.find(j => j.id === targetJackpotId || j.slug === targetJackpotId || j.id === activePage || j.slug === activePage);
                  }
                  if (!activeJackpot) {
                    const baseFallback = jackpotsData.find(j => j.id === 'sportpesa-mega') || jackpotsData[0];
                    const pageMd = getMarkdownContent(activePage);
                    activeJackpot = {
                      ...baseFallback,
                      id: activePage,
                      name: pageMd.displayTitle || pageMd.title || activePage,
                      slug: activePage
                    };
                  }

                  const rawFixtures = (activeJackpot.fixtures && activeJackpot.fixtures.length > 0)
                    ? activeJackpot.fixtures
                    : ((activeJackpot as any).games && (activeJackpot as any).games.length > 0)
                      ? (activeJackpot as any).games
                      : (jackpotsData.find(j => j.id === activeJackpot!.id || j.slug === activeJackpot!.slug)?.fixtures || []);

                  const formattedJackpot = {
                    ...activeJackpot,
                    fixtures: rawFixtures.map((f: any, idx: number) => ({
                      ...f,
                      id: f.id || idx + 1,
                      fixtureNumber: f.fixtureNumber || f.position || idx + 1,
                      prediction: f.prediction || f.tip || 'Home Win (1)',
                      homeTeam: f.homeTeam || f.home_team_name || 'Home Team',
                      awayTeam: f.awayTeam || f.away_team_name || 'Away Team',
                      homeScore: f.homeScore !== undefined ? f.homeScore : f.fullTimeHome !== undefined ? f.fullTimeHome : '-',
                      awayScore: f.awayScore !== undefined ? f.awayScore : f.fullTimeAway !== undefined ? f.fullTimeAway : '-',
                      kickoffTime: f.kickoffTime || f.date || f.time || new Date().toISOString(),
                      confidence: getRefinedConfidence(f),
                      aiAnalysis: f.aiAnalysis || f.ai_analysis || 'AI mathematical model favors this outcome based on form and tactical alignment.'
                    }))
                  };

                  const isJackpotUnlocked = unlockedJackpots.includes(formattedJackpot.id) || unlockedJackpots.includes(targetJackpotId);

                  return (
                    <JackpotPage 
                      jackpot={formattedJackpot}
                      hasPaid={isJackpotUnlocked}
                      isLoading={loadingDb}
                      onOpenPayment={handleOpenPayment}
                      onBackToList={() => handleSelectPage('jackpot-list')}
                      pageId={activePage}
                    />
                  );
                }

                if (['vip-packages', 'vip', 'odds'].includes(activePage)) {
                  return (
                    <VipPackagesPage 
                      vipPackages={dbVipPackages}
                      oddsPacks={dbOddsPacks}
                      jackpots={dbJackpots}
                      unlockedJackpots={unlockedJackpots}
                      userPurchasedItemIds={userPurchasedItemIds}
                      onOpenPayment={handleOpenPayment}
                      onSelectJackpot={(id) => handleSelectPage(id)}
                      onBackToHome={() => handleSelectPage('home')}
                    />
                  );
                }

                if (activePage === 'not-found' || activePage === '404') {
                  return (
                    <NotFoundPage 
                      onNavigate={handleSelectPage} 
                      status={404} 
                      requestedPath={typeof window !== 'undefined' ? window.location.pathname : undefined} 
                    />
                  );
                }

                if (['about', 'partners', 'responsible-gambling', 'privacy-policy', 'terms-of-use', 'contact'].includes(activePage)) {
                  return (
                    <StaticPages 
                      pageId={activePage}
                      onBackToHome={() => handleSelectPage('home')}
                    />
                  );
                }

                // DYNAMIC MARKDOWN PAGE FALLBACK (For any newly created .md files: Competitors, custom SEO Jackpot pages, etc.)
                if (activePage !== 'home') {
                  const pageMd = getMarkdownContent(activePage);

                  // 1. Is it a jackpot page (has jackpotId or type === 'jackpot')?
                  if (pageMd.jackpotId || pageMd.type === 'jackpot') {
                    const targetJackpotId = pageMd.jackpotId || activePage;
                    const activeJackpot = dbJackpots.find(j => j.id === targetJackpotId || j.slug === targetJackpotId) || dbJackpots[0];
                    if (activeJackpot) {
                      const isJackpotUnlocked = unlockedJackpots.includes(activeJackpot.id);
                      return (
                        <JackpotPage 
                          jackpot={activeJackpot}
                          hasPaid={isJackpotUnlocked}
                          isLoading={loadingDb}
                          onOpenPayment={handleOpenPayment}
                          onBackToList={() => handleSelectPage('jackpot-list')}
                          pageId={activePage}
                        />
                      );
                    }
                  }

                  // 2. Is it a competitor, category, or custom markdown landing page?
                  if (pageMd.type === 'competitor' || pageMd.type === 'category' || pageMd.type === 'custom' || pageMd.title) {
                    const dynamicCategory: PredictionCategory = {
                      id: activePage,
                      name: pageMd.displayTitle || pageMd.title || activePage,
                      label: pageMd.displayTitle || pageMd.title || activePage,
                      countText: getCategoryCountText(activePage),
                      description: pageMd.description,
                      icon: pageMd.icon || "⚽",
                      badgeColor: pageMd.badgeColor || "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
                    };

                    const categoryFixtures = getCategoryFixtures(
                      pageMd.fixturesCategory || activePage, 
                      dbPredictions.all && dbPredictions.all.length > 0 ? dbPredictions.all : dbPredictions, 
                      pageMd.type
                    );

                    return (
                      <CategoryPredictionsPage 
                        category={dynamicCategory}
                        fixtures={categoryFixtures}
                        isLoading={loadingDb || loadingCategory}
                        onBackToHome={() => handleSelectPage('home')}
                        onSelectPage={handleSelectPage}
                        onOpenPayment={handleOpenPayment}
                        jackpots={dbJackpots}
                        pageId={activePage}
                      />
                    );
                  }
                }

                // DEFAULT: Home / Free Tips Page Layout
                const homeMd = getMarkdownContent('home');
                return (
                  <div className="space-y-8">
                    {/* HERO BANNER */}
                    <section id="hero" className="p-6 md:p-8 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow)] backdrop-blur-[var(--backdrop)] relative overflow-hidden text-left">
                      <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-[var(--primary)] bg-opacity-10 blur-3xl glow-glow" />
                      <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-[var(--secondary)] bg-opacity-5 blur-3xl glow-glow" />

                      <div className="relative z-10 max-w-2xl space-y-4">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--primary)] text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                          <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" /> Real-Time Analytics & Verified Predictions
                        </div>
                        <h1 
                          className="text-2xl md:text-4xl font-extrabold tracking-tight leading-[1.1] text-[var(--text)]"
                          style={{ fontFamily: 'var(--font-display)' }}
                        >
                          {homeMd.displayTitle || homeMd.title || "Expert SportPesa Mega Jackpot Predictions & Sure Football Tips"}
                        </h1>
                        <div className="text-xs md:text-sm text-[var(--text-muted)] leading-relaxed">
                          {homeMd.intro ? (
                            <MarkdownRenderer content={homeMd.intro} />
                          ) : (
                            <p>Unlock mathematically proven accumulator slips, daily double-chances, and premium curated shortlists analyzed by professional sporting algorithms. Verified secure payments via Safaricom M-Pesa.</p>
                          )}
                        </div>

                        {/* Hero Actions */}
                        <div className="flex flex-wrap gap-3 pt-2">
                          <button
                            onClick={() => handleSelectPage('category-today')}
                            className="px-6 py-3.5 bg-[var(--primary)] hover:bg-emerald-800 text-white font-black text-xs rounded-[var(--radius)] shadow-lg hover:opacity-95 flex items-center gap-2 transition-all cursor-pointer border-none"
                          >
                            <Zap className="w-4 h-4 text-white" />
                            <span>View Free Predictions</span>
                          </button>
                          <button
                            onClick={() => handleSelectPage('vip-packages')}
                            className="px-6 py-3.5 bg-[var(--card)] hover:bg-slate-100 dark:hover:bg-slate-800 border-2 border-[var(--border)] text-[var(--text)] hover:border-[var(--primary)] font-black text-xs rounded-[var(--radius)] transition-all cursor-pointer shadow-3xs"
                          >
                            Explore VIP Selections
                          </button>
                        </div>
                      </div>
                    </section>

                    {/* 1. FREE PREDICTIONS SECTION */}
                    <section id="predictions" className="space-y-4">
                      {/* Quick Horizontal Scroll for Categories */}
                      <div className="space-y-2 text-left">
                        <span className="text-[10px] font-mono font-black uppercase text-indigo-800 dark:text-indigo-300 tracking-wider">
                          Quick Category Shortcuts
                        </span>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                          {PREDICTION_CATEGORIES.map((cat) => {
                            const isCatActive = activePage === cat.id;
                            const targetUrl = getPageUrl(cat.id);
                            return (
                              <a
                                key={cat.id}
                                href={targetUrl}
                                onClick={(e) => {
                                  if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSelectPage(cat.id);
                                  }
                                }}
                                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-black shrink-0 transition-all border cursor-pointer no-underline ${
                                  isCatActive 
                                    ? 'bg-indigo-700 text-white border-indigo-700 shadow-3xs scale-102' 
                                    : 'bg-[var(--card)] text-[var(--text-muted)] hover:text-[var(--text)] border-[var(--border)] hover:bg-slate-100/40 dark:hover:bg-slate-900/30'
                                }`}
                              >
                                <span>{cat.icon}</span>
                                <span>{cat.label}</span>
                                <span className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded-full ${
                                  isCatActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                }`}>
                                  {getCategoryCountText(cat.id, dbPredictions.all && dbPredictions.all.length > 0 ? dbPredictions.all : dbPredictions).split(' ')[0]}
                                </span>
                              </a>
                            );
                          })}
                        </div>
                      </div>

                      <PredictionsList 
                        isLoading={loadingDb}
                        fixtures={getCategoryFixtures('category-today', dbPredictions.all && dbPredictions.all.length > 0 ? dbPredictions.all : dbPredictions)}
                        title={homeMd.listTitle || "Today's Free Football Predictions"}
                        subtitle={homeMd.listSubtitle || "High-probability daily double-chance options and standard single tips verified by Soka King mathematical indexes."}
                      />
                    </section>

                    {/* MIDDLE SEO MARKDOWN SECTION */}
                    {homeMd.middle && (
                      <section id="middle-insights" className="p-4 md:p-5 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow)] text-left text-xs leading-relaxed text-[var(--text-muted)]">
                        <MarkdownRenderer content={homeMd.middle} />
                      </section>
                    )}

                    {/* 2. DEDICATED PREMIUM JACKPOTS HOME PROMOTION BANNER */}
                    <section id="jackpot-section" className="p-5 rounded-[var(--radius)] bg-gradient-to-br from-emerald-600/10 via-emerald-600/5 to-transparent border border-emerald-500/20 shadow-xs relative overflow-hidden text-left">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                      
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2 max-w-lg">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 text-[10px] font-mono font-bold uppercase tracking-wider animate-pulse">
                            <Trophy className="w-3 h-3" /> Premium Jackpots Available
                          </div>
                          <h3 className="text-md md:text-lg font-black text-[var(--text)] tracking-tight uppercase" style={{ fontFamily: 'var(--font-display)' }}>
                            Soka King Premium Jackpots
                          </h3>
                          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                            Get mathematically analyzed prediction codes for SportPesa Mega (17), Betika Midweek (15), Betika Grand (17), and Mozzart Super Grand (20). Our Poisson algorithms deliver high confidence slips.
                          </p>
                        </div>

                        <a
                          href={getPageUrl('jackpot-list')}
                          onClick={(e) => {
                            if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                              e.preventDefault();
                              handleSelectPage('jackpot-list');
                            }
                          }}
                          className="px-5 py-3 shrink-0 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black rounded-xl shadow-md active:scale-95 transition-all no-underline cursor-pointer flex items-center gap-2 border-none"
                        >
                          <span>VIEW ALL JACKPOTS</span>
                          <ChevronRight className="w-4 h-4 text-white" />
                        </a>
                      </div>

                      {/* Quick brand badge shortcuts */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-[var(--border)]">
                        {dbJackpots.slice(0, 4).map((item) => (
                          <a
                            key={item.id}
                            href={getPageUrl(item.id)}
                            onClick={(e) => {
                              if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                                e.preventDefault();
                                handleSelectPage(item.id);
                              }
                            }}
                            className="p-2.5 rounded-lg border bg-[var(--card)] text-left transition-all cursor-pointer no-underline border-emerald-500/20 hover:border-emerald-500/50 hover:bg-emerald-500/5 flex flex-col justify-between"
                          >
                            <span className="text-[11px] font-black text-[var(--text)] tracking-tight uppercase">{item.name}</span>
                            <span className="text-[9px] text-slate-600 dark:text-slate-400 font-mono font-bold mt-1">{item.gamesCount} Games</span>
                          </a>
                        ))}
                      </div>
                    </section>

                    {/* 3. VIP SUBSCRIPTION MODULE */}
                    <div id="vip-showcase">
                      <VipPackages 
                        packages={dbVipPackages}
                        onOpenPayment={handleOpenPayment}
                        userPurchasedItemIds={userPurchasedItemIds}
                      />
                    </div>

                    {/* 4. PREMIUM ODDS PACKS MODULE */}
                    <div id="odds-packs">
                      <OddsPacks 
                        packs={dbOddsPacks}
                        onOpenPayment={handleOpenPayment}
                        userPurchasedItemIds={userPurchasedItemIds}
                        title={homeMd.unlockHeading}
                        subtitle={homeMd.unlockDescription}
                      />
                    </div>

                    {/* EXPERT INSIGHTS & FAQ FROM MARKDOWN */}
                    <div className="space-y-6">
                      {homeMd.meat && (
                        <section id="expert-insights" className="p-5 md:p-6 rounded-[var(--radius)] bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow)] backdrop-blur-[var(--backdrop)] text-left">
                          <MarkdownRenderer content={homeMd.meat} />
                        </section>
                      )}

                      <InboundLinksBlock 
                        pageId="home" 
                        onSelectPage={handleSelectPage} 
                      />

                      {(homeMd.author || homeMd.authorName) && (
                        <AuthorCard 
                          authorId={homeMd.authorId}
                          author={homeMd.author}
                          name={homeMd.authorName}
                          title={homeMd.authorTitle}
                          description={homeMd.authorDescription}
                          avatar={homeMd.authorAvatar}
                        />
                      )}

                      <FaqSection pageId="home" />

                      <ResponsibleGamblingNotice notice={homeMd.responsibleGambling} />
                    </div>
                  </div>
                );
              })()}
              </Suspense>
            </main>

            {/* RIGHT SIDEBAR PANEL */}
            <aside className="w-full lg:w-[320px] flex-shrink-0 space-y-6">
              {['jackpot-list', ...ALL_JACKPOT_IDS].includes(activePage) ? (
                <JackpotSidebar 
                  jackpotId={activePage} 
                  jackpotName={dbJackpots.find(j => j.id === activePage || j.slug === activePage)?.name}
                  hasPaid={unlockedJackpots.includes(activePage)}
                />
              ) : (
                <>
                  <PredictionsSidebar 
                    activeCategoryId={activePage}
                    onSelectCategory={(id) => handleSelectPage(id)}
                    fixtures={Array.isArray(dbPredictions) ? dbPredictions : (dbPredictions.all || [])}
                  />
                  <LiveUpdates 
                    onScrollTo={handleScrollTo} 
                    fixtures={Array.isArray(dbPredictions) ? dbPredictions : (dbPredictions.all || [])} 
                  />
                </>
              )}
            </aside>

          </div>
      </div>

      {/* 4. MODAL FOR INTEGRATED SECURE PAYMENTS */}
      {paymentOpen && (
        <Suspense fallback={null}>
          <PaymentModal 
            isOpen={paymentOpen}
            onClose={() => setPaymentOpen(false)}
            packageName={payPackageName}
            price={payPrice}
            packageId={payId}
            packageSlug={paySlug}
            packageType={payType}
            onPaymentSuccess={handlePaymentSuccess}
          />
        </Suspense>
      )}

      {/* 5. INTERACTIVE FLOOR TOAST ALERTS */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 px-4 py-3 rounded-lg bg-neutral-900 border border-neutral-800 text-white shadow-xl text-xs flex items-center gap-2 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 6. FLOATING WHATSAPP BUTTON */}
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40">
        <a 
          href={`https://wa.me/${(siteContacts.whatsapp || siteContacts.phone || '+254740841375').replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello Soka King Support, I need today tips')}`} 
          target="_blank" 
          rel="noopener noreferrer"
          aria-label="Chat with Soka King support on WhatsApp"
          title="Contact WhatsApp Support"
          className="w-12 h-12 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all duration-200"
        >
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.964 9.964 0 001.333 4.993L2 22l5.233-1.237a9.96 9.96 0 004.779 1.217h.004c5.505 0 9.988-4.478 9.989-9.985 0-2.669-1.038-5.176-2.925-7.062A9.925 9.925 0 0012.012 2zm0 2c2.133 0 4.14.83 5.648 2.338a7.935 7.935 0 012.338 5.646c-.001 4.41-3.587 7.996-7.996 7.996h-.003a7.936 7.936 0 01-3.801-.973l-.272-.162-2.825.668.683-2.756-.178-.283a7.938 7.938 0 01-1.213-4.184c0-4.409 3.586-7.994 7.995-7.994zm-3.084 4.5c-.171 0-.447.064-.681.318-.233.255-.892.871-.892 2.124 0 1.253.913 2.463 1.04 2.633.128.17 1.796 2.742 4.352 3.846 2.124.918 2.557.735 3.024.693.467-.043 1.508-.616 1.72-1.21.212-.595.212-1.105.148-1.211-.063-.106-.233-.17-.488-.297-.255-.127-1.508-.743-1.741-.828-.233-.085-.403-.127-.573.128-.17.254-.658.828-.807 1.002-.149.173-.297.191-.552.064-.255-.128-1.077-.397-2.052-1.266-.759-.677-1.272-1.513-1.421-1.768-.149-.255-.016-.393.111-.52.115-.114.255-.297.382-.446.128-.149.17-.255.255-.425.085-.17.043-.318-.021-.446-.064-.127-.573-1.381-.786-1.89-.207-.496-.418-.429-.573-.437-.149-.008-.318-.008-.488-.008z" />
          </svg>
        </a>
      </div>

      {/* 7. MOBILE BOTTOM NAVIGATION BAR */}
      <nav aria-label="Mobile bottom navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--card)]/95 backdrop-blur-md border-t border-[var(--border)] px-2 py-1.5 flex items-center justify-around shadow-2xl">
        <a
          href={getPageUrl('category-today')}
          onClick={(e) => {
            if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
              e.preventDefault();
              handleSelectPage('category-today'); 
              handleScrollTo('predictions');
            }
          }}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg text-[10px] font-extrabold transition-all no-underline cursor-pointer ${
            ['today', 'category-today', 'category-tomorrow', '254-sure-tips'].includes(activePage)
              ? 'bg-[var(--primary)] text-white shadow-3xs font-black'
              : 'bg-transparent text-[var(--text-muted)] hover:text-[var(--text)]'
          }`}
        >
          <Flame className={`w-4 h-4 mb-0.5 ${['today', 'category-today', 'category-tomorrow', '254-sure-tips'].includes(activePage) ? 'text-white' : 'text-amber-500'}`} />
          <span>Free Tips</span>
        </a>

        <a
          href={getPageUrl('sportpesa-mega')}
          onClick={(e) => {
            if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
              e.preventDefault();
              handleSelectPage('sportpesa-mega');
            }
          }}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg text-[10px] font-extrabold transition-all no-underline cursor-pointer ${
            activePage === 'sportpesa-mega'
              ? 'bg-[var(--primary)] text-white shadow-3xs font-black'
              : 'bg-transparent text-[var(--text-muted)] hover:text-[var(--text)]'
          }`}
        >
          <Trophy className={`w-4 h-4 mb-0.5 ${activePage === 'sportpesa-mega' ? 'text-white' : 'text-amber-500'}`} />
          <span>Mega JP</span>
        </a>

        <a
          href={getPageUrl('vip-packages')}
          onClick={(e) => {
            if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
              e.preventDefault();
              handleSelectPage('vip-packages');
            }
          }}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg text-[10px] font-extrabold transition-all no-underline cursor-pointer ${
            activePage === 'vip-packages'
              ? 'bg-[var(--primary)] text-white shadow-3xs font-black'
              : 'bg-transparent text-[var(--text-muted)] hover:text-[var(--text)]'
          }`}
        >
          <Crown className={`w-4 h-4 mb-0.5 ${activePage === 'vip-packages' ? 'text-white' : 'text-amber-500'}`} />
          <span>VIP</span>
        </a>

        <a
          href={getPageUrl('jackpot-list')}
          onClick={(e) => {
            if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
              e.preventDefault();
              handleSelectPage('jackpot-list');
            }
          }}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg text-[10px] font-extrabold transition-all no-underline cursor-pointer ${
            ['jackpot-list', 'betika-grand', 'betika-midweek', 'sportpesa-midweek', 'mozzart-super-grand', 'mozzart-super-daily', 'sportybet-jackpot', 'betpawa-pick-jackpot', 'odibet-laki-tatu'].includes(activePage)
              ? 'bg-[var(--primary)] text-white shadow-3xs font-black'
              : 'bg-transparent text-[var(--text-muted)] hover:text-[var(--text)]'
          }`}
        >
          <Layers className={`w-4 h-4 mb-0.5 ${['jackpot-list', 'betika-grand', 'betika-midweek', 'sportpesa-midweek', 'mozzart-super-grand', 'mozzart-super-daily', 'sportybet-jackpot', 'betpawa-pick-jackpot', 'odibet-laki-tatu'].includes(activePage) ? 'text-white' : ''}`} />
          <span>Jackpots</span>
        </a>
      </nav>

      {/* 8. FOOTER */}
      <footer className="mt-16 border-t border-[var(--border)] bg-slate-50 dark:bg-slate-950/60 py-12 pb-24 md:pb-12 text-xs transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-left text-slate-500 dark:text-slate-400 min-h-[220px]">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6.5 h-6.5 rounded-md bg-[var(--primary)] flex items-center justify-center text-white font-black text-[10px]">
                SK
              </div>
              <span className="font-extrabold text-sm text-[var(--text)]" style={{ fontFamily: 'var(--font-display)' }}>
                SOKA <span className="text-[var(--primary)]">KING</span>
              </span>
            </div>
            <p className="leading-relaxed text-[11px]">
              Kenya's premier football prediction & jackpot analytics portal. Powered by advanced statistical algorithms and Poisson goal distribution models.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {siteContacts.whatsapp && (
                <a 
                  href={`https://wa.me/${siteContacts.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello Soka King Support, I need today tips')}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-bold hover:bg-emerald-500/20 transition-all no-underline" 
                  title="WhatsApp Hotline"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              )}
              {siteContacts.telegram && (
                <a 
                  href={siteContacts.telegram} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 font-mono text-[11px] font-bold hover:bg-sky-500/20 transition-all no-underline" 
                  title="Telegram Channel"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Telegram</span>
                </a>
              )}
              {siteContacts.facebook && (
                <a 
                  href={siteContacts.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono text-[11px] font-bold hover:bg-blue-500/20 transition-all no-underline" 
                  title="Facebook Page"
                >
                  <Facebook className="w-3.5 h-3.5" />
                  <span>Facebook</span>
                </a>
              )}
              {siteContacts.twitter && (
                <a 
                  href={siteContacts.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-slate-500/10 text-slate-700 dark:text-slate-300 font-mono text-[11px] font-bold hover:bg-slate-500/20 transition-all no-underline" 
                  title="Twitter / X"
                >
                  <Twitter className="w-3.5 h-3.5" />
                  <span>Twitter / X</span>
                </a>
              )}
              {siteContacts.instagram && (
                <a 
                  href={siteContacts.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-pink-500/10 text-pink-600 dark:text-pink-400 font-mono text-[11px] font-bold hover:bg-pink-500/20 transition-all no-underline" 
                  title="Instagram Page"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>Instagram</span>
                </a>
              )}
              {siteContacts.youtube && (
                <a 
                  href={siteContacts.youtube} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 font-mono text-[11px] font-bold hover:bg-red-500/20 transition-all no-underline" 
                  title="YouTube Channel"
                >
                  <Youtube className="w-3.5 h-3.5" />
                  <span>YouTube</span>
                </a>
              )}
              <a 
                href={getPageUrl('contact')}
                onClick={(e) => {
                  if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                    e.preventDefault();
                    handleSelectPage('contact');
                  }
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-slate-200 dark:bg-slate-800 text-[var(--text)] font-mono text-[11px] font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-all no-underline cursor-pointer" 
                title="Contact Support"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Contact</span>
              </a>
            </div>
          </div>

          {/* Quick Access */}
          <div className="space-y-3">
            <strong className="text-[var(--text)] block text-xs font-black uppercase tracking-wider font-mono">Service Links</strong>
            <div className="flex flex-col gap-2 font-semibold text-[11px]">
              <a 
                href={getPageUrl('category-today')}
                onClick={(e) => {
                  if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                    e.preventDefault();
                    handleSelectPage('today'); 
                    handleScrollTo('predictions');
                  }
                }}
                className="text-left hover:text-[var(--primary)] no-underline cursor-pointer text-slate-500 dark:text-slate-400 text-xs"
              >
                Free Predictions
              </a>
              <a 
                href={getPageUrl('jackpot-list')}
                onClick={(e) => {
                  if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                    e.preventDefault();
                    handleSelectPage('jackpot-list');
                  }
                }}
                className="text-left hover:text-[var(--primary)] no-underline cursor-pointer text-slate-500 dark:text-slate-400 text-xs"
              >
                Premium Jackpots
              </a>
              <a 
                href={getPageUrl('vip-packages')}
                onClick={(e) => {
                  if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                    e.preventDefault();
                    handleSelectPage('vip-packages');
                  }
                }}
                className="text-left hover:text-[var(--primary)] no-underline cursor-pointer text-slate-500 dark:text-slate-400 text-xs"
              >
                VIP Subscription
              </a>
              <a 
                href="/#odds-packs"
                onClick={(e) => {
                  if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                    e.preventDefault();
                    if (activePage === 'home') {
                      handleScrollTo('odds-packs');
                    } else {
                      handleSelectPage('home');
                      setTimeout(() => handleScrollTo('odds-packs'), 100);
                    }
                  }
                }}
                className="text-left hover:text-[var(--primary)] no-underline cursor-pointer text-slate-500 dark:text-slate-400 text-xs"
              >
                Odds Packs & Slips
              </a>
            </div>
          </div>

          {/* Legal / Pages */}
          <div className="space-y-3">
            <strong className="text-[var(--text)] block text-xs font-black uppercase tracking-wider font-mono">Soka King Network</strong>
            <div className="flex flex-col gap-2 font-semibold text-[11px]">
              <a 
                href={getPageUrl('about')}
                onClick={(e) => {
                  if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                    e.preventDefault();
                    handleSelectPage('about');
                  }
                }}
                className="text-left hover:text-[var(--primary)] no-underline cursor-pointer text-slate-500 dark:text-slate-400 text-xs"
              >
                About Soka King
              </a>
              <a 
                href={getPageUrl('partners')}
                onClick={(e) => {
                  if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                    e.preventDefault();
                    handleSelectPage('partners');
                  }
                }}
                className="text-left hover:text-[var(--primary)] no-underline cursor-pointer text-slate-500 dark:text-slate-400 text-xs"
              >
                Strategic Partners
              </a>
              <a 
                href={getPageUrl('privacy-policy')}
                onClick={(e) => {
                  if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                    e.preventDefault();
                    handleSelectPage('privacy-policy');
                  }
                }}
                className="text-left hover:text-[var(--primary)] no-underline cursor-pointer text-slate-500 dark:text-slate-400 text-xs"
              >
                Privacy Policy
              </a>
              <a 
                href={getPageUrl('terms-of-use')}
                onClick={(e) => {
                  if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                    e.preventDefault();
                    handleSelectPage('terms-of-use');
                  }
                }}
                className="text-left hover:text-[var(--primary)] no-underline cursor-pointer text-slate-500 dark:text-slate-400 text-xs"
              >
                Terms of Use
              </a>
              <a 
                href={getPageUrl('contact')}
                onClick={(e) => {
                  if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                    e.preventDefault();
                    handleSelectPage('contact');
                  }
                }}
                className="text-left hover:text-[var(--primary)] no-underline cursor-pointer text-slate-500 dark:text-slate-400 text-xs"
              >
                Contact Support
              </a>
            </div>
          </div>

          {/* Responsible Gaming */}
          <div className="space-y-3">
            <strong className="text-[var(--text)] block text-xs font-black uppercase tracking-wider font-mono">Player Protection</strong>
            <p className="leading-relaxed text-[11px]">
              Sports prediction is speculative. Soka King does not host betting. Strictly 18+ for players in Kenya.
            </p>
            <div className="pt-1">
              <a 
                href={getPageUrl('responsible-gambling')}
                onClick={(e) => {
                  if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                    e.preventDefault();
                    handleSelectPage('responsible-gambling');
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-mono font-bold uppercase tracking-wider border border-rose-500/20 transition-all no-underline cursor-pointer"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                <span>Responsible Gambling</span>
              </a>
            </div>
          </div>

        </div>

        {/* Lower row */}
        <div className="max-w-7xl mx-auto px-4 border-t border-[var(--border)] mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-400">
          <div>
            © 2026 SOKA KING. Kenya's #1 Data-Driven Football Predictions & Jackpot Portal. All rights reserved.
          </div>
          <div className="flex gap-4 font-mono font-semibold">
            <a 
              href={getPageUrl('privacy-policy')}
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                  e.preventDefault();
                  handleSelectPage('privacy-policy');
                }
              }}
              className="hover:text-[var(--primary)] no-underline cursor-pointer text-[10px] text-slate-400"
            >
              Privacy
            </a>
            <span>•</span>
            <a 
              href={getPageUrl('terms-of-use')}
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                  e.preventDefault();
                  handleSelectPage('terms-of-use');
                }
              }}
              className="hover:text-[var(--primary)] no-underline cursor-pointer text-[10px] text-slate-400"
            >
              Terms
            </a>
            <span>•</span>
            <a 
              href={getPageUrl('responsible-gambling')}
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                  e.preventDefault();
                  handleSelectPage('responsible-gambling');
                }
              }}
              className="hover:text-[var(--primary)] no-underline cursor-pointer text-[10px] text-slate-400"
            >
              Responsibility
            </a>
            <span>•</span>
            <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--primary)] text-[10px] text-slate-400 no-underline">XML Sitemap</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
