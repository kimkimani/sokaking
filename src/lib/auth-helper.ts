import { adminAuth } from './firebase-admin.ts';
import { NextRequest } from 'next/server';

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  email_verified?: boolean;
}

export async function authenticateRequest(req: NextRequest): Promise<AuthenticatedUser | null> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split('Bearer ')[1];

  // Custom bypass for development demo/guest user tokens to overcome iframe/popup limits
  if (token && token.startsWith('demo_')) {
    const parts = token.split(':');
    const uid = parts[1] || 'demo_soka_user';
    const email = parts[2] || 'demo@sokaking.test';
    
    return {
      uid,
      email,
      email_verified: true,
    };
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      email_verified: decodedToken.email_verified,
    };
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return null;
  }
}
