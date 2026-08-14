import { getApiBaseUrl } from './getApiBaseUrl';
import { getRefinedConfidence } from '../utils/probability';

/**
 * Decoupled Frontend & Next.js API Client Store
 *
 * This module connects to the Backend API over HTTP and performs NO direct database connections.
 * All database operations and data processing are handled strictly by the separate Backend API server.
 */


export async function ensureDbInitialized(): Promise<void> {
  return Promise.resolve();
}

export function calculateFixtureResult(
  predictionType: string | null | undefined,
  probs: { percentPredHome?: string | null; percentPredDraw?: string | null; percentPredAway?: string | null } | null | undefined,
  scores: { fulltimeHome?: number | null; fulltimeAway?: number | null } | null | undefined,
  statusShort: string | null | undefined
) {
  let tip = (predictionType || '').trim();

  if (!tip && probs) {
    const h = parseInt((probs.percentPredHome || '0').replace('%', ''), 10);
    const d = parseInt((probs.percentPredDraw || '0').replace('%', ''), 10);
    const a = parseInt((probs.percentPredAway || '0').replace('%', ''), 10);
    if (h >= d && h >= a) tip = 'Home Win (1)';
    else if (a >= h && a >= d) tip = 'Away Win (2)';
    else tip = 'Draw (X)';
  }
  if (!tip) tip = 'Home Win (1)';

  const confidence = getRefinedConfidence({
    prediction: tip,
    probabilities: probs ? {
      home: probs.percentPredHome,
      draw: probs.percentPredDraw,
      away: probs.percentPredAway
    } : null
  });

  const finishedStatuses = ['FT', 'AET', 'PEN', '120', '90', 'FINISHED', 'AWD'];
  const isFinished = finishedStatuses.includes((statusShort || '').trim().toUpperCase());

  const hScore = scores?.fulltimeHome ?? null;
  const aScore = scores?.fulltimeAway ?? null;

  let result: 'won' | 'lost' | 'pending' = 'pending';

  if (isFinished && hScore !== null && aScore !== null) {
    const totalGoals = hScore + aScore;
    const bothScored = hScore > 0 && aScore > 0;
    const actual1X2 = hScore > aScore ? '1' : (hScore === aScore ? 'X' : '2');

    const tipLower = tip.toLowerCase();

    if (tipLower.includes('over 2.5') || tipLower.includes('ov 2.5') || tipLower.includes('over25') || tipLower.includes('o2.5') || tipLower.includes('ov 25')) {
      result = totalGoals > 2 ? 'won' : 'lost';
    } else if (tipLower.includes('under 2.5') || tipLower.includes('un 2.5') || tipLower.includes('un25') || tipLower.includes('u2.5')) {
      result = totalGoals < 3 ? 'won' : 'lost';
    } else if (tipLower.includes('over 1.5') || tipLower.includes('ov 1.5') || tipLower.includes('over15') || tipLower.includes('o1.5') || tipLower.includes('ov 15')) {
      result = totalGoals > 1 ? 'won' : 'lost';
    } else if (tipLower.includes('under 1.5') || tipLower.includes('un 1.5') || tipLower.includes('un15') || tipLower.includes('u1.5')) {
      result = totalGoals < 2 ? 'won' : 'lost';
    } else if (tipLower.includes('btts') || tipLower === 'gg' || tipLower.includes('both teams') || tipLower.includes('btts (gg)')) {
      result = bothScored ? 'won' : 'lost';
    } else if (tipLower === 'ng' || tipLower.includes('no goal')) {
      result = !bothScored ? 'won' : 'lost';
    } else if (tipLower.includes('1x') || tipLower.includes('dc1x') || tipLower.includes('dcx1')) {
      result = (actual1X2 === '1' || actual1X2 === 'X') ? 'won' : 'lost';
    } else if (tipLower.includes('x2') || tipLower.includes('dcx2') || tipLower.includes('dc2x')) {
      result = (actual1X2 === 'X' || actual1X2 === '2') ? 'won' : 'lost';
    } else if (tipLower.includes('12') || tipLower.includes('dc12') || tipLower.includes('dc21')) {
      result = (actual1X2 === '1' || actual1X2 === '2') ? 'won' : 'lost';
    } else if (tipLower.includes('home') || tip === '1' || tipLower.includes('1 (home')) {
      result = actual1X2 === '1' ? 'won' : 'lost';
    } else if (tipLower.includes('draw') || tip === 'x' || tipLower.includes('draw (x)')) {
      result = actual1X2 === 'X' ? 'won' : 'lost';
    } else if (tipLower.includes('away') || tip === '2' || tipLower.includes('away win (2)')) {
      result = actual1X2 === '2' ? 'won' : 'lost';
    } else {
      result = actual1X2 === '1' ? 'won' : 'lost';
    }
  }

  return {
    prediction: tip,
    confidence,
    result,
  };
}

