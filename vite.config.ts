import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, Plugin} from 'vite';

function markdownDevPlugin(): Plugin {
  return {
    name: 'markdown-dev-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith('/api/markdown')) {
          try {
            const urlObj = new URL(req.url, 'http://localhost');
            const key = urlObj.searchParams.get('key') || 'home';
            let normKey = key.toLowerCase().trim().replace(/^\//, '').replace(/\.md$/, '');
            if (!normKey) normKey = 'home';

            if (normKey === 'today' || normKey === 'football-predictions-today') normKey = 'category-today';
            if (normKey === 'tomorrow' || normKey === 'football-predictions-tomorrow') normKey = 'category-tomorrow';
            if (normKey === 'yesterday' || normKey === 'football-predictions-yesterday') normKey = 'category-yesterday';
            if (normKey === 'over15' || normKey === 'over-1-5' || normKey === 'football-predictions-over-1-5-goals') normKey = 'category-over15';
            if (normKey === 'over25' || normKey === 'over-2-5' || normKey === 'football-predictions-over-2-5-goals') normKey = 'category-over25';
            if (normKey === 'btts' || normKey === 'gg' || normKey === 'football-predictions-btts-gg') normKey = 'category-btts';
            if (normKey === 'doublechance' || normKey === 'double-chance' || normKey === 'football-predictions-double-chance') normKey = 'category-doublechance';
            if (normKey === 'homewin' || normKey === 'home-win' || normKey === '1x2' || normKey === 'football-predictions-1x2-home-win') normKey = 'category-homewin';
            if (normKey === 'about-us') normKey = 'about';
            if (normKey === 'contact-us') normKey = 'contact';
            if (normKey === 'privacy') normKey = 'privacy-policy';
            if (normKey === 'terms') normKey = 'terms-of-use';
            if (normKey === 'vip' || normKey === 'vip-tips' || normKey === 'odds') normKey = 'vip-packages';
            if (normKey === 'jackpot-tips') normKey = 'jackpot-list';

            const pagesDir = path.join(process.cwd(), 'src', 'content', 'pages');
            let filePath = path.join(pagesDir, `${normKey}.md`);

            if (!fs.existsSync(filePath) && fs.existsSync(pagesDir)) {
              const filenames = fs.readdirSync(pagesDir);
              const match = filenames.find(f => f.toLowerCase() === `${normKey}.md` || f.toLowerCase() === normKey);
              if (match) {
                filePath = path.join(pagesDir, match);
              }
            }

            if (fs.existsSync(filePath)) {
              const content = fs.readFileSync(filePath, 'utf-8');
              res.setHeader('Content-Type', 'text/plain; charset=utf-8');
              res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
              res.statusCode = 200;
              return res.end(content);
            }
          } catch (e) {}
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), markdownDevPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
