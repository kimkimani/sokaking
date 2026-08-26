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
 * Strips markdown and HTML formatting to return clean plain text for Schema.org fields.
 */
function cleanSchemaText(text: string): string {
  if (!text) return '';
  return text
    .replace(/<!--[\s\S]*?-->/g, '') // Remove HTML comments
    .replace(/<[^>]*>?/gm, '') // Strip HTML tags
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Strip bold **text**
    .replace(/\*([^*]+)\*/g, '$1') // Strip italic *text*
    .replace(/__([^_]+)__/g, '$1') // Strip bold __text__
    .replace(/_([^_]+)_/g, '$1') // Strip italic _text_
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Strip markdown links [label](url) -> label
    .replace(/^[-*+]\s+/gm, '') // Strip bullet points
    .replace(/^[0-9]+\.\s+/gm, '') // Strip numbered list items
    .replace(/\s+/g, ' ') // Collapse multiple whitespaces
    .trim();
}

/**
 * Extracts and parses FAQ items from Markdown FAQ block into strictly compliant Schema.org format.
 */
export function extractFaqSchema(faqText: string | undefined): Record<string, any> | null {
  if (!faqText || !faqText.trim()) return null;

  const faqPairs: { question: string; answer: string }[] = [];
  const faqBlocks = faqText.split(/(?=###|\n(?=###))/g);

  // Blacklist non-question headings that often appear in markdown
  const nonQuestionKeywords = [
    'system parameters',
    'key mathematical thresholds',
    'algorithmic selection criteria',
    'analytical framework',
    'top covered leagues',
    'covered jackpot pools',
    'prize tiers and rules',
    'prize tiers and rules',
    'combination strategy',
    'secure your winning',
    'mathematical drivers',
    'key selection indicators',
    'predictz vs soka king'
  ];

  for (const block of faqBlocks) {
    const qMatch = block.match(/###\s+(.+)/);
    if (qMatch) {
      const rawQuestion = qMatch[1].trim();
      const cleanQ = cleanSchemaText(rawQuestion);
      
      // Filter out non-question headings
      const lowerQ = cleanQ.toLowerCase();
      const isBlacklisted = nonQuestionKeywords.some(kw => lowerQ.includes(kw));
      const looksLikeQuestion = cleanQ.endsWith('?') || 
        lowerQ.startsWith('what') || 
        lowerQ.startsWith('how') || 
        lowerQ.startsWith('why') || 
        lowerQ.startsWith('which') || 
        lowerQ.startsWith('when') || 
        lowerQ.startsWith('where') || 
        lowerQ.startsWith('who') || 
        lowerQ.startsWith('is ') || 
        lowerQ.startsWith('can ') || 
        lowerQ.startsWith('does ') || 
        lowerQ.startsWith('do ') || 
        lowerQ.startsWith('are ');

      if (!isBlacklisted && looksLikeQuestion && cleanQ.length > 5) {
        const rawAnswer = block
          .replace(/###\s+.+/, '')
          .replace(/<!--\s*FAQ\s*-->/gi, '')
          .trim();
        const cleanA = cleanSchemaText(rawAnswer);

        if (cleanQ && cleanA && cleanA.length > 2) {
          faqPairs.push({ question: cleanQ, answer: cleanA });
        }
      }
    }
  }

  if (faqPairs.length === 0) return null;

  return {
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
 * Builds breadcrumb structured data for any given page (minimum 2 items required by Google).
 */
export function buildBreadcrumbSchema(pageId: string, pageMd: ParsedMarkdownPage, canonicalUrl: string): Record<string, any> | null {
  // Never output single-item BreadcrumbList on the homepage
  if (pageId === 'home' || pageId === '' || pageId === 'not-found') {
    return null;
  }

  const items: Array<{ '@type': string; position: number; name: string; item: string }> = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://sokaking.com'
    }
  ];

  const pageTitle = pageMd.displayTitle || pageMd.title.split('|')[0].trim();

  if (
    pageId.startsWith('category-') || 
    pageId === '254-sure-tips' || 
    pageId === '254-golden-tips' ||
    pageId === '4soka-tips' ||
    pageId === '4soka-tips-prediction' ||
    pageId === 'sokamastas-predictions-and-tips' ||
    pageId === 'cheerplex-predictions-and-tips-today' || 
    pageId === 'liobet-predictions-and-tips' || 
    pageId === 'predictz-predictions' || 
    pageId === 'soccervista' || 
    pageId === 'soccervista-predictions-and-tips' || 
    pageId === 'sunpel-free-football-betting-tips'
  ) {
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
        name: pageTitle,
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
        name: pageTitle,
        item: canonicalUrl
      });
    }
  } else if (pageId === 'vip-packages' || pageId === 'vip' || pageId === 'odds' || pageId === 'odds-packs') {
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: 'VIP Packages and Odds Packs',
      item: 'https://sokaking.com/vip-packages'
    });
  } else {
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: pageTitle,
      item: canonicalUrl
    });
  }

  // Google requires at least 2 items in BreadcrumbList
  if (items.length < 2) {
    return null;
  }

  return {
    '@type': 'BreadcrumbList',
    itemListElement: items
  };
}

