import { getMarkdownContent, buildCanonicalUrl, ParsedMarkdownPage } from '../content/markdownLoader';
import { getAuthor, ParsedAuthor } from '../content/authorLoader';
import { getPageUrl, ALL_JACKPOT_IDS, DYNAMIC_CATEGORY_PAGES, DYNAMIC_JACKPOT_PAGES } from './navigation';
import { jackpotsData } from '../jackpotsData';
import { vipPackages, oddsPacks } from '../data';
import { PREDICTION_CATEGORIES } from './predictionGenerator';
import { getBlogPostBySlug, getAllBlogPosts, BlogPost } from '../content/blogLoader';
import { getCycleDateModified } from './cycleDateModified';

export interface SchemaGraphResult {
  mainSchema: Record<string, any>;
  faqSchema?: Record<string, any> | null;
  breadcrumbSchema?: Record<string, any> | null;
  fullGraph: Record<string, any>;
}

/**
 * Strips markdown and HTML formatting to return clean plain text for Schema.org fields.
 */
export function cleanSchemaText(text: string): string {
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
    .replace(/^["'\s]+|["'\s]+$/g, '') // Strip leading and trailing quotes
    .trim();
}

/**
 * Accurately calculates article word count by stripping markdown formatting, code blocks, and HTML tags.
 */
export function calculateArticleWordCount(content: string): number {
  if (!content) return 0;
  const clean = content
    .replace(/```[\s\S]*?```/g, '') // code blocks
    .replace(/`[^`]+`/g, '') // inline code
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '') // images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/<!--[\s\S]*?-->/g, '') // comments
    .replace(/<[^>]+>/g, ' ') // html tags
    .replace(/\$\$[\s\S]*?\$\$/g, ' ') // math blocks
    .replace(/\$[^$]+\$/g, ' ') // inline math
    .replace(/[|#*_~>\-+]/g, ' ') // markdown markers
    .replace(/\s+/g, ' ')
    .trim();

  if (!clean) return 0;
  return clean.split(/\s+/).filter(w => w.length > 0).length;
}

/**
 * Formats reading time into ISO 8601 duration format (e.g. PT7M for 7 minutes).
 */
export function formatDurationIso(readTimeStr: string, wordCount: number): string {
  const match = (readTimeStr || '').match(/(\d+)/);
  const minutes = match ? parseInt(match[1], 10) : Math.max(1, Math.ceil(wordCount / 200));
  return `PT${minutes}M`;
}

/**
 * Resolves a blog post cover image to a fully qualified absolute HTTPS URL.
 */
export function resolveCoverImageUrl(coverImage: string | undefined, slug: string): string {
  if (!coverImage) {
    return 'https://sokaking.com/icon.png';
  }
  if (coverImage.startsWith('http://') || coverImage.startsWith('https://')) {
    return coverImage;
  }
  if (coverImage.startsWith('/')) {
    return `https://sokaking.com${coverImage}`;
  }
  const clean = coverImage.replace(/^\.\//, '');
  return `https://sokaking.com/blog-assets/${slug}/${clean}`;
}

/**
 * Canonical Soka King Organization publisher schema object.
 */
export const SOKAKING_PUBLISHER_SCHEMA = {
  '@type': 'Organization',
  '@id': 'https://sokaking.com/#organization',
  name: 'Soka King',
  legalName: 'Soka King Analytics Ltd',
  foundingDate: '2021-03-15',
  url: 'https://sokaking.com',
  logo: {
    '@type': 'ImageObject',
    '@id': 'https://sokaking.com/#logo',
    url: 'https://sokaking.com/icon.png',
    caption: 'Soka King Sports Analytics Logo',
    width: 512,
    height: 512
  },
  sameAs: [
    'https://twitter.com/sokaking_ke',
    'https://facebook.com/sokakingkenya'
  ],
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

/**
 * Constructs a rich Person author schema object with credentials, bio, and expertise.
 */
export function buildAuthorSchema(author: ParsedAuthor): Record<string, any> {
  const authorUrl = `https://sokaking.com/about-us#author-${author.id}`;
  const authorSchema: Record<string, any> = {
    '@type': 'Person',
    '@id': authorUrl,
    name: author.name,
    jobTitle: author.role,
    description: author.shortBio,
    url: authorUrl,
    worksFor: {
      '@type': 'Organization',
      name: 'Soka King',
      url: 'https://sokaking.com'
    },
    knowsAbout: author.knowsAbout && author.knowsAbout.length > 0
      ? author.knowsAbout
      : [
          'Football Statistical Modeling',
          'Poisson Distribution',
          'Expected Goals (xG)',
          'Value Betting Analysis',
          'Jackpot Optimization'
        ]
  };

  if (author.avatar) {
    authorSchema.image = author.avatar.startsWith('http')
      ? author.avatar
      : `https://sokaking.com${author.avatar.startsWith('/') ? '' : '/'}${author.avatar}`;
  }

  if (author.credentials) {
    authorSchema.hasCredential = {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'degree',
      name: author.credentials
    };
  }

  if (author.social) {
    const sameAsList: string[] = [];
    if (author.social.twitter) sameAsList.push(author.social.twitter);
    if (author.social.linkedin) sameAsList.push(author.social.linkedin);
    if (sameAsList.length > 0) {
      authorSchema.sameAs = sameAsList;
    }
  }

  return authorSchema;
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
 * Builds comprehensive BreadcrumbList structured data for any given page
 * providing deep, contextual navigation hierarchy for search engines (minimum 2 items required by Google).
 */
export function buildBreadcrumbSchema(pageId: string, pageMd: ParsedMarkdownPage, canonicalUrl: string): Record<string, any> | null {
  // Never output single-item BreadcrumbList on the homepage, 404, or empty
  if (pageId === 'home' || pageId === '' || pageId === 'not-found' || pageId === '404') {
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

  const rawTitle = pageMd.displayTitle || pageMd.title.split('|')[0].trim();
  const pageTitle = cleanSchemaText(rawTitle);

  // 1. ALL JACKPOT PAGES
  const isJackpotPage = 
    pageId === 'jackpot-list' || 
    ALL_JACKPOT_IDS.includes(pageId) || 
    Boolean(DYNAMIC_JACKPOT_PAGES && DYNAMIC_JACKPOT_PAGES[pageId]) ||
    pageMd.type === 'jackpot' || 
    Boolean(pageMd.jackpotId) || 
    pageId.includes('jackpot') ||
    pageId.includes('mega') ||
    pageId.includes('midweek');

  if (isJackpotPage) {
    // Level 2: Always "Jackpot Predictions"
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: 'Jackpot Predictions',
      item: 'https://sokaking.com/jackpot-tips'
    });

    // If on the jackpot directory hub itself (/jackpot-tips)
    if (pageId === 'jackpot-list') {
      return {
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrl}#breadcrumb`,
        itemListElement: items
      };
    }

    // Check if this page is a sub-jackpot or competitor analysis page targeting a parent jackpot
    const parentJackpotId = pageMd.jackpotId;
    const isSubJackpot = Boolean(parentJackpotId && parentJackpotId !== pageId);

    if (isSubJackpot && parentJackpotId) {
      const parentUrl = buildCanonicalUrl(getPageUrl(parentJackpotId), parentJackpotId);
      let parentTitle = 'Mega Jackpot Predictions';
      
      const parentJackpotConfig = jackpotsData.find(j => j.id === parentJackpotId || j.slug === parentJackpotId);
      if (parentJackpotConfig) {
        parentTitle = parentJackpotConfig.name;
      } else {
        const parentMeta = getMarkdownContent(parentJackpotId);
        if (parentMeta && parentMeta.title) {
          parentTitle = parentMeta.displayTitle || parentMeta.title.split('|')[0].trim();
        }
      }

      // Level 3: Parent Jackpot (e.g. "SportPesa Mega Jackpot")
      items.push({
        '@type': 'ListItem',
        position: 3,
        name: cleanSchemaText(parentTitle),
        item: parentUrl
      });

      // Level 4: Current Page Analysis (e.g. "Betnumbers SportPesa Mega Jackpot")
      items.push({
        '@type': 'ListItem',
        position: 4,
        name: pageTitle,
        item: canonicalUrl
      });
    } else {
      // Direct Primary Jackpot (Level 3)
      items.push({
        '@type': 'ListItem',
        position: 3,
        name: pageTitle,
        item: canonicalUrl
      });
    }

    return {
      '@type': 'BreadcrumbList',
      '@id': `${canonicalUrl}#breadcrumb`,
      itemListElement: items
    };
  }

  // 2. ALL FOOTBALL PREDICTION & CATEGORY PAGES
  const isPredictionOrCategory = 
    pageId.startsWith('category-') ||
    pageMd.type === 'category' ||
    pageMd.type === 'competitor' ||
    Boolean(DYNAMIC_CATEGORY_PAGES && DYNAMIC_CATEGORY_PAGES[pageId]) ||
    pageId.includes('predict') ||
    pageId.includes('tips') ||
    pageId.includes('sure') ||
    pageId.includes('golden') ||
    pageId.includes('cheza') ||
    pageId.includes('soka') ||
    pageId.includes('sunpel') ||
    pageId.includes('tabiri') ||
    pageId.includes('forebet') ||
    pageId.includes('soccervista') ||
    pageId.includes('liobet') ||
    pageId.includes('cheerplex');

  if (isPredictionOrCategory) {
    const parentPredictionUrl = 'https://sokaking.com/football-predictions-today';

    if (pageId === 'category-today') {
      items.push({
        '@type': 'ListItem',
        position: 2,
        name: 'Free Football Predictions Today',
        item: parentPredictionUrl
      });
    } else {
      // Level 2: "Free Football Predictions"
      items.push({
        '@type': 'ListItem',
        position: 2,
        name: 'Free Football Predictions',
        item: parentPredictionUrl
      });

      // Level 3: Specific Prediction Category / Model Page
      items.push({
        '@type': 'ListItem',
        position: 3,
        name: pageTitle,
        item: canonicalUrl
      });
    }

    return {
      '@type': 'BreadcrumbList',
      '@id': `${canonicalUrl}#breadcrumb`,
      itemListElement: items
    };
  }

  // 3. VIP PACKAGES / ODDS PACKS
  if (pageId === 'vip-packages' || pageId === 'vip' || pageId === 'odds' || pageId === 'odds-packs') {
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: 'VIP Packages and Odds Packs',
      item: 'https://sokaking.com/vip-packages'
    });
    return {
      '@type': 'BreadcrumbList',
      '@id': `${canonicalUrl}#breadcrumb`,
      itemListElement: items
    };
  }

  // 4. BLOG PAGES
  if (pageId === 'blog' || pageId === 'blog-list') {
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: 'Football Analytics Blog',
      item: 'https://sokaking.com/blog'
    });
    return {
      '@type': 'BreadcrumbList',
      '@id': `${canonicalUrl}#breadcrumb`,
      itemListElement: items
    };
  }

  if (pageId.startsWith('blog-')) {
    const slug = pageId.replace(/^blog-/, '');
    const post = getBlogPostBySlug(slug);
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: 'Football Analytics Blog',
      item: 'https://sokaking.com/blog'
    });
    items.push({
      '@type': 'ListItem',
      position: 3,
      name: post ? cleanSchemaText(post.title) : pageTitle,
      item: canonicalUrl
    });
    return {
      '@type': 'BreadcrumbList',
      '@id': `${canonicalUrl}#breadcrumb`,
      itemListElement: items
    };
  }

  // 5. CORPORATE & ALL OTHER PAGES
  items.push({
    '@type': 'ListItem',
    position: 2,
    name: pageTitle,
    item: canonicalUrl
  });

  return {
    '@type': 'BreadcrumbList',
    '@id': `${canonicalUrl}#breadcrumb`,
    itemListElement: items
  };
}

