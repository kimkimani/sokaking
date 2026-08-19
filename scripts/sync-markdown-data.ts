import fs from 'fs';
import path from 'path';

function syncPages() {
  try {
    const pagesDir = path.join(process.cwd(), 'src', 'content', 'pages');
    const targetFile = path.join(process.cwd(), 'src', 'content', 'markdownData.ts');

    if (!fs.existsSync(pagesDir)) {
      console.error('[Sync Pages] Directory not found:', pagesDir);
      return;
    }

    const files = fs.readdirSync(pagesDir);
    const mapEntries: string[] = [];

    for (const file of files) {
      if (file.endsWith('.md')) {
        const key = file.replace(/\.md$/, '').toLowerCase();
        const content = fs.readFileSync(path.join(pagesDir, file), 'utf-8');
        const escapedContent = content.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\${/g, '\\${');
        mapEntries.push(`  '${key}': \`${escapedContent}\``);
      }
    }

    const fileContent = `/**
 * AUTO-GENERATED MARKDOWN PAGES FALLBACK DATA
 * Synced automatically from src/content/pages/*.md
 */

export const RAW_MARKDOWN_MAP: Record<string, string> = {
${mapEntries.join(',\n\n')}
};
`;

    fs.writeFileSync(targetFile, fileContent, 'utf-8');
    console.log(`[Sync Pages] Successfully synced ${mapEntries.length} markdown pages to ${targetFile}`);
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

syncPages();
syncAuthors();
