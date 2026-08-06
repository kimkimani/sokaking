# Deploying Soka King (Next.js) to Cloudflare Pages

This guide walks you through deploying the **Soka King** Next.js web application to **Cloudflare Pages** with full static page generation or edge SSR support and remote PHP backend integration at `https://cheerplex.co.ke/soka_king`.

---

## 🚀 Key Deployment Requirements

- **Domain**: `sokaking.com` (or your chosen custom domain on Cloudflare)
- **PHP Backend URL**: `https://cheerplex.co.ke/soka_king`
- **Build Output**: Static HTML / Client SPA export or Cloudflare `@cloudflare/next-on-pages`

---

## Option A: Direct Static Export (Recommended & Fast)

Since Soka King features pre-rendered static markdown pages (`src/content/pages/*.md`) and dynamic client-side hydration for real-time predictions and M-Pesa payments, exporting as a static app is the simplest and fastest route.

### 1. Update `next.config.mjs`
Ensure static export is configured in `next.config.mjs`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
```

### 2. Connect Repository to Cloudflare Pages
1. Log into your **Cloudflare Dashboard** → **Workers & Pages** → **Create Application** → **Pages** → **Connect to Git**.
2. Select your repository containing the Soka King codebase.
3. Configure the **Build Settings**:
   - **Framework Preset**: `Next.js (Static Export)`
   - **Build Command**: `npm run build`
   - **Build Output Directory**: `out` (or `dist` depending on standard export)
4. Add **Environment Variables**:
   - `BACKEND_URL`: `https://cheerplex.co.ke/soka_king`
   - `NEXT_PUBLIC_BACKEND_URL`: `https://cheerplex.co.ke/soka_king`
   - `NODE_VERSION`: `20`
5. Click **Save and Deploy**.

---

## Option B: Cloudflare Pages with `@cloudflare/next-on-pages` (Full SSR)

If you require full Edge Server-Side Rendering (SSR):

### 1. Install `@cloudflare/next-on-pages`
```bash
npm install --save-dev @cloudflare/next-on-pages
```

### 2. Configure `next.config.mjs`
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

### 3. Build & Local Testing
Run the Cloudflare build adapter:
```bash
npx @cloudflare/next-on-pages
```
This generates a `.vercel/output/static` directory ready for Cloudflare Workers/Pages.

### 4. Deploy via Cloudflare Dashboard
1. Select **Framework Preset**: `None` / `Next.js`
2. **Build Command**: `npx @cloudflare/next-on-pages`
3. **Build Output Directory**: `.vercel/output/static`
4. Set **Compatibility Flags**:
   - Add flag: `nodejs_compat`
5. Add **Environment Variables**:
   - `BACKEND_URL`: `https://cheerplex.co.ke/soka_king`
   - `NEXT_PUBLIC_BACKEND_URL`: `https://cheerplex.co.ke/soka_king`

---

## 🌐 Custom Domain Setup (`sokaking.com`)

1. In Cloudflare Pages, go to your project → **Custom Domains** → **Add Custom Domain**.
2. Enter `sokaking.com` (and `www.sokaking.com`).
3. Cloudflare will automatically route CNAME and SSL certificates.

---

## 📄 Sitemap & Robots.txt on Cloudflare Pages

To ensure `/sitemap.xml` and `/robots.txt` serve correctly:
1. Place static `sitemap.xml` and `robots.txt` in the `/public/` directory, or
2. Cloudflare Pages automatically serves files generated in `public/` or `out/` during static build exports (`npm run build`).

---

## 🛠️ Remote PHP Backend Connectivity Checklist

Ensure your cPanel PHP backend at `https://cheerplex.co.ke/soka_king` has CORS enabled in `php-backend/api/index.php`:

```php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
```

---

*Your Soka King deployment to Cloudflare Pages is now complete and connected to `cheerplex.co.ke`!*
