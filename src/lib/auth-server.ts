import { NextRequest } from 'next/server';

export interface AuthUser {
  uid: string;
  email: string;
}

export async function parseAuthUser(req: NextRequest): Promise<AuthUser> {
  const authHeader = req.headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (token.startsWith('demo_token:')) {
      const parts = token.split(':');
      return {
        uid: parts[1] || 'demo_soka_user',
        email: parts[2] || 'demo@sokaking.test',
      };
    }
    // Firebase ID token decode fallback or token mock
    try {
      const base64Url = token.split('.')[1];
      if (base64Url) {
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
        const parsed = JSON.parse(jsonPayload);
        if (parsed.user_id || parsed.sub) {
          return {
            uid: parsed.user_id || parsed.sub,
            email: parsed.email || 'user@sokaking.com',
          };
        }
      }
    } catch (e) {
      // ignore
    }
  }
  return {
    uid: 'guest_user',
    email: 'guest@sokaking.com',
  };
}
