// Dynamically load all markdown files from /src/content/pages/*.md
// This eliminates hardcoded string duplicates and ensures editing any .md file
// reflects instantly without needing to manually update markdownData.ts.

let globMap: Record<string, string> = {};

// 1. Try Vite import.meta.glob (Client & Vite SSR)
try {
  if (typeof import.meta !== 'undefined' && typeof (import.meta as any).glob === 'function') {
    const globFiles = (import.meta as any).glob('./pages/*.md', {
      query: '?raw',
      import: 'default',
      eager: true,
    }) as Record<string, any>;

    for (const [filePath, content] of Object.entries(globFiles)) {
      const key = filePath
        .split('/')
        .pop()
        ?.replace(/\.md.*$/, '')
        .toLowerCase()
        .trim();
      if (key) {
        globMap[key] = typeof content === 'string' ? content : content?.default || '';
      }
    }
  }
} catch (e) {
  // ignore if not in Vite build environment
}

// 2. Node filesystem fallback (Server side execution)
if (Object.keys(globMap).length === 0 && typeof window === 'undefined') {
  try {
    const fs = (process as any).getBuiltinModule ? (process as any).getBuiltinModule('fs') : null;
    const path = (process as any).getBuiltinModule ? (process as any).getBuiltinModule('path') : null;
    if (fs && path) {
      const pagesDir = path.join(process.cwd(), 'src', 'content', 'pages');
      if (fs.existsSync(pagesDir)) {
        const files = fs.readdirSync(pagesDir);
        for (const file of files) {
          if (file.endsWith('.md')) {
            const key = file.replace(/\.md$/, '').toLowerCase();
            globMap[key] = fs.readFileSync(path.join(pagesDir, file), 'utf-8');
          }
        }
      }
    }
  } catch (e) {
    // ignore
  }
}

export const RAW_MARKDOWN_MAP: Record<string, string> = globMap;
