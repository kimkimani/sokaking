'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  LogOut,
  User as UserIcon,
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

import { designIterations } from './data';
import { DesignIteration, Fixture, VipPackage, OddsPack } from './types';
import { getMarkdownContent, getDynamicUrlMaps } from './content/markdownLoader';

// Import Firebase client auth and api fetch utilities
import { auth, googleProvider, signInWithPopup, signOut } from './lib/firebase-client.ts';
import { onAuthStateChanged, User } from 'firebase/auth';
import { apiFetch } from './utils/api.ts';
import { PredictionCategory, getCategoryCountText } from './utils/predictionGenerator';

// Import subcomponents
import Sidebar from './components/Sidebar';

const ALL_JACKPOT_IDS = [
  'sportpesa-mega', 
  'sportpesa-midweek', 
  'betika-grand', 
  'betika-midweek', 
  'mozzart-grand', 
  'mozzart-super-grand', 
  'mozzart-daily', 
  'sportybet-jackpot', 
  'betpawa-pick-jackpot', 
  'odibet-laki-tatu', 
  'mozzart-super-daily'
];

const BASE_URL_TO_PAGE_MAP: Record<string, string> = {
  '/': 'home',
  '/football-predictions-today': 'category-today',
  '/football-predictions-yesterday': 'category-yesterday',
  '/football-predictions-tomorrow': 'category-tomorrow',
  '/football-predictions-over-1-5-goals': 'category-over15',
  '/football-predictions-btts-gg': 'category-btts',
  '/football-predictions-1x2-home-win': 'category-homewin',
  '/football-predictions-over-2-5-goals': 'category-over25',
  '/football-predictions-double-chance': 'category-doublechance',
  '/254-sure-tips': '254-sure-tips',
  '/cheerplex-predictions-and-tips-today': 'cheerplex-predictions-and-tips-today',
  '/liobet-predictions-and-tips': 'liobet-predictions-and-tips',
  '/sunpel-free-football-betting-tips-and-soccer-predictions': 'sunpel-free-football-betting-tips',
  '/sunpel-free-football-betting-tips': 'sunpel-free-football-betting-tips',
  '/jackpot-tips': 'jackpot-list',
  '/free-sportpesa-mega-jackpot-predictions-and-analysis': 'sportpesa-mega',
  '/free-sportpesa-midweek-jackpot-predictions-and-analysis': 'sportpesa-midweek',
  '/free-betika-grand-jackpot-predictions-and-analysis': 'betika-grand',
  '/free-betika-midweek-jackpot-predictions-and-analysis': 'betika-midweek',
  '/free-mozzart-grand-jackpot-predictions-and-analysis': 'mozzart-grand',
  '/free-mozzart-super-grand-jackpot-predictions-and-analysis': 'mozzart-super-grand',
  '/free-mozzart-daily-jackpot-predictions-and-analysis': 'mozzart-daily',
  '/free-sportybet-jackpot-predictions-and-analysis': 'sportybet-jackpot',
  '/free-betpawa-pick-jackpot-predictions-and-analysis': 'betpawa-pick-jackpot',
  '/free-odibet-laki-tatu-jackpot-predictions-and-analysis': 'odibet-laki-tatu',
  '/free-mozzart-super-daily-jackpot-predictions-and-analysis': 'mozzart-super-daily',
  '/about-us': 'about',
  '/partners': 'partners',
  '/responsible-gambling': 'responsible-gambling',
  '/privacy-policy': 'privacy-policy',
  '/terms-of-use': 'terms-of-use',
  '/contact-us': 'contact',
  '/vip-packages': 'vip-packages',
  '/vip-tips': 'vip-packages',
  '/vip': 'vip-packages',
  '/odds': 'vip-packages'
};

const BASE_PAGE_TO_URL_MAP: Record<string, string> = {
  'home': '/',
  'category-today': '/football-predictions-today',
  'category-yesterday': '/football-predictions-yesterday',
  'category-tomorrow': '/football-predictions-tomorrow',
  'category-over15': '/football-predictions-over-1-5-goals',
  'category-btts': '/football-predictions-btts-gg',
  'category-homewin': '/football-predictions-1x2-home-win',
  'category-over25': '/football-predictions-over-2-5-goals',
  'category-doublechance': '/football-predictions-double-chance',
  '254-sure-tips': '/254-sure-tips',
  'cheerplex-predictions-and-tips-today': '/cheerplex-predictions-and-tips-today',
  'liobet-predictions-and-tips': '/liobet-predictions-and-tips',
  'sunpel-free-football-betting-tips': '/sunpel-free-football-betting-tips-and-soccer-predictions',
  'jackpot-list': '/jackpot-tips',
  'sportpesa-mega': '/free-sportpesa-mega-jackpot-predictions-and-analysis',
  'sportpesa-midweek': '/free-sportpesa-midweek-jackpot-predictions-and-analysis',
  'betika-grand': '/free-betika-grand-jackpot-predictions-and-analysis',
  'betika-midweek': '/free-betika-midweek-jackpot-predictions-and-analysis',
  'mozzart-grand': '/free-mozzart-grand-jackpot-predictions-and-analysis',
  'mozzart-super-grand': '/free-mozzart-super-grand-jackpot-predictions-and-analysis',
  'mozzart-daily': '/free-mozzart-daily-jackpot-predictions-and-analysis',
  'sportybet-jackpot': '/free-sportybet-jackpot-predictions-and-analysis',
  'betpawa-pick-jackpot': '/free-betpawa-pick-jackpot-predictions-and-analysis',
  'odibet-laki-tatu': '/free-odibet-laki-tatu-jackpot-predictions-and-analysis',
  'mozzart-super-daily': '/free-mozzart-super-daily-jackpot-predictions-and-analysis',
  'about': '/about-us',
  'partners': '/partners',
  'responsible-gambling': '/responsible-gambling',
  'privacy-policy': '/privacy-policy',
  'terms-of-use': '/terms-of-use',
  'contact': '/contact-us',
  'vip-packages': '/vip-packages',
  'vip': '/vip-packages',
  'odds': '/vip-packages'
};

