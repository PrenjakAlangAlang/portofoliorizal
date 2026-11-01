import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// Clean url to remove trailing slashes or /rest/v1 if copied from Data API page
const supabaseUrl = rawUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();
const supabaseServiceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseUrl.startsWith('https://') &&
    supabaseAnonKey &&
    supabaseAnonKey.length > 10
  );
};

// Client for public reads and user submissions with cache: no-store to prevent stale cache in Next.js
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
      global: {
        fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' }),
      },
    })
  : null;

// Server-side admin client with service role key if available, otherwise anon key
export const getAdminSupabase = () => {
  if (!isSupabaseConfigured()) return null;
  const key = supabaseServiceRoleKey || supabaseAnonKey;
  return createClient(supabaseUrl, key, {
    auth: { persistSession: false },
    global: {
      fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' }),
    },
  });
};
