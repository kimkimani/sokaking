/**
 * Centralized API Base URL resolver.
 * 
 * Configured to target the standalone remote PHP MySQL backend on cheerplex.co.ke/soka_king.
 * Priority order:
 * 1. NEXT_PUBLIC_BACKEND_URL (accessible on client and server)
 * 2. BACKEND_URL (accessible on server side / Next API proxy)
 * 3. window.location.origin (client browser current host when proxying locally)
 * 4. Fallback default: https://cheerplex.co.ke/soka_king
 */
export function getApiBaseUrl(): string {
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.NEXT_PUBLIC_BACKEND_URL) {
      return process.env.NEXT_PUBLIC_BACKEND_URL.replace(/\/$/, '');
    }
    if (process.env.BACKEND_URL) {
      return process.env.BACKEND_URL.replace(/\/$/, '');
    }
  }

  // Check browser window location for local dev server vs deployed static site (e.g., Cloudflare Pages)
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    // Local development or AI Studio sandbox environment running server.ts proxy
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.includes('ais-dev-') ||
      hostname.includes('ais-pre-') ||
      hostname.endsWith('.run.app')
    ) {
      return window.location.origin.replace(/\/$/, '');
    }
  }

  // Default fallback for deployed static sites (Cloudflare Pages, custom domain, etc.)
  return 'https://cheerplex.co.ke/soka_king';
}

