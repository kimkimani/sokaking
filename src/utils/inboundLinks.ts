import { getPageUrl } from './navigation';
import { PAGE_METADATA_MAP } from '../content/pageMetadata';

export interface InboundLinkItem {
  id: string;
  title: string;
  url: string;
  description: string;
  tag: string;
  icon: string;
  type: 'category' | 'competitor' | 'jackpot' | 'static' | 'vip';
}

export interface InboundLinksGroup {
  sectionTitle: string;
  sectionSubtitle: string;
  badgeText?: string;
  type: 'category' | 'competitor' | 'jackpot' | 'static' | 'vip';
  links: InboundLinkItem[];
}

/**
 * Curated defaults and overrides for established pages
 */
const CURATED_LINKS: Record<string, Partial<InboundLinkItem>> = {
  // --- COMPETITOR / ALTERNATIVE PORTAL PAGES ---
  '254-sure-tips': {
    title: '254 Sure Tips Today',
    url: '/254-sure-tips',
    description: 'High-confidence fixed odds models and sure banker predictions for Kenyan punters.',
    tag: 'Sure 254 Banker',
    icon: '🎯',
    type: 'competitor',
  },
  '254-golden-tips': {
    title: '254 Golden Tips',
    url: '/254-golden-tips',
    description: 'Daily curated high-probability golden tips, double chance options, and value selections.',
    tag: '254 Golden Tips',
    icon: '✨',
    type: 'competitor',
  },
  'sokamastas-predictions-and-tips': {
    title: 'Sokamastas Predictions',
    url: '/sokamastas-predictions-and-tips',
    description: 'Daily Sokamasta football tips, 1X2 banker slips, and Poisson goal distribution forecasts.',
    tag: 'Sokamasta Picks',
    icon: '⚡',
    type: 'competitor',
  },
  'sunpel-free-football-betting-tips': {
    title: 'Sunpelpredict Banker Tips',
    url: '/sunpel-free-football-betting-tips-and-soccer-predictions',
    description: 'Daily Sunpel football predictions, high-confidence banker picks, and soccer tips.',
    tag: 'Sunpel Banker',
    icon: '🌟',
    type: 'competitor',
  },
  '4soka-tips-prediction': {
    title: '4Soka Tips Predictions',
    url: '/4soka-tips',
    description: 'Daily mathematical football tips, 1X2 predictions, BTTS picks, and statistical game analysis.',
    tag: '4Soka Tips',
    icon: '🌐',
    type: 'competitor',
  },

  // --- PREDICTION CATEGORY PAGES ---
  'category-today': {
    title: "Today's Football Predictions",
    url: '/football-predictions-today',
    description: 'Comprehensive daily soccer predictions, 1X2 options, and banker singles.',
    tag: 'Daily Fixtures',
    icon: '📅',
    type: 'category',
  },
  'category-tomorrow': {
    title: 'Tomorrow Football Predictions',
    url: '/football-predictions-tomorrow',
    description: 'Early tactical analysis, expected lineups, and preview odds for tomorrow matches.',
    tag: 'Early Lines',
    icon: '⏱️',
    type: 'category',
  },
  'category-yesterday': {
    title: 'Yesterday Predictions Results',
    url: '/football-predictions-yesterday',
    description: 'Verified historical performance log and past match win rates with transparent scores.',
    tag: 'Verified Results',
    icon: '📋',
    type: 'category',
  },
  'category-over25': {
    title: 'Over 2.5 Goals Predictions',
    url: '/football-predictions-over-2-5-goals',
    description: 'High-scoring match forecast models with >2.5 total goals probability ratings.',
    tag: '3+ Total Goals',
    icon: '💥',
    type: 'category',
  },
  'category-over15': {
    title: 'Over 1.5 Goals Predictions',
    url: '/football-predictions-over-1-5-goals',
    description: 'Safe low-risk goal-line tips with over 88% historical accuracy rate.',
    tag: 'Safe Goals',
    icon: '🛡️',
    type: 'category',
  },
  'category-btts': {
    title: 'Both Teams To Score (BTTS/GG)',
    url: '/football-predictions-btts-gg',
    description: 'Goal-Goal predictions identifying matches where both sides possess high scoring form.',
    tag: 'BTTS / GG',
    icon: '🤝',
    type: 'category',
  },
  'category-homewin': {
    title: '1X2 Home Win Predictions',
    url: '/football-predictions-1x2-home-win',
    description: 'Dominant home turf selections with high expected goal conversion differentials.',
    tag: '1X2 Home Turf',
    icon: '🏰',
    type: 'category',
  },
  'category-doublechance': {
    title: 'Double Chance (1X, 12, X2)',
    url: '/football-predictions-double-chance',
    description: 'High probability two-way safety slips covering two out of three match outcomes.',
    tag: 'Double Cover',
    icon: '🎲',
    type: 'category',
  },

  // --- JACKPOT PAGES ---
  'jackpot-list': {
    title: 'All Kenyan Jackpots 2026',
    url: '/jackpot-tips',
    description: 'Full portal for all Kenyan football jackpots with combination generator and filters.',
    tag: 'All Jackpots Hub',
    icon: '🏆',
    type: 'jackpot',
  },
  'sportpesa-mega': {
    title: 'SportPesa Mega Jackpot (17)',
    url: '/free-sportpesa-mega-jackpot-prediction',
    description: 'KES 300 Million pool analysis with double chance combinations for 17 fixtures.',
    tag: '17 Games | KES 300M+',
    icon: '💰',
    type: 'jackpot',
  },
  'sportpesa-midweek': {
    title: 'SportPesa Midweek Jackpot (13)',
    url: '/free-sportpesa-midweek-jackpot-predictions-and-analysis',
    description: '13-match midweek jackpot analysis with tactical fatigue matrices and covers.',
    tag: '13 Games | KES 15M+',
    icon: '⚽',
    type: 'jackpot',
  },
  'betika-midweek': {
    title: 'Betika Midweek Jackpot (15)',
    url: '/free-betika-midweek-jackpot-predictions-and-analysis',
    description: 'KES 15 Million 15-game jackpot selections with computer model probability.',
    tag: '15 Games | KES 15M',
    icon: '🎖️',
    type: 'jackpot',
  },
  'mozzart-grand': {
    title: 'Mozzart Grand Jackpot (16)',
    url: '/free-mozzart-grand-jackpot-predictions-and-analysis',
    description: 'Fixed KES 200 Million jackpot slips for 16 weekend European fixtures.',
    tag: '16 Games | KES 200M',
    icon: '💎',
    type: 'jackpot',
  },
  'mozzart-super-daily': {
    title: 'Mozzart Super Daily Jackpot',
    url: '/free-mozzart-super-daily-jackpot-predictions-and-analysis',
    description: 'Daily KES 20 Million 13-game jackpot combinations updated every morning.',
    tag: 'Daily | KES 20M',
    icon: '⏰',
    type: 'jackpot',
  },
  'odibet-laki-tatu': {
    title: 'OdiBet Laki Tatu Daily',
    url: '/free-odibet-laki-tatu-jackpot-predictions-and-analysis',
    description: 'Daily 10-match micro jackpot selections with low entry stake and high returns.',
    tag: '10 Games | Daily',
    icon: '🎁',
    type: 'jackpot',
  },
  'sportybet-jackpot': {
    title: 'SportyBet 12 Jackpot',
    url: '/free-sportybet-jackpot-predictions-and-analysis',
    description: '12-game weekly master ticket optimized for African football betting markets.',
    tag: '12 Games Pool',
    icon: '🚀',
    type: 'jackpot',
  },
  'betpawa-pick-jackpot': {
    title: 'betPawa Pick 13 Jackpot',
    url: '/free-betpawa-pick-jackpot-predictions-and-analysis',
    description: 'Pick 13 jackpot analysis with small stake leverage and mathematically vetted picks.',
    tag: '13 Games Pool',
    icon: '🎟️',
    type: 'jackpot',
  },

  // --- STATIC and VIP PAGES ---
  'vip-packages': {
    title: 'VIP Packages and Daily Odds',
    url: '/vip-packages',
    description: 'Premium curated 2+ odds, 5+ odds shortlists, and guaranteed jackpot slips via M-Pesa.',
    tag: 'VIP Subscription',
    icon: '👑',
    type: 'vip',
  },
  'about': {
    title: 'About Soka King Intelligence',
    url: '/about-us',
    description: 'Learn about our quantitative sports models, Poisson algorithms, and expert team.',
    tag: 'Platform Info',
    icon: '📖',
    type: 'static',
  },
  'partners': {
    title: 'Strategic Partners and Affiliates',
    url: '/partners',
    description: 'Explore our sports data feeds, API providers, and strategic betting network partners.',
    tag: 'Data Affiliates',
    icon: '🤝',
    type: 'static',
  },
  'responsible-gambling': {
    title: 'Responsible Gambling Center',
    url: '/responsible-gambling',
    description: 'Player safety guidelines, bankroll allocation formulas, and Kenya helpline resources.',
    tag: 'Player Safety',
    icon: '🛡️',
    type: 'static',
  },
  'privacy-policy': {
    title: 'Privacy Policy and Data Security',
    url: '/privacy-policy',
    description: 'How we safeguard user telephone numbers, M-Pesa transaction IDs, and privacy.',
    tag: 'Data Compliance',
    icon: '🔒',
    type: 'static',
  },
  'terms-of-use': {
    title: 'Terms of Use and Disclaimer',
    url: '/terms-of-use',
    description: 'Digital subscription agreement, age limits (18+), and service warranty terms.',
    tag: 'Terms and Legal',
    icon: '⚖️',
    type: 'static',
  },
  'contact': {
    title: 'Customer Dispatch and Support',
    url: '/contact-us',
    description: '24/7 WhatsApp dispatch, email ticketing, and Nairobi headquarters contact details.',
    tag: '24/7 Support',
    icon: '📞',
    type: 'static',
  },
};

