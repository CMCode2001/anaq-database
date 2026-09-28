import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SupabaseExpertRepository } from "@/lib/repositories/supabase-expert-repository";
import type { ExpertRepository } from "@/lib/repositories/expert-repository";

/**
 * Fabrique de repository -seul endroit de l'application qui connaît
 * l'implémentation concrète.
 *
 * Migration future vers une API backend : il suffit d'écrire un
 * `HttpExpertRepository implements ExpertRepository` et de le retourner ici.
 */
export async function getExpertRepository(): Promise<ExpertRepository> {
  const supabase = await createServerSupabaseClient();
  return new SupabaseExpertRepository(supabase);
}

export type { ExpertRepository };
