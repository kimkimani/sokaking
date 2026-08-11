import { NextResponse } from 'next/server';
import { getApiBaseUrl } from '../../../../lib/getApiBaseUrl';

export async function GET() {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/sms/subscriptions`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err) {}

  return NextResponse.json([
    {
      id: 1,
      user_id: 'demo_vip_user',
      phone_number: '+254740841375',
      package_id: 'VIP_WEEKLY',
      start_time: new Date(Date.now() - 86400000).toISOString(),
      end_time: new Date(Date.now() + 6 * 86400000).toISOString(),
      status: 'active',
      last_sms_sent_at: new Date().toISOString(),
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ]);
}
