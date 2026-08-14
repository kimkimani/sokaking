import { getApiBaseUrl } from '../lib/getApiBaseUrl';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  const baseUrl = getApiBaseUrl();
  const url = endpoint.startsWith('http://') || endpoint.startsWith('https://')
    ? endpoint
    : `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (netErr: any) {
    console.warn(`[apiFetch Network Error] Failed to fetch ${url}:`, netErr?.message || netErr);
    throw new Error(netErr?.message || 'Network error: Failed to reach server.');
  }

  const responseText = await response.text();

  if (!response.ok) {
    let errData: any = {};
    try {
      errData = JSON.parse(responseText);
    } catch {
      // Non-JSON HTML error page received
    }
    throw new Error(errData.error || errData.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  try {
    return JSON.parse(responseText);
  } catch (parseErr) {
    console.warn(`[apiFetch JSON Parse Error] Expected JSON from ${url}, got:`, responseText.slice(0, 100));
    throw new Error('Received non-JSON response from server.');
  }
}

