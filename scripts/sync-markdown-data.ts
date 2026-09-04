import fs from 'fs';
import path from 'path';

interface PageMeta {
  pageKey: string;
  title: string;
  displayTitle: string;
  description: string;
  keywords: string;
  link: string;
  type?: string;
  jackpotId?: string;
  fixturesCategory?: string;
  icon?: string;
  badgeColor?: string;
  authorId?: string;
  authorName?: string;
  authorTitle?: string;
  authorDescription?: string;
  authorAvatar?: string;
  responsibleGambling?: string;
  inboundTitle?: string;
  inboundHeading?: string;
  inboundDescription?: string;
  inboundSubtitle?: string;
  inboundBadge?: string;
  miniIntro?: string;
  unlockHeading?: string;
  unlockDescription?: string;
  listTitle?: string;
  listSubtitle?: string;
  faqTitle?: string;
  faqHeading?: string;
}

function parseFrontmatterFromRaw(rawMd: string, keyName: string): PageMeta {
  let title = 'Soka King | Free Football Predictions and Jackpot Tips';
  let displayTitle = '';
  let description = 'Free football predictions, jackpot tips, and betting analysis.';
  let keywords = 'football predictions, jackpot tips, soccer predictions';
  let link = keyName ? `/${keyName}` : '/';
  let type: string | undefined = undefined;
  let jackpotId: string | undefined = undefined;
  let fixturesCategory: string | undefined = undefined;
  let icon: string | undefined = undefined;
  let badgeColor: string | undefined = undefined;
  let authorId = '';
  let authorName = '';
  let authorTitle = '';
  let authorAvatar = '';
  let responsibleGambling = '';
  let inboundTitle = '';
  let inboundHeading = '';
  let inboundDescription = '';
  let inboundSubtitle = '';
  let inboundBadge = '';
  let miniIntro = '';
  let unlockHeading = '';
  let unlockDescription = '';
  let listTitle = '';
  let listSubtitle = '';

  const yamlMatch = rawMd.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
  if (yamlMatch) {
    const yamlStr = yamlMatch[1];
    const titleY = yamlStr.match(/^title:\s*"?(.*?)"?$/m);
    if (titleY) title = titleY[1].trim();

    const dtY = yamlStr.match(/^(?:displayTitle|pageTitle):\s*"?(.*?)"?$/m);
    if (dtY) displayTitle = dtY[1].trim();

    const descY = yamlStr.match(/^description:\s*"?(.*?)"?$/m);
    if (descY) description = descY[1].trim();

    const kwY = yamlStr.match(/^keywords:\s*"?(.*?)"?$/m);
    if (kwY) keywords = kwY[1].trim();

    const linkY = yamlStr.match(/^link:\s*"?(.*?)"?$/m);
    if (linkY) link = linkY[1].trim();

    const typeY = yamlStr.match(/^type:\s*"?(.*?)"?$/m);
    if (typeY) type = typeY[1].trim();

    const jidY = yamlStr.match(/^(?:jackpotId|jackpot_id):\s*"?(.*?)"?$/m);
    if (jidY) jackpotId = jidY[1].trim();

    const fcY = yamlStr.match(/^(?:fixturesCategory|category):\s*"?(.*?)"?$/m);
    if (fcY) fixturesCategory = fcY[1].trim();

    const iconY = yamlStr.match(/^icon:\s*"?(.*?)"?$/m);
    if (iconY) icon = iconY[1].trim();

    const bcY = yamlStr.match(/^(?:badgeColor|badge_color):\s*"?(.*?)"?$/m);
    if (bcY) badgeColor = bcY[1].trim();

    const aidY = yamlStr.match(/^(?:authorId|author_id|author):\s*"?(.*?)"?$/m);
    if (aidY) authorId = aidY[1].trim();

    const anY = yamlStr.match(/^(?:authorName|author_name):\s*"?(.*?)"?$/m);
    if (anY) authorName = anY[1].trim();

    const atY = yamlStr.match(/^(?:authorTitle|author_title):\s*"?(.*?)"?$/m);
    if (atY) authorTitle = atY[1].trim();

    const aaY = yamlStr.match(/^(?:authorAvatar|author_avatar):\s*"?(.*?)"?$/m);
    if (aaY) authorAvatar = aaY[1].trim();

    const rgY = yamlStr.match(/^(?:responsibleGambling|responsible_gambling|responsibleGamblingNotice):\s*"?(.*?)"?$/m);
    if (rgY) responsibleGambling = rgY[1].trim();

    const ibtY = yamlStr.match(/^(?:inboundTitle|inboundHeading|relatedTitle|relatedHeading):\s*"?(.*?)"?$/m);
    if (ibtY) inboundTitle = ibtY[1].trim();

    const ibdY = yamlStr.match(/^(?:inboundDescription|inboundSubtitle|relatedDescription|relatedSubtitle):\s*"?(.*?)"?$/m);
    if (ibdY) inboundDescription = ibdY[1].trim();

    const ibbY = yamlStr.match(/^(?:inboundBadge|relatedBadge):\s*"?(.*?)"?$/m);
    if (ibbY) inboundBadge = ibbY[1].trim();

    const miY = yamlStr.match(/^(?:miniIntro|mini_intro):\s*"?(.*?)"?$/m);
    if (miY) miniIntro = miY[1].trim();

    const uhY = yamlStr.match(/^unlockHeading:\s*"?(.*?)"?$/m);
    if (uhY) unlockHeading = uhY[1].trim();

    const udY = yamlStr.match(/^unlockDescription:\s*"?(.*?)"?$/m);
    if (udY) unlockDescription = udY[1].trim();

    const ltY = yamlStr.match(/^listTitle:\s*"?(.*?)"?$/m);
    if (ltY) listTitle = ltY[1].trim();

    const lsY = yamlStr.match(/^listSubtitle:\s*"?(.*?)"?$/m);
    if (lsY) listSubtitle = lsY[1].trim();
  }

  // Extract HTML comments fallback
  const titleMatch = rawMd.match(/<!--\s*Title:\s*(.+?)\s*-->/i);
  if (titleMatch) title = titleMatch[1].trim();

  const dtMatch = rawMd.match(/<!--\s*(?:DisplayTitle|PageTitle):\s*(.+?)\s*-->/i);
  if (dtMatch) displayTitle = dtMatch[1].trim();

  const descMatch = rawMd.match(/<!--\s*Description:\s*(.+?)\s*-->/i);
  if (descMatch) description = descMatch[1].trim();

  const kwMatch = rawMd.match(/<!--\s*Keywords:\s*(.+?)\s*-->/i);
  if (kwMatch) keywords = kwMatch[1].trim();

  const linkMatch = rawMd.match(/<!--\s*Link:\s*(.+?)\s*-->/i);
  if (linkMatch) link = linkMatch[1].trim();

  const typeMatch = rawMd.match(/<!--\s*Type:\s*(.+?)\s*-->/i);
  if (typeMatch) type = typeMatch[1].trim();

  const jidMatch = rawMd.match(/<!--\s*(?:JackpotId|Jackpot_Id):\s*(.+?)\s*-->/i);
  if (jidMatch) jackpotId = jidMatch[1].trim();

  const anMatch = rawMd.match(/<!--\s*(?:AuthorName|Author_Name):\s*(.+?)\s*-->/i);
  if (anMatch) authorName = anMatch[1].trim();

  const atMatch = rawMd.match(/<!--\s*(?:AuthorTitle|Author_Title):\s*(.+?)\s*-->/i);
  if (atMatch) authorTitle = atMatch[1].trim();

  const aaMatch = rawMd.match(/<!--\s*(?:AuthorAvatar|Author_Avatar):\s*(.+?)\s*-->/i);
  if (aaMatch) authorAvatar = aaMatch[1].trim();

  const rgMatch = rawMd.match(/<!--\s*(?:ResponsibleGambling|Responsible_Gambling):\s*(.+?)\s*-->/i);
  if (rgMatch) responsibleGambling = rgMatch[1].trim();

  const ibtMatch = rawMd.match(/<!--\s*(?:InboundTitle|InboundHeading|RelatedTitle|RelatedHeading):\s*(.+?)\s*-->/i);
  if (ibtMatch) inboundTitle = ibtMatch[1].trim();

  const ibdMatch = rawMd.match(/<!--\s*(?:InboundDescription|InboundSubtitle|RelatedDescription|RelatedSubtitle):\s*(.+?)\s*-->/i);
  if (ibdMatch) inboundDescription = ibdMatch[1].trim();

  const ibbMatch = rawMd.match(/<!--\s*(?:InboundBadge|RelatedBadge):\s*(.+?)\s*-->/i);
  if (ibbMatch) inboundBadge = ibbMatch[1].trim();

  const uhMatch = rawMd.match(/<!--\s*UnlockHeading:\s*(.+?)\s*-->/i);
  if (uhMatch) unlockHeading = uhMatch[1].trim();

  const udMatch = rawMd.match(/<!--\s*UnlockDescription:\s*(.+?)\s*-->/i);
  if (udMatch) unlockDescription = udMatch[1].trim();

  const ltMatch = rawMd.match(/<!--\s*ListTitle:\s*(.+?)\s*-->/i);
  if (ltMatch) listTitle = ltMatch[1].trim();

  const lsMatch = rawMd.match(/<!--\s*ListSubtitle:\s*(.+?)\s*-->/i);
  if (lsMatch) listSubtitle = lsMatch[1].trim();

  const cleanedContent = rawMd
    .replace(/^---\s*\r?\n[\s\S]*?\r?\n---\s*/, '')
    .replace(/<!--\s*(Title|DisplayTitle|PageTitle|Description|Keywords|Link|Type|JackpotId|AuthorName|AuthorTitle|AuthorDescription|AuthorAvatar|ResponsibleGambling|InboundTitle|InboundHeading|InboundDescription|InboundSubtitle|InboundBadge|RelatedTitle|RelatedHeading|RelatedDescription|RelatedSubtitle|RelatedBadge|UnlockHeading|UnlockDescription|ListTitle|ListSubtitle):\s*.+?\s*-->/gi, '')
    .trim();

  if (title === 'Soka King | Free Football Predictions and Jackpot Tips') {
    const h1Match = cleanedContent.match(/^#\s+(.+)$/m);
    if (h1Match) title = h1Match[1].trim();
  }

  return {
    pageKey: keyName,
    title,
    displayTitle: displayTitle || title,
    description,
    keywords,
    link,
    type,
    jackpotId,
    fixturesCategory,
    icon,
    badgeColor,
    authorId: authorId || 'john-mwangi',
    authorName: authorName || 'John K. Mwangi',
    authorTitle: authorTitle || 'Lead Football Analyst and Poisson Modeler',
    authorAvatar: authorAvatar || undefined,
    responsibleGambling: responsibleGambling || undefined,
    inboundTitle: inboundTitle || undefined,
    inboundHeading: inboundHeading || inboundTitle || undefined,
    inboundDescription: inboundDescription || undefined,
    inboundSubtitle: inboundSubtitle || inboundDescription || undefined,
    inboundBadge: inboundBadge || undefined,
    miniIntro: miniIntro || undefined,
    unlockHeading: unlockHeading || displayTitle || title,
    unlockDescription: unlockDescription || description,
    listTitle: listTitle || "Today's Free Football Predictions",
    listSubtitle: listSubtitle || "High-probability daily double-chance options and standard single tips verified by Soka King mathematical indexes."
  };
}

function syncPages() {
  try {
    const pagesDir = path.join(process.cwd(), 'src', 'content', 'pages');
    const targetFile = path.join(process.cwd(), 'src', 'content', 'markdownData.ts');
    const metadataFile = path.join(process.cwd(), 'src', 'content', 'pageMetadata.ts');

    if (!fs.existsSync(pagesDir)) {
      console.error('[Sync Pages] Directory not found:', pagesDir);
      return;
    }

    const files = fs.readdirSync(pagesDir);
    const mapEntries: string[] = [];
    const metaMap: Record<string, PageMeta> = {};

    for (const file of files) {
      if (file.endsWith('.md')) {
        const key = file.replace(/\.md$/, '').toLowerCase();
        const content = fs.readFileSync(path.join(pagesDir, file), 'utf-8');
        
        metaMap[key] = parseFrontmatterFromRaw(content, key);

        const escapedContent = content.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\${/g, '\\${');
        mapEntries.push(`  '${key}': \`${escapedContent}\``);
      }
    }

    // 1. Generate Raw Markdown Map
    const fileContent = `/**
 * AUTO-GENERATED MARKDOWN PAGES FALLBACK DATA
 * Synced automatically from src/content/pages/*.md
 */

export const RAW_MARKDOWN_MAP: Record<string, string> = {
${mapEntries.join(',\n\n')}
};
`;
    fs.writeFileSync(targetFile, fileContent, 'utf-8');

    // 2. Generate Lightweight Page Metadata Map (< 5KB)
    const metaContent = `/**
 * AUTO-GENERATED LIGHTWEIGHT PAGE METADATA MAP
 * Extracted at build time for 0-cost routing, instant startup and 0 forced reflows
 */

export interface PageMetadata {
  pageKey: string;
  title: string;
  displayTitle: string;
  description: string;
  keywords: string;
  link: string;
  type?: string;
  jackpotId?: string;
  fixturesCategory?: string;
  icon?: string;
  badgeColor?: string;
  authorId?: string;
  authorName?: string;
  authorTitle?: string;
  authorDescription?: string;
  authorAvatar?: string;
  responsibleGambling?: string;
  inboundTitle?: string;
  inboundHeading?: string;
  inboundDescription?: string;
  inboundSubtitle?: string;
  inboundBadge?: string;
  miniIntro?: string;
  unlockHeading?: string;
  unlockDescription?: string;
  listTitle?: string;
  listSubtitle?: string;
  faqTitle?: string;
  faqHeading?: string;
}

export const PAGE_METADATA_MAP: Record<string, PageMetadata> = ${JSON.stringify(metaMap, null, 2)};
`;
    fs.writeFileSync(metadataFile, metaContent, 'utf-8');

    console.log(`[Sync Pages] Successfully synced ${mapEntries.length} markdown pages and generated pageMetadata.ts`);
  } catch (err) {
    console.error('[Sync Pages] Error syncing pages:', err);
  }
}

function syncAuthors() {
  try {
    const authorsDir = path.join(process.cwd(), 'src', 'content', 'authors');
    const targetFile = path.join(process.cwd(), 'src', 'content', 'authorData.ts');

    if (!fs.existsSync(authorsDir)) {
      console.error('[Sync Authors] Directory not found:', authorsDir);
      return;
    }

    const files = fs.readdirSync(authorsDir);
    const mapEntries: string[] = [];

    for (const file of files) {
      if (file.endsWith('.md')) {
        const key = file.replace(/\.md$/, '').toLowerCase();
        const content = fs.readFileSync(path.join(authorsDir, file), 'utf-8');
        const escapedContent = content.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\${/g, '\\${');
        mapEntries.push(`  '${key}': \`${escapedContent}\``);
      }
    }

    const fileContent = `/**
 * AUTO-GENERATED AUTHOR PROFILES FALLBACK DATA
 * Synced automatically from src/content/authors/*.md
 */

export const RAW_AUTHOR_MAP: Record<string, string> = {
${mapEntries.join(',\n\n')}
};
`;

    fs.writeFileSync(targetFile, fileContent, 'utf-8');
    console.log(`[Sync Authors] Successfully synced ${mapEntries.length} author markdown profiles to ${targetFile}`);
  } catch (err) {
    console.error('[Sync Authors] Error syncing authors:', err);
  }
}

function syncBlog() {
  try {
    const blogDir = path.join(process.cwd(), 'src', 'content', 'blog');
    const targetFile = path.join(process.cwd(), 'src', 'content', 'blogData.ts');

    if (!fs.existsSync(blogDir)) {
      console.log('[Sync Blog] Directory not found, creating:', blogDir);
      fs.mkdirSync(blogDir, { recursive: true });
    }

    const entries = fs.readdirSync(blogDir, { withFileTypes: true });
    const mapEntries: string[] = [];
    const metaList: any[] = [];

    // Public blog assets destination directory
    const publicBlogAssetsDir = path.join(process.cwd(), 'public', 'blog-assets');
    if (!fs.existsSync(publicBlogAssetsDir)) {
      fs.mkdirSync(publicBlogAssetsDir, { recursive: true });
    }

    const blogItems: { filePath: string; defaultSlug: string; folderName?: string }[] = [];

    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.md')) {
        const defaultSlug = entry.name.replace(/\.md$/, '').toLowerCase();
        blogItems.push({ filePath: path.join(blogDir, entry.name), defaultSlug });
      } else if (entry.isDirectory()) {
        const folderPath = path.join(blogDir, entry.name);
        const subFiles = fs.readdirSync(folderPath);
        // Look for index.md or [folderName].md
        let mdFile = subFiles.find(f => f.toLowerCase() === 'index.md');
        if (!mdFile) {
          mdFile = subFiles.find(f => f.toLowerCase() === `${entry.name.toLowerCase()}.md`);
        }
        if (!mdFile) {
          mdFile = subFiles.find(f => f.toLowerCase().endsWith('.md'));
        }

        if (mdFile) {
          blogItems.push({
            filePath: path.join(folderPath, mdFile),
            defaultSlug: entry.name.toLowerCase(),
            folderName: entry.name
          });

          // Copy any local images in the folder to public/blog-assets/[folderName]/
          const destAssetFolder = path.join(publicBlogAssetsDir, entry.name);
          if (!fs.existsSync(destAssetFolder)) {
            fs.mkdirSync(destAssetFolder, { recursive: true });
          }

          for (const sf of subFiles) {
            if (/\.(png|jpe?g|webp|gif|svg|avif)$/i.test(sf)) {
              const srcImg = path.join(folderPath, sf);
              const destImg = path.join(destAssetFolder, sf);
              try {
                fs.copyFileSync(srcImg, destImg);
              } catch (copyErr) {
                console.warn(`[Sync Blog] Failed to copy asset ${sf}:`, copyErr);
              }
            }
          }
        }
      }
    }

    for (const item of blogItems) {
      const content = fs.readFileSync(item.filePath, 'utf-8');
      const defaultSlug = item.defaultSlug;

      // Extract frontmatter
      const yamlMatch = content.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
      let title = defaultSlug;
      let slug = defaultSlug;
      let description = '';
      let date = new Date().toISOString().split('T')[0];
      let author = 'john-mwangi';
      let category = 'Analysis';
      let tags: string[] = [];
      let readTime = '5 min read';
      let featured = false;
      let coverImage = '';

      if (yamlMatch) {
        const yamlStr = yamlMatch[1];
        const titleM = yamlStr.match(/^title:\s*"?(.*?)"?$/m);
        if (titleM) title = titleM[1].trim();

        const slugM = yamlStr.match(/^slug:\s*"?(.*?)"?$/m);
        if (slugM) slug = slugM[1].trim().toLowerCase();

        const descM = yamlStr.match(/^description:\s*"?(.*?)"?$/m);
        if (descM) description = descM[1].trim();

        const dateM = yamlStr.match(/^date:\s*"?(.*?)"?$/m);
        if (dateM) date = dateM[1].trim();

        const authorM = yamlStr.match(/^author:\s*"?(.*?)"?$/m);
        if (authorM) author = authorM[1].trim();

        const catM = yamlStr.match(/^category:\s*"?(.*?)"?$/m);
        if (catM) category = catM[1].trim();

        const rtM = yamlStr.match(/^readTime:\s*"?(.*?)"?$/m);
        if (rtM) readTime = rtM[1].trim();

        const featM = yamlStr.match(/^featured:\s*(true|false)/m);
        if (featM) featured = featM[1] === 'true';

        const imgM = yamlStr.match(/^coverImage:\s*"?(.*?)"?$/m);
        if (imgM) coverImage = imgM[1].trim();

        const tagsMatch = yamlStr.match(/^tags:\s*\[(.*?)\]/m);
        if (tagsMatch) {
          tags = tagsMatch[1].split(',').map(t => t.trim().replace(/^["']|["']$/g, ''));
        }
      }

      // If coverImage is local relative path inside folder, resolve to public URL
      if (item.folderName && coverImage && !coverImage.startsWith('http') && !coverImage.startsWith('/')) {
        const cleanCover = coverImage.replace(/^\.\//, '');
        coverImage = `/blog-assets/${item.folderName}/${cleanCover}`;
      }

      metaList.push({
        slug,
        title,
        description,
        date,
        author,
        category,
        tags,
        readTime,
        featured,
        coverImage,
      });

      const escapedContent = content.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\${/g, '\\${');
      mapEntries.push(`  '${slug}': \`${escapedContent}\``);
    }

    // Sort metaList by date descending
    metaList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const fileContent = `/**
 * AUTO-GENERATED BLOG POSTS FALLBACK DATA
 * Synced automatically from src/content/blog/*.md
 */

export interface BlogMetaItem {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  category: string;
  tags: string[];
  readTime: string;
  featured: boolean;
  coverImage?: string;
}

export const BLOG_METADATA_LIST: BlogMetaItem[] = ${JSON.stringify(metaList, null, 2)};

export const RAW_BLOG_MAP: Record<string, string> = {
${mapEntries.join(',\n\n')}
};
`;

    fs.writeFileSync(targetFile, fileContent, 'utf-8');
    console.log(`[Sync Blog] Successfully synced ${mapEntries.length} blog posts to ${targetFile}`);
  } catch (err) {
    console.error('[Sync Blog] Error syncing blog:', err);
  }
}

syncPages();
syncAuthors();
syncBlog();

