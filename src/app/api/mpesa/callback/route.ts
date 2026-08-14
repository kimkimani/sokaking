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
  console.log('[Next API] POST /api/mpesa/callback');
  try {
    const body = await req.json().catch(() => ({}));
    console.log('[Next API M-Pesa Callback Payload]:', JSON.stringify(body));

    const stkCallback = body?.Body?.stkCallback;

    if (stkCallback) {
      const checkoutRequestId = stkCallback.CheckoutRequestID;
      const resultCode = stkCallback.ResultCode;
      const resultDesc = stkCallback.ResultDesc || '';

      if (resultCode === 0) {
        let mpesaReceiptCode = '';
        let phoneNumber = '';

        if (Array.isArray(stkCallback.CallbackMetadata?.Item)) {
          for (const item of stkCallback.CallbackMetadata.Item) {
            if (item.Name === 'MpesaReceiptNumber' && item.Value) {
              mpesaReceiptCode = String(item.Value);
            }
            if (item.Name === 'PhoneNumber' && item.Value) {
              phoneNumber = String(item.Value);
            }
          }
        }

        if (!mpesaReceiptCode) {
          mpesaReceiptCode = `RJK${Date.now().toString().slice(-6)}`;
        }

        console.log(`[M-Pesa Payment COMPLETED] ID: ${checkoutRequestId}, Receipt: ${mpesaReceiptCode}, Phone: ${phoneNumber}`);
        markMpesaTxnCompleted(checkoutRequestId, mpesaReceiptCode, phoneNumber);
      } else {
        console.warn(`[M-Pesa Payment FAILED/CANCELLED] ID: ${checkoutRequestId}, ResultCode: ${resultCode}, Desc: ${resultDesc}`);
        markMpesaTxnFailed(checkoutRequestId);
      }
    }

    return NextResponse.json(
      { ResultCode: 0, ResultDesc: 'Accepted' },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('[Next API Error] POST /api/mpesa/callback:', error?.message || error);
    return NextResponse.json(
      { ResultCode: 0, ResultDesc: 'Accepted' },
      { headers: corsHeaders }
    );
  }
}
