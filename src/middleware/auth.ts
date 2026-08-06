import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split('Bearer ')[1];

  // Custom bypass for development demo/guest user tokens to overcome iframe/popup limits
  if (token && token.startsWith('demo_')) {
    const parts = token.split(':');
    const uid = parts[1] || 'demo_soka_user';
    const email = parts[2] || 'demo@sokaking.test';
    
    req.user = {
      uid,
      email,
      email_verified: true,
      auth_time: Math.floor(Date.now() / 1000),
      iss: 'https://securetoken.google.com/mock-project',
      aud: 'mock-project',
      sub: uid,
    } as any;
    return next();
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