/**
 * Universal Inbound Links Catalog
 * Builds dynamically from PAGE_METADATA_MAP with curated enhancements
 */
export function getAllInboundLinks(): Record<string, InboundLinkItem> {
  const links: Record<string, InboundLinkItem> = {};

  // Automatically index ONLY pages that exist in PAGE_METADATA_MAP
  for (const [key, meta] of Object.entries(PAGE_METADATA_MAP)) {
    if (key === 'home' || key === '') continue;

    const curated = CURATED_LINKS[key];
    const pageType = (meta.type as InboundLinkItem['type']) || (curated?.type) || detectPageType(key, meta.type, meta.jackpotId);
    let tag = curated?.tag || meta.inboundBadge || meta.title || 'Soccer Tips';
    if (tag.length > 22) tag = tag.slice(0, 20) + '...';

    links[key] = {
      id: key,
      title: curated?.title || meta.displayTitle || meta.title || key,
      url: meta.link || curated?.url || getPageUrl(key),
      description: curated?.description || meta.description || 'Verified football analysis and mathematical prediction tips.',
      tag: tag,
      icon: curated?.icon || meta.icon || (pageType === 'jackpot' ? '🏆' : pageType === 'category' ? '⚽' : pageType === 'static' ? '📖' : '🌐'),
      type: pageType === 'home' ? 'category' : pageType,
    };
  }

  return links;
}