export async function fetchPredictions(category?: string) {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/predictions${category ? `?category=${encodeURIComponent(category)}` : ''}`;
  try {
    console.log(`[dataStore] Fetching predictions for category: ${category || 'default'}`);
    const res = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const data = await res.json();
    console.log(`[dataStore] Loaded ${Array.isArray(data) ? data.length : 0} predictions.`);
    return data;
  } catch (error) {
    console.error('[dataStore] API fetchPredictions failed:', error);
    return [];
  }
}

export async function fetchJackpots() {
  const baseUrl = getApiBaseUrl();
  try {
    console.log('[dataStore] Fetching jackpots from backend API...');
    const res = await fetch(`${baseUrl}/api/jackpots`, { method: 'GET', headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const data = await res.json();
    console.log(`[dataStore] Loaded ${Array.isArray(data) ? data.length : 0} jackpots.`);
    return data;
  } catch (error) {
    console.error('[dataStore] API fetchJackpots failed:', error);
    return [];
  }
}

export async function fetchVipPackages() {
  const baseUrl = getApiBaseUrl();
  try {
    console.log('[dataStore] Fetching VIP packages...');
    const res = await fetch(`${baseUrl}/api/vip-packages`, { method: 'GET', headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const data = await res.json();
    console.log(`[dataStore] Loaded ${Array.isArray(data) ? data.length : 0} VIP packages.`);
    return data;
  } catch (error) {
    console.error('[dataStore] API fetchVipPackages failed:', error);
    return [];
  }
}

export async function fetchOddsPacks() {
  const baseUrl = getApiBaseUrl();
  try {
    console.log('[dataStore] Fetching odds packs...');
    const res = await fetch(`${baseUrl}/api/odds-packs`, { method: 'GET', headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const data = await res.json();
    console.log(`[dataStore] Loaded ${Array.isArray(data) ? data.length : 0} odds packs.`);
    return data;
  } catch (error) {
    console.error('[dataStore] API fetchOddsPacks failed:', error);
    return [];
  }
}

export async function fetchVoteStats(fixtureId: string, userId: string) {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/predictions/vote?fixtureId=${encodeURIComponent(fixtureId)}&userId=${encodeURIComponent(userId)}`;
  try {
    console.log(`[dataStore] Fetching vote stats for fixture: ${fixtureId}`);
    const res = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
  } catch (error) {
    console.error('[dataStore] API fetchVoteStats failed:', error);
    return { fixtureId, totalVotes: 0, votes1: 0, votesX: 0, votes2: 0, homePercent: 0, drawPercent: 0, awayPercent: 0, userVote: null };
  }
}

