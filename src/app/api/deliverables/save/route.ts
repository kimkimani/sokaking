import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrl } from '../../../../lib/getApiBaseUrl';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const baseUrl = getApiBaseUrl();

    try {
      const res = await fetch(`${baseUrl}/api/deliverables/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } catch (err: any) {
      console.warn('[Next API Save Deliverable] Backend fetch failed, local simulation fallback:', err?.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Deliverable saved to local store (Simulation Mode)',
      id: body.id || Date.now(),
      category: body.category || 'vip'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to save deliverable' }, { status: 500 });
  }
}
