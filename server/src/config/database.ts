import { checkSupabaseConnection } from './supabase';

export async function connectDatabase(): Promise<void> {
  await checkSupabaseConnection();
}

export async function disconnectDatabase(): Promise<void> {
  // Supabase client manages stateless HTTP connections
}