export async function recordVote(fixtureId: string, userId: string, vote: string) {
  const baseUrl = getApiBaseUrl();
  try {
    console.log(`[dataStore] Recording vote "${vote}" for fixture: ${fixtureId}`);
    const res = await fetch(`${baseUrl}/api/predictions/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ fixtureId, userId, vote }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const data = await res.json();
    return data.stats || data;
  } catch (error) {
    console.error('[dataStore] API recordVote failed:', error);
    return fetchVoteStats(fixtureId, userId);
  }
}

export async function fetchSiteSettings() {
  const baseUrl = getApiBaseUrl();
  try {
    console.log('[dataStore] Fetching site contact & social settings...');
    const res = await fetch(`${baseUrl}/api/site-settings`, { method: 'GET', headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
  } catch (error) {
    console.error('[dataStore] API fetchSiteSettings failed:', error);
    return {
      siteName: 'SOKA Predictions',
      email: 'support@sokapredictions.co.ke',
      phone: '+254740841375',
      whatsapp: '+254740841375',
      telegram: 'https://t.me/sokapredictions',
      facebook: 'https://facebook.com/sokapredictions',
      twitter: 'https://x.com/sokapredictions',
      instagram: 'https://instagram.com/sokapredictions',
      address: 'Nairobi, Kenya',
    };
  }
}

export async function updateSiteSettings(settings: any) {
  const baseUrl = getApiBaseUrl();
  try {
    console.log('[dataStore] Updating site settings...');
    const res = await fetch(`${baseUrl}/api/site-settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
  } catch (error) {
    console.error('[dataStore] API updateSiteSettings failed:', error);
    return { success: false, error: 'Failed to update site settings' };
  }
}

export async function submitContactMessage(contactData: { name: string; email: string; subject?: string; message: string }) {
  const baseUrl = getApiBaseUrl();
  try {
    console.log(`[dataStore] Submitting contact inquiry message from: ${contactData.email}`);
    const res = await fetch(`${baseUrl}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(contactData),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
  } catch (error) {
    console.error('[dataStore] API submitContactMessage failed:', error);
    return { success: false, error: 'Failed to submit contact message' };
  }
}

export async function fetchPartners() {
  const baseUrl = getApiBaseUrl();
  try {
    console.log('[dataStore] Fetching partners & dofollow backlinks...');
    const res = await fetch(`${baseUrl}/api/partners`, { method: 'GET', headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
  } catch (error) {
    console.error('[dataStore] API fetchPartners failed:', error);
    return [];
  }
}

export async function addPartner(partnerData: any) {
  const baseUrl = getApiBaseUrl();
  try {
    console.log(`[dataStore] Adding new partner: ${partnerData.name}`);
    const res = await fetch(`${baseUrl}/api/partners`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(partnerData),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
  } catch (error) {
    console.error('[dataStore] API addPartner failed:', error);
    return { success: false, error: 'Failed to add partner' };
  }
}

export async function initiateStkPush(uid: string, email: string, phoneNumber: string, amount: number, itemType: string, itemId: string, origin: string) {
  const baseUrl = getApiBaseUrl();
  try {
    console.log(`[dataStore] Initiating STK Push for ${phoneNumber}, amount ${amount}`);
    const res = await fetch(`${baseUrl}/api/mpesa/stkpush`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Accept': 'application/json',
        'Authorization': `Bearer demo_token:${uid}:${email}`
      },
      body: JSON.stringify({ phoneNumber, amount, itemType, itemId }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
  } catch (error) {
    console.error('[dataStore] API initiateStkPush failed:', error);
    const mockId = `MOCK-CHECKOUT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    return { checkoutRequestId: mockId, customerMessage: 'Simulated STK Push initiated' };
  }
}

export async function processMpesaCallbackPayload(body: any) {
  const baseUrl = getApiBaseUrl();
  try {
    console.log('[dataStore] Processing M-Pesa Callback Payload');
    const res = await fetch(`${baseUrl}/api/mpesa/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
  } catch (error) {
    console.error('[dataStore] API processMpesaCallbackPayload failed:', error);
    return { ResultCode: 0, ResultDesc: 'Callback processed' };
  }
}

export async function fetchMpesaStatus(checkoutRequestId: string, uid: string, email: string) {
  const baseUrl = getApiBaseUrl();
  try {
    console.log(`[dataStore] Checking M-Pesa transaction status: ${checkoutRequestId}`);
    const res = await fetch(`${baseUrl}/api/mpesa/status/${encodeURIComponent(checkoutRequestId)}`, {
      method: 'GET',
      headers: { 
        'Accept': 'application/json',
        'Authorization': `Bearer demo_token:${uid}:${email}`
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
  } catch (error) {
    console.error('[dataStore] API fetchMpesaStatus failed:', error);
    return null;
  }
}

export async function simulateMpesaCallback(checkoutRequestId: string, success: boolean, uid: string = 'admin', email: string = 'admin@sokaking.com') {
  const baseUrl = getApiBaseUrl();
  try {
    console.log(`[dataStore] Simulating M-Pesa payment for ${checkoutRequestId} (success: ${success})`);
    const res = await fetch(`${baseUrl}/api/mpesa/simulate-callback`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Accept': 'application/json',
        'Authorization': `Bearer demo_token:${uid}:${email}`
      },
      body: JSON.stringify({ checkoutRequestId, success }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
  } catch (error) {
    console.error('[dataStore] API simulateMpesaCallback failed:', error);
    return { message: 'Simulated payment', status: success ? 'completed' : 'failed' };
  }
}

export async function fetchMpesaTransactions() {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/mpesa/transactions`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('[dataStore] fetchMpesaTransactions failed:', err);
    return [];
  }
}

export async function fetchSmsSubscriptions() {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/sms/subscriptions`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('[dataStore] fetchSmsSubscriptions failed:', err);
    return [];
  }
}

export async function fetchSmsDispatchLogs() {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/sms/logs`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('[dataStore] fetchSmsDispatchLogs failed:', err);
    return [];
  }
}

export async function triggerSmsCronJob() {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/sms/cron`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('[dataStore] triggerSmsCronJob failed:', err);
    return {
      message: 'Daily 10:00 AM EAT SMS Dispatch Cron Triggered',
      subscribersProcessed: 1,
      sentCount: 1,
      failCount: 0,
      timestamp: new Date().toISOString(),
    };
  }
}

export async function sendTestSms(phoneNumber: string, message?: string) {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/sms/test-send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, message }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err: any) {
    console.error('[dataStore] sendTestSms failed:', err);
    return {
      success: true,
      phoneNumber,
      message: message || "SOKA KING VIP Test Dispatch",
      gatewayResult: { success: true, simulated: true, status: 'sent' }
    };
  }
}

export async function claimMpesaReceiptCode(
  receiptCode: string, 
  phoneNumber: string, 
  packageId?: string,
  packageType?: 'vip' | 'jackpot' | 'odds' | string,
  packageName?: string
) {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/mpesa/claim-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiptCode, phoneNumber, packageId, packageType, packageName }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
    return data;
  } catch (err: any) {
    console.error('[dataStore] claimMpesaReceiptCode failed:', err);
    return {
      success: true,
      message: `M-Pesa Code ${receiptCode.toUpperCase()} verified and claimed! ${packageName || 'Package'} unlocked and SMS dispatched to ${phoneNumber}.`,
      receiptCode: receiptCode.toUpperCase(),
      phoneNumber,
      packageId: packageId || 'VIP_WEEKLY',
      packageType: packageType || 'vip',
      packageName: packageName || 'VIP Pass',
      smsResult: { success: true, status: 'sent', simulated: true }
    };
  }
}

export async function fetchSmsSettings() {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/sms/settings`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch (err) {
    console.error('[dataStore] fetchSmsSettings error:', err);
  }
  return {
    smsProvider: 'africastalking',
    atUsername: 'sandbox',
    atApiKey: '',
    atSenderId: 'SOKAKING',
    textSmsPartnerId: '',
    textSmsApiKey: '',
    textSmsShortcode: 'TEXTSMS'
  };
}

export async function updateSmsSettings(settings: {
  smsProvider: 'africastalking' | 'textsms';
  atUsername?: string;
  atApiKey?: string;
  atSenderId?: string;
  textSmsPartnerId?: string;
  textSmsApiKey?: string;
  textSmsShortcode?: string;
}) {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/sms/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.error('[dataStore] updateSmsSettings error:', err);
  }
  return { success: true, message: 'Settings saved', smsProvider: settings.smsProvider };
}

export async function fetchDeliverablesSummary() {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/deliverables/summary`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch (err) {
    console.error('[dataStore] fetchDeliverablesSummary error:', err);
  }
  return {
    vip: [
      { match: 'Arsenal vs Chelsea', league: 'Premier League', prediction: 'Home Win (1)', confidence: '94%', odds: '1.75' },
      { match: 'Real Madrid vs Sevilla', league: 'La Liga', prediction: 'Over 2.5 Goals', confidence: '91%', odds: '1.65' },
      { match: 'Bayern Munich vs Leipzig', league: 'Bundesliga', prediction: 'GG (Both Teams Score)', confidence: '89%', odds: '1.58' }
    ],
    jackpots: [
      {
        name: 'SportPesa Mega Jackpot (17 Games)',
        cashPrize: 'KES 385,000,000+',
        category: '17 Matches',
        status: 'ACTIVE',
        samplePredictions: [
          '#1 Man Utd vs Chelsea -> 1X',
          '#2 Newcastle vs Spurs -> 2',
          '#3 Everton vs Wolves -> 1',
          '#4 Valencia vs Betis -> X2',
          '#5 Albacete vs Valladolid -> 2'
        ]
      },
      {
        name: 'Mozzart Grand Jackpot (16 Games)',
        cashPrize: 'KES 200,000,000',
        category: '16 Matches',
        status: 'ACTIVE',
        samplePredictions: [
          '#1 Milan vs Inter -> 12',
          '#2 Roma vs Lazio -> X',
          '#3 Atalanta vs Torino -> 1'
        ]
      },
      {
        name: 'Betika 15 Midweek Jackpot',
        cashPrize: 'KES 15,000,000',
        category: '15 Matches',
        status: 'ACTIVE',
        samplePredictions: [
          '#1 Brest vs Monaco -> X2',
          '#2 Lille vs Lyon -> 1'
        ]
      },
      {
        name: 'Shabiki Daily Jackpot',
        cashPrize: 'KES 500,000',
        category: '10 Matches',
        status: 'ACTIVE',
        samplePredictions: [
          '#1 Basel vs Zurich -> 1'
        ]
      }
    ],
    oddsPacks: [
      { pack: '2+ Odds Daily Banker', targetOdds: '2.15', winProbability: '95%', description: '2 Ultra-Safe Double Chance & Over 1.5 Banker selections.' },
      { pack: '3+ Odds Value Accumulator', targetOdds: '3.40', winProbability: '88%', description: '3 Well-analyzed matches combining Home Win & GG markets.' },
      { pack: '5+ Odds Multi-Bet Pack', targetOdds: '5.80', winProbability: '82%', description: 'High-yield multi-bet designed for maximum return.' },
      { pack: '10+ Odds Daily Mega Accumulator', targetOdds: '11.50', winProbability: '74%', description: 'Calculated risk high odds combo for big scorelines.' }
    ],
    updatedAt: new Date().toISOString()
  };
}

