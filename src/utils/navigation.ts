import { getDynamicUrlMaps } from '../content/markdownLoader';

export const BASE_URL_TO_PAGE_MAP: Record<string, string> = {
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
  '/predictz-predictions': 'predictz-predictions',
  '/soccervista-predictions-and-tips': 'soccervista-predictions-and-tips',
  '/sunpel-free-football-betting-tips-and-soccer-predictions': 'sunpel-free-football-betting-tips',
  '/4soka-tips': '4soka-tips-prediction',
  '/4soka-tips-prediction': '4soka-tips-prediction',
  '/jackpot-tips': 'jackpot-list',
  '/free-sportpesa-mega-jackpot-predictions-and-analysis': 'sportpesa-mega',
  '/free-sportpesa-midweek-jackpot-predictions-and-analysis': 'sportpesa-midweek',
  '/free-betika-midweek-jackpot-predictions-and-analysis': 'betika-midweek',
  '/free-mozzart-grand-jackpot-predictions-and-analysis': 'mozzart-grand',
  '/free-mozzart-super-daily-jackpot-predictions-and-analysis': 'mozzart-super-daily',
  '/free-sportybet-jackpot-predictions-and-analysis': 'sportybet-jackpot',
  '/free-betpawa-pick-jackpot-predictions-and-analysis': 'betpawa-pick-jackpot',
  '/free-odibet-laki-tatu-jackpot-predictions-and-analysis': 'odibet-laki-tatu',
  '/sportpesa-mega-jackpot-2026': 'sportpesa-mega-jackpot-2026',
  '/mozzart-super-grand-2026': 'mozzart-super-grand-2026',
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

export const BASE_PAGE_TO_URL_MAP: Record<string, string> = {
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
  'predictz-predictions': '/predictz-predictions',
  'soccervista-predictions-and-tips': '/soccervista-predictions-and-tips',
  'sunpel-free-football-betting-tips': '/sunpel-free-football-betting-tips-and-soccer-predictions',
  '4soka-tips-prediction': '/4soka-tips',
  '4soka-tips': '/4soka-tips',
  'jackpot-list': '/jackpot-tips',
  'sportpesa-mega': '/free-sportpesa-mega-jackpot-predictions-and-analysis',
  'sportpesa-midweek': '/free-sportpesa-midweek-jackpot-predictions-and-analysis',
  'betika-midweek': '/free-betika-midweek-jackpot-predictions-and-analysis',
  'mozzart-grand': '/free-mozzart-grand-jackpot-predictions-and-analysis',
  'mozzart-super-daily': '/free-mozzart-super-daily-jackpot-predictions-and-analysis',
  'sportybet-jackpot': '/free-sportybet-jackpot-predictions-and-analysis',
  'betpawa-pick-jackpot': '/free-betpawa-pick-jackpot-predictions-and-analysis',
  'odibet-laki-tatu': '/free-odibet-laki-tatu-jackpot-predictions-and-analysis',
  'sportpesa-mega-jackpot-2026': '/sportpesa-mega-jackpot-2026',
  'mozzart-super-grand-2026': '/mozzart-super-grand-2026',
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

export const { 
  urlToPageMap: URL_TO_PAGE_MAP, 
  pageToUrlMap: PAGE_TO_URL_MAP,
  dynamicCategoryPages: DYNAMIC_CATEGORY_PAGES,
  dynamicJackpotPages: DYNAMIC_JACKPOT_PAGES,
  dynamicJackpotIds: DYNAMIC_JACKPOT_IDS
} = getDynamicUrlMaps(BASE_URL_TO_PAGE_MAP, BASE_PAGE_TO_URL_MAP);

export const ALL_JACKPOT_IDS = Array.from(new Set([
  'sportpesa-mega', 
  'sportpesa-midweek', 
  'betika-midweek', 
  'mozzart-grand', 
  'sportybet-jackpot', 
  'betpawa-pick-jackpot', 
  'odibet-laki-tatu', 
  'mozzart-super-daily',
  ...DYNAMIC_JACKPOT_IDS
]));

export function getNormalizedPath(path: string): string {
  let p = path.toLowerCase().trim();
  if (p.endsWith('/') && p !== '/') {
    p = p.slice(0, -1);
  }
  return p || '/';
}

export function getPageUrl(pageId: string): string {
  if (!pageId || pageId === 'home') return '/';
  if (pageId === 'today') return '/football-predictions-today';
  if (PAGE_TO_URL_MAP[pageId]) return PAGE_TO_URL_MAP[pageId];
  if (pageId.startsWith('/')) return pageId;
  return `/${pageId}`;
}

export function getPageIdFromUrl(pathname: string): string {
  const norm = getNormalizedPath(pathname);
  return URL_TO_PAGE_MAP[norm] || 'home';
}
