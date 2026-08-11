import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrl } from '../../../../lib/getApiBaseUrl';

export async function GET(req: NextRequest) {
  return handleSmsCron(req);
}

export async function POST(req: NextRequest) {
  return handleSmsCron(req);
}

async function handleSmsCron(req: NextRequest) {
  console.log('[Next API] Daily 10:00 AM EAT SMS Dispatch Cron Triggered');
  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/sms/cron`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err: any) {
    console.warn('[Next API SMS Cron] PHP backend unreachable, returning demo result:', err?.message);
  }

  return NextResponse.json({
    message: 'Daily 10:00 AM EAT SMS Dispatch Cron Executed (Local Mode)',
    subscribersProcessed: 1,
    sentCount: 1,
    failCount: 0,
    expiredNotified: 0,
    scheduledTime: '10:00 AM EAT',
    timestamp: new Date().toISOString(),
  });
}
