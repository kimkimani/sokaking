# Deploying Soka King to Cloudflare Pages

This guide covers deploying **Soka King** to **Cloudflare Pages**.

---

## ⚡ Quick Fixes for Cloudflare Pages Build Errors

### 1. `JSON does not support trailing commas` in `package.json`
- **Issue**: The trailing comma after `"react-markdown": "^10.1.0"` in `package.json` caused esbuild/vite to fail during build.
- **Fix**: The trailing comma and duplicate `vite` dependency entry have been removed from `package.json`.

### 2. `/bin/sh: 1: npm: not found` Error
- **Root Cause**: Because your repository includes `bun.lock`, Cloudflare Pages automatically uses **Bun** as the package manager and container runtime. In this environment, `npm` is not present.
- **Solution in Cloudflare Dashboard**:
  1. Go to **Cloudflare Dashboard** → **Workers & Pages** → Select **Soka King**.
  2. Go to **Settings** → **Build & deployments** → Click **Edit configuration**.
  3. Update build settings:
     - **Framework preset**: `Vite`
     - **Build command**: `bun run build`
     - **Build output directory**: `dist`
  4. Click **Save** and trigger a new deployment.

### 3. API & Database Data Loading on Deployed Site (`https://sokaking.com` / `*.pages.dev`)
- **Root Cause**: When deployed as a static frontend on Cloudflare Pages, relative client fetch requests (like `/api/predictions` or `/api/jackpots`) were attempting to fetch from Cloudflare Pages static web server (`https://sokaking.com/api/predictions`), which returned a 404 HTML page instead of querying your remote MySQL PHP backend at `https://cheerplex.co.ke/soka_king`.
- **Fix Applied**:
  1. `getApiBaseUrl()` and `apiFetch()` have been updated across the frontend app (`App.tsx`, `StaticPages.tsx`, `VotePoll.tsx`, `LiveUpdates.tsx`, `dataStore.ts`) to automatically direct API requests to `https://cheerplex.co.ke/soka_king` when running on Cloudflare Pages.
  2. `vite.config.ts` has been configured with `define` to inject `NEXT_PUBLIC_BACKEND_URL` during `bun run build`.

---

## 🚀 Full Cloudflare Pages Deployment Steps

### 1. Configure Cloudflare Pages
- **Build command**: `bun run build`
- **Build output directory**: `dist`
- **Node.js / Bun version**: Bun v1.2+ (automatically detected via `bun.lock`)

### 2. Environment Variables
Under **Settings** → **Environment Variables**, add:
- `BACKEND_URL`: `https://cheerplex.co.ke/soka_king`
- `NEXT_PUBLIC_BACKEND_URL`: `https://cheerplex.co.ke/soka_king`

### 3. Custom Domain Setup (`sokaking.com`)
1. In Cloudflare Pages → **Custom Domains** → Click **Set up a custom domain**.
2. Enter `sokaking.com` (and `www.sokaking.com`).
3. Cloudflare will automatically provision SSL certificates and update DNS records.

---

## 🛠️ Remote PHP Backend Connectivity Checklist
Ensure your PHP backend at `https://cheerplex.co.ke/soka_king` has CORS enabled in `php-backend/api/index.php`:
```php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
```

