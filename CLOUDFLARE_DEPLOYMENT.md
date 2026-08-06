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

### 3. Direct Backend Connectivity (Zero Environment Variables Needed)
- **Zero Config**: The frontend code (`src/lib/getApiBaseUrl.ts`) is configured to directly query `https://cheerplex.co.ke/soka_king` when running on Cloudflare Pages or custom domains, without requiring any environment variables in Cloudflare settings.

---

## 🚀 Full Cloudflare Pages Deployment Steps

### 1. Configure Cloudflare Pages
- **Build command**: `bun run build`
- **Build output directory**: `dist`
- **Environment Variables**: None required! (The backend URL `https://cheerplex.co.ke/soka_king` is built directly into the application).

### 2. Custom Domain Setup (`sokaking.com`)
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

