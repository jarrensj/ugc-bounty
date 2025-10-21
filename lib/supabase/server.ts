import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';
import type { Database } from '../database.types';

export async function createClerkSupabaseClient() {
  const { getToken } = auth();
  const token = await getToken({ template: 'supabase' });
  
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );
}
