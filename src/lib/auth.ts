import { cookies } from 'next/headers';
import { ADMIN_COOKIE_NAME, getSecretAdminPath } from './auth-constants';

export { ADMIN_COOKIE_NAME, getSecretAdminPath };

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || 'geolog2026';
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(ADMIN_COOKIE_NAME);
    if (!session || !session.value) return false;
    
    // Simple secure token format check: "admin_verified_<timestamp>"
    return session.value.startsWith('admin_verified_');
  } catch (e) {
    return false;
  }
}

export async function setAdminSession() {
  const cookieStore = await cookies();
  const token = `admin_verified_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}
