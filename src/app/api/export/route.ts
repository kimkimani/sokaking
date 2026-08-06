import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrl } from '../../../lib/getApiBaseUrl';

export async function GET(req: NextRequest) {
  try {
    const baseUrl = getApiBaseUrl();
    const search = req.nextUrl.search;
    const backendRes = await fetch(`${baseUrl}/api/export${search}`, {
      method: 'GET',
      headers: {
        'Accept': req.headers.get('accept') || '*/*',
      },
    });

    const contentType = backendRes.headers.get('content-type') || 'application/sql';
    const contentDisposition = backendRes.headers.get('content-disposition');

    const data = await backendRes.text();

    const responseHeaders: Record<string, string> = {
      'Content-Type': contentType,
    };
    if (contentDisposition) {
      responseHeaders['Content-Disposition'] = contentDisposition;
    }

    return new NextResponse(data, {
      status: backendRes.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Export request failed' }, { status: 500 });
  }
}
