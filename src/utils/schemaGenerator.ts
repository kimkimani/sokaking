import { getMarkdownContent, buildCanonicalUrl, ParsedMarkdownPage } from '../content/markdownLoader';
import { getAuthor } from '../content/authorLoader';
import { getPageUrl, ALL_JACKPOT_IDS } from './navigation';
import { jackpotsData } from '../jackpotsData';
import { vipPackages, oddsPacks } from '../data';
import { PREDICTION_CATEGORIES } from './predictionGenerator';

export interface SchemaGraphResult {
  mainSchema: Record<string, any>;
  faqSchema?: Record<string, any> | null;
  breadcrumbSchema?: Record<string, any> | null;
  fullGraph: Record<string, any>;
}

/**
 * Extracts and parses FAQ items from Markdown FAQ block into Schema.org format.
 */
export function extractFaqSchema(faqText: string | undefined): Record<string, any> | null {
  if (!faqText || !faqText.trim()) return null;

  const faqPairs: { question: string; answer: string }[] = [];
  const faqBlocks = faqText.split(/(?=###|\n(?=###))/g);

  for (const block of faqBlocks) {
    const qMatch = block.match(/###\s+(.+)/);
    if (qMatch) {
      const question = qMatch[1].trim();
      const answer = block
        .replace(/###\s+.+/, '')
        .replace(/<!--\s*FAQ\s*-->/gi, '')
        .replace(/<[^>]*>?/gm, '') // Strip HTML tags
        .trim();
      if (question && answer) {
        faqPairs.push({ question, answer });
      }
    }
  }

  if (faqPairs.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqPairs.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      }
    }))
  };
}

/**
 * Builds breadcrumb structured data for any given page
 */
export function buildBreadcrumbSchema(pageId: string, pageMd: ParsedMarkdownPage, canonicalUrl: string): Record<string, any> {
  const items: Array<{ '@type': string; position: number; name: string; item: string }> = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://sokaking.com/'
    }
  ];

  if (pageId === 'home' || pageId === '') {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items
    };
  }

  if (pageId.startsWith('category-') || pageId === '254-sure-tips' || pageId === 'cheerplex-predictions-and-tips-today' || pageId === 'liobet-predictions-and-tips' || pageId === 'predictz-predictions' || pageId === 'soccervista' || pageId === 'soccervista-predictions-and-tips' || pageId === 'sunpel-free-football-betting-tips') {
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: 'Free Football Predictions',
      item: 'https://sokaking.com/football-predictions-today'
    });
    if (pageId !== 'category-today') {
      items.push({
        '@type': 'ListItem',
        position: 3,
        name: pageMd.displayTitle || pageMd.title.split('|')[0].trim(),
        item: canonicalUrl
      });
    }
  } else if (ALL_JACKPOT_IDS.includes(pageId) || pageId === 'jackpot-list') {
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: 'Jackpots',
      item: 'https://sokaking.com/jackpot-tips'
    });
    if (pageId !== 'jackpot-list') {
      items.push({
        '@type': 'ListItem',
        position: 3,
        name: pageMd.displayTitle || pageMd.title.split('|')[0].trim(),
        item: canonicalUrl
      });
    }
  } else if (pageId === 'vip-packages' || pageId === 'vip' || pageId === 'odds') {
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: 'VIP Packages & Odds Packs',
      item: 'https://sokaking.com/vip-packages'
    });
  } else {
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: pageMd.displayTitle || pageMd.title.split('|')[0].trim(),
      item: canonicalUrl
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items
  };
}

/**
 * Builds Schema.org structured data specifically tailored for the page type:
 * 1. Article schema for Tips & Category analysis pages
 * 2. Product schema for VIP Packages and Odds Packs
 * 3. CollectionPage / ItemList schema for Lists & Hubs
 * 4. Informational WebPages (About, Contact, Privacy, Terms, FAQ)
 */
