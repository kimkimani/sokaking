import { RAW_BLOG_MAP, BLOG_METADATA_LIST, BlogMetaItem } from './blogData';
import { getAuthor, ParsedAuthor, normalizeAuthorKey } from './authorLoader';

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  formattedDate: string;
  authorId: string;
  author: ParsedAuthor;
  category: string;
  tags: string[];
  readTime: string;
  featured: boolean;
  coverImage?: string;
  content: string; // Markdown body without frontmatter
  raw: string;
}

/**
 * Format ISO date string into readable English date
 */
export function formatBlogDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

/**
 * Reads physical markdown file from src/content/blog in Node.js environment directly from disk.
 * Supports both [slug].md and [slug]/index.md or [slug]/[slug].md.
 */
function readServerBlogFile(slug: string): string | null {
  if (typeof window === 'undefined') {
    try {
      const fs = require('fs');
      const path = require('path');
      const blogDir = path.join(process.cwd(), 'src', 'content', 'blog');
      const cleanSlug = slug.toLowerCase().trim().replace(/^\//, '').replace(/\.md$/, '');
      if (!cleanSlug) return null;

      // 1. Direct flat file [slug].md
      const directFile = path.join(blogDir, `${cleanSlug}.md`);
      if (fs.existsSync(directFile)) {
        return fs.readFileSync(directFile, 'utf-8');
      }

      // 2. Folder-based blog [slug]/index.md or [slug]/[slug].md
      const folderPath = path.join(blogDir, cleanSlug);
      if (fs.existsSync(folderPath) && fs.statSync(folderPath).isDirectory()) {
        const subFiles = fs.readdirSync(folderPath);
        const indexMd = subFiles.find((f: string) => f.toLowerCase() === 'index.md');
        if (indexMd) {
          return fs.readFileSync(path.join(folderPath, indexMd), 'utf-8');
        }
        const nameMd = subFiles.find((f: string) => f.toLowerCase() === `${cleanSlug}.md`);
        if (nameMd) {
          return fs.readFileSync(path.join(folderPath, nameMd), 'utf-8');
        }
        const anyMd = subFiles.find((f: string) => f.toLowerCase().endsWith('.md'));
        if (anyMd) {
          return fs.readFileSync(path.join(folderPath, anyMd), 'utf-8');
        }
      }

      // 3. Fallback directory scan
      if (fs.existsSync(blogDir)) {
        const files = fs.readdirSync(blogDir);
        for (const file of files) {
          if (file.toLowerCase() === `${cleanSlug}.md` || file.toLowerCase() === cleanSlug) {
            const fullPath = path.join(blogDir, file);
            if (fs.statSync(fullPath).isDirectory()) {
              const subFiles = fs.readdirSync(fullPath);
              const anyMd = subFiles.find((f: string) => f.toLowerCase().endsWith('.md'));
              if (anyMd) {
                return fs.readFileSync(path.join(fullPath, anyMd), 'utf-8');
              }
            } else {
              return fs.readFileSync(fullPath, 'utf-8');
            }
          }
        }
      }
    } catch {
      // fs is unavailable in client environments
    }
  }
  return null;
}

/**
 * Parse raw markdown content into BlogPost
 */
export function parseBlogPostMarkdown(raw: string, fallbackSlug: string = ''): BlogPost {
  let frontmatterBlock = '';
  let bodyContent = raw;

  if (raw.startsWith('---')) {
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    if (match) {
      frontmatterBlock = match[1];
      bodyContent = match[2].trim();
    }
  }

  // Fallbacks from metadata list if available
  const existingMeta = BLOG_METADATA_LIST.find(m => m.slug === fallbackSlug);

  let title = existingMeta?.title || fallbackSlug;
  let slug = fallbackSlug || existingMeta?.slug || 'article';
  let description = existingMeta?.description || '';
  let date = existingMeta?.date || new Date().toISOString().split('T')[0];
  let authorId = existingMeta?.author || 'john-mwangi';
  let category = existingMeta?.category || 'Analysis';
  let tags: string[] = existingMeta?.tags || [];
  let readTime = existingMeta?.readTime || '5 min read';
  let featured = existingMeta?.featured || false;
  let coverImage = existingMeta?.coverImage || '';

  if (frontmatterBlock) {
    const lines = frontmatterBlock.split('\n');
    for (const line of lines) {
      const colonIdx = line.indexOf(':');
      if (colonIdx === -1) continue;
      const key = line.substring(0, colonIdx).trim();
      const val = line.substring(colonIdx + 1).trim().replace(/^["']|["']$/g, '');

      if (key === 'title') title = val;
      if (key === 'slug') slug = val.toLowerCase();
      if (key === 'description') description = val;
      if (key === 'date') date = val;
      if (key === 'author' || key === 'authorId') authorId = val;
      if (key === 'category') category = val;
      if (key === 'readTime') readTime = val;
      if (key === 'featured') featured = val === 'true';
      if (key === 'coverImage') coverImage = val;
      if (key === 'tags') {
        const tagMatch = line.match(/tags:\s*\[(.*?)\]/);
        if (tagMatch) {
          tags = tagMatch[1].split(',').map(t => t.trim().replace(/^["']|["']$/g, ''));
        }
      }
    }
  }

  // If coverImage is a local relative path, map to /blog-assets/[slug]/[image]
  if (coverImage && !coverImage.startsWith('http') && !coverImage.startsWith('/')) {
    const cleanImg = coverImage.replace(/^\.\//, '');
    coverImage = `/blog-assets/${slug}/${cleanImg}`;
  }

  // Strip initial H1 if it repeats the title
  bodyContent = bodyContent.replace(/^#\s+[^\r\n]+(?:\r?\n)*/m, '').trim();

  const author = getAuthor(authorId);

  return {
    slug,
    title,
    description,
    date,
    formattedDate: formatBlogDate(date),
    authorId,
    author,
    category,
    tags,
    readTime,
    featured,
    coverImage: coverImage || undefined,
    content: bodyContent,
    raw
  };
}

/**
 * Returns all blog posts, sorted chronologically (newest first).
 */
export function getAllBlogPosts(): BlogPost[] {
  // 1. Try server filesystem if in Node.js
  if (typeof window === 'undefined') {
    try {
      const fs = require('fs');
      const path = require('path');
      const blogDir = path.join(process.cwd(), 'src', 'content', 'blog');
      if (fs.existsSync(blogDir)) {
        const entries = fs.readdirSync(blogDir, { withFileTypes: true });
        const posts: BlogPost[] = [];
        for (const entry of entries) {
          if (entry.isFile() && entry.name.endsWith('.md')) {
            const slug = entry.name.replace(/\.md$/, '').toLowerCase();
            const raw = fs.readFileSync(path.join(blogDir, entry.name), 'utf-8');
            posts.push(parseBlogPostMarkdown(raw, slug));
          } else if (entry.isDirectory()) {
            const folderPath = path.join(blogDir, entry.name);
            const subFiles = fs.readdirSync(folderPath);
            const mdFile = subFiles.find((f: string) => f.toLowerCase() === 'index.md')
              || subFiles.find((f: string) => f.toLowerCase() === `${entry.name.toLowerCase()}.md`)
              || subFiles.find((f: string) => f.toLowerCase().endsWith('.md'));
            if (mdFile) {
              const raw = fs.readFileSync(path.join(folderPath, mdFile), 'utf-8');
              posts.push(parseBlogPostMarkdown(raw, entry.name.toLowerCase()));
            }
          }
        }
        return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }
    } catch {
      // Fallback to bundled data
    }
  }

  // 2. Client fallback via RAW_BLOG_MAP and BLOG_METADATA_LIST
  const posts: BlogPost[] = [];
  for (const meta of BLOG_METADATA_LIST) {
    const raw = RAW_BLOG_MAP[meta.slug] || '';
    if (raw) {
      posts.push(parseBlogPostMarkdown(raw, meta.slug));
    } else {
      posts.push({
        ...meta,
        formattedDate: formatBlogDate(meta.date),
        authorId: meta.author,
        author: getAuthor(meta.author),
        content: meta.description,
        raw: ''
      });
    }
  }

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Get a single blog post by slug
 */
export function getBlogPostBySlug(slug: string): BlogPost | null {
  if (!slug) return null;
  const cleanSlug = slug.toLowerCase().trim().replace(/^\/blog\//, '').replace(/^\//, '').replace(/\.md$/, '');

  // 1. Server disk check
  if (typeof window === 'undefined') {
    const serverRaw = readServerBlogFile(cleanSlug);
    if (serverRaw) {
      return parseBlogPostMarkdown(serverRaw, cleanSlug);
    }
  }

  // 2. Client raw map check
  if (RAW_BLOG_MAP && RAW_BLOG_MAP[cleanSlug]) {
    return parseBlogPostMarkdown(RAW_BLOG_MAP[cleanSlug], cleanSlug);
  }

  // 3. Check metadata list
  const meta = BLOG_METADATA_LIST.find(m => m.slug === cleanSlug);
  if (meta) {
    return {
      ...meta,
      formattedDate: formatBlogDate(meta.date),
      authorId: meta.author,
      author: getAuthor(meta.author),
      content: meta.description,
      raw: ''
    };
  }

  return null;
}

/**
 * Filter blog posts by author ID or author name
 */
export function getBlogPostsByAuthor(authorIdOrName: string): BlogPost[] {
  const normKey = normalizeAuthorKey(authorIdOrName);
  const allPosts = getAllBlogPosts();
  return allPosts.filter(p => {
    const postNormAuthor = normalizeAuthorKey(p.authorId || p.author.name);
    return postNormAuthor === normKey || p.authorId.toLowerCase() === authorIdOrName.toLowerCase();
  });
}

/**
 * Returns distinct list of all blog categories
 */
export function getBlogCategories(): string[] {
  const posts = getAllBlogPosts();
  const catSet = new Set<string>();
  posts.forEach(p => {
    if (p.category) catSet.add(p.category);
  });
  return Array.from(catSet);
}

/**
 * Returns featured posts
 */
export function getFeaturedBlogPosts(): BlogPost[] {
  const posts = getAllBlogPosts();
  const featured = posts.filter(p => p.featured);
  return featured.length > 0 ? featured : posts.slice(0, 1);
}

/**
 * Returns all authors who have written articles
 */
export function getBlogAuthors(): ParsedAuthor[] {
  const posts = getAllBlogPosts();
  const authorKeys = Array.from(new Set(posts.map(p => p.authorId || p.author.id)));
  return authorKeys.map(key => getAuthor(key));
}
