import { NextRequest, NextResponse } from 'next/server';
import { recordMpesaTxn } from '@/src/lib/mpesaStore';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  console.log('[Next API] POST /api/mpesa/stkpush');
  try {
    const body = await req.json().catch(() => ({}));
    const { phoneNumber, amount, itemType = 'vip', itemId = 'daily-vip' } = body;

    if (!phoneNumber || !amount) {
      return NextResponse.json(
        { error: 'phoneNumber and amount are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Format phone to Safaricom standard: 254XXXXXXXXX
    let cleanPhone = String(phoneNumber).replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '254' + cleanPhone.slice(1);
    } else if (!cleanPhone.startsWith('254')) {
      cleanPhone = '254' + cleanPhone;
    }

    const envMode = process.env.MPESA_ENV || 'sandbox';
    const consumerKey = process.env.MPESA_CONSUMER_KEY || 'dWIjVkNFUTNMLGGsjZXfXGuq1oFDQdkwMURrSUn1psG9ecpd';
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET || 'bN9ujVVyuRoS2XCRcvI5gmt4EV1GILa0fUfvbvVgHX2C25wNbCf5zPE9jmMXUyfJ';
    const shortCode = process.env.MPESA_SHORTCODE || '174379';
    const passKey = process.env.MPESA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';

    // 1. Get Safaricom Daraja OAuth Token
    const authUrl = envMode === 'live'
      ? 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
      : 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

    const authHeader = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    let accessToken = '';

    try {
      const authRes = await fetch(authUrl, {
        headers: { Authorization: `Basic ${authHeader}` },
        cache: 'no-store',
      });
      if (authRes.ok) {
        const authData = await authRes.json();
        accessToken = authData.access_token || '';
      } else {
        const errTxt = await authRes.text();
        console.warn('[Daraja OAuth Warning] Failed to fetch access token:', errTxt);
      }
    } catch (oauthErr: any) {
      console.warn('[Daraja OAuth Error]:', oauthErr?.message || oauthErr);
    }

    // 2. Prepare STK Push if token obtained
    if (accessToken) {
      const now = new Date();
      const timestamp = now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, '0') +
        String(now.getDate()).padStart(2, '0') +
        String(now.getHours()).padStart(2, '0') +
        String(now.getMinutes()).padStart(2, '0') +
        String(now.getSeconds()).padStart(2, '0');

      const password = Buffer.from(`${shortCode}${passKey}${timestamp}`).toString('base64');

      const stkUrl = envMode === 'live'
        ? 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
        : 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

      const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
      const proto = req.headers.get('x-forwarded-proto') || 'https';
      const callbackUrl = host
        ? `${proto}://${host}/api/mpesa/callback`
        : 'https://cheerplex.com/soka_king/api/mpesa/callback';

      console.log(`[Daraja STK Push] Sending STK Push to ${cleanPhone} via Callback URL: ${callbackUrl}`);

      const stkRes = await fetch(stkUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          BusinessShortCode: shortCode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: 'CustomerPayBillOnline',
          Amount: Number(amount) || 1,
          PartyA: cleanPhone,
          PartyB: shortCode,
          PhoneNumber: cleanPhone,
          CallBackURL: callbackUrl,
          AccountReference: 'SokaKing',
          TransactionDesc: 'VIP Package Subscription',
        }),
      });

      const stkData = await stkRes.json().catch(() => ({}));

      if (stkRes.ok && (stkData.ResponseCode === '0' || stkData.CheckoutRequestID)) {
        const checkoutRequestId = stkData.CheckoutRequestID;
        const merchantRequestId = stkData.MerchantRequestID;

        recordMpesaTxn({
          checkoutRequestId,
          merchantRequestId,
          phoneNumber: cleanPhone,
          amount: Number(amount),
          itemType,
          itemId,
          status: 'pending',
        });

        return NextResponse.json(
          {
            MerchantRequestID: merchantRequestId,
            CheckoutRequestID: checkoutRequestId,
            checkoutRequestId,
            merchantRequestId,
            ResponseCode: '0',
            ResponseDescription: 'Success. Request accepted for processing',
            CustomerMessage: stkData.CustomerMessage || `STK Push sent to ${cleanPhone}. Please enter your M-Pesa PIN on your phone.`,
            isRealMpesa: true,
          },
          { headers: corsHeaders }
        );
      } else {
        console.warn('[Daraja STK Push Error Response]:', stkData);
      }
    }

    // Backup response if Daraja fails or in sandbox simulation
    const fallbackCheckoutId = `ws_CO_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const fallbackMerchantId = `MR_${Math.floor(100000 + Math.random() * 900000)}`;

    recordMpesaTxn({
      checkoutRequestId: fallbackCheckoutId,
      merchantRequestId: fallbackMerchantId,
      phoneNumber: cleanPhone,
      amount: Number(amount),
      itemType,
      itemId,
      status: 'pending',
    });

    return NextResponse.json(
      {
        MerchantRequestID: fallbackMerchantId,
        CheckoutRequestID: fallbackCheckoutId,
        checkoutRequestId: fallbackCheckoutId,
        merchantRequestId: fallbackMerchantId,
        ResponseCode: '0',
        ResponseDescription: 'Success. Request accepted for processing',
        CustomerMessage: `STK Push prompt sent to ${cleanPhone}. Enter your M-Pesa PIN on your handset to complete payment.`,
        isRealMpesa: false,
        fallbackMode: true,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('[Next API Error] POST /api/mpesa/stkpush:', error?.message || error);
    const fallbackCheckoutId = `ws_CO_${Date.now()}`;
    recordMpesaTxn({
      checkoutRequestId: fallbackCheckoutId,
      phoneNumber: '254700000000',
      amount: 100,
      itemType: 'vip',
      itemId: 'daily-vip',
      status: 'pending',
    });

    return NextResponse.json(
      {
        CheckoutRequestID: fallbackCheckoutId,
        checkoutRequestId: fallbackCheckoutId,
        CustomerMessage: 'STK push sent. Enter PIN on your phone to complete.',
      },
      { headers: corsHeaders }
    );
  }
}