export const ALL_LINKS: Record<string, InboundLinkItem> = getAllInboundLinks();

/**
 * Determine page archetype from pageId and optional markdown frontmatter.
 */
export function detectPageType(
  pageId: string, 
  rawType?: string, 
  jackpotId?: string
): 'competitor' | 'jackpot' | 'category' | 'static' | 'vip' | 'home' {
  const norm = pageId.toLowerCase().trim();

  if (norm === 'home' || norm === '' || norm === '/') {
    return 'home';
  }

  if (norm === 'vip-packages' || norm === 'vip' || norm === 'odds') {
    return 'vip';
  }

  // Check PAGE_METADATA_MAP first if available
  if (PAGE_METADATA_MAP[norm]?.type) {
    const metaType = PAGE_METADATA_MAP[norm].type;
    if (metaType === 'competitor') return 'competitor';
    if (metaType === 'jackpot') return 'jackpot';
    if (metaType === 'category') return 'category';
    if (metaType === 'static') return 'static';
  }

  if (
    rawType === 'competitor' || 
    norm === '254-sure-tips' || 
    norm === '254-golden-tips' ||
    norm === 'sokamastas-predictions-and-tips' ||
    norm === 'cheerplex-predictions-and-tips-today' || 
    norm === 'liobet-predictions-and-tips' || 
    norm === 'predictz-predictions' || 
    norm === 'soccervista-predictions-and-tips' || 
    norm === 'sunpel-free-football-betting-tips' ||
    norm === '4soka-tips-prediction' ||
    norm.includes('sunpel') ||
    norm.includes('predictz') ||
    norm.includes('soccervista') ||
    norm.includes('liobet') ||
    norm.includes('cheerplex') ||
    norm.includes('sokamasta') ||
    norm.includes('golden-tips') ||
    norm.includes('4soka')
  ) {
    return 'competitor';
  }

  if (
    rawType === 'jackpot' || 
    Boolean(jackpotId) || 
    norm === 'jackpot-list' || 
    norm.startsWith('sportpesa-') || 
    norm.startsWith('betika-') || 
    norm.startsWith('mozzart-') || 
    norm.startsWith('odibet-') || 
    norm.startsWith('sportybet-') || 
    norm.startsWith('betpawa-') || 
    norm.includes('jackpot')
  ) {
    return 'jackpot';
  }

  if (
    rawType === 'category' || 
    norm.startsWith('category-') || 
    norm.includes('over-1-5') || 
    norm.includes('over-2-5') || 
    norm.includes('btts') || 
    norm.includes('home-win') || 
    norm.includes('double-chance') ||
    norm.includes('today') ||
    norm.includes('tomorrow') ||
    norm.includes('yesterday')
  ) {
    return 'category';
  }

  return 'static';
}

