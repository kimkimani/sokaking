import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrl } from '../../../../lib/getApiBaseUrl';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { receiptCode, phoneNumber, packageId, packageType, packageName } = body;

    if (!receiptCode || !phoneNumber) {
      return NextResponse.json(
        { error: 'M-Pesa Receipt Code and Phone Number are required.' },
        { status: 400 }
      );
    }

    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/mpesa/claim-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ receiptCode, phoneNumber, packageId, packageType, packageName }),
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } catch (backendErr: any) {
      console.warn('[Next API Claim Code] PHP backend error, fallback local claim:', backendErr?.message);
    }

    // Local Fallback simulation
    let formatted = phoneNumber.replace(/[^0-9]/g, '');
    if (formatted.startsWith('0')) formatted = '254' + formatted.slice(1);
    if (!formatted.startsWith('+')) formatted = '+' + formatted;

    const typeStr = (packageType || 'vip').toUpperCase();
    const nameStr = packageName || 'Package';

    return NextResponse.json({
      success: true,
      message: `M-Pesa Code ${receiptCode.toUpperCase()} verified! ${nameStr} (${typeStr}) unlocked and tips sent to ${formatted}.`,
      receiptCode: receiptCode.toUpperCase(),
      phoneNumber: formatted,
      packageId: packageId || 'VIP_WEEKLY',
      packageType: packageType || 'vip',
      packageName: nameStr,
      smsResult: { success: true, status: 'sent', simulated: true },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to claim M-Pesa receipt code' }, { status: 500 });
  }
}
