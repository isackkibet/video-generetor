import { cookies } from 'next/headers';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
const API_KEY = process.env.ADMIN_TO_API_GATEWAY_KEY || '';
const COOKIE_NAME = process.env.ADMIN_SESSION_COOKIE || 'yohpal_admin_session';

function authHeaders() {
  const token = cookies().get(COOKIE_NAME)?.value;
  return {
    ...(API_KEY ? { 'X-API-Key': API_KEY } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: 'no-store',
    headers: {
      ...authHeaders(),
    },
  });
  if (!response.ok) {
    throw new Error(`GET ${path} failed with ${response.status}`);
  }
  return response.json();
}

export async function apiPost<T>(
  path: string,
  body: Record<string, unknown> = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(`POST ${path} failed with ${response.status}`);
  }
  return response.json();
}

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: string;
  meta?: Record<string, unknown>;
};
