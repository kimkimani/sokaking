import { NextRequest, NextResponse } from 'next/server';
import { getMpesaTxn } from '@/src/lib/mpesaStore';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ checkoutRequestId: string }> }
) {
  try {
    const { checkoutRequestId } = await params;
    console.log(`[Next API] GET /api/mpesa/status/${checkoutRequestId}`);

    // Check internal mpesaStore state
    const txn = getMpesaTxn(checkoutRequestId);

    if (txn) {
      if (txn.status === 'completed') {
        return NextResponse.json(
          {
            status: 'completed',
            checkoutRequestId,
            CheckoutRequestID: checkoutRequestId,
            mpesaReceiptCode: txn.mpesaReceiptCode || `RJK${Date.now().toString().slice(-6)}`,
            phoneNumber: txn.phoneNumber,
            amount: txn.amount,
            itemId: txn.itemId,
            resultDesc: 'M-Pesa payment completed successfully',
          },
          { headers: corsHeaders }
        );
      }

      if (txn.status === 'failed') {
        return NextResponse.json(
          {
            status: 'failed',
            checkoutRequestId,
            CheckoutRequestID: checkoutRequestId,
            resultDesc: 'M-Pesa payment was cancelled or failed',
          },
          { headers: corsHeaders }
        );
      }

      return NextResponse.json(
        {
          status: 'pending',
          checkoutRequestId,
          CheckoutRequestID: checkoutRequestId,
          resultDesc: 'Awaiting customer PIN entry on phone handset',
        },
        { headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        status: 'pending',
        checkoutRequestId,
        resultDesc: 'Transaction initialising',
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('[Next API Error] GET /api/mpesa/status:', error?.message || error);
    return NextResponse.json(
      {
        status: 'pending',
        resultDesc: 'Awaiting verification',
      },
      { headers: corsHeaders }
    );
  }
}
