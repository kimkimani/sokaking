import { RAW_AUTHOR_MAP } from './authorData';

const authorMarkdownFiles = (typeof import.meta !== 'undefined' && typeof (import.meta as any).glob === 'function')
  ? (import.meta as any).glob('./authors/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>
  : {};

export interface AuthorBadge {
  text: string;
  type?: 'verified' | 'modeler' | 'experience' | 'tactical' | 'support' | 'security' | 'custom';
}

export interface ParsedAuthor {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  experience?: string;
  credentials?: string;
  specialization?: string;
  reviewerName?: string;
  reviewerTitle?: string;
  badges: AuthorBadge[];
  social?: {
    twitter?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
  };
  knowsAbout: string[];
  shortBio: string;
  fullContent: string;
}

/**
 * Default fallback author (John K. Mwangi)
 */
export const DEFAULT_AUTHOR: ParsedAuthor = {
  id: 'john-mwangi',
  name: 'John K. Mwangi',
  role: 'Lead Football Analyst & Poisson Model Expert',
  avatar: '',
  experience: '10+ Years',
  credentials: 'B.Sc. Actuarial Science & Applied Statistics (University of Nairobi)',
  specialization: 'Bivariate Poisson Distribution, xG Calibration & Jackpot Permutations',
  reviewerName: 'David Ochieng',
  reviewerTitle: 'Senior Tactical & Statistical Verifier',
  badges: [
    { text: 'Verified Sports Analyst', type: 'verified' },
    { text: 'Poisson & xG Modeler', type: 'modeler' },
    { text: '10+ Yrs Experience', type: 'experience' }
  ],
  social: {
    twitter: 'https://x.com/sokapredictions',
    email: 'john.mwangi@sokapredictions.co.ke'
  },
  knowsAbout: [
    'Bivariate Poisson Goal Distribution',
    'Expected Goals (xG) Forecasting',
    'Jackpot Permutation & Cover Strategy',
    'Kenyan & European Football Tactics'
  ],
  shortBio: '10+ years experience in statistical sports modeling and actuarial probability. Leads Poisson goal distribution algorithms and mathematical jackpot line optimization at Soka King.',
  fullContent: ''
};

/**
 * Reads physical markdown author file from src/content/authors in Node.js environment directly from disk.
 */
function readServerAuthorFile(authorIdOrKey: string): string | null {
  if (typeof window === 'undefined') {
    try {
      const fs = require('fs');
      const path = require('path');
      const authorsDir = path.join(process.cwd(), 'src', 'content', 'authors');
      const cleanKey = authorIdOrKey.toLowerCase().trim().replace(/^\//, '').replace(/\.md$/, '');
      if (!cleanKey) return null;

      const directFile = path.join(authorsDir, `${cleanKey}.md`);
      if (fs.existsSync(directFile)) {
        return fs.readFileSync(directFile, 'utf-8');
      }

      if (fs.existsSync(authorsDir)) {
        const filenames = fs.readdirSync(authorsDir);
        for (const file of filenames) {
          if (file.toLowerCase() === `${cleanKey}.md` || file.toLowerCase() === cleanKey) {
            return fs.readFileSync(path.join(authorsDir, file), 'utf-8');
          }
        }
      }
    } catch (e) {
      // fs is unavailable in client environments
    }
  }
  return null;
}

/**
 * Normalizes input name/key to matched author identifier.
 */
export function normalizeAuthorKey(input?: string): string {
  if (!input) return 'john-mwangi';
  const clean = input.toLowerCase().trim();

  if (clean.includes('mwangi') || clean.includes('john') || clean === 'lead analyst') return 'john-mwangi';
  if (clean.includes('ochieng') || clean.includes('david')) return 'david-ochieng';
  if (clean.includes('wanjiku') || clean.includes('grace')) return 'grace-wanjiku';
  if (clean.includes('kipchumba') || clean.includes('brian')) return 'brian-kipchumba';
  if (clean.includes('omondi') || clean.includes('samuel')) return 'samuel-omondi';
  if (clean.includes('safety') || clean.includes('player safety')) return 'soka-safety-board';
  if (clean.includes('legal') || clean.includes('compliance')) return 'legal-compliance';

  return clean.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

/**
 * Parse frontmatter and content from raw author markdown string.
 */
export function parseAuthorMarkdown(raw: string, fallbackId: string = 'author'): ParsedAuthor {
  let frontmatterBlock = '';
  let bodyContent = raw;

  if (raw.startsWith('---')) {
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    if (match) {
      frontmatterBlock = match[1];
      bodyContent = match[2].trim();
    }
  }

  const fm: Record<string, any> = {};
  if (frontmatterBlock) {
    const lines = frontmatterBlock.split('\n');
    let currentKey = '';
    let currentArray: any[] | null = null;
    let currentObject: Record<string, any> | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      // Handle array items
      if (trimmed.startsWith('- ') && currentKey) {
        const itemVal = trimmed.substring(2).trim();
        // Check if item is an object (e.g. badges)
        if (itemVal.startsWith('text:') || (lines[i + 1] && lines[i + 1].trim().startsWith('type:'))) {
          // Object within array
          const textMatch = itemVal.match(/text:\s*["']?([^"'\n]+)["']?/);
          const badgeObj: any = { text: textMatch ? textMatch[1] : itemVal };
          if (lines[i + 1] && lines[i + 1].trim().startsWith('type:')) {
            const typeMatch = lines[i + 1].trim().match(/type:\s*["']?([^"'\n]+)["']?/);
            if (typeMatch) badgeObj.type = typeMatch[1];
            i++; // skip next line
          }
          if (!Array.isArray(fm[currentKey])) fm[currentKey] = [];
          fm[currentKey].push(badgeObj);
        } else {
          if (!Array.isArray(fm[currentKey])) fm[currentKey] = [];
          fm[currentKey].push(itemVal.replace(/^["']|["']$/g, ''));
        }
        continue;
      }

      // Handle key-value pairs
      const colonIdx = line.indexOf(':');
      if (colonIdx !== -1) {
        const key = line.substring(0, colonIdx).trim();
        const value = line.substring(colonIdx + 1).trim();

        if (value === '') {
          // Could be starting an array or object
          currentKey = key;
          fm[key] = [];
        } else {
          currentKey = key;
          let cleanVal = value.replace(/^["']|["']$/g, '');
          if (cleanVal === 'true') fm[key] = true;
          else if (cleanVal === 'false') fm[key] = false;
          else fm[key] = cleanVal;
        }
      }
    }
  }

  // Build badge array
  let parsedBadges: AuthorBadge[] = [];
  if (Array.isArray(fm.badges)) {
    parsedBadges = fm.badges.map(b => typeof b === 'string' ? { text: b, type: 'verified' } : b);
  } else if (fm.badges && typeof fm.badges === 'string') {
    parsedBadges = [{ text: fm.badges, type: 'verified' }];
  } else {
    parsedBadges = [
      { text: 'Verified Sports Analyst', type: 'verified' },
      { text: 'Poisson & xG Modeler', type: 'modeler' }
    ];
  }

  return {
    id: fm.id || fallbackId,
    name: fm.name || fm.title || 'John K. Mwangi',
    role: fm.role || fm.authorTitle || fm.title || 'Lead Football Analyst & Poisson Model Expert',
    avatar: fm.avatar || '',
    experience: fm.experience || '10+ Years',
    credentials: fm.credentials || 'B.Sc. Actuarial Science & Quantitative Sports Analytics',
    specialization: fm.specialization || 'Bivariate Poisson Goal Modeling & Jackpot Line Analysis',
    reviewerName: fm.reviewerName || 'David Ochieng',
    reviewerTitle: fm.reviewerTitle || 'Senior Tactical & Statistical Verifier',
    badges: parsedBadges,
    social: typeof fm.social === 'object' ? fm.social : {
      twitter: fm.twitter || 'https://x.com/sokapredictions',
      email: fm.email || 'support@sokapredictions.co.ke'
    },
    knowsAbout: Array.isArray(fm.knowsAbout) ? fm.knowsAbout : [
      'Bivariate Poisson Goal Distribution',
      'Expected Goals (xG) Forecasting',
      'Jackpot Permutation & Cover Strategy'
    ],
    shortBio: fm.shortBio || fm.description || fm.authorDescription || 'Experienced sports statistician and professional betting strategist.',
    fullContent: bodyContent
  };
}

/**
 * Loads raw markdown for a specific author.
 */
function loadRawAuthorMarkdown(authorKey: string): string {
  const normKey = normalizeAuthorKey(authorKey);

  // 0. Server-side filesystem read (real-time disk access)
  if (typeof window === 'undefined') {
    const serverContent = readServerAuthorFile(normKey);
    if (serverContent) return serverContent;
  }

  // 1. Eager Vite glob check
  const fileKey = `./authors/${normKey}.md`;
  if (authorMarkdownFiles[fileKey]) {
    return authorMarkdownFiles[fileKey];
  }

  // 2. Case-insensitive check of eager glob
  for (const fk of Object.keys(authorMarkdownFiles)) {
    const pk = fk.replace(/^\.\/authors\//, '').replace(/\.md$/, '').toLowerCase();
    if (pk === normKey) {
      return authorMarkdownFiles[fk];
    }
  }

  // 3. Fallback map check
  if (RAW_AUTHOR_MAP && RAW_AUTHOR_MAP[normKey]) {
    return RAW_AUTHOR_MAP[normKey];
  }

  return '';
}

/**
 * Retrieves a parsed author profile by author ID or name.
 */
export function getAuthor(authorIdOrName?: string): ParsedAuthor {
  if (!authorIdOrName) return DEFAULT_AUTHOR;

  const normKey = normalizeAuthorKey(authorIdOrName);
  const raw = loadRawAuthorMarkdown(normKey);

  if (raw) {
    return parseAuthorMarkdown(raw, normKey);
  }

  return {
    ...DEFAULT_AUTHOR,
    id: normKey,
    name: authorIdOrName
  };
}

/**
 * Returns all available verified authors/analysts.
 */
export function getAllAuthors(): ParsedAuthor[] {
  const knownKeys = [
    'john-mwangi',
    'david-ochieng',
    'grace-wanjiku',
    'brian-kipchumba',
    'samuel-omondi'
  ];

  return knownKeys.map(key => getAuthor(key));
}
