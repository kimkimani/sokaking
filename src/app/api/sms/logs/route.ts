import { NextResponse } from 'next/server';
import { getApiBaseUrl } from '../../../../lib/getApiBaseUrl';

export async function GET() {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/sms/logs`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err) {}

  return NextResponse.json([
    {
      id: 101,
      user_id: 'demo_vip_user',
      phone_number: '+254740841375',
      message_body: "SOKA KING VIP 10:00 AM DISPATCH:\n1. Man City vs Liverpool -> Tip: Home Win (1)\n2. Real Madrid vs Barca -> Tip: GG\n🎯 SportPesa Mega Jackpot Picks:\n#1. Man Utd vs Chelsea (1X)\n#2. Bournemouth vs Newcastle (X2)",
      status: 'sent',
      error_message: null,
      sent_at: new Date().toISOString(),
    },
  ]);
}