/**
 * Builds Schema.org structured data specifically tailored for the page type:
 * 1. Article schema for Tips and Category analysis pages
 * 2. Product schema for VIP Packages and Odds Packs
 * 3. CollectionPage / ItemList schema for Lists and Hubs
 * 4. Informational WebPages (AboutPage, ContactPage, WebPage)
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
      contactType: 'customer service',
      email: 'support@sokapredictions.co.ke',
      availableLanguage: ['en', 'sw'],
      areaServed: 'KE'
    }
  };

  const auth = pageMd.author || getAuthor(pageMd.authorId || pageMd.authorName || 'john-mwangi');

  const authorObj = {
    '@type': 'Person',
    name: auth.name,
    jobTitle: auth.role,
    description: auth.shortBio,
    worksFor: {
      '@type': 'Organization',
      name: 'Soka King'
    },
    url: 'https://sokaking.com/about-us'
  };

  const breadcrumbSchema = buildBreadcrumbSchema(pageId, pageMd, canonicalUrl);
  const faqSchema = extractFaqSchema(pageMd.faq);

  let mainSchema: Record<string, any>;

  // TYPE 1: VIP Packages and Odds Packs -> Product / Offer Schema
  if (pageId === 'vip-packages' || pageId === 'vip' || pageId === 'odds' || pageId === 'odds-packs') {
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
        seller: {
          '@type': 'Organization',
          name: 'Soka King'
        }
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
        seller: {
          '@type': 'Organization',
          name: 'Soka King'
        }
      }))
    ];

    mainSchema = {
      '@type': 'Product',
      name: 'Soka King VIP Predictions and Pro Odds Slips',
      description: cleanSchemaText(pageMd.description) || 'Premium mathematical football prediction slips, VIP daily sure tips, mega jackpot combinations, and high-odds accumulators with verified 92% win rate.',
      image: [
        'https://sokaking.com/icon.png',
        'https://sokaking.com/apple-touch-icon.png'
      ],
      brand: {
        '@type': 'Brand',
        name: 'Soka King VIP'
      },
      category: 'Sports Predictions and Betting Analytics',
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
            ratingValue: '5',
            bestRating: '5',
            worstRating: '1'
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
            ratingValue: '5',
            bestRating: '5',
            worstRating: '1'
          }
        }
      ]
    };
  }
  // TYPE 2: Jackpot List -> CollectionPage / ItemList Schema
  else if (pageId === 'jackpot-list') {
    const listElements = jackpotsData.map((jp, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: `${jp.name} (${jp.gamesCount} Games)`,
      description: `${jp.name} analysis, mathematical predictions, and recommended slips. ${jp.estimatedPool ? `Estimated Pool: ${jp.estimatedPool}` : ''}`,
      url: `https://sokaking.com${getPageUrl(jp.id)}`
    }));

    mainSchema = {
      '@type': 'CollectionPage',
      name: cleanSchemaText(pageMd.title) || 'Football Jackpots Predictions and Analysis Hub',
      description: cleanSchemaText(pageMd.description) || 'Comprehensive football jackpot predictions, mathematical combinations, and slip analysis for SportPesa, Betika, Mozzart, and SportyBet.',
      url: canonicalUrl,
      mainEntity: {
        '@type': 'ItemList',
        name: 'Kenyan and Global Football Jackpot Predictions',
        numberOfItems: listElements.length,
        itemListElement: listElements
      },
      publisher: publisherObj
    };
  }
  // TYPE 3: Home Page -> CollectionPage and ItemList Schema
  else if (pageId === 'home') {
    const categoryElements = PREDICTION_CATEGORIES.map((cat, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: cat.name,
      description: cat.description,
      url: `https://sokaking.com${getPageUrl(cat.id)}`
    }));

    mainSchema = {
      '@type': 'CollectionPage',
      name: cleanSchemaText(pageMd.title) || 'Soka King - Kenya\'s #1 Football Predictions and Jackpot Portal',
      description: cleanSchemaText(pageMd.description) || 'Free mathematical football predictions, 1X2 tips, over 2.5 goals, BTTS/GG picks, and jackpot analysis.',
      url: canonicalUrl,
      mainEntity: {
        '@type': 'ItemList',
        name: 'Football Prediction Categories and Analysis Hubs',
        numberOfItems: categoryElements.length,
        itemListElement: categoryElements
      },
      publisher: publisherObj
    };
  }
  // TYPE 4: Informational / Legal WebPages (About, Contact, Privacy, Terms, Responsible Gambling, Partners)
  else if (pageId === 'about') {
    mainSchema = {
      '@type': 'AboutPage',
      name: cleanSchemaText(pageMd.title),
      description: cleanSchemaText(pageMd.description),
      url: canonicalUrl,
      mainEntity: {
        '@type': 'Organization',
        name: 'Soka King',
        url: 'https://sokaking.com',
        logo: {
          '@type': 'ImageObject',
          url: 'https://sokaking.com/icon.png',
          width: 512,
          height: 512
        },
        founder: authorObj,
        foundingDate: '2021-03-15',
        description: 'Soka King is Kenya\'s premier data-driven sports analytics platform, delivering statistical football predictions and jackpot analysis.'
      },
      publisher: publisherObj
    };
  }
  else if (pageId === 'contact') {
    mainSchema = {
      '@type': 'ContactPage',
      name: cleanSchemaText(pageMd.title),
      description: cleanSchemaText(pageMd.description),
      url: canonicalUrl,
      mainEntity: {
        '@type': 'Organization',
        name: 'Soka King Support and Editorial Office',
        url: 'https://sokaking.com',
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          telephone: '+254740841375',
          email: 'support@sokapredictions.co.ke',
          availableLanguage: ['en', 'sw'],
          areaServed: 'KE'
        }
      },
      publisher: publisherObj
    };
  }
  else if (pageId === 'privacy-policy') {
    mainSchema = {
      '@type': 'WebPage',
      name: cleanSchemaText(pageMd.title),
      description: cleanSchemaText(pageMd.description),
      url: canonicalUrl,
      specialty: 'Data Privacy and Protection Policy',
      publisher: publisherObj,
      datePublished: datePublished,
      dateModified: dateModified
    };
  }
  else if (pageId === 'terms-of-use') {
    mainSchema = {
      '@type': 'WebPage',
      name: cleanSchemaText(pageMd.title),
      description: cleanSchemaText(pageMd.description),
      url: canonicalUrl,
      specialty: 'Terms of Service and Subscription Agreement',
      publisher: publisherObj,
      datePublished: datePublished,
      dateModified: dateModified
    };
  }
  else if (pageId === 'responsible-gambling') {
    mainSchema = {
      '@type': 'WebPage',
      name: cleanSchemaText(pageMd.title),
      description: cleanSchemaText(pageMd.description),
      url: canonicalUrl,
      specialty: 'Responsible Gambling and Player Protection Policy',
      publisher: publisherObj,
      datePublished: datePublished,
      dateModified: dateModified
    };
  }
  else if (pageId === 'partners') {
    mainSchema = {
      '@type': 'WebPage',
      name: cleanSchemaText(pageMd.title),
      description: cleanSchemaText(pageMd.description),
      url: canonicalUrl,
      specialty: 'Strategic Partners and Data Verification Network',
      publisher: publisherObj,
      datePublished: datePublished,
      dateModified: dateModified
    };
  }
  // TYPE 5: Prediction Tips and Category Pages and Jackpot Analysis -> Article Schema
  else {
    const isJackpotPage = ALL_JACKPOT_IDS.includes(pageId);
    const categoryName = isJackpotPage 
      ? 'Jackpot Predictions and Tactical Analysis' 
      : 'Football Betting Predictions and Analysis';

    mainSchema = {
      '@type': 'Article',
      headline: cleanSchemaText(pageMd.displayTitle || pageMd.title.split('|')[0].trim()),
      description: cleanSchemaText(pageMd.description),
      image: [
        'https://sokaking.com/icon.png',
        'https://sokaking.com/apple-touch-icon.png'
      ],
      url: canonicalUrl,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonicalUrl
      },
      articleSection: categoryName,
      inLanguage: 'en-KE',
      author: authorObj,
      publisher: publisherObj,
      datePublished: datePublished,
      dateModified: dateModified,
      isAccessibleForFree: true,
      keywords: cleanSchemaText(pageMd.keywords)
    };
  }

  // Construct combined Graph representation for rich JSON-LD (Only root has @context)
  const graphEntities: Record<string, any>[] = [mainSchema];
  
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

