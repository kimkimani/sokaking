/**
 * Centralized API Base URL resolver.
 * 
 * - In the browser (Client-side): Always uses the current domain/origin (window.location.origin)
 *   so that fetch calls go to Next.js API routes (/api/...).
 * - On the server (Server-side): Targets the remote PHP MySQL backend or configured REMOTE_API_URL.
 */
export function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL.replace(/\/$/, '');
  }
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined' && window.location) {
    if (
      window.location.hostname.includes('pages.dev') ||
      window.location.hostname.includes('cheerplex.co.ke') ||
      window.location.hostname.includes('cheerplex.com')
    ) {
      return 'https://cheerplex.co.ke/soka_king';
    }
    return window.location.origin.replace(/\/$/, '');
  }

  return process.env.REMOTE_API_URL || 'https://cheerplex.co.ke/soka_king';
}


