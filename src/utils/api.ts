import { auth } from '../lib/firebase-client.ts';

async function getAuthHeader() {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    return { 'Authorization': `Bearer ${token}` };
  }

  // Fallback for sandboxed iframe development environment
  const demoToken = typeof window !== 'undefined' ? localStorage.getItem('demo_token') : null;
  if (demoToken) {
    return { 'Authorization': `Bearer ${demoToken}` };
  }

  return {};
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const authHeader = await getAuthHeader();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...authHeader,
  };

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}
