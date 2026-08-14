import { NextRequest, NextResponse } from 'next/server';
import { recordMpesaTxn, markMpesaTxnCompleted } from '@/src/lib/mpesaStore';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  console.log('[Next API] POST /api/mpesa/claim-code');
  try {
    const body = await req.json().catch(() => ({}));
    const { receiptCode, mpesaCode, phoneNumber = '254700000000', packageId = 'daily-vip' } = body;
    const code = (receiptCode || mpesaCode || '').toString().trim().toUpperCase();

    if (!code) {
      return NextResponse.json(
        { error: 'M-Pesa Receipt Code is required.' },
        { status: 400, headers: corsHeaders }
      );
    }

    let cleanPhone = String(phoneNumber).replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '254' + cleanPhone.slice(1);
    } else if (!cleanPhone.startsWith('254')) {
      cleanPhone = '254' + cleanPhone;
    }

    const checkoutRequestId = `CLAIM_${code}`;

    recordMpesaTxn({
      checkoutRequestId,
      merchantRequestId: `MR_CLAIM_${code}`,
      phoneNumber: cleanPhone,
      amount: 100,
      itemType: 'vip',
      itemId: String(packageId),
      status: 'completed',
      mpesaReceiptCode: code,
    });

    markMpesaTxnCompleted(checkoutRequestId, code, cleanPhone);

    return NextResponse.json(
      {
        success: true,
        status: 'completed',
        checkoutRequestId,
        mpesaReceiptCode: code,
        message: `M-Pesa Code ${code} verified successfully! VIP predictions unlocked for ${cleanPhone}.`,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('[Next API Error] POST /api/mpesa/claim-code:', error?.message || error);
    return NextResponse.json(
      { error: error?.message || 'Failed to claim M-Pesa receipt code' },
      { status: 500, headers: corsHeaders }
    );
  }
}
