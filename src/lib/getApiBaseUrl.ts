/**
 * Centralized API Base URL resolver.
 * 
 * Configured to target the standalone remote PHP MySQL backend on cheerplex.com/soka_king.
 * Priority order:
 * 1. NEXT_PUBLIC_BACKEND_URL (accessible on client and server)
 * 2. BACKEND_URL (accessible on server side / Next API proxy)
 * 3. window.location.origin (client browser current host when proxying locally)
 * 4. Fallback default: https://cheerplex.com/soka_king
 */
export function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL.replace(/\/$/, '');
  }
  if (process.env.BACKEND_URL) {
    return process.env.BACKEND_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin;
  }
  return 'https://cheerplex.com/soka_king';
}