const { urlToPageMap: URL_TO_PAGE_MAP, pageToUrlMap: PAGE_TO_URL_MAP } = getDynamicUrlMaps(BASE_URL_TO_PAGE_MAP, BASE_PAGE_TO_URL_MAP);

const getNormalizedPath = (path: string) => {
  let p = path.toLowerCase();
  if (p.endsWith('/') && p !== '/') {
    p = p.slice(0, -1);
  }
  return p;
};

const getInitialPage = () => {
  if (typeof window === 'undefined') return 'home';
  const normalized = getNormalizedPath(window.location.pathname);
  return URL_TO_PAGE_MAP[normalized] || 'home';
};

const getInitialJackpot = (initialPage: string) => {
  if (ALL_JACKPOT_IDS.includes(initialPage)) {
    return initialPage;
  }
  return 'sportpesa-mega';
};
import PredictionsList from './components/PredictionsList';
import JackpotPage from './components/JackpotPage';
import JackpotListPage from './components/JackpotListPage';
import VipPackages from './components/VipPackages';
import OddsPacks from './components/OddsPacks';
import VipPackagesPage from './components/VipPackagesPage';
import LiveUpdates from './components/LiveUpdates';
import JackpotSidebar from './components/JackpotSidebar';
import PaymentModal from './components/PaymentModal';

// Category Predictions Import
import PredictionsSidebar from './components/PredictionsSidebar';
import CategoryPredictionsPage from './components/CategoryPredictionsPage';
import StaticPages from './components/StaticPages';
import FaqSection from './components/FaqSection';
import MarkdownRenderer from './components/MarkdownRenderer';
import { AuthorCard } from './components/AuthorCard';
import { ResponsibleGamblingNotice } from './components/ResponsibleGamblingNotice';
import { PREDICTION_CATEGORIES, getCategoryFixtures, isSameDay } from './utils/predictionGenerator';

export interface AppProps {
  initialPage?: string;
  initialJackpotId?: string;
}

