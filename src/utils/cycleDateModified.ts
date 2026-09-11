/**
 * Deterministic Weekly & Daily Cycle Date Tracker for SEO & Google QDF
 * 
 * Google's Query Deserves Freshness (QDF) algorithm prioritizes content that is actively
 * maintained for current events (such as weekly football jackpots).
 * 
 * However, dynamically setting dateModified = new Date().toISOString() on every request is
 * an anti-pattern: it changes every millisecond, alerting search engines to artificial freshness.
 * 
 * This module computes deterministic, milestone-based ISO 8601 timestamps in East Africa Time (UTC+3)
 * tied to real jackpot weekly publishing cycles:
 * - Weekend Mega Jackpots (Wed 09:30 EAT round open, Fri 10:15 EAT final preview, Sat 08:30 EAT game-day)
 * - Midweek Jackpots (Mon 09:00 EAT open, Tue 10:00 EAT preview, Wed 09:00 EAT matchday)
 * - Daily Jackpots (Everyday 06:30 EAT)
 * - Daily Predictions (Everyday 06:00 EAT)
 * - Static Legal / About Pages (Fixed safe anchor)
 */

export function formatEatIsoString(d: Date): string {
  // Kenya East Africa Time is UTC+3 (no DST)
  const eatOffsetMs = 3 * 60 * 60 * 1000;
  const eatDate = new Date(d.getTime() + eatOffsetMs);

  const year = eatDate.getUTCFullYear();
  const month = String(eatDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(eatDate.getUTCDate()).padStart(2, '0');
  const hours = String(eatDate.getUTCHours()).padStart(2, '0');
  const minutes = String(eatDate.getUTCMinutes()).padStart(2, '0');
  const seconds = String(eatDate.getUTCSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+03:00`;
}

function buildEatDate(year: number, month: number, date: number, hours: number, minutes: number = 0): string {
  // Construct a Date in UTC representing EAT (hours - 3)
  const utcDate = new Date(Date.UTC(year, month, date, hours - 3, minutes, 0, 0));
  return formatEatIsoString(utcDate);
}

/**
 * Calculates a deterministic, weekly-cycle or daily-cycle ISO 8601 dateModified string.
 * Guarantees that the returned timestamp is strictly in the past (<= now) and stable
 * across multiple search engine crawls within the same cycle window.
 */
export function getCycleDateModified(
  pageId: string,
  jackpotId?: string,
  referenceDate: Date = new Date()
): string {
  // Static informational and legal pages should have stable revision dates
  if (['privacy-policy', 'terms-of-use', 'responsible-gambling', 'partners', 'about', 'contact'].includes(pageId)) {
    return '2026-08-17T06:00:00+03:00';
  }

  // Convert referenceDate to East Africa Time components
  const eatOffsetMs = 3 * 60 * 60 * 1000;
  const eatNow = new Date(referenceDate.getTime() + eatOffsetMs);

  const eatYear = eatNow.getUTCFullYear();
  const eatMonth = eatNow.getUTCMonth();
  const eatDate = eatNow.getUTCDate();
  const eatDay = eatNow.getUTCDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const eatHours = eatNow.getUTCHours();
  const eatMinutes = eatNow.getUTCMinutes();

  const jId = (jackpotId || '').toLowerCase();
  const pId = pageId.toLowerCase();

  const isMidweek = jId.includes('midweek') || pId.includes('midweek');

  const isDaily = jId.includes('daily') || pId.includes('daily') ||
                  pId === 'today' || pId === 'football-predictions-today';

  const isWeekendJackpot = !isMidweek && !isDaily && (
    jId.includes('mega') || jId.includes('grand') ||
    pId.includes('mega') || pId.includes('grand') || pId.includes('jackpot') ||
    jId === 'sportpesa-mega' || jId === 'mozzart-grand'
  );

  // 1. Weekend Mega Jackpots Cycle (SportPesa Mega, Betika Grand, SportyBet, etc.)
  if (isWeekendJackpot) {
    // Saturday: Kickoff Day
    if (eatDay === 6) {
      if (eatHours >= 8 && (eatHours > 8 || eatMinutes >= 30)) {
        return buildEatDate(eatYear, eatMonth, eatDate, 8, 30);
      }
      return buildEatDate(eatYear, eatMonth, eatDate - 1, 10, 15);
    }
    // Friday: Final tactical analysis & double-chance combos
    if (eatDay === 5) {
      if (eatHours >= 10 && (eatHours > 10 || eatMinutes >= 15)) {
        return buildEatDate(eatYear, eatMonth, eatDate, 10, 15);
      }
      return buildEatDate(eatYear, eatMonth, eatDate - 2, 9, 30); // Wednesday
    }
    // Thursday: Round in full swing
    if (eatDay === 4) {
      return buildEatDate(eatYear, eatMonth, eatDate - 1, 9, 30); // Wednesday
    }
    // Wednesday: Round opening & initial 17 fixture probabilities
    if (eatDay === 3) {
      if (eatHours >= 9 && (eatHours > 9 || eatMinutes >= 30)) {
        return buildEatDate(eatYear, eatMonth, eatDate, 9, 30);
      }
      return buildEatDate(eatYear, eatMonth, eatDate - 2, 11, 0); // Monday
    }
    // Tuesday: Round preview & early model generation
    if (eatDay === 2) {
      return buildEatDate(eatYear, eatMonth, eatDate - 1, 11, 0); // Monday
    }
    // Monday: Previous weekend audit & new week jackpot schedule
    if (eatDay === 1) {
      if (eatHours >= 11) {
        return buildEatDate(eatYear, eatMonth, eatDate, 11, 0);
      }
      return buildEatDate(eatYear, eatMonth, eatDate - 2, 8, 30); // Saturday
    }
    // Sunday: Weekend games underway
    if (eatDay === 0) {
      return buildEatDate(eatYear, eatMonth, eatDate - 1, 8, 30); // Saturday
    }
  }

  // 2. Midweek Jackpots Cycle (SportPesa Midweek, Betika Midweek, Odibet, BetPawa)
  if (isMidweek) {
    // Wednesday: Matchday check
    if (eatDay === 3) {
      if (eatHours >= 9) {
        return buildEatDate(eatYear, eatMonth, eatDate, 9, 0);
      }
      return buildEatDate(eatYear, eatMonth, eatDate - 1, 10, 0); // Tuesday
    }
    // Tuesday: Pre-kickoff lineups & double chance
    if (eatDay === 2) {
      if (eatHours >= 10) {
        return buildEatDate(eatYear, eatMonth, eatDate, 10, 0);
      }
      return buildEatDate(eatYear, eatMonth, eatDate - 1, 9, 0); // Monday
    }
    // Monday: Round opens
    if (eatDay === 1) {
      if (eatHours >= 9) {
        return buildEatDate(eatYear, eatMonth, eatDate, 9, 0);
      }
      return buildEatDate(eatYear, eatMonth, eatDate - 4, 12, 0); // Prev Thursday
    }
    // Thursday: Final matches
    if (eatDay === 4) {
      return buildEatDate(eatYear, eatMonth, eatDate - 1, 9, 0); // Wednesday
    }
    // Friday/Saturday/Sunday: Post-round review
    if (eatDay === 5) {
      return buildEatDate(eatYear, eatMonth, eatDate - 1, 12, 0); // Thursday
    }
    if (eatDay === 6) {
      return buildEatDate(eatYear, eatMonth, eatDate - 2, 12, 0); // Thursday
    }
    if (eatDay === 0) {
      return buildEatDate(eatYear, eatMonth, eatDate - 3, 12, 0); // Thursday
    }
  }

  // 3. Daily Jackpots & Daily Prediction Categories
  if (isDaily || pId.includes('tips') || pId.includes('predictions') || pId.includes('over') || pId.includes('btts') || pId.includes('1x2')) {
    const updateHour = isDaily ? 6 : 5; // 06:30 EAT for daily jackpots, 05:45 EAT for daily tips
    const updateMin = isDaily ? 30 : 45;

    if (eatHours > updateHour || (eatHours === updateHour && eatMinutes >= updateMin)) {
      return buildEatDate(eatYear, eatMonth, eatDate, updateHour, updateMin);
    }
    return buildEatDate(eatYear, eatMonth, eatDate - 1, updateHour, updateMin);
  }

  // 4. Default: Recent stable morning refresh
  if (eatHours >= 7) {
    return buildEatDate(eatYear, eatMonth, eatDate, 7, 0);
  }
  return buildEatDate(eatYear, eatMonth, eatDate - 1, 7, 0);
}

/**
 * Calculates the comprehensive, true dateModified for Schema.org and SEO meta tags.
 * 
 * Accurately updates when:
 * 1. A page's markdown content changes (detected via physical file mtime on server or client headers)
 * 2. New jackpot fixtures are published/updated (detected via jackpotsData mtime, live cache fetch, and round schedule)
 * 3. Frontmatter overrides (dateModified / lastModified / updatedAt) are provided
 * 4. Deterministic weekly/daily QDF cycle milestones occur as regular maintenance baseline
 * 
 * Guarantees:
 * - dateModified <= now (never in the future)
 * - dateModified >= 2026-08-17T06:00:00+03:00 (never before site launch anchor)
 * - Formatted in East Africa Time ISO 8601 (YYYY-MM-DDTHH:mm:ss+03:00)
 */
export function getPageDateModified(
  pageId: string,
  pageMd?: any,
  options?: {
    customFixtures?: any[];
    jackpot?: any;
    dateModified?: string;
    referenceDate?: Date;
  }
): string {
  const isStaticLegal = ['privacy-policy', 'terms-of-use', 'responsible-gambling', 'partners'].includes(pageId);
  const now = options?.referenceDate || new Date();
  const candidates: number[] = [];

  // Minimum safe anchor: 2026-08-17T06:00:00+03:00
  const siteAnchor = new Date('2026-08-17T06:00:00+03:00').getTime();
  const nowMs = now.getTime();

  // 1. Explicit option or frontmatter date override
  const explicit = options?.dateModified || pageMd?.dateModified || pageMd?.lastModified || pageMd?.updatedAt;
  if (explicit && typeof explicit === 'string') {
    const parsed = new Date(explicit).getTime();
    if (!isNaN(parsed) && parsed > 0 && parsed <= nowMs) {
      candidates.push(parsed);
    }
  }

  // 2. Physical page file modification time on disk (Server / Node.js environment)
  if (typeof window === 'undefined') {
    try {
      const fs = require('fs');
      const path = require('path');
      const cleanKey = (pageId || '').toLowerCase().trim().replace(/^\//, '').replace(/\.md$/, '');
      if (cleanKey) {
        const pagesDir = path.join(process.cwd(), 'src', 'content', 'pages');
        let filePath = path.join(pagesDir, `${cleanKey}.md`);
        if (!fs.existsSync(filePath) && fs.existsSync(pagesDir)) {
          const files = fs.readdirSync(pagesDir);
          const match = files.find((f: string) => f.toLowerCase() === `${cleanKey}.md` || f.toLowerCase() === cleanKey);
          if (match) filePath = path.join(pagesDir, match);
        }

        if (fs.existsSync(filePath)) {
          const stat = fs.statSync(filePath);
          if (stat && stat.mtime) {
            const mtimeMs = stat.mtime.getTime();
            if (mtimeMs <= nowMs && mtimeMs >= siteAnchor) {
              candidates.push(mtimeMs);
            }
          }
        }
      }
    } catch {
      // fs unavailable in browser
    }
  }

  // 3. Client-side mtime passed via pageMd
  if (pageMd?.mtime) {
    const parsedMtime = new Date(pageMd.mtime).getTime();
    if (!isNaN(parsedMtime) && parsedMtime <= nowMs && parsedMtime >= siteAnchor) {
      candidates.push(parsedMtime);
    }
  }

  // 4. Jackpot Fixtures Changes / New Fixtures
  const targetJackpotId = pageMd?.jackpotId || (pageId.includes('jackpot') ? pageId : undefined);
  const hasJackpotFixtures = !!targetJackpotId || 
    pageMd?.topConfidenceFixtures === true ||
    (typeof pageMd?.fullContent === 'string' && pageMd.fullContent.includes('{{TOP_MEGA_JACKPOT_FIXTURES}}')) ||
    pageId.includes('mega') || pageId.includes('jackpot');

  if (hasJackpotFixtures) {
    // 4a. Check src/jackpotsData.ts file modification time (in Node.js)
    if (typeof window === 'undefined') {
      try {
        const fs = require('fs');
        const path = require('path');
        const jackpotsDataPath = path.join(process.cwd(), 'src', 'jackpotsData.ts');
        if (fs.existsSync(jackpotsDataPath)) {
          const stat = fs.statSync(jackpotsDataPath);
          if (stat && stat.mtime) {
            const jpMtime = stat.mtime.getTime();
            if (jpMtime <= nowMs && jpMtime >= siteAnchor) {
              candidates.push(jpMtime);
            }
          }
        }
      } catch {}
    }

    // 4b. Check live database fixtures fetch time
    try {
      const { getLastLiveFetchTime } = require('./topJackpotFixtures.js');
      const lastFetch = getLastLiveFetchTime?.() || 0;
      if (lastFetch > 0 && lastFetch <= nowMs && lastFetch >= siteAnchor) {
        candidates.push(lastFetch);
      }
    } catch {}

    // 4c. Inspect fixtures for individual timestamps and round kickoff schedule
    let fixtures: any[] = options?.customFixtures || options?.jackpot?.fixtures || [];
    if ((!fixtures || fixtures.length === 0) && typeof window === 'undefined') {
      try {
        const { jackpotsData } = require('../jackpotsData.js');
        const jp = jackpotsData.find((j: any) => j.id === targetJackpotId || j.slug === targetJackpotId || j.id === 'sportpesa-mega');
        fixtures = jp?.fixtures || [];
      } catch {}
    }

    if (Array.isArray(fixtures) && fixtures.length > 0) {
      for (const f of fixtures) {
        if (f?.updatedAt) {
          const fTime = new Date(f.updatedAt).getTime();
          if (!isNaN(fTime) && fTime <= nowMs && fTime >= siteAnchor) {
            candidates.push(fTime);
          }
        }
      }

      // Check earliest kickoff time to determine when this round's fixtures opened
      const kickoffTimes = fixtures
        .map(f => f?.kickoffTime ? new Date(f.kickoffTime).getTime() : 0)
        .filter(t => !isNaN(t) && t > 0);

      if (kickoffTimes.length > 0) {
        const earliestKickoffMs = Math.min(...kickoffTimes);
        
        // Convert kickoff to EAT
        const eatOffsetMs = 3 * 60 * 60 * 1000;
        const kickoffEat = new Date(earliestKickoffMs + eatOffsetMs);
        const kickoffDay = kickoffEat.getUTCDay(); // 0=Sun, 6=Sat

        // For weekend jackpots (kickoffs Sat/Sun/Fri):
        // Active round opened on Wednesday 09:30 EAT
        let daysToWednesday = (kickoffDay - 3 + 7) % 7;
        if (daysToWednesday === 0 && kickoffEat.getUTCHours() < 9) daysToWednesday = 7;
        
        const roundOpenEat = new Date(kickoffEat);
        roundOpenEat.setUTCDate(roundOpenEat.getUTCDate() - daysToWednesday);
        roundOpenEat.setUTCHours(9, 30, 0, 0);
        const roundOpenUtcMs = roundOpenEat.getTime() - eatOffsetMs;

        if (roundOpenUtcMs <= nowMs && roundOpenUtcMs >= siteAnchor) {
          candidates.push(roundOpenUtcMs);
        }
      }
    }
  }

  // 5. Deterministic weekly/daily cycle milestone
  const cycleDateStr = getCycleDateModified(pageId, targetJackpotId, now);
  const cycleMs = new Date(cycleDateStr).getTime();
  if (!isNaN(cycleMs) && cycleMs <= nowMs) {
    if (isStaticLegal && candidates.length === 0) {
      return '2026-08-17T06:00:00+03:00';
    }
    candidates.push(cycleMs);
  }

  // 6. Pick latest timestamp <= now and >= siteAnchor
  const validCandidates = candidates.filter(t => t <= nowMs && t >= siteAnchor);
  if (validCandidates.length > 0) {
    const latestMs = Math.max(...validCandidates);
    return formatEatIsoString(new Date(latestMs));
  }

  return cycleDateStr;
}
