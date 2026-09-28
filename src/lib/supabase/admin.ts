import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { publicEnv, serviceRoleKey } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Client `service_role` -IL CONTOURNE ENTIÈREMENT RLS.
 *
 * À n'utiliser que pour des tâches d'administration serveur explicites
 * (provisionnement de comptes, maintenance, futurs jobs planifiés).
 * Aucune route publique ni aucune page de l'application V1 ne l'utilise :
 * le parcours visiteur et le parcours administrateur passent par RLS.
 *
 * Ce module est marqué `server-only` : toute tentative d'import depuis un
 * composant client provoque une erreur de build.
 */
export function createAdminClient() {
  const env = publicEnv();

  return createSupabaseClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey(),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