export default function App({ initialPage, initialJackpotId }: AppProps = {}) {
  const [currentIteration, setCurrentIteration] = useState<DesignIteration>(designIterations[0]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);

  // DB Driven states
  const [dbJackpots, setDbJackpots] = useState<any[]>([]);
  const [dbVipPackages, setDbVipPackages] = useState<VipPackage[]>([]);
  const [dbOddsPacks, setDbOddsPacks] = useState<OddsPack[]>([]);
  const [dbPredictions, setDbPredictions] = useState<Record<string, Fixture[]>>({});
  const [userPurchasedItemIds, setUserPurchasedItemIds] = useState<string[]>([]);
  const [loadingDb, setLoadingDb] = useState<boolean>(true);
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
    phone: '+254712345678',
    whatsapp: '+254712345678',
    telegram: 'https://t.me/sokapredictions',
    facebook: 'https://facebook.com/sokaking',
    twitter: 'https://x.com/sokaking',
    instagram: 'https://instagram.com/sokaking'
  });

  // Portal active views state
  const defaultPage = initialPage || getInitialPage();
  const defaultJackpot = initialJackpotId || getInitialJackpot(defaultPage);
  const [activePage, setActivePage] = useState<string>(defaultPage);
  const [unlockedJackpots, setUnlockedJackpots] = useState<string[]>([]);

  // Section active states
  const [activeJackpotId, setActiveJackpotId] = useState<string>(defaultJackpot);

  // Listen to popstate event for back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const normalized = getNormalizedPath(window.location.pathname);
      const pageId = URL_TO_PAGE_MAP[normalized] || 'category-today';
      setActivePage(pageId);
      if (ALL_JACKPOT_IDS.includes(pageId)) {
        setActiveJackpotId(pageId);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Dynamic SEO Client-side update driven by markdown frontmatter
  useEffect(() => {
    const pageMd = getMarkdownContent(activePage);
    const fallbackUrl = PAGE_TO_URL_MAP[activePage] || '/football-predictions-today';
    const canonicalUrl = pageMd.link || fallbackUrl;
    
    if (pageMd.title) {
      document.title = pageMd.title;
    }

    if (pageMd.description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', pageMd.description);
    }

    if (pageMd.keywords) {
      let metaKeys = document.querySelector('meta[name="keywords"]');
      if (!metaKeys) {
        metaKeys = document.createElement('meta');
        metaKeys.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeys);
      }
      metaKeys.setAttribute('content', pageMd.keywords);
    }

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.origin + canonicalUrl);
  }, [activePage]);

  // FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Authentication Modal & Fallback States
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Listen to Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoadingAuth(false);

        try {
          // Sync user to PostgreSQL database
          const token = await currentUser.getIdToken();
          await fetch('/api/users/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });

          // Fetch user's active purchases
          const activePurchases = await apiFetch('/api/purchases');
          const itemIds = activePurchases.map((p: any) => p.itemId);
          setUserPurchasedItemIds(itemIds);
          
          const jackpots = itemIds.filter((id: string) => 
            ALL_JACKPOT_IDS.includes(id)
          );
          setUnlockedJackpots(jackpots);
        } catch (err) {
          console.error('Error syncing user and fetching purchases:', err);
        }
      } else {
        // Fallback for sandboxed iframe dev environment: Check for stored demo_token
        const demoToken = localStorage.getItem('demo_token');
        if (demoToken) {
          const parts = demoToken.split(':');
          const uid = parts[1] || 'demo_soka_user';
          const email = parts[2] || 'demo@sokaking.test';
          const mockUser = {
            uid,
            displayName: 'Guest Soka King',
            email,
            photoURL: null,
            getIdToken: async () => demoToken,
          } as any;

          setUser(mockUser);
          setLoadingAuth(false);

          try {
            // Sync guest user to Postgres DB
            await fetch('/api/users/sync', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${demoToken}`
              }
            });

            const activePurchases = await apiFetch('/api/purchases');
            const itemIds = activePurchases.map((p: any) => p.itemId);
            setUserPurchasedItemIds(itemIds);

            const jackpots = itemIds.filter((id: string) => 
              ALL_JACKPOT_IDS.includes(id)
            );
            setUnlockedJackpots(jackpots);
          } catch (err) {
            console.error('Error fetching guest purchases:', err);
          }
        } else {
          setUser(null);
          setLoadingAuth(false);
          const storedGuestPurchases = localStorage.getItem('guest_purchased_item_ids');
          if (storedGuestPurchases) {
            try {
              const guestIds = JSON.parse(storedGuestPurchases);
              if (Array.isArray(guestIds)) {
                setUserPurchasedItemIds(guestIds);
              } else {
                setUserPurchasedItemIds([]);
              }
            } catch (e) {
              setUserPurchasedItemIds([]);
            }
          } else {
            setUserPurchasedItemIds([]);
          }
          setUnlockedJackpots([]);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch Database-driven data
  const loadDatabaseData = async () => {
    try {
      setLoadingDb(true);
      const [jackpotsRes, vipRes, oddsRes, allPredictionsRes, settingsRes] = await Promise.all([
        fetch('/api/jackpots').then(r => r.ok ? r.json() : []).catch(() => []),
        fetch('/api/vip-packages').then(r => r.ok ? r.json() : []).catch(() => []),
        fetch('/api/odds-packs').then(r => r.ok ? r.json() : []).catch(() => []),
        fetch('/api/predictions').then(r => r.ok ? r.json() : []).catch(() => []),
        fetch('/api/settings').then(r => r.ok ? r.json() : null).catch(() => null),
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

      const predictionsList = Array.isArray(allPredictionsRes) ? allPredictionsRes : [];

      const yesterdayPreds = predictionsList.filter((f: any) => isSameDay(f.kickoffTime, clientYesterday));
      const todayPreds = predictionsList.filter((f: any) => isSameDay(f.kickoffTime, clientToday));
      const tomorrowPreds = predictionsList.filter((f: any) => isSameDay(f.kickoffTime, clientTomorrow));

      setDbJackpots(Array.isArray(jackpotsRes) ? jackpotsRes : []);
      setDbVipPackages(Array.isArray(vipRes) ? vipRes : []);
      setDbOddsPacks(Array.isArray(oddsRes) ? oddsRes : []);
      setDbPredictions({
        'all': predictionsList,
        'category-today': todayPreds,
        'category-yesterday': yesterdayPreds,
        'category-tomorrow': tomorrowPreds,
      });
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
          const preds = await fetch(`/api/predictions?category=${activePage}`)
            .then(r => r.ok ? r.json() : [])
            .catch(() => []);
          setDbPredictions(prev => ({
            ...prev,
            [activePage]: Array.isArray(preds) ? preds : [],
          }));
        } catch (err) {
          console.error(`Failed to load predictions for category: ${activePage}`, err);
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
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 70;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
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
    if (ALL_JACKPOT_IDS.includes(resolvedPageId)) {
      setActiveJackpotId(resolvedPageId);
    }

    // Push URL state for normal subpages
    const url = PAGE_TO_URL_MAP[resolvedPageId];
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
      if (user) {
        await apiFetch('/api/purchase', {
          method: 'POST',
          body: JSON.stringify({
            itemType: payType,
            itemId: String(payId),
          }),
        });

        // Re-fetch purchases
        const activePurchases = await apiFetch('/api/purchases');
        const itemIds = activePurchases.map((p: any) => p.itemId);
        setUserPurchasedItemIds(itemIds);

        const jackpots = itemIds.filter((id: string) => 
          ALL_JACKPOT_IDS.includes(id)
        );
        setUnlockedJackpots(jackpots);
      } else {
        // Guest user local storage persistence
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
      }

      if (payType === 'jackpot') {
        showToast(`🎉 ${payPackageName} Selections Unlocked!`);
      } else {
        showToast(`🎉 Premium ${payPackageName} activated! Checked out on Safaricom.`);
      }
    } catch (err) {
      console.error('Failed to sync purchase record:', err);
      showToast('❌ Payment processed, but database sync failed.');
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      // First clear any existing guest login state
      localStorage.removeItem('demo_token');
      
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      await fetch('/api/users/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      showToast(`👋 Welcome, ${result.user.displayName || 'User'}!`);
      setLoginModalOpen(false);
    } catch (err: any) {
      console.error('Authentication failed:', err);
      // Format informative error message for iframe sandbox environment
      if (err.code === 'auth/popup-blocked') {
        setLoginError('⚠️ Popup Blocked! Your browser blocked the secure Google sign-in window. Please enable popups, click "Open App in New Tab" in top-right to log in, or try the Guest Bypass option below.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setLoginError('⚠️ Authentication request cancelled or blocked. If you are previewing inside the AI Studio sandbox, please use the Instant Guest Bypass Option below.');
      } else {
        setLoginError(`❌ Google Sign-In failed: ${err.message || String(err)}. You can use the Quick Guest Bypass option below inside this sandbox.`);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const demoToken = `demo_soka_user:demo_${Math.random().toString(36).substring(2, 7)}@sokaking.test`;
      localStorage.setItem('demo_token', demoToken);
      
      const mockUser = {
        uid: 'demo_soka_user',
        displayName: 'Guest Soka King',
        email: 'demo@sokaking.test',
        photoURL: null,
        getIdToken: async () => demoToken,
      } as any;
      
      setUser(mockUser);
      
      // Sync guest user to Postgres DB
      await fetch('/api/users/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${demoToken}`
        }
      });
      
      const activePurchases = await apiFetch('/api/purchases');
      const itemIds = activePurchases.map((p: any) => p.itemId);
      setUserPurchasedItemIds(itemIds);
      
      const jackpots = itemIds.filter((id: string) => 
        ALL_JACKPOT_IDS.includes(id)
      );
      setUnlockedJackpots(jackpots);
      
      showToast('👋 Signed in successfully with Guest Profile!');
      setLoginModalOpen(false);
    } catch (err) {
      console.error('Guest login failed:', err);
      showToast('❌ Failed to initialize guest profile.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('demo_token');
    setUser(null);
    setUserPurchasedItemIds([]);
    setUnlockedJackpots([]);
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Error signing out:', e);
    }
    showToast('👋 Logged out successfully.');
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] font-sans antialiased selection:bg-[var(--primary)] selection:text-white transition-colors duration-500 pb-16">
      
      {/* 1. MAIN HEADER & DESKTOP TOOLBAR */}
      <header className="w-full border-b border-[var(--border)] bg-[var(--card)] backdrop-blur-[var(--backdrop)] sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          
          {/* Left: Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg bg-white bg-opacity-5 border border-[var(--border)] text-[var(--text)] cursor-pointer"
            >
              <Menu className="w-5 h-5 text-[var(--primary)]" />
            </button>
            
            <div 
              onClick={() => handleSelectPage('home')}
              className="flex items-center gap-2 cursor-pointer"
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
            </div>
          </div>

          {/* Center: Desktop Toolbar Navigation Menu */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/60 dark:bg-slate-900/40 p-1 rounded-full border border-[var(--border)] shadow-3xs">
            <button 
              onClick={() => handleSelectPage('home')}
              className={`px-3.5 py-1.5 text-xs font-bold transition-all border-none cursor-pointer rounded-full ${activePage === 'home' ? 'bg-[var(--primary)] text-white font-black shadow-3xs' : 'bg-transparent text-[var(--text-muted)] hover:text-[var(--primary)]'}`}
            >
              Home
            </button>
            <button 
              onClick={() => handleSelectPage('category-today')}
              className={`px-3.5 py-1.5 text-xs font-bold transition-all border-none cursor-pointer rounded-full ${activePage === 'category-today' ? 'bg-[var(--primary)] text-white font-black shadow-3xs' : 'bg-transparent text-[var(--text-muted)] hover:text-[var(--primary)]'}`}
            >
              Today's Tips
            </button>
            <button 
              onClick={() => handleSelectPage('jackpot-list')}
              className={`px-3.5 py-1.5 text-xs font-bold transition-all border-none cursor-pointer rounded-full ${activePage === 'jackpot-list' ? 'bg-[var(--primary)] text-white font-black shadow-3xs' : 'bg-transparent text-[var(--text-muted)] hover:text-[var(--primary)]'}`}
            >
              Jackpots
            </button>
            <button 
              onClick={() => {
                handleSelectPage('home');
                setTimeout(() => {
                  const el = document.getElementById('odds-packs');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="px-3.5 py-1.5 text-xs font-bold transition-all bg-transparent border-none cursor-pointer rounded-full text-[var(--text-muted)] hover:text-[var(--primary)]"
            >
              Odds Packs
            </button>
            <button 
              onClick={() => handleSelectPage('sportpesa-mega')}
              className={`px-3.5 py-1.5 text-xs font-bold transition-all border-none cursor-pointer rounded-full ${activePage === 'sportpesa-mega' ? 'bg-[var(--primary)] text-white font-black shadow-3xs' : 'bg-transparent text-[var(--text-muted)] hover:text-[var(--primary)]'}`}
            >
              Mega JP
            </button>
            <button 
              onClick={() => handleSelectPage('vip-packages')}
              className={`px-3.5 py-1.5 text-xs font-bold transition-all border-none cursor-pointer rounded-full ${activePage === 'vip-packages' ? 'bg-[var(--primary)] text-white font-black shadow-3xs' : 'bg-transparent text-[var(--text-muted)] hover:text-[var(--primary)]'}`}
            >
              VIP
            </button>
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
              className="px-3.5 py-1.5 bg-[var(--primary)] text-white text-[10px] lg:text-xs font-extrabold rounded-[var(--radius)] shadow-sm hover:opacity-90 cursor-pointer border-none"
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
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-6">
        {loadingDb ? (
          <div className="py-24 text-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-[var(--primary)] mx-auto" />
            <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest animate-pulse">
              Loading...
            </p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            
            {/* MAIN CENTER DASHBOARD CONTAINER */}
            <main className="flex-1 w-full space-y-8 overflow-hidden">
              
              {(() => {
                const category = PREDICTION_CATEGORIES.find(c => 
                  c.id === activePage || 
                  (c.id === 'sunpel-free-football-betting-tips' && activePage.startsWith('sunpel-free-football-betting-tips'))
                );
                if (category) {
                  const categoryFixtures = getCategoryFixtures(category.id, dbPredictions.all && dbPredictions.all.length > 0 ? dbPredictions.all : dbPredictions);
                  return (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={category.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.25 }}
                      >
                        <CategoryPredictionsPage 
                          category={category}
                          fixtures={categoryFixtures}
                          onBackToHome={() => handleSelectPage('home')}
                          onSelectPage={handleSelectPage}
                          onOpenPayment={handleOpenPayment}
                          jackpots={dbJackpots}
                        />
                      </motion.div>
                    </AnimatePresence>
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

                if (ALL_JACKPOT_IDS.includes(activePage)) {
                  let activeJackpot = dbJackpots.find(j => j.id === activePage || j.slug === activePage);
                  if (!activeJackpot) {
                    activeJackpot = jackpotsData.find(j => j.id === activePage || j.slug === activePage);
                  }
                  if (!activeJackpot) return null;

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
                      confidence: f.confidence || 75,
                      aiAnalysis: f.aiAnalysis || f.ai_analysis || 'AI mathematical model favors this outcome based on form and tactical alignment.'
                    }))
                  };

                  const isJackpotUnlocked = unlockedJackpots.includes(formattedJackpot.id);

                  return (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={formattedJackpot.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.25 }}
                      >
                        <JackpotPage 
                          jackpot={formattedJackpot}
                          hasPaid={isJackpotUnlocked}
                          onOpenPayment={handleOpenPayment}
                          onBackToList={() => handleSelectPage('jackpot-list')}
                        />
                      </motion.div>
                    </AnimatePresence>
                  );
                }

                if (['vip-packages', 'vip', 'odds'].includes(activePage)) {
                  return (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key="vip-packages-page"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.25 }}
                      >
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
                      </motion.div>
                    </AnimatePresence>
                  );
                }

                if (['about', 'partners', 'responsible-gambling', 'privacy-policy', 'terms-of-use', 'contact'].includes(activePage)) {
                  return (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activePage}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.25 }}
                      >
                        <StaticPages 
                          pageId={activePage}
                          onBackToHome={() => handleSelectPage('home')}
                        />
                      </motion.div>
                    </AnimatePresence>
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
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={activePage}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.25 }}
                          >
                            <JackpotPage 
                              jackpot={activeJackpot}
                              hasPaid={isJackpotUnlocked}
                              onOpenPayment={handleOpenPayment}
                              onBackToList={() => handleSelectPage('jackpot-list')}
                              pageId={activePage}
                            />
                          </motion.div>
                        </AnimatePresence>
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
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activePage}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -15 }}
                          transition={{ duration: 0.25 }}
                        >
                          <CategoryPredictionsPage 
                            category={dynamicCategory}
                            fixtures={categoryFixtures}
                            onBackToHome={() => handleSelectPage('home')}
                            onSelectPage={handleSelectPage}
                            onOpenPayment={handleOpenPayment}
                            jackpots={dbJackpots}
                            pageId={activePage}
                          />
                        </motion.div>
                      </AnimatePresence>
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
                          <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" /> Live Database Integration Connected
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
                            className="px-5 py-3 bg-[var(--primary)] text-white font-extrabold text-xs rounded-[var(--radius)] shadow-lg hover:opacity-95 flex items-center gap-1.5 transition-all cursor-pointer border-none"
                          >
                            <Zap className="w-4 h-4" /> View Free Predictions
                          </button>
                          <button
                            onClick={() => handleSelectPage('vip-packages')}
                            className="px-5 py-3 bg-white bg-opacity-5 hover:bg-opacity-10 border border-[var(--border)] text-[var(--text)] hover:border-[var(--primary)] font-bold text-xs rounded-[var(--radius)] transition-all cursor-pointer"
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
                        <span className="text-[10px] font-mono font-black uppercase text-indigo-500 tracking-wider">
                          Quick Category Shortcuts
                        </span>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                          {PREDICTION_CATEGORIES.map((cat) => {
                            const isCatActive = activePage === cat.id;
                            return (
                              <button
                                key={cat.id}
                                onClick={() => handleSelectPage(cat.id)}
                                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-black shrink-0 transition-all border cursor-pointer ${
                                  isCatActive 
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-3xs scale-102' 
                                    : 'bg-[var(--card)] text-[var(--text-muted)] hover:text-[var(--text)] border-[var(--border)] hover:bg-slate-100/40 dark:hover:bg-slate-900/30'
                                }`}
                              >
                                <span>{cat.icon}</span>
                                <span>{cat.label}</span>
                                <span className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded-full ${
                                  isCatActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                }`}>
                                  {getCategoryCountText(cat.id, dbPredictions.all && dbPredictions.all.length > 0 ? dbPredictions.all : dbPredictions).split(' ')[0]}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <PredictionsList 
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
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-mono font-bold uppercase tracking-wider animate-pulse">
                            <Trophy className="w-3 h-3" /> Premium Jackpots Available
                          </div>
                          <h3 className="text-md md:text-lg font-black text-[var(--text)] tracking-tight uppercase" style={{ fontFamily: 'var(--font-display)' }}>
                            Soka King Premium Jackpots
                          </h3>
                          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                            Get mathematically analyzed prediction codes for SportPesa Mega (17), Betika Midweek (15), Betika Grand (17), and Mozzart Super Grand (20). Our Poisson algorithms deliver high confidence slips.
                          </p>
                        </div>

                        <button
                          onClick={() => handleSelectPage('jackpot-list')}
                          className="px-5 py-3 shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md active:scale-95 transition-all border-none cursor-pointer flex items-center gap-1.5"
                        >
                          <span>VIEW ALL JACKPOTS</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Quick brand badge shortcuts */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-[var(--border)]">
                        {dbJackpots.slice(0, 4).map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleSelectPage(item.id)}
                            className="p-2.5 rounded-lg border bg-[var(--card)] text-left transition-all cursor-pointer border-emerald-500/20 hover:border-emerald-500/50 hover:bg-emerald-500/5 flex flex-col justify-between"
                          >
                            <span className="text-[11px] font-black text-[var(--text)] tracking-tight uppercase">{item.name}</span>
                            <span className="text-[9px] text-slate-400 font-mono font-bold mt-1">{item.gamesCount} Games</span>
                          </button>
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

                      {homeMd.authorName && (
                        <AuthorCard 
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
        )}
      </div>

      {/* 4. MODAL FOR INTEGRATED SECURE PAYMENTS */}
      <AnimatePresence>
        {paymentOpen && (
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
        )}
      </AnimatePresence>

      {/* 5. INTERACTIVE FLOOR TOAST ALERTS */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-6 left-6 z-50 px-4 py-3 rounded-lg bg-neutral-900 border border-neutral-800 text-white shadow-xl text-xs flex items-center gap-2"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. FLOATING WHATSAPP BUTTON */}
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40">
        <a 
          href="https://wa.me/254712345678" 
          target="_blank" 
          rel="noopener noreferrer"
          title="Contact WhatsApp Support"
          className="w-12 h-12 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all duration-200"
        >
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.964 9.964 0 001.333 4.993L2 22l5.233-1.237a9.96 9.96 0 004.779 1.217h.004c5.505 0 9.988-4.478 9.989-9.985 0-2.669-1.038-5.176-2.925-7.062A9.925 9.925 0 0012.012 2zm0 2c2.133 0 4.14.83 5.648 2.338a7.935 7.935 0 012.338 5.646c-.001 4.41-3.587 7.996-7.996 7.996h-.003a7.936 7.936 0 01-3.801-.973l-.272-.162-2.825.668.683-2.756-.178-.283a7.938 7.938 0 01-1.213-4.184c0-4.409 3.586-7.994 7.995-7.994zm-3.084 4.5c-.171 0-.447.064-.681.318-.233.255-.892.871-.892 2.124 0 1.253.913 2.463 1.04 2.633.128.17 1.796 2.742 4.352 3.846 2.124.918 2.557.735 3.024.693.467-.043 1.508-.616 1.72-1.21.212-.595.212-1.105.148-1.211-.063-.106-.233-.17-.488-.297-.255-.127-1.508-.743-1.741-.828-.233-.085-.403-.127-.573.128-.17.254-.658.828-.807 1.002-.149.173-.297.191-.552.064-.255-.128-1.077-.397-2.052-1.266-.759-.677-1.272-1.513-1.421-1.768-.149-.255-.016-.393.111-.52.115-.114.255-.297.382-.446.128-.149.17-.255.255-.425.085-.17.043-.318-.021-.446-.064-.127-.573-1.381-.786-1.89-.207-.496-.418-.429-.573-.437-.149-.008-.318-.008-.488-.008z" />
          </svg>
        </a>
      </div>

      {/* 7. MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--card)]/95 backdrop-blur-md border-t border-[var(--border)] px-2 py-1.5 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => { handleSelectPage('category-today'); handleScrollTo('predictions'); }}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer border-none ${
            ['today', 'category-today', 'category-tomorrow', '254-sure-tips'].includes(activePage)
              ? 'bg-[var(--primary)] text-white shadow-3xs font-black'
              : 'bg-transparent text-[var(--text-muted)] hover:text-[var(--text)]'
          }`}
        >
          <Flame className={`w-4 h-4 mb-0.5 ${['today', 'category-today', 'category-tomorrow', '254-sure-tips'].includes(activePage) ? 'text-white' : 'text-amber-500'}`} />
          <span>Free Tips</span>
        </button>

        <button
          onClick={() => handleSelectPage('sportpesa-mega')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer border-none ${
            activePage === 'sportpesa-mega'
              ? 'bg-[var(--primary)] text-white shadow-3xs font-black'
              : 'bg-transparent text-[var(--text-muted)] hover:text-[var(--text)]'
          }`}
        >
          <Trophy className={`w-4 h-4 mb-0.5 ${activePage === 'sportpesa-mega' ? 'text-white' : 'text-amber-500'}`} />
          <span>Mega JP</span>
        </button>

        <button
          onClick={() => handleSelectPage('vip-packages')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer border-none ${
            activePage === 'vip-packages'
              ? 'bg-[var(--primary)] text-white shadow-3xs font-black'
              : 'bg-transparent text-[var(--text-muted)] hover:text-[var(--text)]'
          }`}
        >
          <Crown className={`w-4 h-4 mb-0.5 ${activePage === 'vip-packages' ? 'text-white' : 'text-amber-500'}`} />
          <span>VIP</span>
        </button>

        <button
          onClick={() => handleSelectPage('jackpot-list')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer border-none ${
            ['jackpot-list', 'betika-grand', 'betika-midweek', 'sportpesa-midweek', 'mozzart-super-grand', 'mozzart-super-daily', 'sportybet-jackpot', 'betpawa-pick-jackpot', 'odibet-laki-tatu'].includes(activePage)
              ? 'bg-[var(--primary)] text-white shadow-3xs font-black'
              : 'bg-transparent text-[var(--text-muted)] hover:text-[var(--text)]'
          }`}
        >
          <Layers className={`w-4 h-4 mb-0.5 ${['jackpot-list', 'betika-grand', 'betika-midweek', 'sportpesa-midweek', 'mozzart-super-grand', 'mozzart-super-daily', 'sportybet-jackpot', 'betpawa-pick-jackpot', 'odibet-laki-tatu'].includes(activePage) ? 'text-white' : ''}`} />
          <span>Jackpots</span>
        </button>
      </nav>

      {/* 8. FOOTER */}
      <footer className="mt-16 border-t border-[var(--border)] bg-slate-50 dark:bg-slate-950/60 py-12 pb-24 md:pb-12 text-xs transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-left text-slate-500 dark:text-slate-400">
          
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
              Kenya's elite database-driven soccer analytics portal. We turn raw sporting indices into mathematically calibrated outcomes.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {siteContacts.whatsapp && (
                <a 
                  href={`https://wa.me/${siteContacts.whatsapp.replace(/[^0-9]/g, '')}`} 
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
              <button 
                onClick={() => handleSelectPage('contact')} 
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-slate-200 dark:bg-slate-800 text-[var(--text)] font-mono text-[11px] font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-all cursor-pointer border-none" 
                title="Contact Support"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Contact</span>
              </button>
            </div>
          </div>

          {/* Quick Access */}
          <div className="space-y-3">
            <strong className="text-[var(--text)] block text-xs font-black uppercase tracking-wider font-mono">Service Links</strong>
            <div className="flex flex-col gap-2 font-semibold text-[11px]">
              <button onClick={() => { handleSelectPage('today'); handleScrollTo('predictions'); }} className="text-left hover:text-[var(--primary)] bg-transparent border-none cursor-pointer text-slate-500 dark:text-slate-400 text-xs">Free Predictions</button>
              <button onClick={() => handleSelectPage('jackpot-list')} className="text-left hover:text-[var(--primary)] bg-transparent border-none cursor-pointer text-slate-500 dark:text-slate-400 text-xs">Premium Jackpots</button>
              <button onClick={() => handleSelectPage('vip-packages')} className="text-left hover:text-[var(--primary)] bg-transparent border-none cursor-pointer text-slate-500 dark:text-slate-400 text-xs">VIP Subscription</button>
              <button onClick={() => handleSelectPage('vip-packages')} className="text-left hover:text-[var(--primary)] bg-transparent border-none cursor-pointer text-slate-500 dark:text-slate-400 text-xs">Odds Packs & slips</button>
              <button onClick={() => { handleSelectPage('today'); handleScrollTo('faq'); }} className="text-left hover:text-[var(--primary)] bg-transparent border-none cursor-pointer text-slate-500 dark:text-slate-400 text-xs">Interactive FAQ</button>
            </div>
          </div>

          {/* Legal / Pages */}
          <div className="space-y-3">
            <strong className="text-[var(--text)] block text-xs font-black uppercase tracking-wider font-mono">Soka King Network</strong>
            <div className="flex flex-col gap-2 font-semibold text-[11px]">
              <button onClick={() => handleSelectPage('about')} className="text-left hover:text-[var(--primary)] bg-transparent border-none cursor-pointer text-slate-500 dark:text-slate-400 text-xs">About Soka King</button>
              <button onClick={() => handleSelectPage('partners')} className="text-left hover:text-[var(--primary)] bg-transparent border-none cursor-pointer text-slate-500 dark:text-slate-400 text-xs">Strategic Partners</button>
              <button onClick={() => handleSelectPage('privacy-policy')} className="text-left hover:text-[var(--primary)] bg-transparent border-none cursor-pointer text-slate-500 dark:text-slate-400 text-xs">Privacy Policy</button>
              <button onClick={() => handleSelectPage('terms-of-use')} className="text-left hover:text-[var(--primary)] bg-transparent border-none cursor-pointer text-slate-500 dark:text-slate-400 text-xs">Terms of Use</button>
              <button onClick={() => handleSelectPage('contact')} className="text-left hover:text-[var(--primary)] bg-transparent border-none cursor-pointer text-slate-500 dark:text-slate-400 text-xs">Contact Support</button>
            </div>
          </div>

          {/* Responsible Gaming */}
          <div className="space-y-3">
            <strong className="text-[var(--text)] block text-xs font-black uppercase tracking-wider font-mono">Player Protection</strong>
            <p className="leading-relaxed text-[11px]">
              Sports prediction is speculative. Soka King does not host betting. Strictly 18+ for players in Kenya.
            </p>
            <div className="pt-1">
              <button 
                onClick={() => handleSelectPage('responsible-gambling')} 
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-mono font-bold uppercase tracking-wider border border-rose-500/20 transition-all cursor-pointer"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                <span>Responsible Gambling</span>
              </button>
            </div>
          </div>

        </div>

        {/* Lower row */}
        <div className="max-w-7xl mx-auto px-4 border-t border-[var(--border)] mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-400">
          <div>
            © 2026 SOKA KING. Built with Real-Time Database Sync. All rights reserved.
          </div>
          <div className="flex gap-4 font-mono font-semibold">
            <button onClick={() => handleSelectPage('privacy-policy')} className="hover:text-[var(--primary)] bg-transparent border-none cursor-pointer text-[10px] text-slate-400">Privacy</button>
            <span>•</span>
            <button onClick={() => handleSelectPage('terms-of-use')} className="hover:text-[var(--primary)] bg-transparent border-none cursor-pointer text-[10px] text-slate-400">Terms</button>
            <span>•</span>
            <button onClick={() => handleSelectPage('responsible-gambling')} className="hover:text-[var(--primary)] bg-transparent border-none cursor-pointer text-[10px] text-slate-400">Responsibility</button>
          </div>
        </div>
      </footer>

    </div>
  );
}
