/**
 * Link and URL utility helper functions for SEO and link rel attributes.
 */

const SOCIAL_MEDIA_DOMAINS = [
  'wa.me',
  'whatsapp.com',
  'api.whatsapp.com',
  'facebook.com',
  'fb.com',
  'fb.me',
  'twitter.com',
  'x.com',
  't.co',
  'instagram.com',
  'instagr.am',
  't.me',
  'telegram.me',
  'telegram.org',
  'tiktok.com',
  'youtube.com',
  'youtu.be',
  'linkedin.com',
  'threads.net',
  'reddit.com',
  'pinterest.com',
  'snapchat.com'
];

/**
 * Checks whether a given URL points to a known social media or messaging service.
 */
export function isSocialUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const cleanUrl = url.toLowerCase().trim();
  return SOCIAL_MEDIA_DOMAINS.some(domain => cleanUrl.includes(domain));
}

/**
 * Returns the appropriate HTML rel attribute for any link.
 * If the link points to a social media / messaging service, 'nofollow noopener noreferrer' is returned.
 * If it is an external link, 'noopener noreferrer' is returned (or 'nofollow noopener noreferrer' if forceNoFollow is true).
 * If it is an internal link, undefined is returned.
 */
export function getLinkRel(url: string | null | undefined, forceNoFollow = false): string | undefined {
  if (!url) return undefined;
  const cleanUrl = url.trim();
  const isExternal = 
    cleanUrl.startsWith('http://') || 
    cleanUrl.startsWith('https://') || 
    cleanUrl.startsWith('//');

  if (!isExternal) return undefined;

  if (forceNoFollow || isSocialUrl(cleanUrl)) {
    return 'nofollow noopener noreferrer';
  }

  return 'noopener noreferrer';
}
