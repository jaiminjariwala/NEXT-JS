"use client";

import { createClient } from "@supabase/supabase-js";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "./env";

let browserClient: SupabaseClient | null | undefined;

declare global {
  interface Window {
    __componentLibrarySupabaseClient?: SupabaseClient | null;
  }
}

const noOpAuthLock = async <T>(
  _name: string,
  _timeout: number,
  fn: () => Promise<T>
) => await fn();

export function getSupabaseBrowserClient() {
  if (browserClient !== undefined) {
    return browserClient;
  }

  const env = getSupabasePublicEnv();
  if (!env) {
    browserClient = null;
    return browserClient;
  }

  if (typeof window !== "undefined" && window.__componentLibrarySupabaseClient) {
    browserClient = window.__componentLibrarySupabaseClient;
    return browserClient;
  }

  browserClient = createClient(env.url, env.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      lock: noOpAuthLock,
    },
  });

  if (typeof window !== "undefined") {
    window.__componentLibrarySupabaseClient = browserClient;
  }

  return browserClient;
}

export type { Session };
