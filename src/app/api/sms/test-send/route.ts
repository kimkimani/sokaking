import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrl } from '../../../../lib/getApiBaseUrl';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phoneNumber, message } = body;

    if (!phoneNumber) {
      return NextResponse.json({ error: 'phoneNumber is required' }, { status: 400 });
    }

    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/sms/test-send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ phoneNumber, message }),
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } catch (backendErr: any) {
      console.warn('[Next API Test SMS] Backend error, using local response:', backendErr?.message);
    }

    // Format phone
    let formatted = phoneNumber.replace(/[^0-9]/g, '');
    if (formatted.startsWith('0')) formatted = '254' + formatted.slice(1);
    if (!formatted.startsWith('+')) formatted = '+' + formatted;

    return NextResponse.json({
      success: true,
      phoneNumber: formatted,
      message: message || "SOKA KING VIP: 1. Arsenal vs Chelsea -> Tip: Home Win (1); 2. Real Madrid vs Barca -> Tip: GG. Jackpot Picks included! Web: sokapredictions.co.ke",
      gatewayResult: {
        success: true,
        simulated: true,
        recipients: formatted,
        status: 'sent',
        cost: 'KES 0.00 (Simulated)',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to send test SMS' }, { status: 500 });
  }
}
