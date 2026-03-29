"use client";

import { useMemo } from "react";
import { useSession } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "./env";

export function useSupabaseBrowserClient(): SupabaseClient | null {
  const { session } = useSession();
  const env = getSupabasePublicEnv();

  return useMemo(() => {
    if (!env) {
      return null;
    }

    return createClient(env.url, env.anonKey, {
      accessToken: async () => (await session?.getToken()) ?? null,
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }, [env, session]);
}