/**
 * Generates comprehensive Article and TechArticle Schema.org JSON-LD structured data for blog posts.
 * Includes Person author with expertise/credentials, publication timestamps, breadcrumbs,
 * word count, reading time (ISO 8601 duration), keywords, cover images, and FAQ support.
 */
export function generateBlogPostJsonLd(post: BlogPost): SchemaGraphResult {
  const canonicalUrl = `https://sokaking.com/blog/${post.slug}`;
  const wordCount = calculateArticleWordCount(post.content || post.raw);
  const timeRequired = formatDurationIso(post.readTime || '', wordCount);
  const coverImageUrl = resolveCoverImageUrl(post.coverImage, post.slug);

  // ISO timestamps with Kenya timezone (+03:00)
  const publishedDate = post.date.includes('T') ? post.date : `${post.date}T08:00:00+03:00`;
  const modifiedDate = new Date().toISOString();

  const publisherObj = SOKAKING_PUBLISHER_SCHEMA;
  const author = post.author || getAuthor(post.authorId || 'john-mwangi');
  const authorObj = buildAuthorSchema(author);

  // Determine if this is a technical / mathematical / statistical modeling guide
  const isTechnical = 
    /poisson|expected-goals|xg|statistical|kelly|bankroll|algorithm|draw|tactics|strategy|modeling|model|permutation/i.test(post.slug) ||
    /mathematical|analysis|strategy|modeling|tactics|tactical/i.test(post.category || '') ||
    (post.tags || []).some(t => /poisson|xg|math|statistical|model|analysis|kelly|probability|permutation/i.test(t));

  const schemaTypes = isTechnical 
    ? ['Article', 'TechArticle'] 
    : ['Article', 'BlogPosting'];

  const cleanTitle = cleanSchemaText(post.title);
  const cleanDesc = cleanSchemaText(post.description);

  // Strip markdown tags from beginning of article body for rich schema preview
  const plainBody = cleanSchemaText(post.content || post.raw).slice(0, 1000);

  const mainSchema: Record<string, any> = {
    '@type': schemaTypes,
    '@id': `${canonicalUrl}#article`,
    isPartOf: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
      url: canonicalUrl,
      name: cleanTitle,
      description: cleanDesc
    },
    headline: cleanTitle,
    name: cleanTitle,
    description: cleanDesc,
    url: canonicalUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl
    },
    image: [
      coverImageUrl,
      'https://sokaking.com/icon.png',
      'https://sokaking.com/apple-touch-icon.png'
    ],
    thumbnailUrl: coverImageUrl,
    datePublished: publishedDate,
    dateModified: modifiedDate,
    author: authorObj,
    publisher: publisherObj,
    inLanguage: 'en-KE',
    isAccessibleForFree: true,
    wordCount: wordCount,
    timeRequired: timeRequired,
    articleSection: post.category || 'Football Analytics',
    keywords: (post.tags && post.tags.length > 0) ? post.tags.join(', ') : 'football analytics, betting strategies',
    articleBody: plainBody,
    copyrightHolder: {
      '@type': 'Organization',
      name: 'Soka King'
    },
    copyrightYear: new Date(publishedDate).getFullYear() || 2026
  };

  if (isTechnical) {
    mainSchema.proficiencyLevel = 'Beginner to Advanced';
    mainSchema.dependencies = 'Understanding of basic football match statistics, probability theory, and betting odds formulation';
  }

  if (author.reviewerName) {
    mainSchema.reviewedBy = {
      '@type': 'Person',
      name: author.reviewerName,
      jobTitle: author.reviewerTitle || 'Senior Quantitative Analyst',
      worksFor: {
        '@type': 'Organization',
        name: 'Soka King'
      }
    };
  }

  const breadcrumbSchema = {
    '@type': 'BreadcrumbList',
    '@id': `${canonicalUrl}#breadcrumb`,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://sokaking.com'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Football Analytics Blog',
        item: 'https://sokaking.com/blog'
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: cleanTitle,
        item: canonicalUrl
      }
    ]
  };

  const faqSchema = extractFaqSchema(post.content || post.raw);

  const graphEntities: Record<string, any>[] = [mainSchema, breadcrumbSchema];
  if (faqSchema) {
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

/**
 * Generates CollectionPage and Blog structured data for the /blog hub.
 */
export function generateBlogIndexJsonLd(): SchemaGraphResult {
  const blogCanonical = 'https://sokaking.com/blog';
  const allPosts = getAllBlogPosts();
  const publisherObj = SOKAKING_PUBLISHER_SCHEMA;

  const mainSchema: Record<string, any> = {
    '@type': 'Blog',
    '@id': `${blogCanonical}#blog`,
    name: 'Soka King Football Analytics & Prediction Strategy Blog',
    headline: 'Football Analytics, Poisson Modeling & SportPesa Jackpot Strategy Guides',
    description: 'In-depth tactical breakdowns, Poisson distribution guides, SportPesa jackpot combination strategies, and quantitative bankroll models.',
    url: blogCanonical,
    publisher: publisherObj,
    inLanguage: 'en-KE',
    blogPost: allPosts.map(p => {
      const pUrl = `https://sokaking.com/blog/${p.slug}`;
      const pCover = resolveCoverImageUrl(p.coverImage, p.slug);
      return {
        '@type': 'BlogPosting',
        headline: cleanSchemaText(p.title),
        description: cleanSchemaText(p.description),
        url: pUrl,
        image: pCover,
        datePublished: p.date.includes('T') ? p.date : `${p.date}T08:00:00+03:00`,
        author: {
          '@type': 'Person',
          name: p.author.name
        }
      };
    })
  };

  const breadcrumbSchema = {
    '@type': 'BreadcrumbList',
    '@id': `${blogCanonical}#breadcrumb`,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://sokaking.com'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Football Analytics Blog',
        item: blogCanonical
      }
    ]
  };

  return {
    mainSchema,
    breadcrumbSchema,
    fullGraph: {
      '@context': 'https://schema.org',
      '@graph': [mainSchema, breadcrumbSchema]
    }
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
  // Check for specific blog post structured data
  if (pageId.startsWith('blog-')) {
    const slug = pageId.replace(/^blog-/, '');
    const post = getBlogPostBySlug(slug);
    if (post) {
      return generateBlogPostJsonLd(post);
    }
  }

  // Check for Blog index structured data
  if (pageId === 'blog' || pageId === 'blog-list') {
    return generateBlogIndexJsonLd();
  }

  const pageMd = getMarkdownContent(pageId);
  const rawUrl = getPageUrl(pageId);
  const canonicalUrl = buildCanonicalUrl(pageMd.link || rawUrl, pageId);
  // Safe Kenya local time publication anchor (2026-08-17)
  const datePublished = '2026-08-17T06:00:00+03:00';
  // Deterministic weekly/daily cycle dateModified tracking active jackpot rounds for Google QDF
  const dateModified = getCycleDateModified(pageId, pageMd.jackpotId);

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
    const isJackpotPage = ALL_JACKPOT_IDS.includes(pageId) || pageMd.type === 'jackpot' || !!pageMd.jackpotId || pageId.includes('jackpot');
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
  if (breadcrumbSchema) {
    mainSchema.breadcrumb = {
      '@id': `${canonicalUrl}#breadcrumb`
    };
  }
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

