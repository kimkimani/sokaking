import fs from 'fs';
import path from 'path';

function syncMarkdownData() {
  try {
    const pagesDir = path.join(process.cwd(), 'src', 'content', 'pages');
    const targetFile = path.join(process.cwd(), 'src', 'content', 'markdownData.ts');

    if (!fs.existsSync(pagesDir)) {
      console.error('[Sync Markdown] Pages directory not found:', pagesDir);
      return;
    }

    const files = fs.readdirSync(pagesDir);
    const mapEntries: string[] = [];

    for (const file of files) {
      if (file.endsWith('.md')) {
        const key = file.replace(/\.md$/, '').toLowerCase();
        const content = fs.readFileSync(path.join(pagesDir, file), 'utf-8');
        // Escape backticks and backslashes for template literals
        const escapedContent = content.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\${/g, '\\${');
        mapEntries.push(`  '${key}': \`${escapedContent}\``);
      }
    }

    const fileContent = `/**
 * AUTO-GENERATED MARKDOWN FALLBACK DATA
 * Synced automatically from src/content/pages/*.md
 */

export const RAW_MARKDOWN_MAP: Record<string, string> = {
${mapEntries.join(',\n\n')}
};
`;

    fs.writeFileSync(targetFile, fileContent, 'utf-8');
    console.log(`[Sync Markdown] Successfully synced ${mapEntries.length} markdown pages to ${targetFile}`);
  } catch (err) {
    console.error('[Sync Markdown] Error syncing markdown data:', err);
  }
}

syncMarkdownData();
