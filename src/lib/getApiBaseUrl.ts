/**
 * Centralized API Base URL resolver.
 * 
 * - In the browser (Client-side): Always uses the current domain/origin (window.location.origin)
 *   so that fetch calls go to Next.js API routes (/api/...).
 * - On the server (Server-side): Targets the remote PHP MySQL backend or configured REMOTE_API_URL.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location) {
    return window.location.origin.replace(/\/$/, '');
  }

  return process.env.REMOTE_API_URL || 'https://cheerplex.com/soka_king';
}


