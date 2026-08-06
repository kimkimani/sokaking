/**
 * Centralized API Base URL resolver.
 * 
 * Directly targets the standalone remote PHP MySQL backend on cheerplex.co.ke/soka_king
 * without relying on environment variables.
 */
export function getApiBaseUrl(): string {
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

  // Hardcoded direct backend URL for Cloudflare Pages and custom domains
  return 'https://cheerplex.co.ke/soka_king';
}