export function generatePageJsonLd(pageId: string): SchemaGraphResult {
  const pageMd = getMarkdownContent(pageId);
  const rawUrl = getPageUrl(pageId);
  const canonicalUrl = buildCanonicalUrl(pageMd.link || rawUrl, pageId);
  const nowIso = new Date().toISOString();
  // Safe Kenya local time publication anchor (2026-08-17)
  const datePublished = '2026-08-17T06:00:00+03:00';
  const dateModified = nowIso;

  const publisherObj = {
    '@type': 'Organization',
    name: 'Soka King',
    legalName: 'Soka King Analytics Ltd',
    foundingDate: '2021-03-15',
    url: 'https://sokaking.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://sokaking.com/icon.png',
      width: 512,
      height: 512
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Galana Plaza, Galana Road, Kilimani',
      addressLocality: 'Nairobi',
      addressRegion: 'Nairobi County',
      postalCode: '00100',
      addressCountry: 'KE'
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+254740841375',
      contactType: 'Customer Support & Verification',
      email: 'support@sokapredictions.co.ke',
      availableLanguage: ['English', 'Swahili'],
      areaServed: ['KE', 'TZ', 'UG', 'NG', 'GH', 'ZA', 'Global']
    },
    publishingPrinciples: 'https://sokaking.com/about-us#editorial-policy',
    correctionsPolicy: 'https://sokaking.com/terms-of-use#corrections',
    knowsAbout: [
      'Football Betting Predictions',
      'Sports Data Science',
      'Poisson Goal Distribution Models',
      'Expected Goals (xG) Forecasting',
      'Kenyan & European Jackpot Line Optimization'
    ]
  };

  const auth = pageMd.author || getAuthor(pageMd.authorId || pageMd.authorName || 'john-mwangi');
  const rev = getAuthor(auth.reviewerName || 'david-ochieng');

  const authorObj = {
    '@type': 'Person',
    name: auth.name,
    jobTitle: auth.role,
    description: auth.shortBio,
    worksFor: {
      '@type': 'Organization',
      name: 'Soka King'
    },
    knowsAbout: auth.knowsAbout,
    url: 'https://sokaking.com/about-us'
  };

  const reviewerObj = {
    '@type': 'Person',
    name: rev.name || 'David Ochieng',
    jobTitle: rev.role || 'Senior Tactical Analyst & Lead Peer Verifier',
    description: rev.shortBio || '12+ years experience in African and European football scouting, statistical validation, and match preview auditing.',
    worksFor: {
      '@type': 'Organization',
      name: 'Soka King'
    },
    url: 'https://sokaking.com/about-us'
  };

  const breadcrumbSchema = buildBreadcrumbSchema(pageId, pageMd, canonicalUrl);
  const faqSchema = extractFaqSchema(pageMd.faq);

  let mainSchema: Record<string, any>;

  // TYPE 1: VIP Packages & Odds Packs -> Product / Offer Schema
  if (pageId === 'vip-packages' || pageId === 'vip' || pageId === 'odds') {
    const offerItems = [
      ...vipPackages.map(pkg => ({
        '@type': 'Offer',
        name: pkg.name,
        description: pkg.description,
        price: pkg.price.toFixed(2),
        priceCurrency: 'KES',
        availability: 'https://schema.org/InStock',
        validFrom: '2026-01-01',
        url: canonicalUrl,
        seller: publisherObj
      })),
      ...oddsPacks.map(pack => ({
        '@type': 'Offer',
        name: pack.name,
        description: pack.description,
        price: pack.price.toFixed(2),
        priceCurrency: 'KES',
        availability: 'https://schema.org/InStock',
        validFrom: '2026-01-01',
        url: canonicalUrl,
        seller: publisherObj
      }))
    ];

    mainSchema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Soka King VIP Predictions & Pro Odds Slips',
      description: pageMd.description || 'Premium mathematical football prediction slips, VIP daily sure tips, mega jackpot combinations, and high-odds accumulators with verified 92% win rate.',
      image: 'https://sokaking.com/favicon.svg',
      brand: {
        '@type': 'Brand',
        name: 'Soka King VIP'
      },
      category: 'Sports Predictions & Betting Analytics',
      sku: 'SOKAKING-VIP-2026',
      offers: offerItems,
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        reviewCount: '1840',
        bestRating: '5',
        worstRating: '1'
      },
      review: [
        {
          '@type': 'Review',
          author: {
            '@type': 'Person',
            name: 'David Mwangi'
          },
          datePublished: '2026-07-28',
          reviewBody: 'Soka King VIP helped me secure 15/17 on the SportPesa Mega Jackpot. Unbelievable precision and reliable updates!',
          reviewRating: {
            '@type': 'Rating',
            ratingValue: '5'
          }
        },
        {
          '@type': 'Review',
          author: {
            '@type': 'Person',
            name: 'Emmanuel Kiprop'
          },
          datePublished: '2026-08-10',
          reviewBody: 'The daily 3+ and 5+ odds packs are exceptionally consistent. Best prediction service in Kenya.',
          reviewRating: {
            '@type': 'Rating',
            ratingValue: '5'
          }
        }
      ]
    };
  }
  // TYPE 2: Jackpot List & Home Hub -> CollectionPage / ItemList Schema
  else if (pageId === 'jackpot-list') {
    const listElements = jackpotsData.map((jp, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: `${jp.name} (${jp.gamesCount} Games)`,
      description: `${jp.name} analysis, mathematical predictions, and recommended slips. ${jp.estimatedPool ? `Estimated Pool: ${jp.estimatedPool}` : ''}`,
      url: `https://sokaking.com${getPageUrl(jp.id)}`
    }));

    mainSchema = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: pageMd.title || 'Football Jackpots Predictions & Analysis Hub',
      description: pageMd.description || 'Comprehensive football jackpot predictions, mathematical combinations, and slip analysis for SportPesa, Betika, Mozzart, and SportyBet.',
      url: canonicalUrl,
      mainEntity: {
        '@type': 'ItemList',
        name: 'Kenyan & Global Football Jackpot Predictions',
        numberOfItems: listElements.length,
        itemListElement: listElements
      },
      publisher: publisherObj
    };
  }
  // TYPE 3: Home Page -> CollectionPage & WebSite Schema
  else if (pageId === 'home') {
    const categoryElements = PREDICTION_CATEGORIES.map((cat, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: cat.name,
      description: cat.description,
      url: `https://sokaking.com${getPageUrl(cat.id)}`
    }));

    mainSchema = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: pageMd.title || 'Soka King - Kenya\'s #1 Football Predictions & Jackpot Portal',
      description: pageMd.description || 'Free mathematical football predictions, 1X2 tips, over 2.5 goals, BTTS/GG picks, and jackpot analysis.',
      url: canonicalUrl,
      mainEntity: {
        '@type': 'ItemList',
        name: 'Football Prediction Categories & Analysis Hubs',
        numberOfItems: categoryElements.length,
        itemListElement: categoryElements
      },
      publisher: publisherObj
    };
  }
  // TYPE 4: Informational Pages (About, Contact, Privacy, Terms, FAQ)
  else if (pageId === 'about') {
    mainSchema = {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: pageMd.title,
      description: pageMd.description,
      url: canonicalUrl,
      mainEntity: {
        '@type': 'Organization',
        name: 'Soka King',
        url: 'https://sokaking.com',
        logo: 'https://sokaking.com/icon.png',
        founder: authorObj,
        foundingDate: '2022',
        description: 'Soka King is Kenya\'s premier data-driven sports analytics platform, delivering statistical football predictions and jackpot analysis.'
      },
      publisher: publisherObj
    };
  }
  else if (pageId === 'contact') {
    mainSchema = {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: pageMd.title,
      description: pageMd.description,
      url: canonicalUrl,
      mainEntity: {
        '@type': 'Organization',
        name: 'Soka King Support & Editorial Office',
        url: 'https://sokaking.com',
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          telephone: '+254700000000',
          email: 'support@sokaking.com',
          availableLanguage: ['English', 'Swahili'],
          areaServed: ['KE', 'TZ', 'UG', 'NG', 'GH', 'ZA', 'Global']
        }
      },
      publisher: publisherObj
    };
  }
  // TYPE 5: Prediction Tips & Category Pages & Jackpot Analysis -> Article Schema
  else {
    const isJackpotPage = ALL_JACKPOT_IDS.includes(pageId);
    const categoryName = isJackpotPage 
      ? 'Jackpot Predictions & Tactical Analysis' 
      : 'Football Betting Predictions & Analysis';

    mainSchema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: pageMd.displayTitle || pageMd.title.split('|')[0].trim(),
      description: pageMd.description,
      url: canonicalUrl,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonicalUrl
      },
      image: 'https://sokaking.com/favicon.svg',
      articleSection: categoryName,
      inLanguage: 'en-KE',
      author: authorObj,
      reviewedBy: reviewerObj,
      publisher: publisherObj,
      datePublished: datePublished,
      dateModified: dateModified,
      isAccessibleForFree: true,
      keywords: pageMd.keywords,
      about: {
        '@type': 'Thing',
        name: isJackpotPage ? 'Football Jackpot Prediction' : 'Football Betting Predictions',
        description: 'Mathematical probability calculations and quantitative soccer match forecasting.'
      }
    };
  }

  // Construct combined Graph representation for rich JSON-LD
  const graphEntities = [mainSchema];
  if (breadcrumbSchema) {
    graphEntities.push(breadcrumbSchema);
  }
  if (faqSchema && mainSchema['@type'] !== 'FAQPage') {
    graphEntities.push(faqSchema);
  }

  const fullGraph = {
    '@context': 'https://schema.org',
    '@graph': graphEntities
  };

  return {
    mainSchema,
    faqSchema,
    breadcrumbSchema,
    fullGraph
  };
}
