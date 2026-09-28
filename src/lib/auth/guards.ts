import "server-only";

import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface AdminIdentity {
  userId: string;
  email: string;
  fullName: string | null;
  role: "admin" | "super_admin";
}

/**
 * Vérifie que l'appelant est un administrateur ANAQ-Sup actif.
 *
 * Trois barrières successives protègent l'espace d'administration :
 *   1. le middleware (redirection si aucune session) ;
 *   2. cette fonction (vérification du JWT + appartenance à admin_users) ;
 *   3. les policies RLS PostgreSQL (autorité finale sur les données).
 */
export async function getAdminIdentity(): Promise<AdminIdentity | null> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const { data: profile } = await supabase
    .from("admin_users")
    .select("user_id, email, full_name, role, is_active")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile || !profile.is_active) return null;

  return {
    userId: profile.user_id,
    email: profile.email ?? user.email ?? "",
    fullName: profile.full_name,
    role: profile.role,
  };
}

/** Variante bloquante : redirige vers la page de connexion si non autorisé. */
export async function requireAdmin(
  redirectTo = "/admin/dashboard",
): Promise<AdminIdentity> {
  const identity = await getAdminIdentity();

  if (!identity) {
    const params = new URLSearchParams({ redirect: redirectTo, reason: "forbidden" });
    redirect(`/admin/login?${params.toString()}`);
  }

  return identity;
}
