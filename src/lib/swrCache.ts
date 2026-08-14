// Lightweight Stale-While-Revalidate (SWR) cache manager with request deduplication

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheItem<any>>();
const inflightRequests = new Map<string, Promise<any>>();

const DEFAULT_TTL_MS = 3 * 60 * 1000; // 3 minutes cache validity

/**
 * Get item from memory or sessionStorage cache
 */
export function getSWRCache<T>(key: string): { data: T | null; isFresh: boolean } {
  const cachedMemory = memoryCache.get(key);
  const now = Date.now();

  if (cachedMemory) {
    const isFresh = now - cachedMemory.timestamp < DEFAULT_TTL_MS;
    return { data: cachedMemory.data, isFresh };
  }

  // Try sessionStorage for cross-reload speed
  if (typeof window !== 'undefined') {
    try {
      const stored = sessionStorage.getItem(`swr_${key}`);
      if (stored) {
        const parsed: CacheItem<T> = JSON.parse(stored);
        memoryCache.set(key, parsed);
        const isFresh = now - parsed.timestamp < DEFAULT_TTL_MS;
        return { data: parsed.data, isFresh };
      }
    } catch (e) {
      // Ignore sessionStorage errors
    }
  }

  return { data: null, isFresh: false };
}

/**
 * Set item in memory and sessionStorage cache
 */
export function setSWRCache<T>(key: string, data: T): void {
  const item: CacheItem<T> = { data, timestamp: Date.now() };
  memoryCache.set(key, item);

  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(`swr_${key}`, JSON.stringify(item));
    } catch (e) {
      // Ignore storage quota errors
    }
  }
}

/**
 * Deduplicated fetch with Stale-While-Revalidate strategy
 */
export async function fetchWithSWR<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: {
    onData?: (data: T, isFromCache: boolean) => void;
    forceRefresh?: boolean;
  }
): Promise<T> {
  const { data: cachedData, isFresh } = getSWRCache<T>(key);

  // 1. If we have cached data (even if stale), deliver it immediately to caller callback
  if (cachedData !== null) {
    if (options?.onData) {
      options.onData(cachedData, true);
    }
    // If cache is fresh and forceRefresh isn't set, return cached data directly without network call
    if (isFresh && !options?.forceRefresh) {
      return cachedData;
    }
  }

  // 2. Request Deduplication: Check if there's already an active in-flight request for this key
  let inflight = inflightRequests.get(key);
  if (!inflight) {
    inflight = (async () => {
      try {
        const freshData = await fetcher();
        setSWRCache(key, freshData);
        if (options?.onData) {
          options.onData(freshData, false);
        }
        return freshData;
      } finally {
        inflightRequests.delete(key);
      }
    })();
    inflightRequests.set(key, inflight);
  } else if (options?.onData && cachedData === null) {
    // If request is already in flight and we had no cache, notify when finished
    inflight.then((freshData) => options.onData?.(freshData, false)).catch(() => {});
  }

  return inflight;
}
