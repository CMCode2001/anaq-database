import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { publicEnv } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Client Supabase côté serveur (Server Components, Server Actions,
 * Route Handlers). Il porte la session de l'utilisateur connecté via les
 * cookies : les policies RLS s'appliquent avec son identité réelle.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  const env = publicEnv();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Appelé depuis un Server Component : l'écriture de cookies est
            // interdite. Le middleware se charge du rafraîchissement de session.
          }
        },
      },
    },
  );
}
