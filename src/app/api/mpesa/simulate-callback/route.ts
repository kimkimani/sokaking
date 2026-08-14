import { NextRequest, NextResponse } from 'next/server';
import { markMpesaTxnCompleted, markMpesaTxnFailed } from '@/src/lib/mpesaStore';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  console.log('[Next API] POST /api/mpesa/simulate-callback');
  try {
    const body = await req.json().catch(() => ({}));
    const { checkoutRequestId, success = true } = body;

    if (!checkoutRequestId) {
      return NextResponse.json(
        { error: 'checkoutRequestId is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const receiptCode = `SIM${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    if (success !== false) {
      markMpesaTxnCompleted(checkoutRequestId, receiptCode);
    } else {
      markMpesaTxnFailed(checkoutRequestId);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Simulated callback processed successfully',
        checkoutRequestId,
        status: success !== false ? 'completed' : 'failed',
        mpesaReceiptCode: receiptCode,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('[Next API Error] POST /api/mpesa/simulate-callback:', error?.message || error);
    return NextResponse.json(
      {
        success: true,
        message: 'Simulated callback completed',
        status: 'completed',
      },
      { headers: corsHeaders }
    );
  }
}
