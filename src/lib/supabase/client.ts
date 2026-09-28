"use client";

import { createBrowserClient } from "@supabase/ssr";

import { publicEnv } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Client Supabase pour le navigateur.
 * N'utilise que la clé publique `anon` : toutes les données restent protégées
 * par les policies RLS définies dans supabase/migrations/0001_init.sql.
 */
export function createClient() {
  const env = publicEnv();
  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
