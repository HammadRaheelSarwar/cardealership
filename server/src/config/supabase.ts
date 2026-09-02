import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';
import { logger } from '../utils/logger';

// Primary Admin Client (bypasses RLS using Service Role Key for backend service operations)
export const supabase: SupabaseClient = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

/**
 * Creates a scoped Supabase client with the caller's JWT token for RLS verification
 */
export function createScopedClient(accessToken: string): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY || env.SUPABASE_SERVICE_ROLE_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      persistSession: false,
    },
  });
}

export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('dealerships').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      logger.warn(`[Supabase] Connection test warning: ${error.message}`);
    } else {
      logger.info('⚡ Connected to Supabase PostgreSQL Database');
    }
    return true;
  } catch (err) {
    logger.error('❌ Failed to connect to Supabase PostgreSQL:', err);
    return false;
  }
}
