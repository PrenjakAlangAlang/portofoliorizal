export const ADMIN_COOKIE_NAME = 'geolog_admin_session';

export function getSecretAdminPath(): string {
  const configured = process.env.NEXT_PUBLIC_ADMIN_SECRET_PATH;
  if (configured && configured.trim().length > 0) {
    return configured.startsWith('/') ? configured : `/${configured}`;
  }
  return '/portal-admin-geolog';
}
