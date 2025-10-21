'use client';

import { createClient } from '@supabase/supabase-js';
import { useSession } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export function useSupabaseClient() {
  const { session } = useSession();
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null);

  useEffect(() => {
    if (session) {
      const client = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            fetch: async (url, options = {}) => {
              // Use Clerk's native Supabase integration - no custom template needed
              const clerkToken = await session.getToken();
              const headers = new Headers(options?.headers);
              if (clerkToken) {
                headers.set('Authorization', `Bearer ${clerkToken}`);
              }
              return fetch(url, { ...options, headers });
            },
          },
        }
      );
      setSupabase(client);
    }
  }, [session]);

  return supabase;
}