/**
 * Returns exactly 3 distinct, contextual inbound links for any page on Soka King.
 */
export function getInboundLinks(
  pageId: string, 
  rawType?: string, 
  jackpotId?: string,
  overrides?: {
    title?: string;
    subtitle?: string;
    badgeText?: string;
  }
): InboundLinksGroup {
  const dynamicLinks = getAllInboundLinks();
  const pageType = detectPageType(pageId, rawType, jackpotId);
  const norm = pageId.toLowerCase().trim();

  // Helper to ensure target links exclude the current page
  const selectThree = (candidateIds: string[]): InboundLinkItem[] => {
    const valid = candidateIds
      .filter(id => id !== norm && !norm.includes(id) && !id.includes(norm))
      .map(id => dynamicLinks[id])
      .filter(Boolean);

    // If we need more to reach 3, fallback from complementary pools
    if (valid.length < 3) {
      const allKeys = Object.keys(dynamicLinks);
      for (const fb of allKeys) {
        if (valid.length >= 3) break;
        if (fb !== norm && !valid.some(v => v.id === fb)) {
          const item = dynamicLinks[fb];
          if (item && item.type === pageType) {
            valid.push(item);
          }
        }
      }
    }

    if (valid.length < 3) {
      const fallbacks = [
        'category-today',
        'category-over25',
        'category-btts',
        'sportpesa-mega',
        'betika-midweek',
        'vip-packages',
        '254-sure-tips',
        'sunpel-free-football-betting-tips',
        '254-golden-tips',
        'sokamastas-predictions-and-tips',
        '4soka-tips-prediction'
      ];
      for (const fb of fallbacks) {
        if (valid.length >= 3) break;
        if (fb !== norm && !valid.some(v => v.id === fb) && dynamicLinks[fb]) {
          valid.push(dynamicLinks[fb]);
        }
      }
    }

    return valid.slice(0, 3);
  };

  // 1. COMPETITOR PAGES -> Inbound links to other competitor analysis and prediction portals
  if (pageType === 'competitor') {
    // Collect all competitor pages dynamically
    const allCompetitors = Object.entries(dynamicLinks)
      .filter(([id, item]) => item.type === 'competitor')
      .map(([id]) => id);

    const localPortals = allCompetitors.filter(id => 
      id.includes('254') || id.includes('soka') || id.includes('masta')
    );
    const globalPortals = allCompetitors.filter(id => 
      !localPortals.includes(id)
    );

    const isLocal = localPortals.includes(norm);
    const currentList = isLocal ? localPortals : globalPortals;
    const idx = Math.max(0, currentList.indexOf(norm));

    // Ensure balanced distribution between regional and global portals
    const sameGroup = (isLocal ? localPortals : globalPortals).filter(p => p !== norm);
    const otherGroup = (isLocal ? globalPortals : localPortals).filter(p => p !== norm);

    const candidateIds: string[] = [];
    if (sameGroup.length > 0) {
      candidateIds.push(sameGroup[idx % sameGroup.length]);
    }
    if (otherGroup.length > 0) {
      candidateIds.push(otherGroup[idx % otherGroup.length]);
      if (otherGroup.length > 1) {
        candidateIds.push(otherGroup[(idx + 1) % otherGroup.length]);
      }
    }
    if (sameGroup.length > 1 && candidateIds.length < 3) {
      candidateIds.push(sameGroup[(idx + 1) % sameGroup.length]);
    }

    // Append remaining competitors as fallbacks
    for (const comp of allCompetitors) {
      if (comp !== norm && !candidateIds.includes(comp)) {
        candidateIds.push(comp);
      }
    }

    let defaultTitle = 'Alternative Prediction Portals and Mathematical Tips';
    let defaultSubtitle = 'Compare daily algorithmic models, banker accuracy rates, and Poisson distributions with top soccer analytics networks.';

    if (norm.includes('sunpel')) {
      defaultTitle = 'Sunpel Alternatives and Free Football Prediction Networks';
      defaultSubtitle = 'Compare Sunpel banker picks and soccer analysis with other verified mathematical tipsters and daily prediction models.';
    } else if (norm.includes('254-golden')) {
      defaultTitle = '254 Golden Tips Alternatives and Prediction Platforms';
      defaultSubtitle = 'Compare 254 Golden Tips daily mathematical picks with other top soccer analytics and alternative portals.';
    } else if (norm.includes('254-sure') || norm === '254-sure-tips') {
      defaultTitle = '254 Sure Tips Alternatives and Related Analysis Portals';
      defaultSubtitle = 'Compare 254 Sure Tips daily algorithmic models, banker accuracy rates, and Poisson distributions with top soccer analytics networks.';
    } else if (norm.includes('sokamasta')) {
      defaultTitle = 'Alternative Predictions to Sokamastas Tips';
      defaultSubtitle = 'Compare Sokamastas match selections and 1X2 banker tips with other verified football prediction engines.';
    } else if (norm.includes('4soka')) {
      defaultTitle = '4Soka Alternatives and Statistical Prediction Networks';
      defaultSubtitle = 'Compare 4Soka daily football predictions, BTTS picks, and 1X2 banker models with top analytics portals.';
    }

    return {
      sectionTitle: overrides?.title || defaultTitle,
      sectionSubtitle: overrides?.subtitle || defaultSubtitle,
      badgeText: overrides?.badgeText,
      type: 'competitor',
      links: selectThree(candidateIds),
    };
  }

  // 2. PREDICTION CATEGORY PAGES -> Inbound links to 3 complementary betting markets
  if (pageType === 'category') {
    let candidateIds = ['category-over25', 'category-btts', 'category-homewin', 'category-doublechance', 'category-today', 'category-tomorrow'];

    let defaultTitle = 'Related Football Betting Markets and Strategies';
    let defaultSubtitle = 'Explore complementary goal-line indicators, double-chance safety slips, and daily high-confidence mathematical angles.';

    if (norm.includes('over25') || norm.includes('over-2-5')) {
      candidateIds = ['category-btts', 'category-over15', 'category-homewin', 'category-today'];
      defaultTitle = 'Over 2.5 Goals Alternatives and Scoring Markets';
      defaultSubtitle = 'Explore complementary BTTS, Over 1.5, and Home Win markets for enhanced goal-scoring betting value.';
    } else if (norm.includes('over15') || norm.includes('over-1-5')) {
      candidateIds = ['category-over25', 'category-doublechance', 'category-btts', 'category-today'];
      defaultTitle = 'Over 1.5 Goals Alternatives and Safety Markets';
      defaultSubtitle = 'Explore Over 2.5 and Double Chance selections to pair with high-safety Over 1.5 goal slips.';
    } else if (norm.includes('btts')) {
      candidateIds = ['category-over25', 'category-homewin', 'category-doublechance', 'category-today'];
      defaultTitle = 'Both Teams To Score Alternatives and Goal Slips';
      defaultSubtitle = 'Explore Over 2.5 Goals and 1X2 market angles for fixtures featuring high attacking momentum.';
    } else if (norm.includes('homewin') || norm.includes('home-win')) {
      candidateIds = ['category-doublechance', 'category-over25', 'category-btts', 'category-today'];
      defaultTitle = 'Home Win (1X2) Alternatives and Value Markets';
      defaultSubtitle = 'Compare straight home win singles with double chance covers and goal-total predictions.';
    } else if (norm.includes('doublechance') || norm.includes('double-chance')) {
      candidateIds = ['category-homewin', 'category-over15', 'category-btts', 'category-today'];
      defaultTitle = 'Double Chance Alternatives and Banker Picks';
      defaultSubtitle = 'Explore straight 1X2 and low-risk goal markets to maximize accumulator confidence.';
    } else if (norm.includes('today')) {
      candidateIds = ['category-tomorrow', 'category-over25', 'category-btts', 'category-yesterday'];
      defaultTitle = "Today's Related Prediction Markets and Early Slips";
      defaultSubtitle = 'Analyze tomorrow preview fixtures, verified yesterday logs, and specialized goal metrics.';
    } else if (norm.includes('tomorrow')) {
      candidateIds = ['category-today', 'category-over25', 'category-homewin', 'category-doublechance'];
      defaultTitle = 'Tomorrow Match Alternatives and Today Live Slips';
      defaultSubtitle = "Check today active fixtures alongside tomorrow early tactical lines and market movements.";
    } else if (norm.includes('yesterday')) {
      candidateIds = ['category-today', 'category-over25', 'category-btts', 'category-tomorrow'];
      defaultTitle = "Past Results and Today's Active Football Slips";
      defaultSubtitle = "Compare historical performance metrics with today active predictions and tomorrow previews.";
    }

    return {
      sectionTitle: overrides?.title || defaultTitle,
      sectionSubtitle: overrides?.subtitle || defaultSubtitle,
      badgeText: overrides?.badgeText,
      type: 'category',
      links: selectThree(candidateIds),
    };
  }

  // 3. JACKPOT PAGES -> Inbound links to 3 other major Kenyan football jackpots
  if (pageType === 'jackpot') {
    const allJackpots = Object.entries(dynamicLinks)
      .filter(([id, item]) => item.type === 'jackpot' && id !== norm)
      .map(([id]) => id);

    let defaultTitle = 'Major Kenyan Football Jackpots and Prize Pools';
    let defaultSubtitle = 'Analyze full 1X2 combinations, double-chance covers, and multimillion-shilling prize pools across top bookmakers.';

    const hash = norm.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const rotatedJackpots = [
      ...allJackpots.slice(hash % (allJackpots.length || 1)),
      ...allJackpots.slice(0, hash % (allJackpots.length || 1))
    ];

    if (norm.includes('sportpesa-mega')) {
      defaultTitle = 'Alternative Jackpots to SportPesa Mega (17 Games)';
      defaultSubtitle = 'Explore Betika Midweek 15, Mozzart Grand 16, and SportPesa Midweek 13 with double-chance combinations.';
    } else if (norm.includes('sportpesa-midweek')) {
      defaultTitle = 'Alternative Jackpots to SportPesa Midweek';
      defaultSubtitle = 'Explore the weekend Mega Jackpot (17), Betika Midweek (15), and Mozzart daily jackpot prize pools.';
    } else if (norm.includes('betika-midweek')) {
      defaultTitle = 'Alternative Jackpots to Betika Midweek (15 Games)';
      defaultSubtitle = 'Compare Betika Midweek slips with SportPesa Mega, Mozzart Grand, and Odibet Laki Tatu.';
    } else if (norm.includes('mozzart-grand') || norm.includes('mozzart-super-grand')) {
      defaultTitle = 'Alternative Jackpots to Mozzart Grand 16/20';
      defaultSubtitle = 'Explore SportPesa Mega Jackpot, Mozzart Super Daily, and Betika jackpot slip combinations.';
    } else if (norm.includes('mozzart-super-daily')) {
      defaultTitle = 'Daily and Weekly Jackpot Alternatives';
      defaultSubtitle = 'Compare Mozzart Daily picks with weekend Mega Jackpots and midweek 15-game slips.';
    } else if (norm.includes('odibet')) {
      defaultTitle = 'Alternative Kenyan Jackpots to Odibet Laki Tatu';
      defaultSubtitle = 'Explore SportPesa Mega, Betika Midweek, and Mozzart football jackpot slips.';
    } else if (norm.includes('jackpot-list')) {
      defaultTitle = 'Featured Jackpot Slips and VIP Combinations';
      defaultSubtitle = 'Explore our top recommended weekly jackpot slips with Poisson probability analysis.';
    }

    return {
      sectionTitle: overrides?.title || defaultTitle,
      sectionSubtitle: overrides?.subtitle || defaultSubtitle,
      badgeText: overrides?.badgeText,
      type: 'jackpot',
      links: selectThree(rotatedJackpots),
    };
  }

  // 4. STATIC PAGES and VIP -> Inbound links to 3 trust, policy, and VIP portals
  let candidateIds = ['vip-packages', 'about', 'responsible-gambling', 'partners', 'privacy-policy', 'terms-of-use', 'contact'];

  if (norm.includes('about')) {
    candidateIds = ['responsible-gambling', 'vip-packages', 'partners', 'contact'];
  } else if (norm.includes('responsible')) {
    candidateIds = ['about', 'terms-of-use', 'privacy-policy', 'contact'];
  } else if (norm.includes('privacy')) {
    candidateIds = ['terms-of-use', 'responsible-gambling', 'contact', 'about'];
  } else if (norm.includes('terms')) {
    candidateIds = ['privacy-policy', 'responsible-gambling', 'vip-packages', 'contact'];
  } else if (norm.includes('contact')) {
    candidateIds = ['vip-packages', 'about', 'responsible-gambling', 'partners'];
  } else if (norm.includes('partners')) {
    candidateIds = ['about', 'vip-packages', 'contact', 'responsible-gambling'];
  } else if (norm.includes('vip')) {
    candidateIds = ['sportpesa-mega', 'betika-midweek', 'category-over25', 'responsible-gambling'];
  }

  return {
    sectionTitle: overrides?.title || 'Platform Directory, Trust and VIP Access',
    sectionSubtitle: overrides?.subtitle || 'Explore Soka King operational guidelines, player safety protocols, customer support dispatch, and premium VIP access.',
    badgeText: overrides?.badgeText,
    type: 'static',
    links: selectThree(candidateIds),
  };
}
